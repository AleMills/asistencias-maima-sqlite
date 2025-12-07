const express = require("express");
const router = express.Router();
const { generateQR } = require("../controllers/qrController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get("/", authMiddleware, adminMiddleware, generateQR);

module.exports = router;
