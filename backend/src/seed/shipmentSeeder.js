import Shipment from "../models/Shipment.js";

const statuses = [
  "BOOKED",
  "STORED",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "IN_TRANSIT",
  "RECEIVED",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

export async function seedShipments(
  warehouses,
  customers,
  users
) {
  await Shipment.deleteMany({});

  const shipments = [];

  for (let i = 1; i <= 250; i++) {
    const status =
      statuses[
        Math.floor(
          Math.random() *
            statuses.length
        )
      ];

    const origin =
      warehouses[
        Math.floor(
          Math.random() *
            warehouses.length
        )
      ];

    const destination =
      warehouses[
        Math.floor(
          Math.random() *
            warehouses.length
        )
      ];

    shipments.push({
      shipmentNumber:
        "LY-2026-" +
        String(i).padStart(
          6,
          "0"
        ),

      barcode:
        "BAR" + i,

      qrCode:
        "QR" + i,

      originWarehouse:
        origin._id,

      destinationWarehouse:
        destination._id,

      senderCustomer:
        customers[
          Math.floor(
            Math.random() *
              customers.length
          )
        ]._id,

      receiverCustomer:
        customers[
          Math.floor(
            Math.random() *
              customers.length
          )
        ]._id,

      packageCount:
        Math.floor(
          Math.random() * 5
        ) + 1,

      weight:
        Math.floor(
          Math.random() * 100
        ) + 1,

      declaredValue:
        Math.floor(
          Math.random() *
            10000
        ),

      currentStatus:
        status,

      currentWarehouse:
        destination._id,

      bookedBy:
        users[0]._id,

      statusHistory: [
        {
          status,
          warehouse:
            destination._id,
          remarks:
            "Seed data",
          updatedBy:
            users[0]._id,
        },
      ],
    });
  }

  return Shipment.insertMany(
    shipments
  );
}