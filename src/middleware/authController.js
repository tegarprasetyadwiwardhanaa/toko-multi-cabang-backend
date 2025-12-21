import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    const user = await User.findOne({ username }).populate("branch");
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        branch: user.branch ? user.branch._id : null
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        branch: user.branch
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login gagal",
      error: error.message
    });
  }
};
