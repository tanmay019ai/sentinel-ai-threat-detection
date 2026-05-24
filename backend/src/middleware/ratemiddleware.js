const requestTracker = {};

const WINDOW_SIZE = 60 * 1000;
const MAX_REQUESTS = 5;
const blockedips=require("../services/Blockedip.js")
const rateLimitMiddleware = (req, res, next) => {

  const ip = req.ip;

  const currentTime = Date.now();

  // First request from IP
  if (!requestTracker[ip]) {
    requestTracker[ip] = [];
  }

  // Remove old requests outside time window
  requestTracker[ip] = requestTracker[ip].filter(
    (timestamp) => currentTime - timestamp < WINDOW_SIZE
  );

  // Add current request timestamp
  requestTracker[ip].push(currentTime);

  // Check request count
  if (requestTracker[ip].length > MAX_REQUESTS) {

    blockedips.add(ip);

    return res.status(429).json({
      message: "Too many requests",
      threatDetected: true,
      threatType: "Brute Force / Rate Limit Exceeded"
    });

  }

  next();
};

module.exports = rateLimitMiddleware;