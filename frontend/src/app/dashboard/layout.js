"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export default function DashboardLayout({ children }) {
	const pathname = usePathname();
	const isDashboard = pathname === "/dashboard";
	const isAnalytics = pathname === "/dashboard/analytics";
	const isLogs = pathname === "/dashboard/logs";
	const [mobileOpen, setMobileOpen] = useState(false);

	const navLinks = useMemo(
		() => (
			<ul className="flex gap-2 overflow-x-auto pb-1 text-sm md:block md:space-y-1 md:overflow-visible md:pb-0">
				<li>
					<Link
						href="/dashboard"
						onClick={() => setMobileOpen(false)}
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
						onClick={() => setMobileOpen(false)}
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
						onClick={() => setMobileOpen(false)}
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
		),
		[isAnalytics, isDashboard, isLogs]
	);

	return (
		<div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
			<div className="min-h-screen flex flex-col md:flex-row">
				<aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/40 backdrop-blur lg:flex">
					<div className="p-4 md:p-6">
						<div className="text-lg font-semibold tracking-wide">Sentinel</div>
						<div className="mt-1 text-xs text-slate-300">AI Threat Detection</div>
					</div>

					<nav className="px-3 pb-4 md:pb-6">
						{navLinks}
					</nav>
				</aside>

				<div
					className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden ${
						mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
					}`}
					onClick={() => setMobileOpen(false)}
				/>

				<aside
					className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-slate-950/95 backdrop-blur lg:hidden ${
						mobileOpen ? "translate-x-0" : "-translate-x-full"
					} transition-transform duration-300`}
				>
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-lg font-semibold tracking-wide">Sentinel</div>
								<div className="mt-1 text-xs text-slate-300">AI Threat Detection</div>
							</div>
							<button
								type="button"
								className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
								onClick={() => setMobileOpen(false)}
								aria-label="Close menu"
							>
								Close
							</button>
						</div>
					</div>
					<nav className="px-3 pb-6">{navLinks}</nav>
				</aside>

				<main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
					<div className="mx-auto w-full max-w-[1600px]">
						<div className="mb-4 flex items-center justify-between lg:hidden">
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100"
								onClick={() => setMobileOpen(true)}
								aria-label="Open menu"
							>
								<span className="h-2 w-2 rounded-full bg-indigo-300" />
								Menu
							</button>
							<div className="text-xs text-slate-300">Sentinel AI Console</div>
						</div>
						<div key={pathname} className="sa-dash-in">
							{children}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
