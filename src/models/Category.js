import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    nama_kategori: {
      type: String,
      required: true,
      trim: true
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
