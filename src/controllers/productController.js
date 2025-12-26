import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "nama_kategori") 
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product)
    return res.status(404).json({ message: "Barang tidak ditemukan" });

  res.json(product);
};

export const createProduct = async (req, res) => {
  try {
    const { kode_barang, nama_barang, satuan, category } = req.body;

    // 1. CEK DUPLIKASI KODE BARANG
    const existingCode = await Product.findOne({ kode_barang });
    if (existingCode) {
      return res.status(400).json({ message: `Kode Barang "${kode_barang}" sudah digunakan.` });
    }

    // 2. CEK DUPLIKASI NAMA (Opsional tapi disarankan)
    const existingName = await Product.findOne({ 
      nama_barang: { $regex: new RegExp(`^${nama_barang}$`, 'i') } 
    });
    if (existingName) {
      return res.status(400).json({ message: `Nama Barang "${nama_barang}" sudah ada.` });
    }

    const newProduct = await Product.create({
      kode_barang,
      nama_barang,
      satuan,
      category,
      is_active: true
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_barang, nama_barang } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    if (kode_barang && kode_barang !== product.kode_barang) {
      const exist = await Product.findOne({ kode_barang });
      if (exist) return res.status(400).json({ message: `Kode "${kode_barang}" sudah dipakai.` });
    }

    if (nama_barang && nama_barang !== product.nama_barang) {
      const existName = await Product.findOne({ 
        nama_barang: { $regex: new RegExp(`^${nama_barang}$`, 'i') } 
      });
      if (existName) return res.status(400).json({ message: `Nama "${nama_barang}" sudah ada.` });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    product.is_active = !product.is_active;
    await product.save();

    const msg = product.is_active ? "diaktifkan" : "dinonaktifkan";
    res.json({ message: `Produk berhasil ${msg}`, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
