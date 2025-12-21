import Inventory from "../models/Inventory.js";

// GUDANG UTAMA
export const getMainInventory = async (req, res) => {
  res.json(await Inventory.find({ tipe_lokasi: "utama" }).populate("product"));
};

export const addMainInventory = async (req, res) => {
  const inv = await Inventory.create({
    product: req.body.product,
    tipe_lokasi: "utama",
    stok: req.body.stok,
    harga_modal: req.body.harga_modal
  });
  res.json(inv);
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

// RESTOCK
export const restockBranch = async (req, res) => {
  const { product, branch, qty } = req.body;

  const gudang = await Inventory.findOne({
    product,
    tipe_lokasi: "utama"
  });

  if (!gudang || gudang.stok < qty)
    return res.status(400).json({ message: "Stok gudang tidak cukup" });

  gudang.stok -= qty;
  await gudang.save();

  let cabang = await Inventory.findOne({
    product,
    tipe_lokasi: "cabang",
    branch
  });

  if (!cabang) {
    cabang = await Inventory.create({
      product,
      tipe_lokasi: "cabang",
      branch,
      stok: 0
    });
  }

  cabang.stok += qty;
  await cabang.save();

  res.json({ message: "Restock berhasil" });
};
