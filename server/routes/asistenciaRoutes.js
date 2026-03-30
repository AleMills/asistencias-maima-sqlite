const express = require("express");
const router = express.Router();
const {
  marcarAsistencia,
  getAsistencias,
  manualMark,
  exportExcel,
  getLlegadasTarde,
  exportLlegadasTarde,
} = require("../controllers/asistenciaController");
const { exportSesionesExcel } = require("../controllers/authController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const ipMiddleware = require("../middleware/ipMiddleware");

// Public-ish route (requires auth but is for employees)
// Apply IP middleware ONLY to the marking route
router.post("/marcar", ipMiddleware, authMiddleware, marcarAsistencia);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAsistencias);
router.post("/manual", authMiddleware, adminMiddleware, manualMark);
router.get("/export", authMiddleware, adminMiddleware, exportExcel);
router.get(
  "/llegadas-tarde",
  authMiddleware,
  adminMiddleware,
  getLlegadasTarde
);
router.get(
  "/llegadas-tarde/export",
  authMiddleware,
  adminMiddleware,
  exportLlegadasTarde
);
router.get(
  "/sesiones/export",
  authMiddleware,
  adminMiddleware,
  exportSesionesExcel
);

module.exports = router;
