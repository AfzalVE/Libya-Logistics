import express from "express";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateStatus
}
from "../controllers/shipmentController.js";

const router = express.Router();

router.get("/", getShipments);
router.post("/", createShipment);
router.get("/:id", getShipmentById);
router.patch("/:id/status", updateStatus
);

export default router;