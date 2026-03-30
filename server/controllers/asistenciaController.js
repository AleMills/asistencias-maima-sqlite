const db = require("../db");
const bcrypt = require("bcryptjs");
const ExcelJS = require("exceljs");
const UAParser = require("ua-parser-js");

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

exports.marcarAsistencia = async (req, res) => {
  const { id: empleadoId } = req.user; // From JWT
  const { userAgent } = req.body;

  // Parse User Agent
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const os = result.os.name || "SO Desconocido";
  const browser = result.browser.name || "Navegador Desconocido";
  let deviceName = `${os} - ${browser}`;

  if (result.device.model) {
    deviceName += ` (${result.device.vendor || ""} ${result.device.model})`;
  }

  // IP handling
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip && ip.substr(0, 7) == "::ffff:") ip = ip.substr(7);

  const fechaHoy = getTodayString();
  const horaActual = getNowTimeString();

  try {
    const empleado = db
      .prepare("SELECT * FROM empleados WHERE id = ?")
      .get(empleadoId);
    if (!empleado)
      return res.status(404).json({ message: "Empleado no encontrado" });

    // Check if attendance exists for today
    let asistencia = db
      .prepare("SELECT * FROM asistencias WHERE empleadoId = ? AND fecha = ?")
      .get(empleadoId, fechaHoy);

    if (!asistencia) {
      // Create INGRESO
      const info = db
        .prepare(
          `INSERT INTO asistencias (
            empleadoId, nombre, apellido, fecha, horaIngreso, 
            dispositivoIngreso, ipIngreso, marcadoPor
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          empleadoId,
          empleado.nombre,
          empleado.apellido,
          fechaHoy,
          horaActual,
          deviceName,
          ip,
          "empleado"
        );

      return res.json({
        message: "Ingreso registrado ✅",
        tipo: "INGRESO",
        hora: horaActual,
      });
    } else if (!asistencia.horaEgreso) {
      // Create EGRESO
      db.prepare(
        `UPDATE asistencias 
         SET horaEgreso = ?, dispositivoEgreso = ?, ipEgreso = ?
         WHERE id = ?`
      ).run(horaActual, deviceName, ip, asistencia.id);

      return res.json({
        message: "Egreso registrado ✅",
        tipo: "EGRESO",
        hora: horaActual,
      });
    } else {
      return res.status(400).json({ message: "Asistencia del día completa" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};

exports.getAsistencias = async (req, res) => {
  const { from, to, empleadoId } = req.query;

  let sql = "SELECT * FROM asistencias WHERE 1=1";
  const params = [];

  if (from) {
    sql += " AND fecha >= ?";
    params.push(from);
  }
  if (to) {
    sql += " AND fecha <= ?";
    params.push(to);
  }
  if (empleadoId) {
    sql += " AND empleadoId = ?";
    params.push(empleadoId);
  }

  sql += " ORDER BY fecha DESC, horaIngreso DESC";

  try {
    const asistencias = db.prepare(sql).all(...params);
    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};

exports.manualMark = async (req, res) => {
  const { id: adminId } = req.user; // From JWT
  const { password, empleadoId, tipo, fecha, hora } = req.body; // tipo: 'INGRESO' or 'EGRESO'

  try {
    // 1. Re-authenticate Admin
    const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(adminId);
    if (!admin) return res.status(404).json({ message: "Admin no encontrado" });

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Contraseña de administrador incorrecta" });

    // 2. Perform Manual Mark
    const empleado = db
      .prepare("SELECT * FROM empleados WHERE id = ?")
      .get(empleadoId);
    if (!empleado)
      return res.status(404).json({ message: "Empleado no encontrado" });

    let asistencia = db
      .prepare("SELECT * FROM asistencias WHERE empleadoId = ? AND fecha = ?")
      .get(empleadoId, fecha);

    if (!asistencia) {
      if (tipo === "EGRESO") {
        return res.status(400).json({
          message:
            "No se puede marcar egreso sin ingreso previo para esta fecha.",
        });
      }
      // Create new with Ingreso
      const info = db
        .prepare(
          `INSERT INTO asistencias (
            empleadoId, nombre, apellido, fecha, horaIngreso, 
            marcadoPor, manualBy
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          empleadoId,
          empleado.nombre,
          empleado.apellido,
          fecha,
          hora,
          "admin",
          admin.id
        );

      asistencia = db
        .prepare("SELECT * FROM asistencias WHERE id = ?")
        .get(info.lastInsertRowid);
    } else {
      // Update existing
      let updateSql =
        "UPDATE asistencias SET marcadoPor = 'admin', manualBy = ?";
      const updateParams = [admin.id];

      if (tipo === "INGRESO") {
        updateSql += ", horaIngreso = ?";
        updateParams.push(hora);
      } else {
        updateSql += ", horaEgreso = ?";
        updateParams.push(hora);
      }

      updateSql += " WHERE id = ?";
      updateParams.push(asistencia.id);

      db.prepare(updateSql).run(...updateParams);

      asistencia = db
        .prepare("SELECT * FROM asistencias WHERE id = ?")
        .get(asistencia.id);
    }

    res.json({ message: "Marca manual registrada exitosamente", asistencia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en marca manual" });
  }
};

exports.exportExcel = async (req, res) => {
  const { from, to, empleadoId } = req.query;

  try {
    let sql = "SELECT * FROM asistencias WHERE 1=1";
    const params = [];

    if (from) {
      sql += " AND fecha >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND fecha <= ?";
      params.push(to);
    }
    if (empleadoId) {
      sql += " AND empleadoId = ?";
      params.push(empleadoId);
    }

    sql += " ORDER BY fecha ASC";

    const asistencias = db.prepare(sql).all(...params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencias");

    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Apellido", key: "apellido", width: 20 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Hora Ingreso", key: "horaIngreso", width: 15 },
      { header: "Hora Egreso", key: "horaEgreso", width: 15 },
      { header: "Disp. Ingreso", key: "dispositivoIngreso", width: 30 },
      { header: "Disp. Egreso", key: "dispositivoEgreso", width: 30 },
      { header: "IP Ingreso", key: "ipIngreso", width: 15 },
      { header: "IP Egreso", key: "ipEgreso", width: 15 },
      { header: "Marcado Por", key: "marcadoPor", width: 15 },
    ];

    asistencias.forEach((a) => {
      worksheet.addRow(a);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=asistencias.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al exportar Excel" });
  }
};

exports.getLlegadasTarde = async (req, res) => {
  const { from, to, tolerancia = 0 } = req.query;

  try {
    let sql = `
      SELECT a.*, e.horarioEntrada, e.horarioSalida 
      FROM asistencias a
      JOIN empleados e ON a.empleadoId = e.id
      WHERE e.horarioEntrada IS NOT NULL
    `;
    const params = [];

    if (from) {
      sql += " AND a.fecha >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND a.fecha <= ?";
      params.push(to);
    }

    // Sort logic
    sql += " ORDER BY a.fecha DESC, a.horaIngreso DESC";

    const records = db.prepare(sql).all(...params);

    const toleranceMinutes = parseInt(tolerancia, 10);

    const lateArrivals = records
      .filter((record) => {
        if (!record.horaIngreso) return false;
        if (!record.horarioEntrada) return false;

        // Convert times to minutes for comparison
        const [ingresoH, ingresoM] = record.horaIngreso.split(":").map(Number);
        const [entradaH, entradaM] = record.horarioEntrada
          .split(":")
          .map(Number);

        const ingresoTotalMinutes = ingresoH * 60 + ingresoM;
        const entradaTotalMinutes = entradaH * 60 + entradaM + toleranceMinutes;

        return ingresoTotalMinutes > entradaTotalMinutes;
      })
      .map((r) => ({
        ...r,
        diferenciaMinutos: (() => {
          const [ingresoH, ingresoM] = r.horaIngreso.split(":").map(Number);
          const [entradaH, entradaM] = r.horarioEntrada.split(":").map(Number);
          return ingresoH * 60 + ingresoM - (entradaH * 60 + entradaM);
        })(),
      }));

    res.json(lateArrivals);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener reporte de llegadas tarde" });
  }
};

exports.exportLlegadasTarde = async (req, res) => {
  const { from, to, tolerancia = 0 } = req.query;

  try {
    let sql = `
      SELECT a.*, e.horarioEntrada, e.horarioSalida 
      FROM asistencias a
      JOIN empleados e ON a.empleadoId = e.id
      WHERE e.horarioEntrada IS NOT NULL
    `;
    const params = [];

    if (from) {
      sql += " AND a.fecha >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND a.fecha <= ?";
      params.push(to);
    }

    // Sort logic
    sql += " ORDER BY a.fecha DESC, a.horaIngreso DESC";

    const records = db.prepare(sql).all(...params);
    const toleranceMinutes = parseInt(tolerancia, 10);

    const lateArrivals = records
      .filter((record) => {
        if (!record.horaIngreso) return false;
        if (!record.horarioEntrada) return false;

        const [ingresoH, ingresoM] = record.horaIngreso.split(":").map(Number);
        const [entradaH, entradaM] = record.horarioEntrada
          .split(":")
          .map(Number);

        const ingresoTotalMinutes = ingresoH * 60 + ingresoM;
        const entradaTotalMinutes = entradaH * 60 + entradaM + toleranceMinutes;

        return ingresoTotalMinutes > entradaTotalMinutes;
      })
      .map((r) => ({
        ...r,
        diferenciaMinutos: (() => {
          const [ingresoH, ingresoM] = r.horaIngreso.split(":").map(Number);
          const [entradaH, entradaM] = r.horarioEntrada.split(":").map(Number);
          return ingresoH * 60 + ingresoM - (entradaH * 60 + entradaM);
        })(),
      }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Llegadas Tarde");

    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Apellido", key: "apellido", width: 20 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Hora Ingreso", key: "horaIngreso", width: 15 },
      { header: "Horario Pactado", key: "horarioEntrada", width: 15 },
      { header: "Demora (min)", key: "diferenciaMinutos", width: 15 },
    ];

    lateArrivals.forEach((a) => {
      worksheet.addRow(a);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=llegadas_tarde.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al exportar reporte de llegadas tarde" });
  }
};
