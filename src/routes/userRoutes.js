import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// OWNER ONLY
router.get("/", protect, ownerOnly, getUsers);
router.post("/", protect, ownerOnly, createUser);
router.put("/:id", protect, ownerOnly, updateUser);
router.delete("/:id", protect, ownerOnly, deleteUser);

export default router;
