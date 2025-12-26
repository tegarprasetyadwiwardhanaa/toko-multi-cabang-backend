import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// GUDANG UTAMA
export const getMainInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    // A. Buat Filter Pencarian Produk (Nama/Kode)
    const searchFilter = search ? {
      $or: [
        { nama_barang: { $regex: search, $options: "i" } },
        { kode_barang: { $regex: search, $options: "i" } }
      ]
    } : {};

    // B. Hitung Total Data (untuk pagination frontend)
    const totalData = await Product.countDocuments(searchFilter);

    // C. Ambil Data Produk (Sesuai Halaman)
    const products = await Product.find(searchFilter)
      .sort({ is_active: -1, nama_barang: 1 }) // Aktif dulu, baru urut abjad
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // D. Ambil Data Stok Gudang untuk produk-produk di atas
    const productIds = products.map(p => p._id);
    const inventories = await Inventory.find({
      product: { $in: productIds },
      tipe_lokasi: "utama"
    });

    // E. GABUNGKAN (Merge) Produk + Stok
    const result = products.map(prod => {
      const inv = inventories.find(i => i.product.toString() === prod._id.toString());
      
      return {
        _id: prod._id, // ID Produk (Penting untuk key)
        kode_barang: prod.kode_barang,
        nama_barang: prod.nama_barang,
        satuan: prod.satuan,
        is_active: prod.is_active,
        stok: inv ? inv.stok : 0,
        harga_modal: inv ? inv.harga_modal : 0,
        harga_jual: inv ? inv.harga_jual : 0,
        inventory_id: inv ? inv._id : null // ID Inventory (jika perlu)
      };
    });

    res.json({
      data: result,
      total: totalData,
      currentPage: Number(page),
      totalPages: Math.ceil(totalData / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchStockDetail = async (req, res) => {
  try {
    const { branchId, productId } = req.query;
    
    const inv = await Inventory.findOne({
      branch: branchId,
      product: productId,
      tipe_lokasi: "cabang"
    });

    res.json({ stok: inv ? inv.stok : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMainInventory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, stok, harga_modal, harga_jual, type } = req.body; 
    let inventory = await Inventory.findOne({
      product,
      tipe_lokasi: "utama"
    }).session(session);

    const stokNum = Number(stok);

    if (inventory) {
      // 1. Logika Update Stok
      if (type === 'set') {
        inventory.stok = stokNum; // Timpa stok lama (Stock Opname)
      } else {
        inventory.stok += stokNum; // Tambah ke stok lama (Pembelian)
      }
      
      // 2. Logika Update Harga
      if (harga_modal > 0) inventory.harga_modal = harga_modal;
      if (harga_jual > 0) inventory.harga_jual = harga_jual;
      
      await inventory.save({ session });
    } else {
      inventory = await Inventory.create([{
        product,
        tipe_lokasi: "utama",
        stok: stokNum,
        harga_modal: harga_modal || 0,
        harga_jual: harga_jual || 0
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json(inventory);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Gagal update stok: " + error.message });
  }
};

export const restockBranch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, branch, qty, harga_jual_cabang } = req.body;
    const qtyNum = Number(qty);

    if (qtyNum <= 0) throw new Error("Jumlah kirim minimal 1");

    // 1. Cek Gudang Utama
    const gudang = await Inventory.findOne({
      product,
      tipe_lokasi: "utama"
    }).session(session);

    if (!gudang || gudang.stok < qtyNum) {
      throw new Error(`Stok gudang tidak cukup. Sisa: ${gudang ? gudang.stok : 0}`);
    }

    // 2. Cek/Buat Inventory Cabang
    let cabang = await Inventory.findOne({
      product,
      tipe_lokasi: "cabang",
      branch
    }).session(session);

    if (!cabang) {
      await Inventory.create([{
        product,
        tipe_lokasi: "cabang",
        branch,
        stok: 0,
        harga_modal: gudang.harga_modal, 
        harga_jual: harga_jual_cabang || gudang.harga_jual // Pakai harga khusus atau default gudang
      }], { session });
      
      cabang = await Inventory.findOne({ product, tipe_lokasi: "cabang", branch }).session(session);
    } else {
      if (harga_jual_cabang > 0) {
        cabang.harga_jual = harga_jual_cabang;
      }
      cabang.harga_modal = gudang.harga_modal; 
    }

    // 3. Pindahkan Stok
    gudang.stok -= qtyNum;
    cabang.stok += qtyNum;

    await gudang.save({ session });
    await cabang.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Berhasil kirim ke cabang" });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// CABANG
export const getBranchInventory = async (req, res) => {
  res.json(
    await Inventory.find({
      tipe_lokasi: "cabang",
      branch: req.params.branchId
    }).populate("product")
  );
};

export const updateBranchInventory = async (req, res) => {
  const inv = await Inventory.findById(req.params.inventoryId);
  if (!inv)
    return res.status(404).json({ message: "Inventory tidak ditemukan" });

  Object.assign(inv, req.body);
  await inv.save();

  res.json(inv);
};

export const getPOSProducts = async (req, res) => {
  try {
    const branchId = req.user.branch; 

    const products = await Inventory.find({ branch: branchId })
      .populate("product", "kode_barang nama_barang satuan") // Ambil detail barang dari tabel Product
      .select("product stok harga_jual"); // Ambil field yang perlu saja

    const activeProducts = products.filter(item => item.product != null);

    res.status(200).json(activeProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchInventoryList = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { search = "" } = req.query;

    if (!branchId) return res.status(400).json({ message: "Branch ID diperlukan" });

    const productFilter = search ? {
      $or: [
        { nama_barang: { $regex: search, $options: "i" } },
        { kode_barang: { $regex: search, $options: "i" } }
      ]
    } : {};
    
    const products = await Product.find(productFilter).select('_id nama_barang kode_barang satuan is_active');
    const productIds = products.map(p => p._id);

    const inventories = await Inventory.find({
      branch: branchId,
      tipe_lokasi: "cabang",
      product: { $in: productIds } 
    }).populate("product");

    const result = inventories.map(inv => ({
      _id: inv._id, // ID Inventory
      product_id: inv.product._id,
      kode_barang: inv.product.kode_barang,
      nama_barang: inv.product.nama_barang,
      satuan: inv.product.satuan,
      is_active: inv.product.is_active,
      stok: inv.stok,
      harga_modal: inv.harga_modal, 
      harga_jual: inv.harga_jual    // Ini yang bisa diedit
    }));

    // Sort: Nama barang A-Z
    result.sort((a, b) => a.nama_barang.localeCompare(b.nama_barang));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBranchPrice = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { harga_jual } = req.body;

    const inv = await Inventory.findById(inventoryId);
    if (!inv) return res.status(404).json({ message: "Data inventory tidak ditemukan" });

    // Validasi sederhana
    if (inv.tipe_lokasi !== 'cabang') {
      return res.status(400).json({ message: "Hanya boleh edit harga cabang di menu ini." });
    }

    inv.harga_jual = Number(harga_jual);
    await inv.save();

    res.json({ message: "Harga berhasil diperbarui", data: inv });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};