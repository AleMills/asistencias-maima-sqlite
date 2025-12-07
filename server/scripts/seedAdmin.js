const db = require("../db");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    console.log("Checking for existing admin...");

    const email = "admin@admin.com";
    const password = "admin";

    const adminExists = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
    
    if (adminExists) {
      console.log("Admin ya existe");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    db.prepare(
      "INSERT INTO admins (email, passwordHash, rol) VALUES (?, ?, ?)"
    ).run(email, passwordHash, "admin");

    console.log("Admin creado exitosamente");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
