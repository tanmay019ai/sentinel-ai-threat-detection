const Log = require("../model/log.js");
const blockedIps = require("./Blockedip.js");
const stream = require("./dashboardStream.js");

async function buildDashboardPayload() {
	const [totalRequests, totalThreats, recentAttacks, threatStats, recentLogs] = await Promise.all([
		Log.countDocuments(),
		Log.countDocuments({ threatDetected: true }),
		Log.find({ threatDetected: true }).sort({ timestamp: -1 }).limit(10),
		Log.aggregate([
			{ $match: { threatDetected: true } },
			{ $group: { _id: "$threatType", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]),
		Log.find({}).sort({ timestamp: -1 }).limit(25),
	]);

	return {
		stats: {
			totalRequests,
			totalThreats,
			blockedIps: blockedIps.size,
		},
		recentAttacks,
		threatStats,
		recentLogs,
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
