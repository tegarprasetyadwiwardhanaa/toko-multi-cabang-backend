import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTransaction,
  addItemToTransaction,
  checkoutTransaction,
  getTransactions,
  getTransactionById
} from "../controllers/transactionController.js";

const router = express.Router();

// TRANSACTION FLOW
router.post("/", protect, createTransaction);
router.post("/:id/items", protect, addItemToTransaction);
router.post("/:id/checkout", protect, checkoutTransaction);

// HISTORY
router.get("/", protect, getTransactions);
router.get("/:id", protect, getTransactionById);

export default router;
