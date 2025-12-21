import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getMainInventory,
  getBranchInventory,
  addMainInventory,
  updateBranchInventory,
  restockBranch
} from "../controllers/inventoryController.js";

const router = express.Router();

// INVENTORY UTAMA (GUDANG)
router.get("/main", protect, ownerOnly, getMainInventory);
router.post("/main", protect, ownerOnly, addMainInventory);

// INVENTORY CABANG
router.get("/branch/:branchId", protect, getBranchInventory);
router.put("/branch/:inventoryId", protect, ownerOnly, updateBranchInventory);

// RESTOCK
router.post("/restock", protect, ownerOnly, restockBranch);

export default router;
