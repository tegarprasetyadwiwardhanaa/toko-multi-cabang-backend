import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getStaffs,
  createStaff,
  updateStaff,
  toggleUserStatus,
  changePassword
} from "../controllers/userController.js";

const router = express.Router();

// OWNER ONLY
router.put("/change-password", protect, changePassword);
router.get("/", protect, ownerOnly, getStaffs);
router.post("/", protect, ownerOnly, createStaff);
router.put("/:id", protect, ownerOnly, updateStaff);
router.delete("/:id", protect, ownerOnly, toggleUserStatus);

export default router;
