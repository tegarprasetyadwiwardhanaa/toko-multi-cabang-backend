import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getBranchInventoryList, 
  updateBranchPrice,
  getMainInventory,
  getBranchInventory,
  addMainInventory,
  updateBranchInventory,
  restockBranch,
  getPOSProducts,
  getBranchStockDetail 
} from "../controllers/inventoryController.js";

const router = express.Router();

// === INVENTORY UTAMA (GUDANG PUSAT) ===
router.get("/main", protect, ownerOnly, getMainInventory);
router.post("/main", protect, ownerOnly, addMainInventory);

// === INVENTORY CABANG (ADMIN/OWNER) ===
router.get("/branch/:branchId", protect, getBranchInventory);
router.put("/branch/:inventoryId", protect, ownerOnly, updateBranchInventory);
router.get("/branch-stock", protect, ownerOnly, getBranchStockDetail);

// === RESTOCK (DISTRIBUSI BARANG) ===
router.post("/restock", protect, ownerOnly, restockBranch);

// Route untuk list stok per cabang
router.get("/branch-list/:branchId", protect, ownerOnly, getBranchInventoryList);

// Route untuk update harga
router.put("/price/:inventoryId", protect, ownerOnly, updateBranchPrice);

// === POS KASIR (KHUSUS STAFF/KASIR) ===
// Endpoint ini dipakai oleh halaman Transaction.vue di frontend
router.get("/pos", protect, getPOSProducts);

export default router;