import mongoose from "mongoose";
import Shipment from "../models/Shipment.js";
import Customer from "../models/Customer.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export async function getReportData(req, res) {
  try {
    const {
      from,
      to,
      warehouse,
      status,
      search,
      page = 1,
      limit = 20,
    } = req.query;

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

    const filter = { ...warehouseAccessFilter };

    // Date Filter
    if (from || to) {
      filter.bookingDate = {};
      if (from) {
        filter.bookingDate.$gte = new Date(from);
      }
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.bookingDate.$lte = endDate;
      }
    }

    if (status) {
      filter.currentStatus = status;
    }

    if (warehouse) {
      if (req.user.role.name === "Super Admin") {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { originWarehouse: warehouse },
            { destinationWarehouse: warehouse },
            { currentWarehouse: warehouse },
          ]
        });
      }
    }

    // Global Search
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

      if (filter.$and) {
        filter.$and.push({ $or: searchOr });
      } else {
        filter.$and = [{ $or: searchOr }];
      }
    }

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    // Run Aggregation for Stats (Avoid reduce)
    const [statsResult, shipments, totalRecords] = await Promise.all([
      Shipment.aggregate([
        { $match: filter },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalShipments: { $sum: 1 },
                  totalWeight: { $sum: { $ifNull: ["$weight", 0] } },
                  totalValue: { $sum: { $ifNull: ["$declaredValue", 0] } }
                }
              }
            ],
            statusCounts: [
              {
                $group: {
                  _id: "$currentStatus",
                  count: { $sum: 1 }
                }
              }
            ],
            warehouseStats: [
              {
                $lookup: {
                  from: "warehouses",
                  localField: "currentWarehouse",
                  foreignField: "_id",
                  as: "warehouseInfo"
                }
              },
              {
                $unwind: {
                  path: "$warehouseInfo",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $group: {
                  _id: {
                    id: "$currentWarehouse",
                    name: { $ifNull: ["$warehouseInfo.name", "In Transit"] }
                  },
                  count: { $sum: 1 },
                  totalWeight: { $sum: { $ifNull: ["$weight", 0] } },
                  totalValue: { $sum: { $ifNull: ["$declaredValue", 0] } }
                }
              }
            ]
          }
        }
      ]),

      Shipment.find(filter)
        .populate("originWarehouse", "name city")
        .populate("destinationWarehouse", "name city")
        .populate("senderCustomer", "name mobile")
        .populate("receiverCustomer", "name mobile")
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Shipment.countDocuments(filter),
    ]);

    const facetData = statsResult[0] || {};
    const summary = facetData.summary?.[0] || {
      totalShipments: 0,
      totalWeight: 0,
      totalValue: 0
    };

    return res.status(200).json({
      success: true,
      summary: {
        totalShipments: summary.totalShipments,
        totalWeight: summary.totalWeight,
        totalValue: summary.totalValue,
        statusCounts: facetData.statusCounts || [],
        warehouseStats: facetData.warehouseStats || [],
      },
      shipments,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
      },
    });
  } catch (error) {
    console.error("Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate report.",
      error: error.message,
    });
  }
}

export async function downloadPdfReport(req, res) {
  try {
    const { from, to, warehouse, status, search } = req.query;

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

    const filter = { ...warehouseAccessFilter };

    if (from || to) {
      filter.bookingDate = {};

      if (from) {
        filter.bookingDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.bookingDate.$lte = endDate;
      }
    }

    if (status) {
      filter.currentStatus = status;
    }

    if (warehouse) {
      if (req.user.role.name === "Super Admin") {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { originWarehouse: warehouse },
            { destinationWarehouse: warehouse },
            { currentWarehouse: warehouse },
          ]
        });
      }
    }

    // Global Search
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

      if (filter.$and) {
        filter.$and.push({ $or: searchOr });
      } else {
        filter.$and = [{ $or: searchOr }];
      }
    }

    const shipments = await Shipment.find(filter)
      .populate("originWarehouse", "name city")
      .populate("destinationWarehouse", "name city");

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=shipment-report.pdf",
    );

    doc.pipe(res);

    doc.fontSize(22);
    doc.text("Libya Logistics");

    doc.moveDown();

    doc.fontSize(16);
    doc.text("Shipment Operations Report");

    doc.moveDown();

    doc.fontSize(10);

    doc.text(`Generated: ${new Date().toLocaleString()}`);

    doc.text(`Total Shipments: ${shipments.length}`);

    doc.moveDown();

    shipments.forEach((shipment) => {
      doc.fontSize(12);

      doc.text(`${shipment.shipmentNumber} | ${shipment.currentStatus}`);

      doc.fontSize(10);

      doc.text(`Origin: ${shipment.originWarehouse?.name}`);

      doc.text(`Destination: ${shipment.destinationWarehouse?.name}`);

      doc.text(`Product Description: ${shipment.goodsDescription}`);

      doc.text(`Weight: ${shipment.weight} kg`);

      doc.text(`Value: ${shipment.declaredValue} LYD`);

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadExcelReport(req, res) {
  try {
    const { from, to, warehouse, status, search } = req.query;

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

    const filter = { ...warehouseAccessFilter };

    if (from || to) {
      filter.bookingDate = {};

      if (from) {
        filter.bookingDate.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.bookingDate.$lte = endDate;
      }
    }

    if (status) {
      filter.currentStatus = status;
    }

    if (warehouse) {
      if (req.user.role.name === "Super Admin") {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { originWarehouse: warehouse },
            { destinationWarehouse: warehouse },
            { currentWarehouse: warehouse },
          ]
        });
      }
    }

    // Global Search
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

      if (filter.$and) {
        filter.$and.push({ $or: searchOr });
      } else {
        filter.$and = [{ $or: searchOr }];
      }
    }

    const shipments = await Shipment.find(filter)
      .populate("originWarehouse", "name")
      .populate("destinationWarehouse", "name");

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Shipments");

    sheet.columns = [
      {
        header: "Shipment Number",
        key: "shipmentNumber",
        width: 25,
      },
      {
        header: "Status",
        key: "status",
        width: 20,
      },
      {
        header: "Origin",
        key: "origin",
        width: 25,
      },
      {
        header: "Destination",
        key: "destination",
        width: 25,
      },
      {
        header: "Product Description",
        key: "goodsDescription",
        width: 25,
      },
      {
        header: "Weight",
        key: "weight",
        width: 15,
      },
      {
        header: "Value",
        key: "value",
        width: 15,
      },
    ];

    sheet.getRow(1).font = {
      bold: true,
    };

    sheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    shipments.forEach((shipment) => {
      sheet.addRow({
        shipmentNumber: shipment.shipmentNumber,

        status: shipment.currentStatus,

        origin: shipment.originWarehouse?.name,

        destination: shipment.destinationWarehouse?.name,

        goodsDescription: shipment.goodsDescription,

        weight: shipment.weight,

        value: shipment.declaredValue,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=shipment-report.xlsx",
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
