const db = require("../db");
const bcrypt = require("bcryptjs");

exports.getEmpleados = async (req, res) => {
  try {
    const empleados = db
      .prepare("SELECT id, nombre, apellido, email, dni, creadoEn, horarioEntrada, horarioSalida FROM empleados ORDER BY apellido ASC")
      .all();
    res.json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};

exports.createEmpleado = async (req, res) => {
  const { nombre, apellido, email, dni, password } = req.body;

  try {
    const existing = db
      .prepare("SELECT id FROM empleados WHERE email = ? OR dni = ?")
      .get(email, dni);

    if (existing) {
      return res
        .status(400)
        .json({ message: "El empleado ya existe (email o DNI duplicado)" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const info = db
      .prepare(
        "INSERT INTO empleados (nombre, apellido, email, dni, passwordHash, horarioEntrada, horarioSalida) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(nombre, apellido, email, dni, passwordHash, req.body.horarioEntrada || null, req.body.horarioSalida || null);

    const empleado = {
      id: info.lastInsertRowid,
      nombre,
      apellido,
      email,
      dni,
      horarioEntrada: req.body.horarioEntrada,
      horarioSalida: req.body.horarioSalida,
    };

    res.status(201).json({ message: "Empleado creado exitosamente", empleado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear empleado" });
  }
};

exports.updateEmpleado = async (req, res) => {
  const { nombre, apellido, email, dni, password } = req.body;
  const { id } = req.params;

  try {
    const empleado = db.prepare("SELECT * FROM empleados WHERE id = ?").get(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    let newPasswordHash = empleado.passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newPasswordHash = await bcrypt.hash(password, salt);
    }

    db.prepare(
      `UPDATE empleados 
       SET nombre = ?, apellido = ?, email = ?, dni = ?, passwordHash = ?, horarioEntrada = ?, horarioSalida = ?
       WHERE id = ?`
    ).run(
      nombre || empleado.nombre,
      apellido || empleado.apellido,
      email || empleado.email,
      dni || empleado.dni,
      newPasswordHash,
      req.body.horarioEntrada !== undefined ? req.body.horarioEntrada : empleado.horarioEntrada,
      req.body.horarioSalida !== undefined ? req.body.horarioSalida : empleado.horarioSalida,
      id
    );

    const updatedEmpleado = db
      .prepare("SELECT id, nombre, apellido, email, dni, creadoEn, horarioEntrada, horarioSalida FROM empleados WHERE id = ?")
      .get(id);

    res.json({ message: "Empleado actualizado", empleado: updatedEmpleado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
};

exports.deleteEmpleado = async (req, res) => {
  try {
    const info = db.prepare("DELETE FROM empleados WHERE id = ?").run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar empleado" });
  }
};
