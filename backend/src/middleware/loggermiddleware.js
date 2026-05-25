const Log=require("../model/log.js");
const { triggerDashboardBroadcast } = require("../services/dashboardBroadcast.js");

const Middleware =(req, res, next) => {
    const path = req.path || "";
    const shouldSkip =
        req.method === "GET" &&
        (path === "/api/stream" ||
            path === "/api/stats" ||
            path === "/api/recent-attacks" ||
            path === "/api/threat-stats" ||
            path === "/api/logs");

    if (!shouldSkip) {
        res.on("finish", () => {
            (async () => {
                try {
                    await Log.create({
                        ip: req.ip,
                        method: req.method,
                        url: req.originalUrl,
                        userAgent: req.get("user-agent"),
                        threatDetected: req.threatDetected,
                        threatType: req.threatType,
                    });
                    console.log("Log entry created successfully", req.ip);
                    triggerDashboardBroadcast();
                } catch (error) {
                    console.error("Error creating log entry:", error);
                }
            })();
        });
    }

    return next();
};


module.exports=Middleware;
