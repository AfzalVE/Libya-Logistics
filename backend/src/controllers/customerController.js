import Customer from "../models/Customer.js";

export async function createCustomer(req, res) {
  try {
    const { name, mobile, alternateMobile, address, nationalId, email, notes } = req.body;

    const existing = await Customer.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ success: false, message: "Customer with this mobile already exists" });
    }

    const customer = await Customer.create({
      name,
      mobile,
      alternateMobile,
      address,
      nationalId,
      email,
      notes
    });

    res.status(201).json({
      success: true,
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCustomers(req, res) {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
