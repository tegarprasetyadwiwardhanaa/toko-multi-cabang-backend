import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "toko_db" // ⬅️ PAKSA DB YANG DIPAKAI
    });

    console.log("✅ MongoDB connected");
    console.log("📦 DB NAME:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
