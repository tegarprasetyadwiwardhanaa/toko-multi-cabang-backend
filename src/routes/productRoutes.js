import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);

// OWNER ONLY
router.post("/", protect, ownerOnly, createProduct);
router.put("/:id", protect, ownerOnly, updateProduct);
router.delete("/:id", protect, ownerOnly, deleteProduct);

export default router;
