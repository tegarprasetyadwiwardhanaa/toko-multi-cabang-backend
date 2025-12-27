import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    kode_barang: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    nama_barang: {
      type: String,
      required: true,
      trim: true
    },
    satuan: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);