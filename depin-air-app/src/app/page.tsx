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
    <div className="min-h-screen w-full flex flex-col bg-bg-primary overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[600px] h-[600px] bg-accent-green/10 rounded-full blur-[120px]"
        />

        {/* Typing Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-tight relative z-10 text-text-primary max-w-4xl tracking-tighter">
          <span>{displayText}</span>
          {!isComplete && <span className="typing-cursor" />}
        </h1>

        {/* Subtext */}
        <p
          className={`text-lg sm:text-xl text-center mt-8 max-w-2xl leading-relaxed transition-all duration-1000 delay-700 text-text-secondary ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Real-time air quality data, permanently recorded on-chain.
          <br />
          No central authority. Just math and sensors.
        </p>

        {/* Live Ticker */}
        <div
          className={`flex flex-wrap justify-center items-center gap-4 sm:gap-10 mt-12 px-8 py-4 rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl transition-all duration-1000 delay-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <TickerItem label="Readings minted" value={<LiveCounter end={12847} />} />
          <div className="hidden sm:block w-px h-8 bg-border-primary" />
          <TickerItem label="AIRQ in circulation" value={<LiveCounter end={4250} />} />
          <div className="hidden sm:block w-px h-8 bg-border-primary" />
          <TickerItem label="Anomalies detected" value={<LiveCounter end={23} />} />
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 mt-12 transition-all duration-1000 delay-[1200ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link href="/dashboard" passHref>
            <Button size="lg" className="px-8 py-6 text-base group">
              View Network Map <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
          <Link href="/esg-portal" passHref>
            <Button variant="secondary" size="lg" className="px-8 py-6 text-base">
              ESG Portal
            </Button>
          </Link>
          <Link href="/compare" passHref>
            <Button variant="outline" size="lg" className="px-8 py-6 text-base border-dashed">
              Audit Official Data
            </Button>
          </Link>
        </div>
      </section>

      {/* Explainer Cards */}
      <section className="px-4 pb-24 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExplainerCard
            icon="🏛"
            title="The Problem"
            description="Official air quality data is often delayed, sparse, and prone to political influence. Citizens deserve the raw truth."
          />
          <ExplainerCard
            icon="🌐"
            title="Citizen Infrastructure"
            description="Our DePIN network uses 100+ low-cost, high-precision sensors streaming live PM2.5 and NO2 data directly to the edge."
          />
          <ExplainerCard
            icon="⛓"
            title="On-Chain Verification"
            description="Every 30 seconds, a batch hash is minted on Polygon, creating an immutable audit trail for corporations and NGOs."
          />
        </div>

        {/* Competitor Callout */}
        <div
          className="mt-8 px-6 py-4 rounded-2xl bg-accent-green/5 border border-accent-green/10 text-center animate-pulse"
        >
          <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">
            Built for the future of transparency · 100% Verified by Polygon
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[10px] bg-bg-secondary border-t border-border-primary text-text-muted uppercase tracking-[0.2em] font-bold">
        DePIN-Air · Decentralized Physical Infrastructure Network · © 2026
      </footer>
    </div>
  );
}

function ExplainerCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Card hoverable className="p-8">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-text-primary">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
    </Card>
  );
}

function TickerItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold text-accent-green">
        {value}
      </span>
      <span className="text-[10px] mt-1 font-bold uppercase tracking-wider text-text-muted">
        {label}
      </span>
    </div>
  );
}

