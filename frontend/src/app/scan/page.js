"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

const PROCESSING_STEPS = [
  "Initializing AI engine...",
  "Fetching website content...",
  "Analyzing HTML structure...",
  "Extracting security features...",
  "Running ML prediction...",
  "Generating threat report...",
];

export default function ScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentStep = useMemo(() => PROCESSING_STEPS[stepIndex] || "", [stepIndex]);

  const startProgress = () => {
    setStepIndex(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 1200);
  };

  const stopProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleScan = async () => {
    if (!url) return;
    setError("");
    setLoading(true);
    startProgress();

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ai/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Scan failed. Please try again.");
      }

      const data = await response.json();
      sessionStorage.setItem("latestScanResult", JSON.stringify(data));
      const scanId = data?._id ? encodeURIComponent(data._id) : "";
      router.push(`/results${scanId ? `?scanId=${scanId}` : ""}`);
    } catch (scanError) {
      setError(scanError?.message || "Scan failed.");
    } finally {
      stopProgress();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="min-h-screen px-6 py-8">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">SentinelAI</div>
            <h1 className="mt-2 text-2xl font-semibold">AI Website Scanner</h1>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/5"
            >
              Home
            </Link>
          </div>
        </header>

        <main className="mx-auto mt-12 grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="sa-intro-in">
              <h2 className="text-3xl font-semibold">Scan any website for hidden threats.</h2>
              <p className="mt-3 text-sm text-slate-300">
                Enter a URL and let SentinelAI analyze HTML structure, scripts, forms, and ML signals.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={handleScan}
                disabled={loading}
                className="rounded-xl bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Scanning..." : "Scan Website"}
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>System status</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-200">
                  AI Ready
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Model</span>
                  <span className="text-slate-400">SentinelAI v2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>HTML Analyzer</span>
                  <span className="text-slate-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <span className="text-slate-400">~1.8s avg</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="sa-radar" />
              <div className="w-full">
                <div className="sa-scanline" />
                <div className="mt-4 text-sm text-slate-300">{loading ? "AI scanning in progress" : "Awaiting target"}</div>
                <div className="mt-2 text-lg font-semibold text-slate-100">
                  {loading ? currentStep : "Enter a URL to begin"}
                </div>
              </div>

              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs text-slate-300">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Processing logs</div>
                <div className="mt-3 space-y-2">
                  {PROCESSING_STEPS.map((step, index) => (
                    <div
                      key={step}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                        loading && index === stepIndex
                          ? "bg-indigo-500/15 text-indigo-200"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <span>{step}</span>
                      <span>{loading && index === stepIndex ? "RUNNING" : "READY"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
          <div className="mx-6 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-center shadow-2xl shadow-slate-950/40">
            <div className="mx-auto flex flex-col items-center gap-5">
              <div className="sa-radar" />
              <div className="w-full">
                <div className="sa-scanline" />
                <div className="mt-4 text-sm text-slate-300">SentinelAI is actively scanning</div>
                <div className="mt-2 text-lg font-semibold text-slate-100">{currentStep}</div>
              </div>
              <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs text-slate-300">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Processing steps</div>
                <div className="mt-3 space-y-2">
                  {PROCESSING_STEPS.map((step, index) => (
                    <div
                      key={step}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                        index === stepIndex ? "bg-indigo-500/20 text-indigo-100" : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <span>{step}</span>
                      <span>{index === stepIndex ? "ACTIVE" : "QUEUED"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
