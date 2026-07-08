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

export async function updateWarehouse(req, res) {
  try {
    const { id } = req.params;
    const { name, code, city, address, phone, managerName, status, latitude, longitude } = req.body;

    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    if (code && code.toUpperCase() !== warehouse.code) {
      const existing = await Warehouse.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Warehouse code already exists" });
      }
      warehouse.code = code.toUpperCase();
    }

    warehouse.name = name || warehouse.name;
    warehouse.city = city || warehouse.city;
    warehouse.address = address || warehouse.address;
    warehouse.phone = phone || warehouse.phone;
    warehouse.managerName = managerName || warehouse.managerName;
    warehouse.status = status || warehouse.status;
    if (latitude !== undefined) warehouse.latitude = latitude;
    if (longitude !== undefined) warehouse.longitude = longitude;

    await warehouse.save();

    res.json({
      success: true,
      warehouse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteWarehouse(req, res) {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    await Warehouse.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Warehouse deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
