import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Database & Seeder
import connectDB from "./config/database.js";
import seedOwner from "./seeders/ownerSeeder.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Load environment variables
dotenv.config();

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB();

    // 2️⃣ Seed owner (auto, aman, tidak duplikat)
    await seedOwner();

    // 3️⃣ Init express
    const app = express();

    // 4️⃣ Global middleware
    app.use(cors());
    app.use(express.json());

    // 5️⃣ API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/branches", branchRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/inventory", inventoryRoutes);
    app.use("/api/transactions", transactionRoutes);
    app.use("/api/dashboard", dashboardRoutes);

    // 6️⃣ Health check (opsional tapi disarankan)
    app.get("/", (req, res) => {
      res.json({
        status: "OK",
        message: "Toko Multi Cabang API is running"
      });
    });

    // 7️⃣ Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

// Run server
startServer();
