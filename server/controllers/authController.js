const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");
const ExcelJS = require("exceljs");

const generateToken = (id, rol) => {
  return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// exports.loginEmpleado = async (req, res) => {
//   const { identifier, password } = req.body; // identifier can be email or dni

//   try {
//     // Find by email OR dni
//     const empleado = db
//       .prepare("SELECT * FROM empleados WHERE email = ? OR dni = ?")
//       .get(identifier, identifier);

//     if (!empleado) {
//       return res.status(401).json({ message: "Credenciales inválidas" });
//     }

//     const isMatch = await bcrypt.compare(password, empleado.passwordHash);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Credenciales inválidas" });
//     }

//     const token = generateToken(empleado.id, "empleado");

//     res.json({
//       token,
//       user: {
//         id: empleado.id,
//         nombre: empleado.nombre,
//         apellido: empleado.apellido,
//         email: empleado.email,
//         rol: "empleado",
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error en el servidor" });
//   }
// };

// Helper to get current date string YYYY-MM-DD
const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// Helper to get current time string HH:mm:ss
const getNowTimeString = () => {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
};

exports.loginEmpleado = async (req, res) => {
  const { identifier, password } = req.body;

  try {
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

    // 🔹 TOKEN
    const token = generateToken(empleado.id, "empleado");

    // 🔹 IP REAL
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (ip && ip.startsWith("::ffff:")) ip = ip.substring(7);

    // 🔹 USER AGENT
    const userAgent = req.headers["user-agent"] || "unknown";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // 🔹 DISPOSITIVO + NAVEGADOR
    const os = result.os.name || "SO Desconocido";
    const browser = result.browser.name || "Navegador Desconocido";
    let dispositivo = `${os} - ${browser}`;

    // Opcional: Agregar modelo si existe, para mayor detalle sin perder lo pedido
    if (result.device.model) {
      dispositivo += ` (${result.device.vendor || ""} ${result.device.model})`;
    }

    // 🔹 FECHA / HORA
    const fecha = getTodayString();
    const hora = getNowTimeString();

    // 🔹 GUARDAR SESIÓN
    db.prepare(
      `
      INSERT INTO sesiones (
        empleadoId,
        nombre,
        apellido,
        dni,
        fecha,
        hora,
        ip,
        dispositivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      empleado.id,
      empleado.nombre,
      empleado.apellido,
      empleado.dni,
      fecha,
      hora,
      ip,
      dispositivo
    );

    // 🔹 RESPUESTA
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

exports.exportSesionesExcel = async (req, res) => {
  try {
    const sesiones = db
      .prepare("SELECT * FROM sesiones ORDER BY fecha ASC, hora ASC")
      .all();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sesiones");

    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Apellido", key: "apellido", width: 20 },
      { header: "DNI", key: "dni", width: 15 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Hora", key: "hora", width: 15 },
      { header: "Dispositivo", key: "dispositivo", width: 35 },
      { header: "IP", key: "ip", width: 18 },
    ];

    sesiones.forEach((s) => worksheet.addRow(s));

    // 🔑 CLAVE
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=sesiones.xlsx");

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al exportar sesiones a Excel" });
  }
};
