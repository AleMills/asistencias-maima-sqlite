const QRCode = require("qrcode");
const os = require("os");

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or string 'IPv4'
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

exports.generateQR = async (req, res) => {
  try {
    const ip = getLocalIP();
    const port = process.env.QRPORT || 5173;
    const url = `http://${ip}:${port}/marcar`;

    const qrImage = await QRCode.toDataURL(url);

    res.json({
      url,
      qrImage,
      ip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar QR" });
  }
};
