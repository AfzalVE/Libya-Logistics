import Shipment from "../models/Shipment.js";

export async function generateShipmentNumber() {
  const count = await Shipment.countDocuments();

  const next = String(count + 1).padStart(
    6,
    "0"
  );

  return `LY-${new Date().getFullYear()}-${next}`;
}