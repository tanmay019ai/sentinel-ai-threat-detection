"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [apiOnline, setApiOnline] = useState(true);
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanStats, setScanStats] = useState({});
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    const streamUrl = `${getApiBaseUrl()}/api/stream`;
    const source = new EventSource(streamUrl);

    const onDashboard = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setStats(payload?.stats ?? null);
        setRecentAttacks(Array.isArray(payload?.recentAttacks) ? payload.recentAttacks : []);
        setScanStats(payload?.scanStats ?? {});
        setRecentScans(Array.isArray(payload?.recentScans) ? payload.recentScans : []);
        setApiOnline(true);
      } catch {
        // ignore malformed payloads
      }
    };

    const onError = () => {
      setApiOnline(false);
    };

    source.addEventListener("dashboard", onDashboard);
    source.addEventListener("error", onError);
    // EventSource built-in retry will handle reconnect

    return () => {
      source.removeEventListener("dashboard", onDashboard);
      source.removeEventListener("error", onError);
      source.close();
    };
  }, []);

  const totalRequests = useMemo(
    () => (typeof stats?.totalRequests === "number" ? stats.totalRequests : null),
    [stats]
  );
  const totalThreats = useMemo(
    () => (typeof stats?.totalThreats === "number" ? stats.totalThreats : null),
    [stats]
  );
  const blockedIps = useMemo(
    () => (typeof stats?.blockedIps === "number" ? stats.blockedIps : null),
    [stats]
  );
  const totalScans = useMemo(
    () => (typeof stats?.totalScans === "number" ? stats.totalScans : null),
    [stats]
  );

  const pieData = useMemo(() => {
    const counts = { safe: 0, malicious: 0 };
    const rows = Array.isArray(scanStats?.byPrediction) ? scanStats.byPrediction : [];
    rows.forEach((row) => {
      const key = String(row?._id || "").toLowerCase();
      if (key === "safe") counts.safe = row?.count ?? 0;
      if (key === "malicious") counts.malicious = row?.count ?? 0;
    });

    return [
      { name: "Safe", value: counts.safe },
      { name: "Malicious", value: counts.malicious },
    ];
  }, [scanStats]);

  const severityData = useMemo(() => {
    const order = ["Low", "Medium", "High", "Critical"];
    const map = new Map(order.map((level) => [level, 0]));
    const rows = Array.isArray(scanStats?.bySeverity) ? scanStats.bySeverity : [];
    rows.forEach((row) => {
      const label = row?._id || "Unknown";
      map.set(label, row?.count ?? 0);
    });

    return order.map((level) => ({ severity: level, count: map.get(level) ?? 0 }));
  }, [scanStats]);

  const trendData = useMemo(() => {
    if (!recentScans?.length) return [];
    return [...recentScans]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((scan, index) => ({
        index: index + 1,
        confidence: Math.round((scan?.confidence || 0) * 100),
      }));
  }, [recentScans]);

  const handleScan = async () => {
    if (!url) return;
    try {
      setLoadingScan(true);
      const response = await fetch(`${getApiBaseUrl()}/api/ai/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });
      const data = await response.json();
      setScanResult(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="sa-dash-in">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-300">Overview of activity, alerts, and system health.</p>
      </header>

      <section className="mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-4">AI Website Scanner</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="flex-1 rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none text-white"
            />
            <button
              onClick={handleScan}
              className="bg-indigo-500/90 hover:bg-indigo-400 transition-all duration-300 px-6 py-3 rounded-xl font-medium"
            >
              {loadingScan ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>
      </section>

      {scanResult ? (
        <section className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            <h2 className="text-xl font-semibold mb-4">Scan Result</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400">URL:</span>
                <p className="mt-1 break-all">{scanResult.url}</p>
              </div>
              <div>
                <span className="text-slate-400">Prediction:</span>
                <p
                  className={`mt-1 text-xl font-bold ${
                    scanResult.prediction === "safe" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {scanResult.prediction}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Confidence:</span>
                <p className="mt-1 text-xl font-bold text-cyan-300">
                  {Math.round((scanResult.confidence || 0) * 100)}%
                </p>
              </div>
              <div>
                <span className="text-slate-400">Severity:</span>
                <p className="mt-1 font-bold text-orange-400">{scanResult.severity}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-sm text-slate-300">Total Requests</div>
              <div className="mt-2 text-3xl font-semibold">{totalRequests ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-400">All-time requests logged</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-sm text-slate-300">Threats Detected</div>
              <div className="mt-2 text-3xl font-semibold">{totalThreats ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-400">All-time threats flagged</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-sm text-slate-300">Blocked IPs</div>
              <div className="mt-2 text-3xl font-semibold">{blockedIps ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-400">Currently blocked entries</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-sm text-slate-300">Total Scans</div>
              <div className="mt-2 text-3xl font-semibold">{totalScans ?? "—"}</div>
              <div className="mt-2 text-xs text-slate-400">All-time AI scans</div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-6">Threat Distribution</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-6">Threat Severity</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Threat Trend</h2>
            <span className="text-xs text-slate-400">Recent scan confidence</span>
          </div>
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis allowDecimals={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="#38bdf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-200">Recent Alerts</h2>
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
              <div className="mt-4 space-y-3 text-sm">
                {recentAttacks?.length ? (
                  recentAttacks.map((attack) => (
                    <div
                      key={attack?._id ?? `${attack?.ip ?? "unknown"}-${attack?.timestamp ?? ""}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-slate-200">
                          <span className="font-medium">{attack?.threatType || "Threat"}</span>
                          {attack?.ip ? <span className="text-slate-400"> · {attack.ip}</span> : null}
                        </div>
                        <div className="text-xs text-slate-400">{formatTimestamp(attack?.timestamp)}</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        {attack?.method ? `${attack.method} ` : ""}
                        <span className="break-all">{attack?.url || ""}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                    {apiOnline ? "No alerts to show yet." : "Backend API not reachable."}
                  </div>
                )}
              </div>
            </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
              <h2 className="text-sm font-medium text-slate-200">System Status</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">API</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${apiOnline ? "bg-emerald-400" : "bg-rose-400"}`}
                    />
                    <span className="text-slate-200">{apiOnline ? "Online" : "Offline"}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">Database</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-slate-200">Check</span>
                  </div>
                </div>
              </div>
        </div>
      </section>
    </div>
  );
}

