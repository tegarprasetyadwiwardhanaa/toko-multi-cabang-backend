import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  res.json(await Category.find());
};

export const createCategory = async (req, res) => {
  const category = await Category.create({
    nama_kategori: req.body.nama_kategori
  });
  res.json(category);
};

export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(404).json({ message: "Kategori tidak ditemukan" });

  category.nama_kategori = req.body.nama_kategori;
  await category.save();

  res.json(category);
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(404).json({ message: "Kategori tidak ditemukan" });

  await category.deleteOne();
  res.json({ message: "Kategori berhasil dihapus" });
};
