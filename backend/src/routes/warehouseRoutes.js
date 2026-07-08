import express from "express";
import {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouseController.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getWarehouses);

// Only Super Admin can write/edit/delete warehouse locations
router.use(authorize("Super Admin"));
router.post("/", createWarehouse);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;
