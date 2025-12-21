import Branch from "../models/Branch.js";

export const getBranches = async (req, res) => {
  res.json(await Branch.find());
};

export const getBranchById = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch)
    return res.status(404).json({ message: "Cabang tidak ditemukan" });

  res.json(branch);
};

export const createBranch = async (req, res) => {
  const branch = await Branch.create(req.body);
  res.json(branch);
};

export const updateBranch = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch)
    return res.status(404).json({ message: "Cabang tidak ditemukan" });

  Object.assign(branch, req.body);
  await branch.save();

  res.json(branch);
};

export const deleteBranch = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch)
    return res.status(404).json({ message: "Cabang tidak ditemukan" });

  await branch.deleteOne();
  res.json({ message: "Cabang berhasil dihapus" });
};
