import express from "express";

import {
  getSettings,
  updateSettings,
  getSystemStats,
} from "../controllers/settingController.js";

const router = express.Router();

router.get("/", getSettings);

router.put("/", updateSettings);

router.get("/stats", getSystemStats);

export default router;
