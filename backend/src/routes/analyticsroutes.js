const express=require("express");

const router= express.Router();

const Log=require("../model/log.js");
router.get("/stats", async (req, res) => {

   try {

      const totalRequests = await Log.countDocuments();

      const totalThreats = await Log.countDocuments({
         threatDetected: true
      });

      res.json({
         totalRequests,
         totalThreats
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