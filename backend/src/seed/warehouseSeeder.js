import Warehouse from "../models/Warehouse.js";

export async function seedWarehouses() {
  await Warehouse.deleteMany({});

  const warehouses = [
    {
      name: "Tripoli Central",
      code: "TRI",
      city: "Tripoli",
      status: "ACTIVE",
    },
    {
      name: "Misrata Hub",
      code: "MIS",
      city: "Misrata",
      status: "ACTIVE",
    },
    {
      name: "Benghazi Main",
      code: "BEN",
      city: "Benghazi",
      status: "ACTIVE",
    },
    {
      name: "Sirte Depot",
      code: "SIR",
      city: "Sirte",
      status: "ACTIVE",
    },
    {
      name: "Sabha Branch",
      code: "SAB",
      city: "Sabha",
      status: "ACTIVE",
    },
    {
      name: "Al Bayda Center",
      code: "BAY",
      city: "Al Bayda",
      status: "ACTIVE",
    },
    {
      name: "Zawiya Warehouse",
      code: "ZAW",
      city: "Zawiya",
      status: "ACTIVE",
    },
  ];

  return Warehouse.insertMany(
    warehouses
  );
}