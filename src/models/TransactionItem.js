import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  qty: Number,
  harga: Number,
  subtotal: Number
});

export default mongoose.model("TransactionItem", transactionItemSchema);
