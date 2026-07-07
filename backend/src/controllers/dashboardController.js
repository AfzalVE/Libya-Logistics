import Shipment from "../models/Shipment.js";
import Warehouse from "../models/Warehouse.js";
import User from "../models/User.js";

export async function getStats(req, res) {
  try {
    const [
      totalShipments,
      warehouses,
      users,
      completed,
      transit,
      pickup,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Warehouse.countDocuments(),
      User.countDocuments(),
      Shipment.countDocuments({
        currentStatus: "COMPLETED",
      }),
      Shipment.countDocuments({
        currentStatus: "IN_TRANSIT",
      }),
      Shipment.countDocuments({
        currentStatus: "READY_FOR_PICKUP",
      }),
    ]);

    res.json({
      totalShipments,
      warehouses,
      users,
      completed,
      transit,
      pickup,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getChartData(req, res) {
  try {
    const data = await Shipment.aggregate([
      {
        $group: {
          _id: "$currentStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}