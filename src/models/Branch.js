import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    nama_cabang: {
      type: String,
      required: true,
      trim: true
    },
    alamat: {
      type: String,
      required: true
    },
    kota: {
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

export default mongoose.model("Branch", branchSchema);
