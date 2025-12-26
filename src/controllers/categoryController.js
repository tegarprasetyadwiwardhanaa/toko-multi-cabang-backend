import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const { active } = req.query;
  let filter = {};
  if (active === 'true') filter.is_active = true;

  res.json(await Category.find(filter));
};

export const createCategory = async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    // 1. VALIDASI DUPLIKASI (Case Insensitive)
    const existing = await Category.findOne({
      nama_kategori: { $regex: new RegExp(`^${nama_kategori}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ message: `Kategori "${nama_kategori}" sudah ada.` });
    }

    const category = await Category.create({ nama_kategori });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    // 2. VALIDASI DUPLIKASI SAAT UPDATE
    if (nama_kategori && nama_kategori !== category.nama_kategori) {
      const duplicateCheck = await Category.findOne({
        nama_kategori: { $regex: new RegExp(`^${nama_kategori}$`, 'i') }
      });

      if (duplicateCheck && duplicateCheck._id.toString() !== id) {
        return res.status(400).json({ message: `Kategori "${nama_kategori}" sudah ada.` });
      }
    }

    category.nama_kategori = nama_kategori || category.nama_kategori;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    category.is_active = !category.is_active;
    await category.save();

    const statusMsg = category.is_active ? "diaktifkan" : "dinonaktifkan";
    res.json({ message: `Kategori berhasil ${statusMsg}`, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};