const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No hay token, autorización denegada" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token no válido" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
};

module.exports = { authMiddleware, adminMiddleware };
