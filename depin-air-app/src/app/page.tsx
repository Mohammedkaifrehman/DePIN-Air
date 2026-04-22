'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// ─── Typing Effect Hook ───
function useTypingEffect(phrases: string[], typingSpeed = 80, pauseTime = 800) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (phraseIndex >= phrases.length) {
      setIsComplete(true);
      return;
    }
    const currentPhrase = phrases[phraseIndex];
    if (charIndex < currentPhrase.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + currentPhrase[charIndex]);
        setCharIndex(charIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + ' ');
        setPhraseIndex(phraseIndex + 1);
        setCharIndex(0);
      }, pauseTime);
      return () => clearTimeout(timer);
    }
  }, [phraseIndex, charIndex, phrases, typingSpeed, pauseTime]);

  return { displayText, isComplete };
}

// ─── Animated Counter ───
function LiveCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const startTime = performance.now();
    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

// ─── Explainer Card ───
function ExplainerCard({
  icon,
  title,
  description,
  accent = 'purple',
}: {
  icon: string;
  title: string;
  description: string;
  accent?: 'purple' | 'cyan';
}) {
  const borderColor = accent === 'purple' ? '#b026ff' : '#00f5ff';
  const glowColor =
    accent === 'purple' ? 'rgba(176,38,255,0.12)' : 'rgba(0,245,255,0.12)';

  return (
    <div
      style={{
        borderLeft: `4px solid ${borderColor}`,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      className="
        group relative flex flex-col gap-5 p-8 h-full rounded-md
        bg-white/[0.03] backdrop-blur-xl
        hover:bg-white/[0.06]
        transition-all duration-300
        shadow-[0_2px_40px_rgba(0,0,0,0.4)]
      "
    >
      {/* subtle inner glow on hover */}
      <div
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 20% 50%, ${glowColor}, transparent 70%)` }}
      />

      <div className="text-4xl group-hover:scale-110 transition-transform duration-300 w-fit">
        {icon}
      </div>

      {/* FIX: title uses a sensible display size, not mixed-weight confusion */}
      <h3 className="text-xl font-bold text-white uppercase tracking-wide leading-snug">
        {title}
      </h3>

      {/* FIX: body copy in sentence case — all-caps paragraphs are fatiguing */}
      <p className="text-sm leading-relaxed text-white/50 font-normal tracking-normal">
        {description}
      </p>
    </div>
  );
}

// ─── Ticker Item ───
function TickerItem({
  label,
  value,
  highlight = 'purple',
}: {
  label: string;
  value: React.ReactNode;
  highlight?: 'purple' | 'cyan';
}) {
  const colorClass =
    highlight === 'purple' ? 'text-[#b026ff]' : 'text-[#00f5ff]';

  return (
    <div className="flex flex-col items-center gap-3 px-8 py-6">
      {/* FIX: stat number size is large but not absurdly outsized vs labels */}
      <span className={`text-5xl md:text-6xl font-black tabular-nums tracking-tighter ${colorClass}`}>
        {value}
      </span>
      {/* FIX: label is slightly larger and has better weight for legibility */}
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ───
export default function LandingPage() {
  const { displayText, isComplete } = useTypingEffect(
    ['100 sensors.', '1 blockchain.', '0 lies.'],
    70,
    600
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#080808] overflow-x-hidden overflow-y-auto text-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center px-6 sm:px-10 lg:px-16 pt-32 pb-24 relative overflow-hidden text-center">

        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 pointer-events-none w-[700px] h-[700px] bg-[#b026ff]/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 pointer-events-none w-[700px] h-[700px] bg-[#00f5ff]/10 rounded-full blur-[180px]" />

        {/* Headline */}
        <div className="relative z-10 w-full max-w-5xl">
          <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.9] tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b026ff] via-[#8A3DFE] to-[#00f5ff]">
              {displayText}
            </span>
            {!isComplete && (
              <span className="inline-block w-[3px] h-[0.85em] bg-[#00f5ff] align-middle ml-1 animate-pulse" />
            )}
          </h1>
        </div>

        {/* Eyebrow Label */}
        <p
          className={`
            text-xs sm:text-sm uppercase tracking-[0.35em] font-semibold text-[#b026ff]/70
            mt-6 transition-all duration-700 delay-500
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
          `}
        >
          Powered by Polygon · Proof of Atmosphere
        </p>

        {/* Subtitle */}
        <p
          className={`
            text-base md:text-lg text-white/40 mt-4 max-w-xl leading-relaxed font-normal
            transition-all duration-700 delay-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
          `}
        >
          Hyper-transparent environmental ledger. Every sensor reading cryptographically minted on-chain — in real time.
        </p>

        {/* Live Ticker */}
        <div
          className={`
            w-full max-w-3xl mt-12 relative z-10
            transition-all duration-700 delay-[900ms]
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="flex flex-col md:flex-row items-stretch rounded-xl bg-white/[0.03] border border-white/[0.07] shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden">
            <div className="flex-1">
              <TickerItem label="Readings minted" value={<LiveCounter end={12847} />} highlight="purple" />
            </div>
            <div className="hidden md:block w-px bg-white/[0.07] self-stretch" />
            <div className="flex-1">
              <TickerItem label="AQ-Index avg" value={<LiveCounter end={42} />} highlight="cyan" />
            </div>
            <div className="hidden md:block w-px bg-white/[0.07] self-stretch" />
            <div className="flex-1">
              <TickerItem label="Active nodes" value={<LiveCounter end={104} />} highlight="purple" />
            </div>
          </div>
        </div>

        {/* Explicit Spacer for High Fidelity Breathing Room */}
        <div className="h-24 md:h-32" />

        {/*
          FIX: both CTA buttons now share identical sizing and border treatment.
          Primary uses filled purple; secondary uses matching border + purple text
          so they have equal optical weight side by side.
        */}
        <div
          className={`
            flex flex-col sm:flex-row items-center gap-4 mt-0 -translate-y-20
            transition-all duration-1000
            ${isComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <Link href="/dashboard" passHref>
            <button className="
              group min-w-[340px] px-16 py-8 rounded-lg
              bg-[#b026ff] hover:bg-[#c040ff]
              text-lg font-black uppercase tracking-[0.25em]
              text-white transition-all duration-200
              shadow-[0_0_40px_rgba(176,38,255,0.4)]
              hover:shadow-[0_0_60px_rgba(176,38,255,0.6)]
              hover:scale-105 active:scale-95
            ">
              Explore Network
            </button>
          </Link>

        </div>
      </section>

      {/* ── Explainer Cards ──────────────────────────────────── */}
      <section className="w-full pb-24 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ExplainerCard
              icon="⚡"
              title="Low Latency"
              description="Sub-second synchronization between global sensors and our real-time visualization layer."
              accent="purple"
            />
            <ExplainerCard
              icon="🏹"
              title="Open-Source"
              description="No proprietary hardware or closed APIs. Truly decentralized physical infrastructure."
              accent="purple"
            />
            <ExplainerCard
              icon="💎"
              title="Proof of Truth"
              description="Every reading is cryptographically signed at the source and hashed onto the Polygon blockchain."
              accent="cyan"
            />
          </div>

          {/* Status Bar */}
          <div className="
          mt-10 px-8 py-5 rounded-xl
          bg-gradient-to-r from-[#b026ff]/8 to-[#00f5ff]/8
          border border-white/[0.06]
          backdrop-blur-xl
          flex flex-col md:flex-row items-center justify-between gap-6
        ">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f5ff] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f5ff]" />
              </span>
              <span className="text-[11px] font-semibold text-white/60 tracking-widest uppercase">
                Mainnet integrity verified
              </span>
            </div>

            {/*
            FIX: footer metadata gets proper breathing room,
            labels and values have clear size contrast
          */}
            <div className="flex gap-10">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Network</span>
                <span className="text-sm text-white font-bold uppercase tracking-wide">Polygon POS</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Protocol</span>
                <span className="text-sm text-white font-bold uppercase tracking-wide">v2.0-Hyper</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* FIX: footer text bumped up slightly from 10px — more readable */}
          <p className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.25em]">
            DePIN-Air · Decentralized Physical Infrastructure Network · © 2026
          </p>
          <nav className="flex gap-8">
            <Link
              href="/about"
              className="text-[11px] font-semibold text-white/40 hover:text-[#00f5ff] transition-colors uppercase tracking-widest"
            >
              About
            </Link>
            <Link
              href="/ledger"
              className="text-[11px] font-semibold text-white/40 hover:text-[#00f5ff] transition-colors uppercase tracking-widest"
            >
              Ledger
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}