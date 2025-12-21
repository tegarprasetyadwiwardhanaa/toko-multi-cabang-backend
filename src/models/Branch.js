import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    nama_cabang: String,
    alamat: String,
    kota: String
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);
