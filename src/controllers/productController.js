import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("category");
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product)
    return res.status(404).json({ message: "Barang tidak ditemukan" });

  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create({
    kode_barang: req.body.kode_barang,
    nama_barang: req.body.nama_barang,
    satuan: req.body.satuan,
    category: req.body.category
  });

  res.json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ message: "Barang tidak ditemukan" });

  Object.assign(product, req.body);
  await product.save();

  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).json({ message: "Barang tidak ditemukan" });

  await product.deleteOne();
  res.json({ message: "Barang berhasil dihapus" });
};
