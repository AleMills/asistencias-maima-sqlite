const express = require("express");
const router = express.Router();
const { loginEmpleado, loginAdmin } = require("../controllers/authController");

router.post("/empleado/login", loginEmpleado);
router.post("/admin/login", loginAdmin);

module.exports = router;
