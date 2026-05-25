"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
	const pathname = usePathname();
	const isDashboard = pathname === "/dashboard";
	const isAnalytics = pathname === "/dashboard/analytics";
	const isLogs = pathname === "/dashboard/logs";

	return (
		<div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
			<div className="min-h-screen flex flex-col md:flex-row">
				<aside className="w-full shrink-0 border-b border-white/10 bg-slate-950/40 backdrop-blur md:w-72 md:border-b-0 md:border-r">
					<div className="p-4 md:p-6">
						<div className="text-lg font-semibold tracking-wide">Sentinel</div>
						<div className="mt-1 text-xs text-slate-300">AI Threat Detection</div>
					</div>

					<nav className="px-3 pb-4 md:pb-6">
						<ul className="flex gap-2 overflow-x-auto pb-1 text-sm md:block md:space-y-1 md:overflow-visible md:pb-0">
							<li>
								<Link
									href="/dashboard"
									className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
										isDashboard
											? "bg-white/10 text-slate-100"
											: "text-slate-300 hover:bg-white/5 hover:text-slate-100"
									}`}
								>
									<span className={`h-2 w-2 rounded-full ${isDashboard ? "bg-indigo-300" : "bg-slate-500"}`} />
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard/analytics"
									className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
										isAnalytics
											? "bg-white/10 text-slate-100"
											: "text-slate-300 hover:bg-white/5 hover:text-slate-100"
									}`}
								>
									<span className={`h-2 w-2 rounded-full ${isAnalytics ? "bg-indigo-300" : "bg-slate-500"}`} />
									Analytics
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard/logs"
									className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
										isLogs
											? "bg-white/10 text-slate-100"
											: "text-slate-300 hover:bg-white/5 hover:text-slate-100"
									}`}
								>
									<span className={`h-2 w-2 rounded-full ${isLogs ? "bg-indigo-300" : "bg-slate-500"}`} />
									Logs
								</Link>
							</li>
						</ul>
					</nav>
				</aside>

				<main className="min-w-0 flex-1 p-4 md:p-6 lg:p-10">{children}</main>
			</div>
		</div>
	);
}
