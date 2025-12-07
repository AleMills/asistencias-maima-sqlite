const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists if we were putting it in a subdir, 
// but here we'll just put it in the server root or a data folder.
// Let's put it in the server root for simplicity as per plan.

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Define tables
const createTables = () => {
  // Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      rol TEXT DEFAULT 'admin',
      creadoEn TEXT DEFAULT (datetime('now'))
    )
  `);

  // Empleados Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS empleados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      dni TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      horarioEntrada TEXT,
      horarioSalida TEXT,
      creadoEn TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration for existing tables
  const columns = db.pragma('table_info(empleados)');
  const hasHorarioEntrada = columns.some(c => c.name === 'horarioEntrada');
  const hasHorarioSalida = columns.some(c => c.name === 'horarioSalida');

  if (!hasHorarioEntrada) {
    db.exec("ALTER TABLE empleados ADD COLUMN horarioEntrada TEXT");
  }
  if (!hasHorarioSalida) {
    db.exec("ALTER TABLE empleados ADD COLUMN horarioSalida TEXT");
  }

  // Asistencias Table
  // Note: SQLite doesn't enforce FKs by default unless enabled, but good to define them.
  // We store dates as TEXT (ISO8601 strings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS asistencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empleadoId INTEGER NOT NULL,
      nombre TEXT,
      apellido TEXT,
      fecha TEXT NOT NULL,
      horaIngreso TEXT,
      horaEgreso TEXT,
      dispositivoIngreso TEXT,
      dispositivoEgreso TEXT,
      ipIngreso TEXT,
      ipEgreso TEXT,
      marcadoPor TEXT CHECK(marcadoPor IN ('empleado', 'admin')) DEFAULT 'empleado',
      manualBy INTEGER,
      FOREIGN KEY (empleadoId) REFERENCES empleados(id) ON DELETE CASCADE,
      FOREIGN KEY (manualBy) REFERENCES admins(id)
    )
  `);
};

createTables();

module.exports = db;
