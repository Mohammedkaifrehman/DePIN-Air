'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateCityReport, generateNationalAudit } from '@/lib/pdf';

const COMPANIES = [
  { name: 'Google India', id: 'goog', city: 'Hyderabad' },
  { name: 'Microsoft', id: 'msft', city: 'Bengaluru' },
  { name: 'Reliance Industries', id: 'ril', city: 'Mumbai' },
  { name: 'Tata Steel', id: 'tata', city: 'Delhi' },
  { name: 'Amazon India', id: 'amzn', city: 'Chennai' },
];

function ESGPortalContent() {
  const { stats, connected, readings, burnAirq } = useWebSocket();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [isBurning, setIsBurning] = useState(false);
  const [burnHistory, setBurnHistory] = useState<{ id: string; date: string; type: string; amount: number; tx: string; companyName: string; city: string }[]>([]);

  // Internal state for demo balance if context is low, or just use context
  const displayBalance = stats.airqBalance;

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('depin_burn_history_final');
    if (saved) {
      try {
        setBurnHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse burn history', e);
      }
    }
  }, []);

  const saveHistory = (newHistory: typeof burnHistory) => {
    localStorage.setItem('depin_burn_history_final', JSON.stringify(newHistory));
    setBurnHistory(newHistory);
  };



  const handleBurn = async (type: 'City' | 'National', cost: number) => {
    if (stats.airqBalance < cost) {
      alert(`Insufficient balance! Need ${cost} AIRQ.`);
      return;
    }
    setIsBurning(true);
    await new Promise(r => setTimeout(r, 1500));
    const reportHash = '0x' + Math.random().toString(16).substring(2, 66);
    const txHash = '0x' + Math.random().toString(16).substring(2, 66);
    
    const newEntry = { 
      id: Math.random().toString(36).substring(7), 
      date: new Date().toLocaleString(), 
      type, 
      amount: cost, 
      tx: txHash.substring(0, 18) + '...', 
      companyName: selectedCompany.name, 
      city: selectedCompany.city,
      reportHash,
      blockNumber: 56789123
    };
    saveHistory([newEntry, ...burnHistory]);
    setIsBurning(false);

    const pdfParams = {
      company: selectedCompany.name,
      city: selectedCompany.city,
      airqBurned: cost,
      reportHash,
      txHash,
      blockNumber: 56789123,
      contractAddress: process.env.NEXT_PUBLIC_PORTAL_ADDRESS || "",
      isSimulated: true
    };

    if (type === 'City') {
      generateCityReport(pdfParams);
    } else {
      generateNationalAudit(pdfParams);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-10 py-12">
      <div className="flex flex-col gap-12">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10">
          <div className="flex flex-col gap-3">

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
              <span className="text-gradient bg-gradient-to-r from-accent-purple to-accent-green">
                ESG Corporate Portal
              </span>
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-xl leading-relaxed font-medium">
              Burn AIRQ tokens to extract high-fidelity environmental telemetry. 
              Our reports are cryptographically linked to sensor clusters for 
              sovereign auditing compliance.
            </p>
          </div>

          {/* Balance Card */}
          <div className="relative w-full lg:w-[550px] bg-white/[0.02] backdrop-blur-xl border border-white/5 p-12 rounded-md overflow-hidden shadow-2xl group glow-box-purple">
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 blur-3xl -mr-32 -mt-32 group-hover:bg-accent-purple/20 transition-all pointer-events-none" />
            
            <span className="text-[12px] font-bold tracking-widest text-text-muted uppercase mb-6 block">VAULT BALANCE</span>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-text-primary">{Math.floor(displayBalance).toLocaleString()}</span>
              <span className="text-base font-bold text-accent-green uppercase tracking-widest">AIRQ</span>
            </div>
            
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-md border border-white/5">
              <span className="text-[12px] text-accent-purple font-bold uppercase tracking-widest">Network Authority A+</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-accent-green animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Selection + Reports */}
        <div className="grid grid-cols-12 gap-10 items-start">
          {/* Left Sidebar (Corporation Selector) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 -mt-20 relative z-10">
            <h3 className="text-[12px] font-bold tracking-[0.2em] text-text-muted uppercase px-2">Select Entity</h3>
            <div className="flex flex-col gap-3">
              {COMPANIES.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompany(comp)}
                  className={`w-full text-left px-8 py-6 rounded-md transition-all border-2 text-lg font-black uppercase tracking-tight ${
                    selectedCompany.id === comp.id
                      ? 'bg-accent-purple/10 border-accent-purple text-white shadow-[0_0_40px_rgba(176,38,255,0.2)]'
                      : 'bg-white/[0.01] border-white/5 text-text-muted hover:bg-white/[0.05]'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Area (Reports + Transactions) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-12">
            {/* Reports Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ReportCard
                type="City Report"
                description="Comprehensive metropolitan telemetry including local PM2.5 trends and node-specific batch logs."
                cost={50}
                onBurn={() => handleBurn('City', 50)}
                isBurning={isBurning}
              />
              <ReportCard
                type="National Audit"
                description="Aggregated sovereign audit covering all operational monitoring zones with proof-of-atmosphere links."
                cost={200}
                onBurn={() => handleBurn('National', 200)}
                isBurning={isBurning}
              />
            </div>

            {/* Transaction History Table */}
            <div className="w-full">
              <h3 className="text-[10px] font-bold tracking-widest text-text-muted uppercase mb-6 px-2">AUDIT LOG HISTORY</h3>
              <div className="bg-white/[0.01] backdrop-blur-xl border border-white/5 rounded-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/[0.03] text-[10px] text-text-muted font-bold uppercase tracking-widest border-b border-white/5 whitespace-nowrap">
                        <th className="py-6 px-8">TIMESTAMP</th>
                        <th className="py-6 px-8">ASSET CATEGORY</th>
                        <th className="py-6 px-8">PROTOCOL BURN</th>
                        <th className="py-6 px-8">HOLDER REFERENCE</th>
                        <th className="py-6 px-8 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {burnHistory.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-5 px-8 text-[11px] text-text-secondary font-medium tabular-nums uppercase">{item.date}</td>
                          <td className="py-5 px-8 text-sm font-bold text-text-primary uppercase tracking-tight">{item.type} AUDIT</td>
                          <td className="py-5 px-8 text-sm font-bold text-accent-red tabular-nums tracking-tight">-{item.amount}.00</td>
                          <td className="py-5 px-8 text-[11px] text-text-muted tabular-nums group-hover:text-text-primary transition-colors">
                            {item.tx} 
                          </td>
                          <td className="py-5 px-8 text-right">
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="text-[10px] uppercase tracking-widest font-bold" 
                               onClick={() => {
                                 const pdfParams = {
                                   company: item.companyName || 'Unknown Entity',
                                   city: item.city,
                                   airqBurned: item.amount,
                                   reportHash: (item as any).reportHash || '0x' + Math.random().toString(16).substring(2, 66),
                                   txHash: (item as any).txHash || '0x' + Math.random().toString(16).substring(2, 66),
                                   blockNumber: (item as any).blockNumber || 56789123,
                                   contractAddress: process.env.NEXT_PUBLIC_PORTAL_ADDRESS || "",
                                   isSimulated: true
                                 };
                                 if (item.type === 'City') generateCityReport(pdfParams);
                                 else generateNationalAudit(pdfParams);
                               }}
                             >
                               EXTRACT PDF ↗
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-accent-amber/5 border-t border-accent-amber/10 flex items-center gap-3">
                  <span className="text-accent-amber text-sm font-bold animate-pulse">!</span>
                  <p className="text-[10px] text-accent-amber/80 font-bold uppercase tracking-widest">
                    System Status: Legacy Simulation active. Polygon Mainnet settlement requires RPC production keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ type, description, cost, onBurn, isBurning }: { type: string; description: string; cost: number; onBurn: () => void; isBurning: boolean }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 flex flex-col rounded-md overflow-hidden group hover:border-accent-purple/30 transition-all shadow-2xl h-full">
      <div className="p-8 flex-1">
        <div className="flex justify-between items-center mb-8">
           <Badge variant="premium">Verified Audit</Badge>
          <div className="text-2xl font-black text-text-primary flex items-baseline gap-2">
            <span className="tracking-tighter tabular-nums">{cost}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">AIRQ</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-text-primary mb-4 leading-none uppercase tracking-tight">{type}</h2>
        <p className="text-xs text-text-secondary leading-relaxed font-medium uppercase tracking-widest opacity-80 max-w-[300px]">
          {description}
        </p>
      </div>

      <button
        onClick={onBurn}
        disabled={isBurning}
        className="w-full py-6 text-[10px] font-bold tracking-widest text-bg-primary bg-accent-green hover:brightness-125 transition-all uppercase disabled:opacity-50"
      >
        {isBurning ? "PROCESSING..." : "BURN & UNLOCK REPORT"}
      </button>
    </div>
  );
}

import DashboardBackground from '@/components/layout/DashboardBackground';

export default function ESGPortalPage() {
  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <DashboardBackground />
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto">
        <ESGPortalContent />
      </main>
    </div>
  );
}
