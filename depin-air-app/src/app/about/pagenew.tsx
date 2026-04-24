'use client';

import React from 'react';
import StatsBar from '@/components/dashboard/StatsBar';

export default function AboutPage() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden font-inter">
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_bottom_left,_var(--accent-purple-dim),_transparent_40%)]">
        <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-16">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end border-b border-white/5 pb-16">
            <div className="md:col-span-8 flex flex-col gap-6">
              <span className="text-[10px] font-black text-accent-cyan tracking-[0.25em] uppercase">Project Genesis v2.0</span>
              <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter uppercase leading-[0.85]">
                Decentralized <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-green to-accent-purple">Atmosphere</span> <br />
                Finality
              </h1>
            </div>
            <div className="md:col-span-4 flex flex-col gap-4">
              <span className="text-[10px] font-black text-accent-green tracking-[0.25em] uppercase">SYSTEM MANIFESTO</span>
              <p className="text-base text-text-secondary leading-relaxed font-medium">
                DePIN-Air is a sovereign physical infrastructure network engineered to solve the global transparency crisis in environmental telemetry.
              </p>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            {/* Left Content (8 columns) */}
            <div className="md:col-span-8 flex flex-col gap-16">
              <section className="flex flex-col gap-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-accent-green opacity-20">01</span>
                  <h2 className="text-[10px] font-black text-text-muted tracking-[0.25em] uppercase">Mission Objective</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-l border-white/10 pl-10">
                  <p className="text-sm text-text-secondary leading-relaxed font-medium uppercase tracking-[0.05em]">
                    Environmental data is a fundamental human right. Legacy monitoring systems are centralized, vertically siloed, and susceptible to geopolitical filtering. DePIN-Air bypasses these gatekeepers by incentivizing the deployment of high-precision sensor arrays directly into the community.
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium uppercase tracking-[0.05em]">
                    By anchoring every measurement on the Polygon POS blockchain, we establish a permanent, immutable record that functions as the source of truth for global environmental stewardship. Total transparency is the only viable path to climate accountability.
                  </p>
                </div>
              </section>

              <section className="flex flex-col gap-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-accent-purple opacity-20">02</span>
                  <h2 className="text-[10px] font-black text-text-muted tracking-[0.25em] uppercase">Technical Consensus</h2>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-3xl p-12 rounded-md border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent-green/5 rounded-full blur-3xl -mr-24 -mt-24" />
                  <p className="text-2xl font-black text-text-primary mb-10 tracking-tight leading-tight uppercase">
                    "The network achieves finality through hardware-bound cryptographic batches, ensuring data integrity without centralized intervention."
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <TechItem label="Infrastructure" value="Polygon" />
                    <TechItem label="Consensus" value="30s Batch" />
                    <TechItem label="Nodes" value="100+ Global" />
                    <TechItem label="Asset" value="AIRQ" />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Rail (4 columns) */}
            <div className="md:col-span-4 flex flex-col gap-10">
              <div className="bg-white/[0.02] p-10 rounded-md border border-white/5 flex flex-col gap-8 shadow-xl backdrop-blur-xl">
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.25em]">Network Architecture</h3>
                <div className="flex flex-col gap-4">
                  <SpecItem label="Sensor Grid" value="SPS30-ALPHA" />
                  <SpecItem label="Ledger v2" value="Polygon_Amoy" />
                  <SpecItem label="Payload" value="Protobuf/JSON" />
                  <SpecItem label="Verification" value="On-Chain_Audit" />
                </div>
              </div>

              <div className="p-10 rounded-md bg-accent-green/5 border border-accent-green/20 flex flex-col gap-6 backdrop-blur-md">
                <h3 className="text-[10px] font-black text-accent-green uppercase tracking-[0.25em]">Protocol Governance</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-black uppercase tracking-widest opacity-80">
                  Global expansion and calibration standards are governed by the AIRQ DAO. All infrastructure upgrades are proposed, debated, and anchored on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="w-full py-20 flex justify-center border-t border-white/5">
            <span className="text-[9px] font-black text-text-muted tracking-[0.4em] uppercase opacity-40 text-center px-6">DECENTRALIZED · PERMEABLE · INTEGRATED · NETWORK</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{label}</span>
      <span className="text-base font-black text-text-primary uppercase tracking-widest whitespace-nowrap">{value}</span>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-4 gap-4">
      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">{label}</span>
      <span className="text-[10px] font-mono text-accent-green font-black uppercase whitespace-nowrap">{value}</span>
    </div>
  );
}
