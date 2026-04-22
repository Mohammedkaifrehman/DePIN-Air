'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

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
function LiveCounter({ end, duration = 2000, prefix = '', suffix = '' }: {
  end: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span ref={ref} className="font-mono">{prefix}{value.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { displayText, isComplete } = useTypingEffect(
    ['100 sensors.', '1 blockchain.', '0 lies.'],
    70,
    600
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-bg-primary overflow-x-hidden overflow-y-auto">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 relative overflow-hidden text-center">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 pointer-events-none w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 pointer-events-none w-[600px] h-[600px] bg-accent-green/10 rounded-full blur-[160px]" />

        {/* Typing Headline */}
        <div className="w-full relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[150px] font-black leading-[0.85] tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple via-[#8A3DFE] to-accent-green">
              {displayText}
            </span>
            {!isComplete && <span className="typing-cursor !text-accent-green" />}
          </h1>
        </div>

        {/* Subtext */}
        <p
          className={`text-sm sm:text-lg text-text-secondary mt-12 max-w-2xl leading-relaxed transition-all duration-1000 delay-700 px-6 font-medium uppercase tracking-[0.2em] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Hyper-Transparent Environmental Ledger.
          <br className="hidden sm:block" />
          Powered by Polygon · Proof of Atmosphere.
        </p>

        {/* Live Ticker Grid */}
        <div className="w-full mt-24 px-6 relative z-10">
          <div
            className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 p-8 md:p-1 rounded-md bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex-1 p-10">
              <TickerItem label="Readings minted" value={<LiveCounter end={12847} />} highlight="purple" />
            </div>
            <div className="hidden md:block w-px h-16 bg-white/10 self-center" />
            <div className="flex-1 p-10">
              <TickerItem label="AQ-Index Avg" value={<LiveCounter end={42} />} highlight="cyan" />
            </div>
            <div className="hidden md:block w-px h-16 bg-white/10 self-center" />
            <div className="flex-1 p-10">
              <TickerItem label="Active Nodes" value={<LiveCounter end={104} />} highlight="purple" />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-10 mt-20 transition-all duration-1000 delay-[1200ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link href="/dashboard" passHref>
            <Button size="lg" className="group min-w-[280px]">
              Explore Network <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </Button>
          </Link>
          <Link href="/esg-portal" passHref>
            <Button variant="secondary" size="lg" className="min-w-[280px]">
              Enterprise ESG
            </Button>
          </Link>
        </div>
      </section>

      {/* Explainer Cards Section */}
      <section className="px-6 lg:px-10 pb-32 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <ExplainerCard
              icon="⚡"
              title="Low Latency"
              description="Sub-second synchronization between global sensors and our real-time visualization layer."
              accent="purple"
            />
          </div>
          <div className="md:col-span-4">
            <ExplainerCard
              icon="💎"
              title="Proof of Truth"
              description="Every reading is cryptographically signed at the source and hashed onto the Polygon blockchain."
              accent="cyan"
            />
          </div>
          <div className="md:col-span-4">
            <ExplainerCard
              icon="🏹"
              title="Open-Source"
              description="No proprietary hardware or closed APIs. Truly decentralized physical infrastructure."
              accent="purple"
            />
          </div>
        </div>

        {/* Status Bar */}
        <div
          className="mt-20 px-10 py-8 rounded-md bg-gradient-to-r from-accent-purple/10 to-accent-green/10 border border-white/5 backdrop-blur-xl text-center flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-ping" />
            <span className="text-[11px] font-black text-white tracking-[0.4em] uppercase">
              Mainnet Integrity Verified
            </span>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1">Network</span>
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Polygon POS</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1">Protocol</span>
              <span className="text-[10px] text-white font-black uppercase tracking-widest">v2.0-HYPER</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border-primary bg-bg-secondary/20">
        <div className="px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
            DePIN-Air · Decentralized Physical Infrastructure Network · © 2026
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-[10px] font-black text-text-secondary hover:text-accent-green transition-colors uppercase tracking-widest">About</Link>
            <Link href="/ledger" className="text-[10px] font-black text-text-secondary hover:text-accent-green transition-colors uppercase tracking-widest">Ledger</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExplainerCard({ icon, title, description, accent = 'purple' }: { icon: string; title: string; description: string; accent?: 'purple' | 'cyan' }) {
  const accentClass = accent === 'purple' ? 'border-accent-purple shadow-accent-purple/5' : 'border-accent-green shadow-accent-green/5';
  
  return (
    <div className={`p-10 rounded-sm bg-white/[0.03] backdrop-blur-xl border-l-4 ${accentClass} border-transparent shadow-2xl hover:bg-white/[0.05] transition-all group h-full`}>
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-black mb-4 text-text-primary uppercase tracking-tighter">
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-text-secondary font-medium uppercase tracking-[0.15em] opacity-80">
        {description}
      </p>
    </div>
  );
}

function TickerItem({ label, value, highlight = 'purple' }: { label: string; value: React.ReactNode; highlight?: 'purple' | 'cyan' }) {
  const colorClass = highlight === 'purple' ? 'text-accent-purple' : 'text-accent-green';
  const glowClass = highlight === 'purple' ? 'shadow-[0_0_20px_rgba(176,38,255,0.3)]' : 'shadow-[0_0_20px_rgba(0,245,255,0.3)]';

  return (
    <div className="flex flex-col items-center">
      <span className={`text-5xl md:text-8xl font-black ${colorClass} tracking-tighter drop-shadow-2xl`}>
        {value}
      </span>
      <span className="text-[12px] mt-6 font-black uppercase tracking-[0.4em] text-text-muted">
        {label}
      </span>
    </div>
  );
}

