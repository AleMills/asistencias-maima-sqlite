// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const path = require("path");

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Conectado"))
//   .catch((err) => console.error("Error conectando a MongoDB:", err));

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/empleados", require("./routes/empleadoRoutes"));
// app.use("/api/asistencias", require("./routes/asistenciaRoutes"));
// app.use("/api/qr", require("./routes/qrRoutes"));

// // Serve static assets
// const clientBuildPath = path.join(__dirname, "../client/dist");
// app.use(express.static(clientBuildPath));

// // SPA Fallback: Serve index.html for any unknown route (GET only)
// app.get("*", (req, res) => {
//   // Don't interfere with API routes (they are already defined above)
//   res.sendFile(path.join(clientBuildPath, "index.html"));
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Servidor corriendo en puerto ${PORT}`);

//   // Print local IP for convenience
//   const os = require("os");
//   const interfaces = os.networkInterfaces();
//   let localIP = "localhost";
//   for (const name of Object.keys(interfaces)) {
//     for (const iface of interfaces[name]) {
//       if (iface.family === "IPv4" && !iface.internal) {
//         localIP = iface.address;
//       }
//     }
//   }
//   console.log(`Acceso local: http://${localIP}:${PORT}`);
// });



const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const os = require("os");
const db = require("./db"); // Initialize SQLite DB

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/empleados", require("./routes/empleadoRoutes"));
app.use("/api/asistencias", require("./routes/asistenciaRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));

// Serve static assets
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// SPA Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

/* 
  ===========================================
  FUNCIÓN PARA DETECTAR SOLO LA IP DEL WIFI
  ===========================================
*/
function getWifiIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    if (
      name.toLowerCase().includes("wi-fi") ||
      name.toLowerCase().includes("wifi") ||
      name.toLowerCase().includes("wlan")
    ) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  return null;
}

const WIFI_IP = getWifiIP() || "127.0.0.1";

if (!WIFI_IP) {
  console.warn("⚠️ ADVERTENCIA: No se encontró IP de WiFi. El sistema solo será accesible localmente.");
}

/*
  ===========================================
  SERVIDOR SOLO EN LA IP DEL WIFI
  ===========================================
*/
app.listen(PORT, "0.0.0.0", () => {
  console.log("=====================================");
  console.log("Servidor corriendo SOLO en el WiFi");
  console.log(`IP WiFi detectada: ${WIFI_IP}`);
  console.log(`Acceso local:   http://${WIFI_IP}:${PORT}`);
  console.log(`Acceso PC:      http://localhost:${PORT}`);
  console.log("=====================================");
});
