import express from "express";
import {
  getReportData,
  downloadPdfReport,
  downloadExcelReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReportData);
router.get("/pdf", downloadPdfReport);
router.get("/excel", downloadExcelReport);

export default router;
