import express from "express";
import {
  getReportData,
  downloadPdfReport,
  downloadExcelReport,
} from "../controllers/reportController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getReportData);
router.get("/pdf", downloadPdfReport);
router.get("/excel", downloadExcelReport);

export default router;
