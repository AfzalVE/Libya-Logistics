import Setting from "../models/Setting.js";
import User from "../models/User.js";
import Warehouse from "../models/Warehouse.js";
import Shipment from "../models/Shipment.js";

export async function getSettings(req, res) {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({});
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateSettings(req, res) {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getSystemStats(req, res) {
  try {
    const [users, warehouses, shipments, activeUsers] = await Promise.all([
      User.countDocuments(),
      Warehouse.countDocuments(),
      Shipment.countDocuments(),
      User.countDocuments({
        status: "ACTIVE",
      }),
    ]);

    res.json({
      users,
      warehouses,
      shipments,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
