const ipRangeCheck = require("ip-range-check");

const ipMiddleware = (req, res, next) => {
  // Get IP from request
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Handle IPv6 mapped IPv4 addresses
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }

  // Localhost is always allowed for testing/admin purposes on the server machine itself
  if (ip === "127.0.0.1" || ip === "::1") {
    return next();
  }

  // Private IP ranges
  const privateRanges = ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"];

  if (ipRangeCheck(ip, privateRanges)) {
    next();
  } else {
    console.log(`Acceso bloqueado desde IP externa: ${ip}`);
    res
      .status(403)
      .json({
        message: "Acceso denegado. Solo permitido desde la red local (LAN).",
      });
  }
};

module.exports = ipMiddleware;
