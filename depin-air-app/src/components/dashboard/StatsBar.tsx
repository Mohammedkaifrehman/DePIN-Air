'use client';

import React, { useEffect, useRef } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const start = prevValue.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      el.textContent = decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value, decimals]);

  return <span ref={ref} className="font-mono">{value}</span>;
}

function StatusDot({ aqi }: { aqi: number }) {
  const color = aqi < 100 ? 'green' : aqi < 150 ? 'amber' : 'red';
  return <span className={`status-dot ${color}`} />;
}

export default function StatsBar() {
  const { stats, connected } = useWebSocket();

  return (
    <header className="z-[100] h-[var(--stats-bar-height)] bg-bg-secondary/80 backdrop-blur-xl border-b border-border-primary/50 shadow-2xl flex items-center px-4 shrink-0">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 shrink-0 group no-underline">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gradient-to-br from-accent-green to-[#148a63] text-white shadow-lg shadow-accent-green/20 group-hover:scale-105 transition-transform">
          DA
        </div>
        <span className="text-sm font-bold text-text-primary hidden sm:block">
          DePIN-Air
        </span>
      </Link>

      {/* Stats */}
      <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto hide-scrollbar px-2">
        <StatItem
          label="Sensors"
          value={<AnimatedNumber value={stats.activeSensors} />}
          icon={<StatusDot aqi={50} />}
        />
        <StatItem
          label="Minted"
          value={<AnimatedNumber value={stats.totalReadingsMinted} />}
          icon={<span className="text-xs">⛓</span>}
        />
        <StatItem
          label="Global AQI"
          value={<AnimatedNumber value={stats.globalAqi} />}
          icon={<StatusDot aqi={stats.globalAqi} />}
        />
        <StatItem
          label="Burned"
          value={<AnimatedNumber value={stats.airqBurned} />}
          icon={<span className="text-xs">🔥</span>}
          className="hidden md:flex"
        />
      </div>

      {/* Nav + Connection */}
      <div className="flex items-center gap-2 shrink-0">
        <nav className="hidden lg:flex items-center gap-1 mr-2 border-r border-border-primary pr-2">
          <Link href="/dashboard" className="nav-link">Map</Link>
          <Link href="/compare" className="nav-link">Compare</Link>
          <Link href="/tokens" className="nav-link">Tokens</Link>
          <Link href="/esg-portal" className="nav-link">ESG</Link>
        </nav>
        
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${
          connected ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green animate-pulse shadow-[0_0_8px_var(--accent-green)]' : 'bg-accent-red shadow-[0_0_8px_var(--accent-red)]'}`} />
          <span className="hidden sm:inline">{connected ? 'Live Network' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}

function StatItem({
  label,
  value,
  icon,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className} shrink-0`}>
      <div className="flex items-center justify-center w-5 h-5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest text-text-muted leading-none mb-0.5">
          {label}
        </span>
        <span className="text-xs font-bold text-text-primary leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}
