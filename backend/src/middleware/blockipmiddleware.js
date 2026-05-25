const blockedIPs = require("../services/Blockedip.js");

const blockIPMiddleware = (req, res, next) => {

  const path = req.path || "";
  if (
    req.method === "GET" &&
    (path === "/api/stream" ||
      path === "/api/stats" ||
      path === "/api/recent-attacks" ||
      path === "/api/threat-stats" ||
      path === "/api/logs")
  ) {
    return next();
  }

  const ip = req.ip;

  if (blockedIPs.has(ip)) {

    return res.status(403).json({
      message: "Access denied",
      threatDetected: true,
      threatType: "Blocked IP"
    });

  }

  next();
};

module.exports = blockIPMiddleware;