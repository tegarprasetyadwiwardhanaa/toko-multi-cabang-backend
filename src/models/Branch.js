import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    nama_cabang: String,
    alamat: String,
    kota: String,
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);
