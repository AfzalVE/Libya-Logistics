import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

export async function seedUsers(warehouses) {
  await User.deleteMany({});

  const password = await bcrypt.hash("password123", 10);

  const superAdminRole = await Role.findOne({ name: "Super Admin" });
  const operatorRole = await Role.findOne({ name: "Warehouse Operator" });
  const managerRole = await Role.findOne({ name: "Warehouse Manager" });

  const tripoli = warehouses.find(w => w.code === "TRI") || warehouses[0];
  const benghazi = warehouses.find(w => w.code === "BEN") || warehouses[2];
  const misrata = warehouses.find(w => w.code === "MIS") || warehouses[1];

  const users = [
    {
      name: "Super Admin",
      email: "admin@libya.com",
      password,
      role: superAdminRole._id,
      status: "ACTIVE",
    },
    {
      name: "Tripoli Operator",
      email: "operator.tripoli@libya.com",
      password,
      role: operatorRole._id,
      warehouse: tripoli._id,
      status: "ACTIVE",
    },
    {
      name: "Tripoli Manager",
      email: "manager.tripoli@libya.com",
      password,
      role: managerRole._id,
      warehouse: tripoli._id,
      status: "ACTIVE",
    },
    {
      name: "Benghazi Operator",
      email: "operator.benghazi@libya.com",
      password,
      role: operatorRole._id,
      warehouse: benghazi._id,
      status: "ACTIVE",
    },
    {
      name: "Benghazi Manager",
      email: "manager.benghazi@libya.com",
      password,
      role: managerRole._id,
      warehouse: benghazi._id,
      status: "ACTIVE",
    },
    {
      name: "Misrata Operator",
      email: "operator.misrata@libya.com",
      password,
      role: operatorRole._id,
      warehouse: misrata._id,
      status: "ACTIVE",
    },
    {
      name: "Misrata Manager",
      email: "manager.misrata@libya.com",
      password,
      role: managerRole._id,
      warehouse: misrata._id,
      status: "ACTIVE",
    }
  ];

  // Add a few extra users to show user management
  for (let i = 1; i <= 5; i++) {
    users.push({
      name: `Staff Member ${i}`,
      email: `staff${i}@libya.com`,
      password,
      role: operatorRole._id,
      warehouse: tripoli._id,
      status: "ACTIVE"
    });
  }

  return User.insertMany(users);
}