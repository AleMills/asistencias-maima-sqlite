const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.loginEmpleado = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or dni

  try {
    // Find by email OR dni
    const empleado = db
      .prepare("SELECT * FROM empleados WHERE email = ? OR dni = ?")
      .get(identifier, identifier);

    if (!empleado) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, empleado.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken(empleado.id, "empleado");

    res.json({
      token,
      user: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        rol: "empleado",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);

    if (!admin) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken(admin.id, "admin");

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        rol: "admin",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
