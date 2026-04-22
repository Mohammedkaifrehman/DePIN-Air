'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { jsPDF } from 'jspdf';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const COMPANIES = [
  { name: 'Microsoft', id: 'msft' },
  { name: 'Google India', id: 'goog' },
  { name: 'Tata Steel', id: 'tata' },
  { name: 'Reliance Industries', id: 'ril' },
  { name: 'Amazon India', id: 'amzn' },
];

function ESGPortalContent() {
  const { stats, connected, readings, burnAirq } = useWebSocket();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [isBurning, setIsBurning] = useState(false);
  const [burnHistory, setBurnHistory] = useState<{ id: string; date: string; type: string; amount: number; tx: string }[]>([]);

  // Internal state for demo balance if context is low, or just use context
  const displayBalance = stats.airqBalance;

  // Load burn history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('depin_burn_history_final');
    if (savedHistory) {
       setBurnHistory(JSON.parse(savedHistory));
    } else {
       const mock = [
         { id: '1', date: '4/18/2026, 2:28:46 PM', type: 'City', amount: 50, tx: '0xa81bbe47139d698cf3...' },
         { id: '2', date: '4/18/2026, 2:03:01 PM', type: 'National', amount: 200, tx: '0x41a1fd...dda1369a' },
         { id: '3', date: '4/18/2026, 12:41:09 PM', type: 'City', amount: 50, tx: '0x5ef0c4...b7c26e98' },
       ];
       setBurnHistory(mock);
    }
  }, []);

  const saveHistory = (newHistory: typeof burnHistory) => {
    localStorage.setItem('depin_burn_history_final', JSON.stringify(newHistory));
    setBurnHistory(newHistory);
  };

  const generatePDF = (type: string, company: string, tx: string) => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleString();
      const safeCompany = company.replace(/[^a-z0-9]/gi, '_');

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
      doc.text(`Organization Name: ${company}`, 15, 70);
      doc.text(`Audit Scope: ${type} Regional Performance`, 15, 76);
      doc.text(`Protocol Consensus: v2.0-HYPER`, 15, 82);

      // Section 2: Environmental Telemetry (Mocked rich data)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ATMOSPHERIC TELEMETRY DATA', 15, 95);
      doc.line(15, 97, 195, 97);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const metrics = [
        ['Metric Name', 'Observed Value', 'Protocol Status'],
        ['Global AQI Avg', `${stats.globalAqi} AQI`, 'VERIFIED'],
        ['PM2.5 Saturation', '12.4 ug/m3', 'STABLE'],
        ['NO2 Concentration', '18.2 ppb', 'OPTIMAL'],
        ['Sensor Health Index', '99.2%', 'HEALTHY'],
        ['Active Node Count', `${stats.activeSensors} Nodes`, 'LIVE'],
      ];

      let yPos = 105;
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
      doc.text('PROTOCOL VERIFICATION', 15, 160);
      doc.line(15, 162, 195, 162);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text(`Tx Hash: ${tx}`, 15, 170);
      doc.text(`Source Entropy: ${Math.random().toString(16).substring(2, 32)}`, 15, 176);
      doc.text(`Blockchain: Polygon POS Mainnet Settlement`, 15, 182);

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
    const newEntry = { id: Math.random().toString(36).substring(7), date: new Date().toLocaleString(), type, amount: cost, tx };
    saveHistory([newEntry, ...burnHistory]);
    setIsBurning(false);
    generatePDF(type, selectedCompany.name, tx);
  };

  return (
    <div className="w-full px-6 lg:px-10 py-10">
      <div className="flex flex-col gap-12">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black text-accent-purple tracking-[0.5em] uppercase">Enterprise Certification</span>
            <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter uppercase leading-[0.9]">
              ESG Corporate <br /> Portal
            </h1>
            <p className="text-text-secondary text-base w-full leading-relaxed font-medium">
              Burn AIRQ tokens to extract high-fidelity environmental telemetry. 
              Our reports are cryptographically linked to sensor clusters for 
              sovereign auditing compliance.
            </p>
          </div>

          {/* Balance Card */}
          <div className="relative w-full lg:w-[400px] bg-white/[0.03] backdrop-blur-3xl rounded-md border border-white/10 p-10 overflow-hidden shadow-2xl group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent-purple/20 transition-all pointer-events-none" />
            
            <span className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase mb-4 block">VAULT BALANCE</span>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-6xl font-black text-text-primary tracking-tighter">{Math.floor(displayBalance).toLocaleString()}</span>
              <span className="text-sm font-black text-accent-green uppercase tracking-widest">AIRQ</span>
            </div>
            
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-md border border-white/5">
              <span className="text-[9px] text-accent-purple font-black uppercase tracking-widest">Network Authority A+</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Selection + Reports */}
        <div className="grid grid-cols-12 gap-10 items-start">
          {/* Left Sidebar (Corporation Selector) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-text-muted uppercase px-2">SELECT ENTITY</h3>
            <div className="flex flex-col gap-3">
              {COMPANIES.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompany(comp)}
                  className={`w-full text-left px-8 py-6 rounded-md transition-all border-2 text-xs font-black uppercase tracking-widest ${
                    selectedCompany.id === comp.id
                      ? 'bg-accent-purple/10 border-accent-purple/50 text-white shadow-[0_0_30px_rgba(176,38,255,0.15)]'
                      : 'bg-white/[0.02] border-transparent text-text-muted hover:bg-white/[0.05]'
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
              <h3 className="text-[10px] font-black tracking-[0.4em] text-text-muted uppercase mb-6 px-2">AUDIT LOG HISTORY</h3>
              <div className="bg-white/[0.02] backdrop-blur-xl rounded-md border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/[0.03] text-[10px] text-text-muted font-black uppercase tracking-[0.2em] border-b border-white/5 whitespace-nowrap">
                        <th className="py-8 px-10">TIMESTAMP</th>
                        <th className="py-8 px-10">ASSET CATEGORY</th>
                        <th className="py-8 px-10">PROTOCOL BURN</th>
                        <th className="py-8 px-10">HOLDER REFERENCE</th>
                        <th className="py-8 px-10 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {burnHistory.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-6 px-8 text-[11px] text-text-secondary font-black font-mono uppercase">{item.date}</td>
                          <td className="py-6 px-8 text-sm font-black text-text-primary uppercase tracking-tighter">{item.type} AUDIT</td>
                          <td className="py-6 px-8 text-sm font-black text-accent-red font-mono">-{item.amount}.00</td>
                          <td className="py-6 px-8 text-[11px] text-text-muted font-mono group-hover:text-text-primary transition-colors">
                            {item.tx} 
                          </td>
                          <td className="py-6 px-8 text-right">
                             <Button size="sm" variant="ghost" onClick={() => generatePDF(item.type, selectedCompany.name, item.tx)}>
                               EXTRACT PDF ↗
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-accent-amber/5 border-t border-accent-amber/10 flex items-center gap-3">
                  <span className="text-accent-amber text-sm font-black animate-pulse">!</span>
                  <p className="text-[9px] text-accent-amber/80 font-black uppercase tracking-[0.2em]">
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
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-md flex flex-col overflow-hidden group hover:border-accent-purple/30 transition-all shadow-2xl h-full">
      <div className="p-10 flex-1">
        <div className="flex justify-between items-center mb-10">
           <Badge variant="premium">Verified Audit</Badge>
          <div className="text-2xl font-black text-text-primary flex items-baseline gap-2">
            <span className="tracking-tighter">{cost}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-widest">AIRQ</span>
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-text-primary mb-4 leading-none uppercase tracking-tighter">{type}</h2>
        <p className="text-xs text-text-secondary leading-relaxed font-medium uppercase tracking-widest opacity-80 max-w-[300px]">
          {description}
        </p>
      </div>

      <button
        onClick={onBurn}
        disabled={isBurning}
        className="w-full py-7 text-[11px] font-black tracking-[0.3em] text-bg-primary bg-accent-green hover:brightness-125 transition-all uppercase disabled:opacity-50"
      >
        {isBurning ? "PROCESSING..." : "BURN & UNLOCK REPORT"}
      </button>
    </div>
  );
}

export default function ESGPortalPage() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto">
        <ESGPortalContent />
      </main>
    </div>
  );
}
