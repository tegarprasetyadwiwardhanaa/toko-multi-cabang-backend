import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  tipe_lokasi: { type: String, enum: ["utama", "cabang"] },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
  stok: Number,
  harga_modal: Number,
  harga_jual: Number,
  harga_jual: {
  type: Number,
  required: true
}

});

export default mongoose.model("Inventory", inventorySchema);
