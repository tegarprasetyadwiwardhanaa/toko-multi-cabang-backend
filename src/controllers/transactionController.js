import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";

const generateNota = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); 
  return `TRX-${yyyy}${mm}${dd}-${random}`;
};

// 1. FUNGSI MEMBUAT TRANSAKSI (POS)
export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, uang_bayar } = req.body; // Kita TIDAK butuh 'total' & 'kembalian' dari frontend, kita hitung sendiri biar aman.
    const cashierId = req.user.id;
    const branchId = req.user.branch;

    if (!items || items.length === 0) {
      throw new Error("Keranjang belanja kosong");
    }

    // A. Ambil Data Kasir (untuk snapshot nama)
    const cashierData = await User.findById(cashierId).session(session);

    // B. Persiapan Data
    let totalTrans = 0;
    const transactionItemsPayload = [];

    // C. LOOPING ITEMS (VALIDASI HARGA & STOK DI BACKEND)
    for (const item of items) {
      // item._id disini adalah ID INVENTORY (sesuai frontend Anda)
      const inventoryItem = await Inventory.findOne({
        _id: item._id,
        branch: branchId // Pastikan barang benar-benar milik cabang ini
      }).populate('product').session(session);

      if (!inventoryItem) {
        throw new Error(`Item dengan ID ${item._id} tidak ditemukan di cabang ini.`);
      }

      // Validasi Stok (Concurrency Check)
      if (inventoryItem.stok < item.qty) {
        throw new Error(`Stok ${inventoryItem.product.nama_barang} tidak cukup. Sisa: ${inventoryItem.stok}`);
      }

      // AMBIL HARGA DARI DATABASE (JANGAN DARI FRONTEND)
      const hargaAsli = inventoryItem.harga_jual;
      const subtotal = hargaAsli * item.qty;
      totalTrans += subtotal;

      // Kurangi Stok
      inventoryItem.stok -= item.qty;
      await inventoryItem.save({ session });

      // Siapkan payload detail transaksi
      transactionItemsPayload.push({
        product: inventoryItem.product._id, // Link ke Master Product
        qty: item.qty,
        harga: hargaAsli, // Harga aman
        subtotal: subtotal
      });
    }

    // D. Validasi Pembayaran
    if (uang_bayar < totalTrans) {
      throw new Error(`Uang bayar kurang. Total: ${totalTrans}, Bayar: ${uang_bayar}`);
    }
    const kembalian = uang_bayar - totalTrans;

    // E. Simpan Header Transaksi
    const newTrx = new Transaction({
      branch: branchId,
      cashier: cashierId,
      cashier_name: cashierData.nama_lengkap, // Snapshot nama
      no_nota: generateNota(),
      total: totalTrans,
      uang_bayar,
      kembalian
    });

    const savedTrx = await newTrx.save({ session });

    // F. Simpan Detail Item (Bulk Insert lebih cepat)
    const detailItems = transactionItemsPayload.map(detail => ({
      ...detail,
      transaction: savedTrx._id
    }));
    
    await TransactionItem.insertMany(detailItems, { session });

    // G. Commit
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Transaksi berhasil disimpan",
      data: {
        no_nota: savedTrx.no_nota,
        total: totalTrans,
        kembalian: kembalian
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const { startDate, endDate } = req.query; // Tangkap query params
    
    let query = { branch: branchId };

    // Jika ada filter tanggal
    if (startDate && endDate) {
      // Set jam ke awal hari (00:00) dan akhir hari (23:59)
      const start = new Date(startDate); start.setHours(0,0,0,0);
      const end = new Date(endDate); end.setHours(23,59,59,999);
      
      query.createdAt = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate("cashier", "nama_lengkap"); // Ambil nama kasir

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
    try {
        const trx = await Transaction.findById(req.params.id)
            .populate("branch")
            .populate("cashier", "nama_lengkap"); 
        
        if (!trx) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    
        const items = await TransactionItem.find({ transaction: trx._id }).populate("product");
    
        res.json({ ...trx._doc, items });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};