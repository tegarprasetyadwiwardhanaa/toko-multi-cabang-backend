import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    total: Number,
    uang_bayar: Number,
    kembalian: Number,
    status: { type: String, enum: ["draft", "selesai"], default: "draft" }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
