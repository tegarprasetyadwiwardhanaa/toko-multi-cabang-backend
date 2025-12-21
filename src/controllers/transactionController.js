import Transaction from "../models/Transaction.js";
import TransactionItem from "../models/TransactionItem.js";
import Inventory from "../models/Inventory.js";

export const createTransaction = async (req, res) => {
  const trx = await Transaction.create({
    branch: req.user.branch,
    total: 0,
    status: "draft"
  });

  res.json(trx);
};

export const addItemToTransaction = async (req, res) => {
  const { product, qty } = req.body;
  const trx = await Transaction.findById(req.params.id);

  const inv = await Inventory.findOne({
    product,
    branch: trx.branch,
    tipe_lokasi: "cabang"
  });

  if (!inv || inv.stok < qty)
    return res.status(400).json({ message: "Stok tidak cukup" });

  const subtotal = inv.harga_jual * qty;

  await TransactionItem.create({
    transaction: trx._id,
    product,
    qty,
    harga: inv.harga_jual,
    subtotal
  });

  inv.stok -= qty;
  await inv.save();

  trx.total += subtotal;
  await trx.save();

  res.json({ message: "Item ditambahkan" });
};

export const checkoutTransaction = async (req, res) => {
  const trx = await Transaction.findById(req.params.id);

  trx.uang_bayar = req.body.uang_bayar;
  trx.kembalian = trx.uang_bayar - trx.total;
  trx.status = "selesai";

  await trx.save();

  res.json(trx);
};

export const getTransactions = async (req, res) => {
  res.json(await Transaction.find().populate("branch"));
};

export const getTransactionById = async (req, res) => {
  const trx = await Transaction.findById(req.params.id).populate("branch");
  if (!trx)
    return res.status(404).json({ message: "Transaksi tidak ditemukan" });

  res.json(trx);
};
