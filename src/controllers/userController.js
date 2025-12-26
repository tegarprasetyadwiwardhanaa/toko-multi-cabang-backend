import User from "../models/User.js";
import bcrypt from "bcrypt";

// GET ALL STAFF (Owner Only)
export const getStaffs = async (req, res) => {
  try {
    // Filter hanya role staff. Populate data cabang agar nama cabang muncul di tabel.
    const staffs = await User.find({ role: "staff" })
      .populate("branch", "nama_cabang")
      .select("-password"); // Jangan kirim password ke frontend (Security)
    
    res.json(staffs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE STAFF
export const createStaff = async (req, res) => {
  try {
    const { username, password, nama_lengkap, branch } = req.body;

    // Cek Duplikasi Username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah digunakan." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter." });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      nama_lengkap,
      branch,
      role: "staff",
      is_active: true
    });

    res.status(201).json({ message: "Staff berhasil dibuat", data: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STAFF
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, branch, password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Update Field Biasa
    if (nama_lengkap) user.nama_lengkap = nama_lengkap;
    if (branch) user.branch = branch;

    // Update Password (Hanya jika diisi)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Data staff diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE STATUS (SOFT DELETE)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Mencegah Owner menonaktifkan dirinya sendiri (Safety)
    if (user.role === 'owner') {
        return res.status(403).json({ message: "Tidak bisa menonaktifkan akun Owner" });
    }

    user.is_active = !user.is_active;
    await user.save();

    const statusMsg = user.is_active ? "diaktifkan kembali" : "dinonaktifkan";
    res.json({ message: `Akun staff berhasil ${statusMsg}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD (SELF)
export const changePassword = async (req, res) => {
  try {
    // req.user.id didapat dari middleware protect
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Cek Password Lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    // 2. Validasi Password Baru
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password baru minimal 6 karakter" });
    }

    // 3. Simpan Password Baru
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password berhasil diganti" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};