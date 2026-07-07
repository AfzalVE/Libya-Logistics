import Warehouse from "../models/Warehouse.js";

export async function createWarehouse(req, res) {
  try {
    const { name, code, city, address, phone, managerName, latitude, longitude } = req.body;
    
    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Warehouse code already exists" });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      city,
      address,
      phone,
      managerName,
      latitude,
      longitude,
      status: "ACTIVE"
    });

    res.status(201).json({
      success: true,
      warehouse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getWarehouses(req, res) {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
