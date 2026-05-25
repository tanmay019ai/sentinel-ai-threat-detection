const express=require("express");

const router= express.Router();

const Log=require("../model/log.js");
const blockedIps = require("../services/Blockedip.js");
const dashboardStream = require("../services/dashboardStream.js");
const { buildDashboardPayload } = require("../services/dashboardBroadcast.js");

function setSseHeaders(res) {
   res.status(200);
   res.setHeader("Content-Type", "text/event-stream");
   res.setHeader("Cache-Control", "no-cache, no-transform");
   res.setHeader("Connection", "keep-alive");
   res.setHeader("X-Accel-Buffering", "no");
   if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
   }
}

router.get("/stream", async (req, res) => {
   setSseHeaders(res);
   dashboardStream.addClient(res);

   try {
      const payload = await buildDashboardPayload();
      dashboardStream.sendEvent(res, "dashboard", payload);
   } catch (error) {
      dashboardStream.sendEvent(res, "error", { message: error.message || "Unknown error" });
   }

   const heartbeatMs = Math.max(parseInt(process.env.SSE_HEARTBEAT_MS, 10) || 25000, 5000);
   const heartbeatId = setInterval(() => {
      try {
         res.write(": keep-alive\n\n");
      } catch {
         // ignore
      }
   }, heartbeatMs);

   req.on("close", () => {
      clearInterval(heartbeatId);
      dashboardStream.removeClient(res);
      res.end();
   });
});

router.get("/logs", async (req, res) => {
   try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
      const logs = await Log.find({}).sort({ timestamp: -1 }).limit(limit);
      res.json(logs);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

router.get("/stats", async (req, res) => {

   try {

      const totalRequests = await Log.countDocuments();

      const totalThreats = await Log.countDocuments({
         threatDetected: true
      });

      res.json({
         totalRequests,
         totalThreats,
         blockedIps: blockedIps.size
      });

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

});
router.get("/recent-attacks", async (req, res) => {

   try {

      const recentAttacks = await Log.find({
         threatDetected: true
      })
      .sort({ timestamp: -1 })
      .limit(10);

      res.json(recentAttacks);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

});

router.get("/threat-stats", async (req, res) => {

   try {

      const stats = await Log.aggregate([
         {
            $match: {
               threatDetected: true
            }
         },

         {
            $group: {
               _id: "$threatType",
               count: {
                  $sum: 1
               }
            }
         }
      ]);

      res.json(stats);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

});

module.exports=router;