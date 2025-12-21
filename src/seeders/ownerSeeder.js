import bcrypt from "bcrypt";
import User from "../models/User.js";

const seedOwner = async () => {
  try {
    const existingOwner = await User.findOne({ role: "owner" });

    if (existingOwner) {
      console.log("ℹ️ Owner already exists, seeder skipped");
      return;
    }

    const username = process.env.OWNER_USERNAME || "owner";
    const password = process.env.OWNER_PASSWORD || "123456";
    const nama_lengkap = process.env.OWNER_NAME || "Owner Toko";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      nama_lengkap,
      role: "owner",
      branch: null
    });

    console.log("✅ Owner account seeded successfully");
    console.log(`   username: ${username}`);
    console.log(`   password: ${password}`);
  } catch (error) {
    console.error("❌ Failed to seed owner:", error.message);
  }
};

export default seedOwner;
