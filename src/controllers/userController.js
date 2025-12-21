import bcrypt from "bcrypt";
import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").populate("branch");
  res.json(users);
};

export const createUser = async (req, res) => {
  const { username, password, role, nama_lengkap, branch } = req.body;

  const exists = await User.findOne({ username });
  if (exists)
    return res.status(400).json({ message: "Username sudah digunakan" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed,
    role,
    nama_lengkap,
    branch: branch || null
  });

  res.json(user);
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User tidak ditemukan" });

  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  Object.assign(user, req.body);
  await user.save();

  res.json(user);
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User tidak ditemukan" });

  await user.deleteOne();
  res.json({ message: "User berhasil dihapus" });
};
