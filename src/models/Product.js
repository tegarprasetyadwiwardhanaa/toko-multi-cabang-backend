import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  kode_barang: { type: String, unique: true },
  nama_barang: String,
  satuan: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  is_active: { type: Boolean, default: true } // <--- TAMBAHAN
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
