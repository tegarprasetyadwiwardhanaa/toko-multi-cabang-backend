import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const { branchId, period } = req.query;
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); 

    if (!period || period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '6m') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // 'all' time
      startDate = new Date(0); 
    }

    const matchStage = {
      createdAt: { $gte: startDate }
    };

    if (req.user.role === 'owner') {
      if (branchId && branchId !== 'all') {
        matchStage.branch = new mongoose.Types.ObjectId(branchId);
      }
    } else {
      matchStage.branch = req.user.branch;
    }

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

    const salesTrend = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } } 
    ]);

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
      omzet: summary[0]?.totalOmzet || 0,
      transaksi: summary[0]?.totalTransaksi || 0,
      trend: salesTrend,
      topProducts: topProducts
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};