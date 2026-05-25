"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    const glowId = setTimeout(() => setShowGlow(true), 600);
    const navId = setTimeout(() => router.replace("/dashboard"), 1800);
    return () => {
      clearTimeout(glowId);
      clearTimeout(navId);
    };
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-1/2 top-1/2 h-130 w-130 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-85 w-85 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-55 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg text-center">
          <div className={`mx-auto h-20 w-20 rounded-2xl border border-white/15 bg-white/5 backdrop-blur ${showGlow ? "sa-glow" : ""}`}>
            <div className="flex h-full w-full items-center justify-center">
              <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold tracking-widest text-slate-100">
                SA
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sa-intro-in">SentinelAI</h1>
          <p className="mt-2 text-sm text-slate-300 sa-intro-in" style={{ animationDelay: "120ms" }}>
            Cyber threat detection and realtime monitoring
          </p>
        </div>
      </div>
    </div>
  );
}