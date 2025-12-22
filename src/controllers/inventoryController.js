import Inventory from "../models/Inventory.js";

// GUDANG UTAMA
export const getMainInventory = async (req, res) => {
  res.json(await Inventory.find({ tipe_lokasi: "utama" }).populate("product"));
};

export const addMainInventory = async (req, res) => {
  try {
    const { product, stok, harga_modal, harga_jual } = req.body;

    let inventory = await Inventory.findOne({
      product,
      tipe_lokasi: "utama"
    });

    if (inventory) {
      inventory.stok += Number(stok);
      inventory.harga_modal = harga_modal;
      inventory.harga_jual = harga_jual;
      await inventory.save();
    } else {
      inventory = await Inventory.create({
        product,
        tipe_lokasi: "utama",
        stok: Number(stok),
        harga_modal,
        harga_jual
      });
    }

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Gagal update stok gudang utama" });
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

// RESTOCK
export const restockBranch = async (req, res) => {
  try {
    const { product, branch, qty } = req.body;

    const gudang = await Inventory.findOne({
      product,
      tipe_lokasi: "utama"
    });

    if (!gudang || gudang.stok < qty) {
      return res.status(400).json({ message: "Stok gudang tidak cukup" });
    }

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
        stok: 0,
        harga_jual: gudang.harga_jual // ✅ WAJIB
      });
    }

    // update stok
    gudang.stok -= qty;
    cabang.stok += qty;

    await gudang.save();
    await cabang.save();

    res.json({ message: "Restock berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal restock ke cabang" });
  }
};
