import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const { branchId, period } = req.query;
    
    // 1. SETTING FILTER TANGGAL (Logika Dinamis)
    let startDate = new Date();
    
    // Default 7 hari jika tidak ada parameter
    if (!period || period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '6m') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Opsi tambahan: 'all' untuk semua waktu
      startDate = new Date(0); // Tahun 1970 (awal waktu komputer)
    }

    // 2. SETTING FILTER MATCH (Gabungan Branch + Tanggal + Status)
    const matchStage = {
      status: "selesai",
      createdAt: { $gte: startDate } // Ambil data mulai dari startDate
    };

    // Tambah filter branch jika dipilih
    if (branchId && branchId !== 'all') {
      matchStage.branch = new mongoose.Types.ObjectId(branchId);
    } else {
       // Keamanan: Jika user login bukan owner, paksa filter branch dia
       if (req.user.role !== 'owner') { 
          matchStage.branch = req.user.branch;
       }
    }

    // A. HITUNG TOTAL OMZET & TRANSAKSI (Sesuai Periode)
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOmzet: { $sum: "$total" },
          totalTransaksi: { $count: {} }
        }
      }
    ]);

    // B. GRAFIK TREN PENJUALAN
    // Catatan: Jika periode > 30 hari, data bisa sangat padat. 
    // Tapi Chart.js biasanya bisa menangani ini dengan baik.
    const salesTrend = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          // Format tanggal YYYY-MM-DD
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } } // Urutkan dari tanggal terlama ke terbaru
    ]);

    // C. PRODUK TERLARIS (Top 5 dalam periode ini)
    // Cari ID transaksi yang valid dalam periode & branch ini
    const validTransactions = await Transaction.find(matchStage).select('_id');
    const validTrxIds = validTransactions.map(t => t._id);

    let topProducts = [];
    if (validTrxIds.length > 0) {
      topProducts = await TransactionItem.aggregate([
        { $match: { transaction: { $in: validTrxIds } } },
        {
          $group: {
            _id: "$product",
            totalQty: { $sum: "$qty" },
            totalSales: { $sum: "$subtotal" }
          }
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $project: {
            nama_barang: "$productInfo.nama_barang",
            qty: "$totalQty",
            sales: "$totalSales"
          }
        }
      ]);
    }

    res.json({
      periodInfo: period || '7d', // Kirim balik info periode
      omzet: summary[0]?.totalOmzet || 0,
      transaksi: summary[0]?.totalTransaksi || 0,
      trend: salesTrend,
      topProducts: topProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};