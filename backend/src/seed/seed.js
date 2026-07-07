import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";

import { seedWarehouses } from "./warehouseSeeder.js";
import { seedCustomers } from "./customerSeeder.js";
import { seedUsers } from "./userSeeder.js";
import { seedShipments } from "./shipmentSeeder.js";

import Role from "../models/Role.js";

async function run() {
  await connectDB();

  console.log("Cleaning and seeding roles...");
  await Role.deleteMany({});
  
  const superAdminRole = await Role.create({
    name: "Super Admin",
    description: "System Administrator",
  });
  
  const operatorRole = await Role.create({
    name: "Warehouse Operator",
    description: "Books and stores shipments",
  });
  
  const managerRole = await Role.create({
    name: "Warehouse Manager",
    description: "Dispatches, receives and releases shipments",
  });

  console.log("Seeding warehouses...");
  const warehouses = await seedWarehouses();

  console.log("Seeding users...");
  const users = await seedUsers(warehouses);

  console.log("Seeding customers...");
  const customers = await seedCustomers();

  console.log("Seeding shipments...");
  await seedShipments(warehouses, customers, users);

  console.log("Seed completed successfully");
  mongoose.disconnect();
}

run().catch(err => {
  console.error("Error seeding DB:", err);
  process.exit(1);
});