"use client";

import { useEffect, useMemo, useState } from "react";

function getApiBaseUrl() {
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export default function AnalyticsPage() {
	const [threatStats, setThreatStats] = useState([]);
	const [apiOnline, setApiOnline] = useState(true);

	useEffect(() => {
		const streamUrl = `${getApiBaseUrl()}/api/stream`;
		const source = new EventSource(streamUrl);

		const onDashboard = (event) => {
			try {
				const payload = JSON.parse(event.data);
				setThreatStats(Array.isArray(payload?.threatStats) ? payload.threatStats : []);
				setApiOnline(true);
			} catch {
				// ignore
			}
		};

		const onError = () => setApiOnline(false);

		source.addEventListener("dashboard", onDashboard);
		source.addEventListener("error", onError);

		return () => {
			source.removeEventListener("dashboard", onDashboard);
			source.removeEventListener("error", onError);
			source.close();
		};
	}, []);

	const totalThreatTypes = useMemo(() => threatStats.length, [threatStats]);

	return (
		<div>
			<header className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold">Analytics</h1>
						<p className="text-sm text-slate-300">Threat distribution by type.</p>
					</div>
					<span
						className={`rounded-full px-2.5 py-1 text-xs ${
							apiOnline
								? "bg-emerald-400/15 text-emerald-200 motion-safe:animate-pulse"
								: "bg-rose-400/15 text-rose-200"
						}`}
					>
						{apiOnline ? "Live" : "Offline"}
					</span>
				</div>
			</header>

			<section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
					<div className="text-sm text-slate-300">Threat Types</div>
					<div className="mt-2 text-3xl font-semibold">{totalThreatTypes || "—"}</div>
					<div className="mt-2 text-xs text-slate-400">Unique threatType categories</div>
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
					<div className="text-sm text-slate-300">Top Threats</div>
					<div className="mt-2 text-xs text-slate-400">Live counts by threat type</div>
					<div className="mt-4 space-y-2">
						{threatStats?.length ? (
							threatStats.map((row) => (
								<div
									key={row?._id ?? "unknown"}
									className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3"
								>
									<div className="text-sm text-slate-200">{row?._id || "Unknown"}</div>
									<div className="text-sm font-medium text-slate-100">{row?.count ?? 0}</div>
								</div>
							))
						) : (
							<div className="rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
								{apiOnline ? "No threat analytics yet." : "Backend API not reachable."}
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
