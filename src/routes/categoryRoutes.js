import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", protect, getCategories);

// OWNER ONLY
router.post("/", protect, ownerOnly, createCategory);
router.put("/:id", protect, ownerOnly, updateCategory);
router.delete("/:id", protect, ownerOnly, deleteCategory);

export default router;
