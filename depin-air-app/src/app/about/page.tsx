'use client';

import React from 'react';
import Link from 'next/link';
import StatsBar from '@/components/dashboard/StatsBar';
import DashboardBackground from '@/components/layout/DashboardBackground';
import { useWebSocket } from '@/context/WebSocketContext';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const { stats } = useWebSocket();

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <DashboardBackground />
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      
      <main className="flex-1 overflow-auto">
        <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-10 py-12 min-h-full">
          <div className="flex flex-col gap-12 w-full">
            
            {/* Header Section - Dashboard Style */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[1]">
                  <span className="text-gradient bg-gradient-to-r from-accent-purple to-accent-green">
                    The Network Protocol
                  </span>
                </h1>
                <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed font-medium">
                  Decentralized Infrastructure for Global Atmospheric Integrity. 
                  Protocol Manifest v2.{stats.activeSensors}-HYPER settlement active.
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="px-6 py-6 border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center min-w-[160px] shadow-2xl rounded-md">
                  <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">NODES LIVE</span>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_10px_#00F5FF] animate-pulse" />
                    <span className="text-lg font-bold text-text-primary tabular-nums tracking-tight">{stats.activeSensors}</span>
                  </div>
                </div>
                <div className="px-6 py-6 border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center min-w-[160px] shadow-2xl rounded-md">
                  <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">INTEGRITY</span>
                  <span className="text-lg font-bold text-accent-green uppercase tracking-tight">STABLE ✓</span>
                </div>
              </div>
            </div>

            {/* Narrative Content - Grid Style */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
                <div className="p-8 border-l-2 border-accent-purple bg-white/[0.02] backdrop-blur-xl rounded-r-md">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-cyan mb-4">01. THE PROBLEM</h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium uppercase tracking-widest opacity-80">
                    Modern air quality data is fragmented, centralized, and prone to administrative manipulation. Cities often position sensors in optimal zones, hiding the true atmospheric cost.
                  </p>
                </div>
                <div className="p-8 border-l-2 border-accent-cyan bg-white/[0.02] backdrop-blur-xl rounded-r-md">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-purple mb-4">02. THE SOLUTION</h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium uppercase tracking-widest opacity-80">
                    DePIN-Air decentralizes the stack. Using citizen-operated hardware nodes and blockchain, we create a high-fidelity environmental ledger that is immutable.
                  </p>
                </div>
              </div>

              <div className="col-span-12 md:col-span-8">
                <div className="p-10 h-full border border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-md relative overflow-hidden group shadow-2xl">
                   <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl group-hover:scale-110 transition-transform">🛰️</div>
                   <h3 className="text-accent-purple font-black text-2xl uppercase tracking-tighter mb-8">Protocol Economics</h3>
                   <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-2xl font-medium uppercase tracking-widest opacity-80">
                      AIRQ tokens incentivize node operators to maintain uptime. Every sensor reading is a cryptographic proof of atmosphere, minted onto the Polygon network. 
                      Enterprise demand for these reports drives a sustainable deflationary burn mechanism.
                   </p>
                   <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold tracking-widest mb-1 uppercase">Block Finality</span>
                        <span className="text-xl font-black text-text-primary tracking-tight uppercase">Instant settlement</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-muted font-bold tracking-widest mb-1 uppercase">Emission Rate</span>
                        <span className="text-xl font-black text-text-primary tracking-tight uppercase">1.0 AIRQ / Batch</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Beneficiaries Area */}
            <div className="w-full pt-12">
               <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.4em] mb-12 text-center">Verified Network Stakeholders</h3>
               <div className="flex flex-wrap justify-center gap-x-20 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all pb-20">
                  <span className="text-2xl font-black uppercase tracking-tighter text-white">Google India</span>
                  <span className="text-2xl font-black uppercase tracking-tighter text-white">Tata Steel</span>
                  <span className="text-2xl font-black uppercase tracking-tighter text-white">Microsoft</span>
                  <span className="text-2xl font-black uppercase tracking-tighter text-white">Reliance</span>
                  <span className="text-2xl font-black uppercase tracking-tighter text-white">Amazon</span>
               </div>
            </div>

            {/* Bottom CTA */}
            <div className="flex justify-center pb-20">
               <Link href="/dashboard" passHref>
                 <Button size="lg" className="px-12 py-8 text-base">
                    ENTER COMMAND CENTER
                 </Button>
               </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}