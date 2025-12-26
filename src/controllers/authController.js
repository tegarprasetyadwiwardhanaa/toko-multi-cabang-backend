import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Branch from "../models/Branch.js"; 

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.is_active === false) {
      return res.status(403).json({ 
        message: "Akun Anda telah dinonaktifkan. Silakan hubungi Owner." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // ---  CEK STATUS CABANG UNTUK STAFF ---
    if (user.role === 'staff' && user.branch) {
      const branchInfo = await Branch.findById(user.branch);

      if (!branchInfo || branchInfo.is_active === false) {
        return res.status(403).json({ 
          message: "Akses ditolak. Cabang tempat Anda bekerja telah Non-Aktif." 
        });
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        branch: user.branch
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};