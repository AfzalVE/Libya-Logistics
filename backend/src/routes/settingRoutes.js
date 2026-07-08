import express from "express";
import {
  updateProfile,
  changePassword
} from "../controllers/settingController.js";

const router = express.Router();

router.put("/:userId/profile", updateProfile);
router.put("/:userId/password", changePassword);

export default router;
