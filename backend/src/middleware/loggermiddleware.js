const Log=require("../model/log.js");

const Middleware =async(req, res, next) => {
    try
    {
        await Log.create({
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get("user-agent"),
            threatDetected: req.threatDetected,
            threatType: req.threatType

        });
        console.log("Log entry created successfully",req.ip);
        next();
    }
    catch (error)
    {
        console.error("Error creating log entry:", error);
    }
    next();
};


module.exports=Middleware;
