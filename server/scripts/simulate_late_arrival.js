const db = require("../db");
const bcrypt = require("bcryptjs");

const simulate = async () => {
  try {
    console.log("Simulando llegada tarde...");

    // 1. Create Employee
    const email = "juan.tarde@test.com";
    let empleado = db.prepare("SELECT * FROM empleados WHERE email = ?").get(email);

    if (!empleado) {
      console.log("Creando empleado Juan Tarde...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("123456", salt);
      
      const info = db.prepare(
        "INSERT INTO empleados (nombre, apellido, email, dni, passwordHash, horarioEntrada, horarioSalida) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run("Juan", "Tarde", email, "DNI_TEST_TARDE", hash, "08:00", "17:00");
      
      empleado = db.prepare("SELECT * FROM empleados WHERE id = ?").get(info.lastInsertRowid);
    } else {
      console.log("Juan Tarde ya existe, actualizando horario...");
        db.prepare("UPDATE empleados SET horarioEntrada = '08:00', horarioSalida = '17:00' WHERE id = ?")
        .run(empleado.id);
    }

    // 2. Create Late Attendance for Today
    const today = new Date().toISOString().split("T")[0];
    const lateTime = "08:30:00"; // 30 mins late

    const existingAttendance = db.prepare("SELECT * FROM asistencias WHERE empleadoId = ? AND fecha = ?").get(empleado.id, today);

    if (existingAttendance) {
        console.log("Ya existe asistencia para hoy. Eliminando para recrear prueba...");
        db.prepare("DELETE FROM asistencias WHERE id = ?").run(existingAttendance.id);
    }

    console.log(`Registrando ingreso a las ${lateTime} para hoy ${today}...`);
    db.prepare(`
        INSERT INTO asistencias (empleadoId, nombre, apellido, fecha, horaIngreso, dispositivoIngreso, marcadoPor)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(empleado.id, empleado.nombre, empleado.apellido, today, lateTime, "Simulación Script", "admin");

    console.log("✅ Simulación completada. Revisa el reporte de llegadas tarde.");

  } catch (error) {
    console.error("Error en simulación:", error);
  }
};

simulate();
