export const ownerOnly = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Akses khusus owner" });
  }
  next();
};

export const staffOnly = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Akses khusus staff" });
  }
  next();
};
