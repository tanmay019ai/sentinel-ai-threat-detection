const express = require("express");
const axios = require("axios");

const ScanResult = require("../model/scanResult.js");
const { triggerDashboardBroadcast } = require("../services/dashboardBroadcast.js");

const router = express.Router();

router.post("/scan-url", async (req, res) => {
	try {
		const { url } = req.body;
		if (!url) {
			return res.status(400).json({ message: "url is required" });
		}

		const response = await axios.post("http://127.0.0.1:8000/scan-url", { url });
		const saved = await ScanResult.create(response.data);
		triggerDashboardBroadcast();

		return res.json(saved);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "AI service failed",
		});
	}
});

router.get("/scan-results", async (req, res) => {
	try {
		const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
		const results = await ScanResult.find({}).sort({ timestamp: -1 }).limit(limit);
		res.json(results);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.get("/scan-stats", async (req, res) => {
	try {
		const [totalScans, byPrediction] = await Promise.all([
			ScanResult.countDocuments(),
			ScanResult.aggregate([
				{ $group: { _id: "$prediction", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
			]),
		]);

		res.json({ totalScans, byPrediction });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
