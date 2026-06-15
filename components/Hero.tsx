"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

const WORDS = ["agent", "machine", "robot", "AI", "API"];
const CONTRACT = "0xc5F069Bf8b8eCc19f0fB70Eb6884781B0132AB07";

function ContractButton() {
  const [copied, setCopied] = useState(false);
  const short = CONTRACT.slice(0, 6) + "…" + CONTRACT.slice(-4);

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CONTRACT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const el = document.createElement("textarea");
    el.value = CONTRACT;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3 pointer-events-auto">
      {/* CA — clear, full on desktop, shortened on mobile */}
      <button
        type="button"
        onClick={copy}
        title="Click to copy contract address"
        className="group cursor-pointer relative flex items-center gap-2 sm:gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25 max-w-[92vw]"
      >
        <span className="text-black/60 text-xs sm:text-sm font-mono shrink-0">CA:</span>
        {/* Full CA on md+ screens, shortened on mobile */}
        <span className="font-mono tracking-tight hidden md:inline break-all">{CONTRACT}</span>
        <span className="font-mono tracking-tight md:hidden">{short}</span>
        <span className="ml-1 text-black/60 group-hover:text-black/90 transition-colors shrink-0">
          {copied ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </span>
        {copied && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2.5 py-1 rounded-md whitespace-nowrap font-medium">
            Copied!
          </span>
        )}
      </button>

      {/* Clanker link — clickable redirect */}
      <a
        href={`https://www.clanker.world/clanker/${CONTRACT}`}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer flex items-center gap-2 bg-[#171719]/90 backdrop-blur border border-white/15 hover:border-emerald-400/50 hover:bg-[#1B1B1C] text-white px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all hover:scale-[1.03] active:scale-[0.98]"
      >
        <span className="text-emerald-400 font-bold">$VERGE</span>
        <span className="text-white/60">on</span>
        <span className="text-blue-400 font-semibold">Clanker</span>
        <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </a>
    </div>
  );
}

export default function Hero() {
  const typeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = typeRef.current;
    if (!el) return;

    let w = 0;
    let i = WORDS[0].length; // start with full first word shown
    let deleting = true;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const word = WORDS[w];
      if (deleting) {
        i--;
        el!.textContent = word.slice(0, i);
        if (i <= 0) {
          deleting = false;
          w = (w + 1) % WORDS.length;
          timeout = setTimeout(tick, 350);
          return;
        }
        timeout = setTimeout(tick, 55);
      } else {
        i++;
        el!.textContent = word.slice(0, i);
        if (i >= word.length) {
          deleting = true;
          timeout = setTimeout(tick, 1600);
          return;
        }
        timeout = setTimeout(tick, 110);
      }
    }

    // wait after page load, then begin cycle
    timeout = setTimeout(() => {
      deleting = true;
      i = WORDS[0].length;
      tick();
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative min-h-screen w-screen overflow-hidden flex flex-col rounded-b-[20px] md:rounded-b-[24px] lg:rounded-b-[32px] -mb-[20px] md:-mb-[24px] lg:-mb-[32px] z-30">
      {/* Dark bg */}
      <div className="absolute inset-0 bg-[#1B1B1C]" />

      {/* Hero image with hue-shift filter to match mrdn cyan/teal */}
      <div className="absolute inset-0">
        <img
          src="/hero-fast.webp"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{
            filter: "sepia(0.85) hue-rotate(150deg) saturate(2.4) brightness(0.95)",
          }}
          aria-hidden
        />
      </div>

      {/* Contract button — bottom center */}
      <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-full max-w-[680px] flex justify-center px-3">
        <ContractButton />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-3 md:px-5 lg:px-8 relative z-20 pt-16">
        <div className="text-center px-2 md:px-3 lg:px-6 max-w-[90%] md:max-w-none relative z-20">
          <Reveal>
            {/* Badge */}
            <div className="mb-6 md:mb-8">
              <span className="bg-emerald-500 dark:bg-emerald-400 text-black px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 rounded font-semibold inline-block font-funnel-display">
                x402
              </span>
            </div>

            {/* Line 1 */}
            <p
              className="text-lg sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl text-white font-light"
              style={{
                textShadow:
                  "0 0 6px rgba(52, 211, 153, 0.45), 0 0 14px rgba(52, 211, 153, 0.25), 0 0 24px rgba(52, 211, 153, 0.12)",
              }}
            >
              <span className="bg-emerald-500 dark:bg-emerald-400 text-black px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 rounded font-semibold inline-block font-funnel-display">
                x402
              </span>{" "}
              payment rails
            </p>

            {/* Line 2 with typewriter */}
            <p className="text-lg sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl text-white font-light mt-1.5 md:mt-2 lg:mt-3">
              for the{" "}
              <span className="font-funnel-display font-light">
                <span ref={typeRef}>agent</span>
                <span className="animate-pulse" id="hero-cursor">|</span>
              </span>{" "}
              economy
            </p>
          </Reveal>

        </div>
      </div>

      {/* Scroll indicator — hidden on mobile, visible on desktop */}
      <div className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <Reveal delay={300}>
          <div className="flex flex-col items-center gap-1.5 md:gap-2 text-white/80 hover:text-white transition-colors">
            <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-0.5 h-2.5 md:w-1 md:h-3 bg-white/60 rounded-full mt-1.5 md:mt-2 animate-bounce" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
