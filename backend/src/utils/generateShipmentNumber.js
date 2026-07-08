import Shipment from "../models/Shipment.js";

export async function generateShipmentNumber() {
  const latestShipment = await Shipment.findOne()
    .sort({ shipmentNumber: -1 })
    .select("shipmentNumber")
    .lean();

  let nextSequence = 1;

  if (latestShipment?.shipmentNumber) {
    const lastSequence = parseInt(
      latestShipment.shipmentNumber.split("-")[2],
      10
    );

    nextSequence = lastSequence + 1;
  }

  return `LY-${new Date().getFullYear()}-${String(nextSequence).padStart(6, "0")}`;
}