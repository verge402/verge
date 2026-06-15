"use client";

import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setState("err");
        setMsg(data.error || "Something went wrong");
        return;
      }
      setState("ok");
      setMsg(data.message || "You're on the list. We'll be in touch.");
    } catch {
      setState("err");
      setMsg("Network error — try again");
    }
  }

  return (
    <section id="waitlist" className="bg-[#171719] py-20 md:py-28 relative z-20">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-white mb-5">
          The first{" "}
          <span className="bg-emerald-500 text-black px-1.5 md:px-2 py-0.5 rounded font-semibold inline-block">
            100
          </span>{" "}
          endpoints{" "}
          <br className="hidden sm:block" />
          go free for 6 months.
        </h2>
        <p className="text-gray-400 text-sm md:text-base mb-10 max-w-[520px] mx-auto">
          We&rsquo;re onboarding 100 builders before mainnet launch. No facilitator fee on
          your first 1M requests. No contract.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-[480px] mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.dev"
            disabled={state === "loading" || state === "ok"}
            className="flex-1 px-5 py-3 text-[15px] rounded-xl border border-[#3a3a3e] bg-[#1B1B1C] focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.2)] disabled:opacity-50 text-white placeholder:text-gray-500 transition-all"
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "ok"}
            className="bg-emerald-500 text-black px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "loading" ? "…" : state === "ok" ? "✓ joined" : "Get early access"}
          </button>
        </form>

        {msg && (
          <div className={`mt-5 text-[13.5px] ${state === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {msg}
          </div>
        )}

        <div className="mt-10 font-mono text-[11px] tracking-[0.16em] uppercase text-gray-500">
          &#x25B8; no spam &middot; 1 email per release
        </div>
      </div>
    </section>
  );
}
