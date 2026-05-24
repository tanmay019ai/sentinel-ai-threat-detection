const blockedIPs = require("../services/Blockedip.js");

const blockIPMiddleware = (req, res, next) => {

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