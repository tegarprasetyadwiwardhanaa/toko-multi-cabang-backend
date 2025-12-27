import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    tipe_lokasi: {
      type: String,
      enum: ["utama", "cabang"],
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null
    },
    stok: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    harga_modal: {
      type: Number,
      required: true,
      min: 0
    },
    harga_jual: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Inventory", inventorySchema);