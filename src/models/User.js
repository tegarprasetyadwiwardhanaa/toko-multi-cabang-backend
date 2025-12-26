import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    nama_lengkap: String,
    role: { type: String, enum: ["owner", "staff"] },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
