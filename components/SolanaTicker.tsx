"use client";

import { useEffect, useState } from "react";

interface Stats {
  ok: boolean;
  slot: number | null;
  tps: number | null;
  avgFeeSol: number | null;
  latestBlockhash: string;
}

function fmtNum(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}

function fmtFee(n: number | null): string {
  if (n == null) return "—";
  if (n === 0) return "0 SOL";
  if (n < 0.00001) return `${(n * 1e9).toFixed(0)}lp`;
  return `${n.toFixed(6).replace(/0+$/, "0")} SOL`;
}

export default function BaseTicker() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const r = await fetch("/api/Base-stats", { cache: "no-store" });
        const data = (await r.json()) as Stats;
        if (cancelled) return;
        setStats(data);
        setLive(Boolean(data.ok && data.slot));
      } catch {
        if (!cancelled) setLive(false);
      } finally {
        if (!cancelled) timer = setTimeout(tick, 3000);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-[#2a2a2e] bg-[#1B1B1C] hidden sm:block">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-1.5 flex items-center gap-3 md:gap-6 font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase whitespace-nowrap overflow-x-auto">
        <span className="inline-flex items-center gap-2 shrink-0">
          <span
            className="pulse-dot w-1.5 h-1.5 rounded-full"
            style={{
              color: live ? "var(--color-accent)" : "var(--color-ink-dim)",
              background: live ? "var(--color-accent)" : "var(--color-ink-dim)",
            }}
          />
          <span style={{ color: live ? "var(--color-accent)" : "var(--color-ink-mid)" }}>
            {live ? "mainnet live" : "connecting…"}
          </span>
        </span>

        <Stat label="slot"  value={fmtNum(stats?.slot ?? null)} />
        <Stat label="tps"   value={fmtNum(stats?.tps ?? null)} />
        <Stat label="p-fee" value={fmtFee(stats?.avgFeeSol ?? null)} />
        <Stat label="block" value={stats?.latestBlockhash ?? "—"} />
        <span className="ml-auto ink-dim shrink-0 hidden md:inline">
          &#x25B8; rpc &middot; public
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span className="ink-dim">{label}:</span>
      <span className="ink font-medium">{value}</span>
    </span>
  );
}
