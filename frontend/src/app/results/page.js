"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scanId");
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem("latestScanResult") || "null");
    } catch {
      stored = null;
    }

    const loadLatest = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/ai/scan-results?limit=8`);
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          setRecentScans(data);
          if (scanId) {
            const match = data.find((item) => String(item?._id) === String(scanId));
            if (match) {
              setScanResult(match);
              return;
            }
          }
          if (!stored || (stored && stored?._id !== scanId)) {
            setScanResult(data[0]);
          }
        }
      } catch {
        // ignore fetch errors
      } finally {
        setLoading(false);
      }
    };

    if (stored && (!scanId || stored?._id === scanId)) {
      setScanResult(stored);
      setLoading(false);
      loadLatest();
      return;
    }

    loadLatest();
  }, [scanId]);

  const htmlAnalysis = scanResult?.html_analysis || {};
  const indicators = useMemo(
    () => [
      { label: "Login forms", value: htmlAnalysis?.form_count ?? 0 },
      { label: "Iframes", value: htmlAnalysis?.iframe_count ?? 0 },
      { label: "Scripts", value: htmlAnalysis?.script_count ?? 0 },
      { label: "External scripts", value: htmlAnalysis?.external_script_count ?? 0 },
      { label: "Password inputs", value: htmlAnalysis?.password_input_count ?? 0 },
      { label: "Hidden elements", value: htmlAnalysis?.hidden_element_count ?? 0 },
    ],
    [htmlAnalysis]
  );

  const highlights = useMemo(
    () => [
      { label: "Prediction", value: scanResult?.prediction || "—" },
      { label: "Severity", value: scanResult?.severity || "—" },
      { label: "Confidence", value: `${Math.round((scanResult?.confidence || 0) * 100)}%` },
      { label: "Scan time", value: formatTimestamp(scanResult?.timestamp) || "Just now" },
    ],
    [scanResult]
  );

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="min-h-screen px-6 py-8">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Results</div>
            <h1 className="mt-2 text-2xl font-semibold">Threat Intelligence Report</h1>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/scan"
              className="rounded-xl bg-indigo-500/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
            >
              New Scan
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <main className="mx-auto mt-10 w-full max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
              Loading threat report...
            </div>
          ) : scanResult ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Target URL</div>
                    <p className="mt-2 break-all text-sm text-slate-200">{scanResult?.url}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      scanResult?.prediction === "safe"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-rose-500/15 text-rose-200"
                    }`}
                  >
                    {scanResult?.prediction || "Unknown"}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="text-xs text-slate-400">{item.label}</div>
                      <div className="mt-2 text-lg font-semibold text-slate-100">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400">HTML Threat Indicators</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {indicators.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-slate-100">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Analysis Summary</div>
                <h2 className="mt-3 text-2xl font-semibold">AI Findings</h2>
                <p className="mt-3 text-sm text-slate-300">
                  SentinelAI analyzed URL signals and HTML structure to detect suspicious patterns, script behavior, and
                  credential harvesting risks.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    Domain: <span className="text-slate-100">{scanResult?.domain || "Unknown"}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    Fetch status: <span className="text-slate-100">{scanResult?.fetch_status || "—"}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    Scan duration: <span className="text-slate-100">{scanResult?.scan_duration || "—"} ms</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    HTTPS: <span className="text-slate-100">{scanResult?.has_https ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Recent Reports</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {recentScans.length ? (
                      recentScans.map((scan) => (
                        <Link
                          key={scan?._id ?? scan?.url}
                          href={`/results?scanId=${encodeURIComponent(scan?._id || "")}`}
                          className={`flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 transition ${
                            scan?._id === scanResult?._id
                              ? "bg-indigo-500/15 text-indigo-100"
                              : "bg-slate-950/40 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate pr-3">{scan?.url || "Unknown URL"}</span>
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatTimestamp(scan?.timestamp) || "Just now"}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
                        No recent scans available.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 sm:hidden">
                  <Link
                    href="/scan"
                    className="rounded-xl bg-indigo-500/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
                  >
                    New Scan
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
              No scan data available yet. Run a scan to generate your report.
              <div className="mt-4">
                <Link
                  href="/scan"
                  className="inline-flex rounded-xl bg-indigo-500/90 px-5 py-3 text-xs font-semibold text-white transition hover:bg-indigo-400"
                >
                  Start a scan
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
