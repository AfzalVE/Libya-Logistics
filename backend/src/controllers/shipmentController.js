import mongoose from "mongoose";
import Shipment from "../models/Shipment.js";
import Customer from "../models/Customer.js";
import { generateShipmentNumber } from "../utils/generateShipmentNumber.js";
import PDFDocument from "pdfkit";
import Setting from "../models/Setting.js";

export async function createShipment(req, res) {
  try {
    const shipmentNumber = await generateShipmentNumber();
    const userId = req.user._id;


    // Enforce origin warehouse for non-Super Admins
    let originWarehouse = req.body.originWarehouse;
    if (req.user.role.name !== "Super Admin") {
      const userWarehouseId = req.user.warehouse?._id || req.user.warehouse;
      if (!userWarehouseId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No warehouse assigned to this staff user.",
        });
      }
      originWarehouse = userWarehouseId;
    }

    // console.log("Creating shipment with originWarehouse:", originWarehouse);
    const shipment = await Shipment.create({
      ...req.body,
      originWarehouse,
      bookedBy: userId,
      shipmentNumber,
      barcode: `BAR-${shipmentNumber}`,
      qrCode: `QR-${shipmentNumber}`,
      currentStatus: "BOOKED",
      currentWarehouse: originWarehouse,
      statusHistory: [
        {
          status: "BOOKED",
          warehouse: originWarehouse,
          remarks: req.body.remarks || "Shipment booked and registered",
          updatedBy: userId,
        },
      ],
    });
    // console.log("Shipment created successfully:", shipment);
    const raw = await Shipment.findById(shipment._id);

    // console.log(raw.originWarehouse);
    const populated = await Shipment.findById(shipment._id)
      .populate("originWarehouse")
      .populate("destinationWarehouse")
      .populate("senderCustomer")
      .populate("receiverCustomer")
      .populate("bookedBy", "name");
    // console.log(populated)
    res.status(201).json({
      success: true,
      shipment: populated,
    });
  } catch (error) {
    console.error("CREATE SHIPMENT ERROR DETAILS:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
}

export async function getShipments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const { search, status, warehouse } = req.query;

    // 1. Role-based Warehouse Access Filter
    let warehouseAccessFilter = {};
    if (req.user.role.name !== "Super Admin") {
      const userWarehouseId = req.user.warehouse?._id || req.user.warehouse;
      if (!userWarehouseId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No warehouse assigned to this staff user.",
        });
      }
      warehouseAccessFilter = {
        $or: [
          { originWarehouse: userWarehouseId },
          { destinationWarehouse: userWarehouseId },
          { currentWarehouse: userWarehouseId },
        ],
      };
    }

    // 2. Build Query Criteria
    const query = { ...warehouseAccessFilter };

    if (status) {
      query.currentStatus = status;
    }

    if (warehouse) {
      if (req.user.role.name === "Super Admin") {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { originWarehouse: warehouse },
            { destinationWarehouse: warehouse },
            { currentWarehouse: warehouse },
          ]
        });
      }
    }

    // 3. Server-side Search logic
    if (search) {
      const matchingCustomers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ]
      }).select("_id").lean();

      const customerIds = matchingCustomers.map(c => c._id);

      const searchOr = [
        { shipmentNumber: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { qrCode: { $regex: search, $options: "i" } },
        { goodsDescription: { $regex: search, $options: "i" } },
      ];

      if (customerIds.length > 0) {
        searchOr.push({ senderCustomer: { $in: customerIds } });
        searchOr.push({ receiverCustomer: { $in: customerIds } });
      }

      if (query.$and) {
        query.$and.push({ $or: searchOr });
      } else {
        query.$and = [{ $or: searchOr }];
      }
    }

    // 4. Query Database
    const totalRecords = await Shipment.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const shipments = await Shipment.find(query)
      .populate("originWarehouse", "name city code")
      .populate("destinationWarehouse", "name city code")
      .populate("currentWarehouse", "name city code")
      .populate("senderCustomer", "name mobile")
      .populate("receiverCustomer", "name mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: shipments,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getShipmentById(req, res) {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("originWarehouse")
      .populate("destinationWarehouse")
      .populate("currentWarehouse")
      .populate("senderCustomer")
      .populate("receiverCustomer")
      .populate("bookedBy", "name")
      .populate("statusHistory.updatedBy", "name")
      .populate("statusHistory.warehouse", "name");

    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

    res.json(shipment);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status, warehouse, remarks, pickup } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role.name;
    const userWarehouseId = req.user.warehouse?._id || req.user.warehouse;

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

    const currentWarehouseId = shipment.currentWarehouse?.toString();
    const destinationWarehouseId = shipment.destinationWarehouse?.toString();

    // 1. Role-based workflow validation
    const managerOnlyStatuses = ["RECEIVED", "READY_FOR_PICKUP", "COMPLETED"];
    const isManagerOnly = managerOnlyStatuses.includes(status);

    if (isManagerOnly) {
      if (userRole !== "Super Admin" && userRole !== "Warehouse Manager") {
        return res.status(403).json({
          success: false,
          message: `Access denied. Only Managers or Super Admins can transition shipments to ${status}.`,
        });
      }

      // Check destination warehouse assignment
      if (userRole === "Warehouse Manager") {
        if (!userWarehouseId || userWarehouseId.toString() !== destinationWarehouseId) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only perform destination acceptance or completion at your assigned destination warehouse.",
          });
        }
      }
    } else {
      // Operator/Manager status updates (STORED, READY_FOR_DISPATCH, DISPATCHED, IN_TRANSIT, CANCELLED)
      if (userRole !== "Super Admin") {
        if (!userWarehouseId) {
          return res.status(403).json({
            success: false,
            message: "Access denied. No warehouse assigned to this staff user.",
          });
        }
        // Staff user must be assigned to the shipment's current warehouse to update its status
        if (userWarehouseId.toString() !== currentWarehouseId) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You can only update shipments currently located at your assigned warehouse.",
          });
        }
      }
    }

    // 2. Perform transition
    shipment.currentStatus = status;
    if (warehouse) {
      shipment.currentWarehouse = warehouse;
    }

    // Record in history
    shipment.statusHistory.push({
      status,
      warehouse: warehouse || shipment.currentWarehouse,
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: userId,
      createdAt: new Date(),
    });

    // If status is COMPLETED, save the customer pickup details
    if (status === "COMPLETED" && pickup) {
      shipment.pickup = {
        receiverName: pickup.receiverName,
        receiverPhone: pickup.receiverPhone,
        nationalId: pickup.nationalId,
        remarks: pickup.remarks,
        signaturePath: pickup.signaturePath || "",
        photoPath: pickup.photoPath || "",
        pickupDate: new Date(),
        receivedBy: userId,
      };
    }

    await shipment.save();

    const populated = await Shipment.findById(shipment._id)
      .populate("originWarehouse")
      .populate("destinationWarehouse")
      .populate("currentWarehouse")
      .populate("senderCustomer")
      .populate("receiverCustomer")
      .populate("bookedBy", "name")
      .populate("statusHistory.updatedBy", "name")
      .populate("statusHistory.warehouse", "name");

    res.json({
      success: true,
      shipment: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadInvoicePdf(req, res) {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("originWarehouse")
      .populate("destinationWarehouse")
      .populate("currentWarehouse")
      .populate("senderCustomer")
      .populate("receiverCustomer")
      .populate("bookedBy", "name")
      .populate("pickup.receivedBy", "name")
      .populate("statusHistory.updatedBy", "name")
      .populate("statusHistory.warehouse", "name");

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (shipment.currentStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Invoice available only for completed shipments",
      });
    }

    const settings = await Setting.findOne();

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${shipment.shipmentNumber}.pdf`,
    );

    doc.pipe(res);

    // =====================================================
    // HEADER
    // =====================================================

    doc.fontSize(24).text(settings?.companyName || "LIBYA LOGISTICS", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc.fontSize(16).text("Shipment Invoice", {
      align: "center",
    });

    doc.moveDown();

    if (settings) {
      doc.fontSize(10).text(settings.address || "", { align: "center" });

      doc.text(`${settings.phone || ""}   ${settings.email || ""}`, {
        align: "center",
      });
    }

    doc.moveDown(2);

    // =====================================================
    // SHIPMENT INFO
    // =====================================================

    doc.fontSize(18).text("Shipment Information");

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Shipment Number: ${shipment.shipmentNumber}`);

    doc.text(
      `Booking Date: ${new Date(shipment.bookingDate).toLocaleString()}`,
    );

    doc.text(`Current Status: ${shipment.currentStatus}`);

    doc.text(`Barcode: ${shipment.barcode || "-"}`);

    doc.text(`QR Code: ${shipment.qrCode || "-"}`);

    doc.moveDown();

    // =====================================================
    // ROUTE DETAILS
    // =====================================================

    doc.fontSize(18).text("Route Information");

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Origin Warehouse: ${shipment.originWarehouse?.name || "-"}`);

    doc.text(
      `Destination Warehouse: ${shipment.destinationWarehouse?.name || "-"}`,
    );

    doc.text(`Current Warehouse: ${shipment.currentWarehouse?.name || "-"}`);

    doc.moveDown();

    // =====================================================
    // SENDER
    // =====================================================

    doc.fontSize(18).text("Sender Details");

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Name: ${shipment.senderCustomer?.name || "-"}`);

    doc.text(`Phone: ${shipment.senderCustomer?.mobile || "-"}`);

    doc.text(`Address: ${shipment.senderCustomer?.address || "-"}`);

    doc.text(`National ID: ${shipment.senderCustomer?.nationalId || "-"}`);

    doc.moveDown();

    // =====================================================
    // RECEIVER
    // =====================================================

    doc.fontSize(18).text("Receiver Details");

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Name: ${shipment.receiverCustomer?.name || "-"}`);

    doc.text(`Phone: ${shipment.receiverCustomer?.mobile || "-"}`);

    doc.text(`Address: ${shipment.receiverCustomer?.address || "-"}`);

    doc.text(`National ID: ${shipment.receiverCustomer?.nationalId || "-"}`);

    doc.moveDown();

    // =====================================================
    // PACKAGE DETAILS
    // =====================================================

    doc.fontSize(18).text("Package Details");

    doc.moveDown();

    doc.fontSize(11);

    doc.text(`Goods Description: ${shipment.goodsDescription || "-"}`);

    doc.text(`Package Count: ${shipment.packageCount}`);

    doc.text(`Weight: ${shipment.weight} kg`);

    doc.text(`Declared Value: ${shipment.declaredValue} LYD`);

    doc.moveDown();

    // =====================================================
    // PICKUP
    // =====================================================

    if (shipment.pickup) {
      doc.fontSize(18).text("Delivery Confirmation");

      doc.moveDown();

      doc.fontSize(11);

      doc.text(`Collected By: ${shipment.pickup.receiverName || "-"}`);

      doc.text(`Phone: ${shipment.pickup.receiverPhone || "-"}`);

      doc.text(`National ID: ${shipment.pickup.nationalId || "-"}`);

      doc.text(
        `Pickup Date: ${shipment.pickup.pickupDate
          ? new Date(shipment.pickup.pickupDate).toLocaleString()
          : "-"
        }`,
      );

      doc.text(`Remarks: ${shipment.pickup.remarks || "-"}`);

      doc.moveDown();
    }

    // =====================================================
    // TIMELINE
    // =====================================================

    doc.fontSize(18).text("Shipment Timeline");

    doc.moveDown();

    shipment.statusHistory.forEach((item) => {
      doc.fontSize(10);

      doc.text(
        `${item.status} | ${item.warehouse?.name || "Transit"} | ${new Date(
          item.createdAt,
        ).toLocaleString()}`,
      );

      if (item.remarks) {
        doc.text(`Remarks: ${item.remarks}`);
      }

      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    doc.fontSize(9).text(`Generated on ${new Date().toLocaleString()}`, {
      align: "center",
    });

    doc.text("System Generated Invoice", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
