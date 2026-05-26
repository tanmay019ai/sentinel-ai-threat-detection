const Log = require("../model/log.js");
const ScanResult = require("../model/scanResult.js");
const blockedIps = require("./Blockedip.js");
const stream = require("./dashboardStream.js");

async function buildDashboardPayload() {
	const [
		totalRequests,
		totalThreats,
		recentAttacks,
		threatStats,
		recentLogs,
		totalScans,
		recentScans,
		scanByPrediction,
		scanBySeverity,
	] = await Promise.all([
		Log.countDocuments(),
		Log.countDocuments({ threatDetected: true }),
		Log.find({ threatDetected: true }).sort({ timestamp: -1 }).limit(10),
		Log.aggregate([
			{ $match: { threatDetected: true } },
			{ $group: { _id: "$threatType", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]),
		Log.find({}).sort({ timestamp: -1 }).limit(25),
		ScanResult.countDocuments(),
		ScanResult.find({}).sort({ timestamp: -1 }).limit(10),
		ScanResult.aggregate([
			{ $group: { _id: "$prediction", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]),
		ScanResult.aggregate([
			{ $group: { _id: "$severity", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]),
	]);

	return {
		stats: {
			totalRequests,
			totalThreats,
			blockedIps: blockedIps.size,
			totalScans,
		},
		recentAttacks,
		threatStats,
		recentLogs,
		scanStats: {
			totalScans,
			byPrediction: scanByPrediction,
			bySeverity: scanBySeverity,
		},
		recentScans,
	};
}

let pendingTimer = null;

function triggerDashboardBroadcast() {
	if (stream.clientCount() === 0) return;
	if (pendingTimer) return;

	const throttleMs = Math.max(parseInt(process.env.SSE_THROTTLE_MS, 10) || 200, 50);
	pendingTimer = setTimeout(async () => {
		pendingTimer = null;
		try {
			const payload = await buildDashboardPayload();
			stream.broadcast("dashboard", payload);
		} catch (error) {
			stream.broadcast("error", { message: error?.message || "Unknown error" });
		}
	}, throttleMs);
}

module.exports = {
	buildDashboardPayload,
	triggerDashboardBroadcast,
};
