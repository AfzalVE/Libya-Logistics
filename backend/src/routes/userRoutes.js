import express from "express";
import {
  loginUser,
  createUser,
  getUsers,
  getRoles
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", getUsers);
router.get("/roles", getRoles);

export default router;
