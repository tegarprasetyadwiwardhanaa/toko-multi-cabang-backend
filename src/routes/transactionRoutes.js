import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTransaction,
  getTransactions,
  getTransactionById
} from "../controllers/transactionController.js";

const router = express.Router();

// === TRANSACTION FLOW (POS) ===
// Membuat transaksi baru (langsung selesai & potong stok)
router.post("/", protect, createTransaction);

// === HISTORY ===
// Melihat riwayat transaksi (sesuai cabang user login)
router.get("/", protect, getTransactions);

// Melihat detail satu transaksi
router.get("/:id", protect, getTransactionById);

export default router;