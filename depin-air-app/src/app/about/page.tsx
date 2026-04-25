'use client';

import React from 'react';
import Link from 'next/link';
import StatsBar from '@/components/dashboard/StatsBar';
import DashboardBackground from '@/components/layout/DashboardBackground';
import { useWebSocket } from '@/context/WebSocketContext';

// ─── Custom Wireframe Cube Graphic ─────────────────────────────
const IsometricCube = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className={className}>
    {/* Outer Hexagon */}
    <path d="M12 2L22 7.5V18.5L12 24L2 18.5V7.5L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
    {/* Inner Y-Shape connecting corners */}
    <path d="M12 13.5V24M12 13.5L22 7.5M12 13.5L2 7.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AboutPage() {
  const { stats } = useWebSocket();

  return (
    <div className="h-screen flex flex-col bg-[#050A07] overflow-hidden text-white font-sans selection:bg-[#4ade80]/30 antialiased">
      <DashboardBackground />
      <StatsBar />

      {/* Spacer for fixed top nav */}
      <div className="h-[52px] shrink-0" />

      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#4ade80]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 pt-10 pb-6 flex-1 flex flex-col h-full">
          <div className="flex flex-col w-full flex-1 h-full">

            {/* ── Header Section ── */}
            <div className="flex flex-col gap-8 pb-6 shrink-0">
              {/* Massive Solid Green Title */}
              <h1 className="text-4xl md:text-[5rem] font-black tracking-tighter uppercase leading-[0.85] text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                THE NETWORK PROTOCOL
              </h1>

              {/* Subtitle & Stat Boxes Row */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-4">
                <p className="text-[9px] md:text-[10px] text-white/70 max-w-lg leading-[1.8] font-bold tracking-[0.25em] uppercase">
                  DECENTRALIZED INFRASTRUCTURE FOR GLOBAL ATMOSPHERIC<br />INTEGRITY.
                </p>

                <div className="flex gap-4">
                  {/* Stat Box 1: Nodes Live */}
                  <div className="flex flex-col items-center justify-center px-10 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg border-t-2 border-t-[#4ade80] min-w-[140px]">
                    <span className="text-[8px] text-white/40 font-bold tracking-[0.2em] uppercase mb-1">NODES LIVE</span>
                    <div className="flex items-center gap-2">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse" />
                      <span className="text-xl font-black text-[#4ade80] tabular-nums tracking-tighter">
                        {stats.activeSensors || '97'}
                      </span>
                    </div>
                  </div>

                  {/* Stat Box 2: Integrity */}
                  <div className="flex flex-col items-center justify-center px-10 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg border-t-2 border-t-[#4ade80] min-w-[140px]">
                    <span className="text-[8px] text-white/40 font-bold tracking-[0.2em] uppercase mb-1">INTEGRITY</span>
                    <span className="text-xl font-black text-[#4ade80] uppercase tracking-tighter">
                      STABLE ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Narrative Content - Grid Style (Dynamically Stretches Downward) ── */}
            {/* flex-1 on this container forces it to absorb all the empty vertical space */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 flex-1 min-h-0">

              {/* Left Column: Problem / Solution */}
              <div className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col gap-6 h-full">

                {/* Problem Card */}
                {/* flex-1 here forces the card to stretch and fill half the vertical space */}
                <div className="flex flex-col p-6 lg:p-8 rounded-lg bg-black/30 border border-white/5 flex-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">01. THE PROBLEM</h3>
                  <div className="w-full h-[1px] bg-white/5 mb-4" />
                  <p className="text-xs text-white/50 leading-relaxed font-medium">
                    Modern air quality data is fragmented, centralized, and prone to administrative manipulation. Cities often position sensors in optimal zones, hiding the true atmospheric cost.
                  </p>
                </div>

                {/* Solution Card */}
                {/* flex-1 here forces the card to stretch and fill the remaining half */}
                <div className="flex flex-col p-6 lg:p-8 rounded-lg bg-black/30 border border-white/5 flex-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#4ade80] mb-3">02. THE SOLUTION</h3>
                  <div className="w-full h-[1px] bg-white/5 mb-4" />
                  <p className="text-xs text-white/50 leading-relaxed font-medium">
                    DePIN-Air decentralizes the stack. Using citizen-operated hardware nodes and blockchain, we create a high-fidelity environmental ledger that is cryptographically immutable.
                  </p>
                </div>

              </div>

              {/* Right Column: Protocol Economics */}
              <div className="col-span-12 md:col-span-7 lg:col-span-8 h-full">
                {/* h-full forces the card to match the total stretched height of the grid */}
                <div className="relative overflow-hidden p-8 lg:p-10 h-full rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex flex-col justify-between">

                  {/* Decorative Background Graphic */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 lg:w-72 lg:h-72 text-[#4ade80]/15 pointer-events-none">
                    <IsometricCube className="w-full h-full" />
                  </div>

                  <div className="relative z-10 w-full md:w-[70%] lg:w-[60%]">
                    <h3 className="text-[#4ade80] font-black text-2xl uppercase tracking-tighter mb-4 drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                      PROTOCOL ECONOMICS
                    </h3>
                    <p className="text-[11px] text-white/60 leading-relaxed mb-8 font-medium">
                      AIRQ tokens incentivize node operators to maintain uptime. Every sensor reading is a cryptographic proof of atmosphere, minted onto the Polygon network. Enterprise demand for these reports drives a sustainable deflationary burn mechanism.
                    </p>
                  </div>

                  {/* Bottom Stats (Pushed to the very bottom of this tall card) */}
                  <div className="relative z-10 flex gap-12 lg:gap-24 pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/40 font-bold tracking-[0.2em] mb-1 uppercase">BLOCK FINALITY</span>
                      <span className="text-2xl lg:text-3xl font-black text-white tracking-tighter uppercase">
                        INSTANT SETTLEMENT
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/40 font-bold tracking-[0.2em] mb-1 uppercase">EMISSION RATE</span>
                      <span className="text-2xl lg:text-3xl font-black text-[#4ade80] tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                        1.0 AIRQ/BATCH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Beneficiaries Area ── */}
            {/* Since the grid above stretches dynamically, this section gets pushed neatly to the bottom */}
            <div className="w-full pt-8 shrink-0">
              <div className="flex flex-wrap justify-center items-center gap-x-12 md:gap-x-20 opacity-40 hover:opacity-100 transition-opacity duration-500">
                <span className="text-lg lg:text-xl font-black uppercase tracking-tighter text-white">GOOGLE INDIA</span>
                <span className="text-lg lg:text-xl font-black uppercase tracking-tighter text-white">TATA STEEL</span>
                <span className="text-lg lg:text-xl font-black uppercase tracking-tighter text-white">MICROSOFT</span>
                <span className="text-lg lg:text-xl font-black uppercase tracking-tighter text-white">RELIANCE</span>
                <span className="text-lg lg:text-xl font-black uppercase tracking-tighter text-white">AMAZON</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}