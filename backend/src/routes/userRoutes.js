import express from "express";
import {
  loginUser,
  createUser,
  getUsers,
  getRoles,
  updateUser,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", getUsers);
router.get("/roles", getRoles);
router.put("/:id", updateUser);
router.patch("/:id/status", toggleUserStatus);
router.patch("/:id/role", changeUserRole);
router.delete("/:id", deleteUser);

export default router;
