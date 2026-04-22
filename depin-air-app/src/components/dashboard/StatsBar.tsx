'use client';

import React, { useEffect, useRef } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { useWallet } from '@/context/WalletContext';

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
  const { account, connect, isConnecting } = useWallet();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Map' },
    { href: '/compare', label: 'Compare' },
    { href: '/tokens', label: 'Tokens' },
    { href: '/esg-portal', label: 'ESG' },
    { href: '/ledger', label: 'Ledger' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[2000] h-[52px] bg-bg-secondary/60 backdrop-blur-3xl border-b border-white/10 flex items-center px-6 lg:px-10 gap-16">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-4 shrink-0 group no-underline">
        <div className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-black bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform shrink-0">
          DA
        </div>
        <span className="text-xs font-black text-text-primary hidden lg:block whitespace-nowrap uppercase tracking-[0.3em]">
          DePIN-Air
        </span>
      </Link>

      {/* Stats Ticker */}
      <div className="flex items-center gap-12 overflow-x-auto hide-scrollbar scroll-smooth">
        <StatItem
          value={<AnimatedNumber value={stats.activeSensors} />}
          icon={<div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_10px_var(--accent-green)]" />}
        />
        <StatItem
          value={<AnimatedNumber value={stats.totalReadingsMinted} />}
          icon={<span className="text-[12px] text-accent-cyan font-black">⛓</span>}
          className="hidden sm:flex"
        />
        <StatItem
          value={<AnimatedNumber value={stats.globalAqi} />}
          icon={<div className="w-2 h-2 rounded-full bg-accent-amber shadow-[0_0_10px_var(--accent-amber)]" />}
        />
        <StatItem
          value={<AnimatedNumber value={Math.floor(stats.airqBurned)} />}
          icon={<span className="text-[12px] text-accent-red font-black">🔥</span>}
          className="hidden md:flex"
        />
      </div>

      {/* Nav Section */}
      <nav className="hidden lg:flex items-center gap-12 ml-auto">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 ${pathname === link.href ? 'text-accent-cyan shadow-[0_8px_15px_-5px_rgba(0,245,255,0.3)]' : 'text-text-muted hover:text-text-primary'}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Status Bar */}
      <div className="hidden xl:flex items-center gap-2.5 shrink-0 px-4 py-1.5 rounded-sm bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em]">
         <span className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_8px_#00F5FF] animate-pulse" />
         <span className="opacity-80">Connected</span>
      </div>
    </header>
  );
}

function StatItem({
  value,
  icon,
  className = '',
}: {
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className} shrink-0`}>
      <div className="flex items-center justify-center">{icon}</div>
      <span className="text-[11px] font-black text-text-primary font-mono tracking-tighter leading-none">
        {value}
      </span>
    </div>
  );
}
