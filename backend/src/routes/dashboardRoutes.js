import express from "express";

import {
  getStats,
  getChartData,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/charts", getChartData);

export default router;