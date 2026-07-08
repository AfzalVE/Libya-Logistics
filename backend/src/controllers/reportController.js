import Shipment from "../models/Shipment.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export async function getReportData(req, res) {
  try {
    const { from, to, warehouse, status } = req.query;

    const filter = {};

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

    if (warehouse) {
      filter.originWarehouse = warehouse;
    }

    if (status) {
      filter.currentStatus = status;
    }

    const shipments = await Shipment.find(filter)
      .populate("originWarehouse", "name city")
      .populate("destinationWarehouse", "name city")
      .populate("senderCustomer", "name mobile")
      .populate("receiverCustomer", "name mobile")
      .sort({ bookingDate: -1 });

    const summary = {
      totalShipments: shipments.length,

      totalWeight: shipments.reduce((sum, item) => sum + (item.weight || 0), 0),

      totalValue: shipments.reduce(
        (sum, item) => sum + (item.declaredValue || 0),
        0,
      ),

      completed: shipments.filter((s) => s.currentStatus === "COMPLETED")
        .length,

      inTransit: shipments.filter((s) => s.currentStatus === "IN_TRANSIT")
        .length,

      cancelled: shipments.filter((s) => s.currentStatus === "CANCELLED")
        .length,
    };

    res.json({
      success: true,
      summary,
      shipments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function downloadPdfReport(req, res) {
  try {
    const { from, to, warehouse, status } = req.query;

    const filter = {};

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

    if (warehouse) {
      filter.originWarehouse = warehouse;
    }

    if (status) {
      filter.currentStatus = status;
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
    const { from, to, warehouse, status } = req.query;

    const filter = {};

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

    if (warehouse) {
      filter.originWarehouse = warehouse;
    }

    if (status) {
      filter.currentStatus = status;
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
