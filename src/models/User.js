import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 4,
      trim: true
    },
    password: {
      type: String,
      minlength: 6,
      required: true
    },
    nama_lengkap: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["owner", "staff"],
      required: true
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);