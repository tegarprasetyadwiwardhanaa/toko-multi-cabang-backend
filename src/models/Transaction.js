import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    no_nota: { type: String, unique: true, required: true }, 
    
    total: { type: Number, required: true },
    uang_bayar: { type: Number, required: true },
    kembalian: { type: Number, required: true },
    
    cashier_name: String, 
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);