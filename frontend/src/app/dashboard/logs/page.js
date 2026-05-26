"use client";

import { useEffect, useMemo, useState } from "react";

function formatTimestamp(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString();
}

function getApiBaseUrl() {
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export default function LogsPage() {
	const [logs, setLogs] = useState([]);
	const [apiOnline, setApiOnline] = useState(true);

	useEffect(() => {
		const streamUrl = `${getApiBaseUrl()}/api/stream`;
		const source = new EventSource(streamUrl);

		const onDashboard = (event) => {
			try {
				const payload = JSON.parse(event.data);
				setLogs(Array.isArray(payload?.recentLogs) ? payload.recentLogs : []);
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

	const totalShown = useMemo(() => logs.length, [logs]);

	return (
		<div>
			<header className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold">Logs</h1>
						<p className="text-sm text-slate-300">Most recent requests recorded by the backend.</p>
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

			<section className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-5">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-medium text-slate-200">Recent Events</h2>
					<div className="text-xs text-slate-400">Showing {totalShown || "—"}</div>
				</div>

				<div className="mt-4 space-y-2 overflow-x-auto">
					{logs?.length ? (
						logs.map((row) => (
							<div
								key={row?._id ?? `${row?.ip ?? "unknown"}-${row?.timestamp ?? ""}`}
								className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="text-sm text-slate-200">
										<span className="font-medium">{row?.method || "—"}</span>
										{row?.url ? <span className="break-all text-slate-400"> · {row.url}</span> : null}
									</div>
									<div className="text-xs text-slate-400">{formatTimestamp(row?.timestamp)}</div>
								</div>

								<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
									{row?.ip ? (
										<span className="rounded-full bg-white/10 px-2 py-1 text-slate-200">{row.ip}</span>
									) : null}
									{row?.threatDetected ? (
										<span className="rounded-full bg-rose-400/15 px-2 py-1 text-rose-200">
											{row?.threatType || "Threat"}
										</span>
									) : (
										<span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-200">
											OK
										</span>
									)}
								</div>
 							</div>
 						))
 					) : (
 						<div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
 							{apiOnline ? "No logs to show yet." : "Backend API not reachable."}
 						</div>
 					)}
 				</div>
 			</section>
 		</div>
 	);
 }
