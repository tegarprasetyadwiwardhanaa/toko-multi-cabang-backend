import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  nama_kategori: String
});

export default mongoose.model("Category", categorySchema);
