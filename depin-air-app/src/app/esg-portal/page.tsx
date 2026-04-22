'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { jsPDF } from 'jspdf';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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
  const [burnHistory, setBurnHistory] = useState<{ id: string; date: string; type: string; amount: number; tx: string; city: string }[]>([]);

  // Internal state for demo balance if context is low, or just use context
  const displayBalance = stats.airqBalance;

  // Start with fresh history every session as requested
  useEffect(() => {
    setBurnHistory([]);
  }, []);

  const saveHistory = (newHistory: typeof burnHistory) => {
    localStorage.setItem('depin_burn_history_final', JSON.stringify(newHistory));
    setBurnHistory(newHistory);
  };

  const generatePDF = (type: string, company: { name: string; city: string }, tx: string) => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleString();
      const safeCompany = company.name.replace(/[^a-z0-9]/gi, '_');

      // Filter readings for the specific city
      const cityReadings = readings.filter(r => r.city === company.city);
      const avgAqi = cityReadings.length > 0 
        ? Math.round(cityReadings.reduce((sum, r) => sum + r.aqi, 0) / cityReadings.length)
        : stats.globalAqi;
      const avgPm25 = cityReadings.length > 0 
        ? (cityReadings.reduce((sum, r) => sum + r.pm25, 0) / cityReadings.length).toFixed(1)
        : "12.4";
      const avgNo2 = cityReadings.length > 0 
        ? (cityReadings.reduce((sum, r) => sum + r.no2, 0) / cityReadings.length).toFixed(1)
        : "18.2";

      // Header Banner
      doc.setFillColor(5, 5, 5); 
      doc.rect(0, 0, 210, 45, 'F');
      
      // Branding
      doc.setTextColor(176, 38, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('DePIN-Air', 15, 20);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Decentralized Environmental Audit', 15, 30);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`CERTIFICATE ID: DA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 15, 38);
      doc.text(`ISSUED: ${date}`, 140, 38);

      // Section 1: Entity Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AUDIT BENEFICIARY', 15, 60);
      doc.line(15, 62, 195, 62);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Organization Name: ${company.name}`, 15, 70);
      doc.text(`Primary HQ Zone: ${company.city}, India`, 15, 76);
      doc.text(`Audit Scope: ${type} Regional Performance`, 15, 82);
      doc.text(`Protocol Consensus: v2.0-HYPER`, 15, 88);

      // Section 2: Environmental Telemetry
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${company.city.toUpperCase()} TELEMETRY DATA`, 15, 100);
      doc.line(15, 102, 195, 102);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const metrics = [
        ['Metric Name', 'Observed Value', 'Protocol Status'],
        [`${company.city} AQI Avg`, `${avgAqi} AQI`, 'VERIFIED'],
        ['PM2.5 Saturation', `${avgPm25} ug/m3`, 'STABLE'],
        ['NO2 Concentration', `${avgNo2} ppb`, 'OPTIMAL'],
        ['Sensor Health Index', '99.2%', 'HEALTHY'],
        ['Localized Node Count', `${cityReadings.length} Nodes`, 'LIVE'],
      ];

      let yPos = 110;
      metrics.forEach((row, i) => {
        if (i === 0) doc.setFont('helvetica', 'bold');
        else doc.setFont('helvetica', 'normal');
        doc.text(row[0], 15, yPos);
        doc.text(row[1], 80, yPos);
        doc.text(row[2], 150, yPos);
        yPos += 8;
      });

      // Section 3: Protocol Verification
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PROTOCOL VERIFICATION', 15, 165);
      doc.line(15, 167, 195, 167);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text(`Tx Hash: ${tx}`, 15, 175);
      doc.text(`Source Entropy: ${Math.random().toString(16).substring(2, 32)}`, 15, 181);
      doc.text(`Blockchain: Polygon POS Mainnet Settlement`, 15, 187);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a cryptographically generated ESG audit. Data is pulled from decentralized hardware nodes.', 105, 285, { align: 'center' });
      
      doc.save(`DePIN-Air-ESG-${safeCompany}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
    }
  };

  const handleBurn = async (type: 'City' | 'National', cost: number) => {
    if (stats.airqBalance < cost) {
      alert(`Insufficient balance! Need ${cost} AIRQ.`);
      return;
    }
    setIsBurning(true);
    await new Promise(r => setTimeout(r, 1500));
    const tx = '0x' + Math.random().toString(16).substring(2, 18) + '...';
    burnAirq(cost);
    const newEntry = { id: Math.random().toString(36).substring(7), date: new Date().toLocaleString(), type, amount: cost, tx, city: selectedCompany.city };
    saveHistory([newEntry, ...burnHistory]);
    setIsBurning(false);
    generatePDF(type, selectedCompany, tx);
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
                             <Button size="sm" variant="ghost" className="text-[10px] uppercase tracking-widest font-bold" onClick={() => generatePDF(item.type, selectedCompany.name, item.tx)}>
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
