import bcrypt from "bcrypt";
import User from "../models/User.js";

const seedOwner = async () => {
  try {
    // Cek apakah sudah ada user dengan role owner
    const existingOwner = await User.findOne({ role: "owner" });

    if (existingOwner) {
      console.log("ℹ️  Owner already exists, seeder skipped");
      return;
    }

    // Ambil dari .env atau gunakan default (HANYA UNTUK DEV)
    const username = process.env.OWNER_USERNAME || "owner";
    const password = process.env.OWNER_PASSWORD || "123456"; 
    const nama_lengkap = process.env.OWNER_NAME || "Kelompok 3";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      nama_lengkap,
      role: "owner",
      branch: null,     // Owner tidak terikat cabang
      is_active: true   // <--- WAJIB: Pastikan owner aktif saat dibuat
    });

    console.log("✅ Owner account seeded successfully");
    console.log(`   Username: ${username}`);
    
    // HANYA TAMPILKAN PASSWORD DI MODE DEVELOPMENT
    if (process.env.NODE_ENV !== 'production') {
        console.log(`   Password: ${password}`);
        console.log("⚠️  Please change your password immediately or use ENV variables.");
    } else {
        console.log(`   Password: [HIDDEN]`);
    }

  } catch (error) {
    console.error("❌ Failed to seed owner:", error.message);
  }
};

export default seedOwner;