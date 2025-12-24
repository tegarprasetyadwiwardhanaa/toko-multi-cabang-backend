import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getMainInventory,
  getBranchInventory,
  addMainInventory,
  updateBranchInventory,
  restockBranch,
  getPOSProducts // <--- TAMBAHAN PENTING: Import fungsi baru ini
} from "../controllers/inventoryController.js";

const router = express.Router();

// === INVENTORY UTAMA (GUDANG PUSAT) ===
router.get("/main", protect, ownerOnly, getMainInventory);
router.post("/main", protect, ownerOnly, addMainInventory);

// === INVENTORY CABANG (ADMIN/OWNER) ===
router.get("/branch/:branchId", protect, getBranchInventory);
router.put("/branch/:inventoryId", protect, ownerOnly, updateBranchInventory);

// === RESTOCK (DISTRIBUSI BARANG) ===
router.post("/restock", protect, ownerOnly, restockBranch);

// === POS KASIR (KHUSUS STAFF/KASIR) ===
// Endpoint ini dipakai oleh halaman Transaction.vue di frontend
router.get("/pos", protect, getPOSProducts);

export default router;