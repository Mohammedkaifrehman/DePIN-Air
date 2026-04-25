'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// ─── Animated Wavy Canvas Background ───────────────────────────
function WavyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height * 0.45; // Horizon line slightly above center

      ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)'; // Neon green color
      ctx.lineWidth = 1;

      const cols = 45;
      const rows = 25;
      const width = canvas.width * 2;
      const startX = -width / 2;
      const dx = width / cols;

      // Draw Horizontal wavy lines
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        for (let x = 0; x <= cols; x++) {
          const xx = startX + x * dx;
          const zz = y / rows; // 0 (horizon) to 1 (front of screen)

          // Sine wave formula for the hills and valleys
          const wave = Math.sin(xx * 0.003 + time + zz * 5) * 60 * zz;

          // 3D Perspective projection
          const px = cx + xx * (0.2 + zz * 1.5);
          const py = cy + (zz * canvas.height * 0.6) + wave;

          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw Vertical wavy lines
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        for (let y = 0; y <= rows; y++) {
          const xx = startX + x * dx;
          const zz = y / rows;

          const wave = Math.sin(xx * 0.003 + time + zz * 5) * 60 * zz;
          const px = cx + xx * (0.2 + zz * 1.5);
          const py = cy + (zz * canvas.height * 0.6) + wave;

          if (y === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      time -= 0.015; // Controls the speed of the wave moving forward
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}

// ─── Custom SVG Icons ─────────────────────────────
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 9l-5 5-4-4-5 5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="9" r="1" fill="currentColor" />
    <circle cx="13" cy="14" r="1" fill="currentColor" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
  </svg>
);

const GaugeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12h.01M17 12h.01" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 8.5l-.01.01M8.5 8.5l-.01.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <path d="M3 6l6-3 6 3 6-3v12l-6 3-6-3-6 3V6z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3v12M15 9v12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LightningGraphic = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NodeGraphic = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    <path d="M21 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m18 8v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3m18-8v8M3 8v8m6-12v16m6-16v16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiamondGraphic = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className}>
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 9h20M12 3v18M6 3l6 6M18 3l-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Typing Effect Hook ────────────────────────────────────────────────
function TypingHeadline() {
  const fullTextLine1 = "100 SENSORS. 1";
  const fullTextLine2 = "BLOCKCHAIN. 0 LIES.";

  const [displayedLine1, setDisplayedLine1] = useState('');
  const [displayedLine2, setDisplayedLine2] = useState('');
  const [isLine1Complete, setIsLine1Complete] = useState(false);
  const [isAllComplete, setIsAllComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer1 = setInterval(() => {
      setDisplayedLine1(fullTextLine1.slice(0, i + 1));
      i++;
      if (i > fullTextLine1.length) {
        clearInterval(timer1);
        setIsLine1Complete(true);
      }
    }, 70);
    return () => clearInterval(timer1);
  }, []);

  useEffect(() => {
    if (!isLine1Complete) return;
    let j = 0;
    const timer2 = setInterval(() => {
      setDisplayedLine2(fullTextLine2.slice(0, j + 1));
      j++;
      if (j > fullTextLine2.length) {
        clearInterval(timer2);
        setIsAllComplete(true);
      }
    }, 70);
    return () => clearInterval(timer2);
  }, [isLine1Complete]);

  return (
    <h1 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.95] tracking-tighter uppercase flex flex-col items-center antialiased">
      <span className="text-[#4ade80] drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]">
        {displayedLine1}
        {!isLine1Complete && <span className="inline-block w-[4px] h-[0.8em] bg-[#4ade80] align-middle ml-1 animate-pulse" />}
      </span>
      <span className="text-[#4ade80] drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] flex items-center">
        {displayedLine2}
        {isLine1Complete && !isAllComplete && <span className="inline-block w-[4px] h-[0.8em] bg-[#4ade80] align-middle ml-1 animate-pulse" />}
      </span>
    </h1>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────────
function LiveCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
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
  return <span>{value.toLocaleString()}</span>;
}

