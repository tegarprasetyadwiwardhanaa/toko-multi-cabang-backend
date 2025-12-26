import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  nama_kategori: { type: String, required: true },
  is_active: { type: Boolean, default: true } // Tambahkan ini
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);