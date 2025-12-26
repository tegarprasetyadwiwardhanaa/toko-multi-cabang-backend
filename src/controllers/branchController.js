import Branch from "../models/Branch.js";

export const getBranches = async (req, res) => {
  // Opsional: Jika Owner ingin melihat yang aktif saja, bisa di filter.
  // Tapi biasanya Owner ingin lihat semua (aktif & non-aktif).
  res.json(await Branch.find());
};

export const getBranchById = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch)
    return res.status(404).json({ message: "Cabang tidak ditemukan" });

  res.json(branch);
};

export const createBranch = async (req, res) => {
  try {
    const { nama_cabang, alamat, kota } = req.body;

    // 1. VALIDASI DUPLIKASI NAMA
    // Kita cek apakah ada cabang lain (baik aktif maupun non-aktif) dengan nama yang sama persis
    // Gunakan regex 'i' agar case-insensitive (Cabang A = cabang a)
    const existingBranch = await Branch.findOne({ 
      nama_cabang: { $regex: new RegExp(`^${nama_cabang}$`, 'i') } 
    });

    if (existingBranch) {
      return res.status(400).json({ 
        message: `Gagal! Nama cabang "${nama_cabang}" sudah terdaftar.` 
      });
    }

    const branch = await Branch.create({ nama_cabang, alamat, kota });
    res.status(201).json(branch);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_cabang } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) return res.status(404).json({ message: "Cabang tidak ditemukan" });

    // 1. VALIDASI DUPLIKASI SAAT UPDATE
    // Jika user mengubah nama cabang, kita harus cek apakah nama baru itu sudah dipakai orang lain?
    if (nama_cabang && nama_cabang !== branch.nama_cabang) {
      const duplicateCheck = await Branch.findOne({ 
        nama_cabang: { $regex: new RegExp(`^${nama_cabang}$`, 'i') } 
      });

      // Jika ada cabang lain yg namanya sama, DAN itu bukan cabang ini sendiri
      if (duplicateCheck && duplicateCheck._id.toString() !== id) {
        return res.status(400).json({ 
          message: `Gagal update! Nama cabang "${nama_cabang}" sudah digunakan oleh cabang lain.` 
        });
      }
    }

    Object.assign(branch, req.body);
    await branch.save();

    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BAGIAN YANG DIUBAH (SOFT DELETE) ---
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch)
      return res.status(404).json({ message: "Cabang tidak ditemukan" });

    // LOGIKA SOFT DELETE / TOGGLE:
    // Kita ubah statusnya menjadi kebalikan dari status sekarang.
    // Jika Aktif -> Jadi Non-Aktif. Jika Non-Aktif -> Jadi Aktif.
    branch.is_active = !branch.is_active;

    await branch.save();

    const statusText = branch.is_active ? "diaktifkan kembali" : "dinonaktifkan";
    
    res.json({ 
      message: `Cabang berhasil ${statusText}`, 
      data: branch 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};