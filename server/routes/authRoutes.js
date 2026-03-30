const express = require("express");
const router = express.Router();
const {
  loginEmpleado,
  loginAdmin,
  exportSesionesExcel,
} = require("../controllers/authController");

router.post("/empleado/login", loginEmpleado);
router.post("/admin/login", loginAdmin);
router.get("/export-sesiones", exportSesionesExcel);

module.exports = router;
