import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/roleMiddleware.js";
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
} from "../controllers/branchController.js";

const router = express.Router();

router.get("/", protect, getBranches);
router.get("/:id", protect, getBranchById);

// OWNER ONLY
router.post("/", protect, ownerOnly, createBranch);
router.put("/:id", protect, ownerOnly, updateBranch);
router.delete("/:id", protect, ownerOnly, deleteBranch);

export default router;
