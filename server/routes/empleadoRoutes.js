const express = require("express");
const router = express.Router();
const {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} = require("../controllers/empleadoController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.use(adminMiddleware); // All routes require admin

router.get("/", getEmpleados);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);

module.exports = router;