// ─── Explainer Card ────────────────────────────────────────────────────
function ExplainerCard({
  icon,
  title,
  description,
  rightGraphic
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  rightGraphic?: React.ReactNode;
}) {
  return (
    <div className="
      group relative overflow-hidden flex flex-col p-8 h-[170px] rounded-xl
      bg-black/60 backdrop-blur-md border border-white/5
      hover:border-[#4ade80]/30 transition-all duration-300
    ">
      <div className="absolute top-0 left-6 w-10 h-[3px] bg-[#4ade80] shadow-[0_0_12px_#4ade80]" />

      <div className="relative z-10 w-[70%]">
        <div className="text-[#4ade80] mb-3">
          {icon}
        </div>
        <h3 className="text-[15px] font-black text-white uppercase tracking-widest mb-3 antialiased">
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed text-white/50 font-medium tracking-wide">
          {description}
        </p>
      </div>

      {rightGraphic && (
        <div className="absolute -right-6 -bottom-6 w-40 h-40 text-[#4ade80]/10 pointer-events-none transform -rotate-12 group-hover:scale-110 group-hover:text-[#4ade80]/20 transition-all duration-500">
          {rightGraphic}
        </div>
      )}
    </div>
  );
}

// ─── Ticker Item ───────────────────────────────────────────────────────
function TickerItem({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-8 pt-4 pb-8">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1 antialiased">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] antialiased pb-2 leading-tight">
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050A07] overflow-x-hidden text-white font-sans selection:bg-[#4ade80]/30">

      {/* ── Background Mesh & Glows ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          // CSS mask fades the edges of the canvas into black for a seamless look
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 50%, transparent 100%)'
        }}
      >
        {/* Animated Wavy Canvas Layer */}
        <WavyBackground />

        {/* Horizon Soft Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A07] via-transparent to-transparent h-[40vh]" />

        {/* Top Center Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#4ade80]/15 rounded-full blur-[150px]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="flex-1 flex flex-col items-center px-6 pt-10 pb-8 relative z-10 text-center">
        <TypingHeadline />

        <p className={`text-[13px] sm:text-[14px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-5 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          Powered by Polygon · Proof of Atmosphere
        </p>

        <p className={`text-base sm:text-lg text-slate-400 mt-3 max-w-2xl font-medium transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          Hyper-transparent environmental ledger. Every sensor reading<br />cryptographically minted on-chain — in real time.
        </p>

        {/* Stats Bar */}
        <div className={`mt-8 w-full max-w-[850px] relative z-10 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row items-stretch rounded-xl bg-black/50 border border-white/5 shadow-2xl backdrop-blur-md">
            <div className="flex-1">
              <TickerItem label="Readings Minted" value={<LiveCounter end={12847} />} icon={<ChartIcon />} />
            </div>
            <div className="hidden md:block w-px bg-white/5 self-stretch my-4" />
            <div className="flex-1">
              <TickerItem label="AQ-Index Avg" value={<LiveCounter end={42} />} icon={<GaugeIcon />} />
            </div>
            <div className="hidden md:block w-px bg-white/5 self-stretch my-4" />
            <div className="flex-1">
              <TickerItem label="Active Nodes" value={<LiveCounter end={104} />} icon={<MapIcon />} />
            </div>
          </div>

          {/* Explore Network Button */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex justify-center w-full pointer-events-none">
            <Link href="/dashboard" passHref>
              <button className="
                 pointer-events-auto
                 px-16 py-5 rounded-full border border-[#4ade80] text-[#4ade80]
                 bg-[#050A07] hover:bg-[#4ade80]/10
                 text-xl font-bold uppercase tracking-[0.2em]
                 transition-all shadow-[0_0_25px_rgba(74,222,128,0.2)]
                 hover:scale-105 active:scale-95
               ">
                Explore Network
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="w-full pb-16 pt-20 flex flex-col items-center relative z-10">
        <div className="w-full max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <ExplainerCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              title="Low Latency"
              description="Sub-second synchronization between global sensors and our real-time visualization layer."
              rightGraphic={<LightningGraphic className="w-full h-full" />}
            />

            <ExplainerCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m18 8v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3m18-8v8M3 8v8m6-12v16m6-16v16" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              title="Open-Source"
              description="No proprietary hardware or closed APIs. Truly decentralized physical infrastructure."
              rightGraphic={<NodeGraphic className="w-full h-full" />}
            />

            <ExplainerCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M12 3v18M6 3l6 6M18 3l-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              title="Proof of Truth"
              description="Every reading is cryptographically signed at the source and hashed onto the Polygon blockchain."
              rightGraphic={<DiamondGraphic className="w-full h-full" />}
            />

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto relative z-10 border-t border-white/[0.02]">
        <div className="max-w-[900px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[8px] font-semibold text-white/30 uppercase tracking-[0.2em]">
            DePIN-Air · Decentralized Physical Infrastructure Network · © 2026
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-[6px] w-[6px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-[#4ade80]" />
            </span>
            <span className="text-[9px] font-bold text-white/60 tracking-widest uppercase antialiased">
              Mainnet integrity verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}