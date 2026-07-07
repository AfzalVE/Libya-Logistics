import Shipment from "../models/Shipment.js";
import { generateShipmentNumber } from "../utils/generateShipmentNumber.js";

export async function createShipment(req, res) {
  try {
    const shipmentNumber = await generateShipmentNumber();

    const shipment = await Shipment.create({
      ...req.body,
      shipmentNumber,
      barcode: `BAR-${shipmentNumber}`,
      qrCode: `QR-${shipmentNumber}`,
      currentStatus: "BOOKED",
      currentWarehouse: req.body.originWarehouse,
      statusHistory: [
        {
          status: "BOOKED",
          warehouse: req.body.originWarehouse,
          remarks: req.body.remarks || "Shipment booked and registered",
          updatedBy: req.body.bookedBy
        }
      ]
    });

    const populated = await Shipment.findById(shipment._id)
      .populate("originWarehouse")
      .populate("destinationWarehouse")
      .populate("senderCustomer")
      .populate("receiverCustomer")
      .populate("bookedBy", "name");

    res.status(201).json({
      success: true,
      shipment: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getShipments(req, res) {
  try {
    const shipments = await Shipment.find()
      .populate("originWarehouse", "name city code")
      .populate("destinationWarehouse", "name city code")
      .populate("currentWarehouse", "name city code")
      .populate("senderCustomer", "name mobile")
      .populate("receiverCustomer", "name mobile")
      .sort({ createdAt: -1 });

    res.json(shipments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    res.json(shipment);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status, warehouse, remarks, updatedBy, pickup } = req.body;

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.currentStatus = status;
    if (warehouse) {
      shipment.currentWarehouse = warehouse;
    }

    // Record in history
    shipment.statusHistory.push({
      status,
      warehouse: warehouse || shipment.currentWarehouse,
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: updatedBy || null,
      createdAt: new Date()
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
        receivedBy: updatedBy
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
      shipment: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}