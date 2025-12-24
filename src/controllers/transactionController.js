import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import Inventory from "../models/Inventory.js";

// 1. FUNGSI MEMBUAT TRANSAKSI (POS)
// Ini menangani: Simpan Header -> Simpan Detail Item -> Kurangi Stok
export const createTransaction = async (req, res) => {
  try {
    const { items, total, uang_bayar, kembalian } = req.body;
    
    // Validasi input dasar
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang belanja kosong" });
    }

    const branchId = req.user.branch; // Dari token login staff

    // A. Buat Header Transaksi
    const newTransaction = new Transaction({
      branch: branchId,
      total,
      uang_bayar,
      kembalian,
      status: "selesai" // Langsung selesai
    });
    
    const savedTransaction = await newTransaction.save();

    // B. Proses Loop Item Belanjaan
    for (const item of items) {
      // 1. Simpan ke tabel TransactionItem (Detail Transaksi)
      // Catatan: Pastikan frontend mengirim item.product._id (ID Product) dan item._id (ID Inventory)
      await TransactionItem.create({
        transaction: savedTransaction._id,
        product: item.product._id, // ID Master Produk
        qty: item.qty,
        harga: item.harga_jual,
        subtotal: item.qty * item.harga_jual
      });

      // 2. KURANGI STOK di tabel Inventory
      const inventoryItem = await Inventory.findById(item._id); 
      if (inventoryItem) {
        // Cek stok lagi untuk keamanan (opsional tapi bagus)
        if (inventoryItem.stok < item.qty) {
           throw new Error(`Stok barang ${item.product.nama_barang} tidak cukup saat proses akhir.`);
        }
        
        inventoryItem.stok = inventoryItem.stok - item.qty;
        await inventoryItem.save();
      }
    }

    res.status(201).json({ 
      message: "Transaksi berhasil", 
      data: savedTransaction 
    });

  } catch (error) {
    // Jika error, idealnya kita perlu rollback transaksi (hapus yg sudah terbuat),
    // tapi untuk tahap belajar ini, return error saja cukup.
    res.status(500).json({ message: error.message });
  }
};

// 2. MELIHAT DAFTAR TRANSAKSI (History)
export const getTransactions = async (req, res) => {
  try {
    const branchId = req.user.branch;
    
    // Staff hanya bisa lihat transaksi cabangnya sendiri
    const transactions = await Transaction.find({ branch: branchId })
      .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
      .populate("branch", "nama_cabang");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. MELIHAT DETAIL 1 TRANSAKSI
export const getTransactionById = async (req, res) => {
  try {
    const trx = await Transaction.findById(req.params.id).populate("branch");
    if (!trx) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    // Kita juga perlu mengambil item-itemnya untuk ditampilkan di detail
    const items = await TransactionItem.find({ transaction: trx._id }).populate("product");

    res.json({ ...trx._doc, items }); // Gabungkan data transaksi dan itemnya
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};