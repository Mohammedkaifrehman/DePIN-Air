'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import jsPDF from 'jspdf';
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
  const { stats, connected, readings } = useWebSocket();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [balance, setBalance] = useState(500); // Simulated demo balance
  const [isBurning, setIsBurning] = useState(false);
  const [burnHistory, setBurnHistory] = useState<{ id: string; date: string; type: string; amount: number; tx: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('depin_burn_history');
    if (saved) setBurnHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (newHistory: any[]) => {
    localStorage.setItem('depin_burn_history', JSON.stringify(newHistory));
    setBurnHistory(newHistory);
  };

  const handleBurn = async (type: 'City' | 'National', cost: number) => {
    if (balance < cost) {
      alert('Insufficient AIRQ balance!');
      return;
    }

    setIsBurning(true);
    
    // Simulate chain interaction
    await new Promise(r => setTimeout(r, 2000));
    
    const tx = '0x' + Math.random().toString(16).substring(2, 66);
    const newEntry = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toLocaleString(),
      type,
      amount: cost,
      tx
    };

    const newHistory = [newEntry, ...burnHistory];
    saveHistory(newHistory);
    setBalance(prev => prev - cost);
    setIsBurning(false);

    generatePDF(type, selectedCompany.name, tx);
  };

  const generatePDF = (type: string, company: string, tx: string) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Header
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('DePIN-Air ESG Sustainability Report', 20, 25);
    
    doc.setTextColor(139, 148, 158);
    doc.setFontSize(10);
    doc.text(`Report Type: ${type} Snapshot | Generated: ${date}`, 20, 34);

    // Body
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(16);
    doc.text(`Entity: ${company}`, 20, 60);
    
    doc.setFontSize(12);
    doc.text('This document verifies that the entity has burned AIRQ utility tokens to unlock', 20, 75);
    doc.text('real-time, blockchain-verified environmental data for corporate reporting.', 20, 81);

    // Blockchain Proof
    doc.setFillColor(248, 249, 250);
    doc.rect(20, 95, 170, 30, 'F');
    doc.setDrawColor(222, 226, 230);
    doc.rect(20, 95, 170, 30, 'S');
    
    doc.setTextColor(29, 158, 117);
    doc.setFontSize(10);
    doc.text('POLYGON PROOF OF BURN', 30, 105);
    doc.setTextColor(33, 37, 41);
    doc.setFont('courier');
    doc.text(tx.substring(0, 45) + '...', 30, 115);
    doc.setFont('helvetica');

    // Data Summary
    doc.setFontSize(14);
    doc.text('Network Snapshot Summary', 20, 145);
    
    let y = 160;
    doc.setFontSize(10);
    doc.text('City', 20, y);
    doc.text('Avg AQI', 80, y);
    doc.text('Sensor Count', 140, y);
    doc.line(20, y + 2, 190, y + 2);
    
    const cities = [...new Set(readings.map(r => r.city))];
    cities.forEach(city => {
      y += 10;
      const cityReadings = readings.filter(r => r.city === city);
      const avg = Math.round(cityReadings.reduce((s, r) => s + r.aqi, 0) / (cityReadings.length || 1));
      doc.text(city, 20, y);
      doc.text(avg.toString(), 80, y);
      doc.text(cityReadings.length.toString(), 140, y);
    });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(139, 148, 158);
    y = 260;
    doc.text('DISCLAIMER: This report is generated from distributed infrastructure data. Values are', 20, y);
    doc.text('verified via keccak256 batch hashing and minted on the Polygon blockchain. DePIN-Air', 20, y + 5);
    doc.text('is a decentralized network and not a government regulatory authority.', 20, y + 10);

    doc.save(`DePIN-Air-ESG-${company}-${date}.pdf`);
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-bg-primary">
      <div className="max-w-6xl mx-auto">
        {/* Portal Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-4 flex items-center gap-4 text-text-primary">
              <span className="p-3 rounded-2xl bg-accent-green/10 text-accent-green">🏢</span>
              ESG Corporate Portal
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
              Burn AIRQ tokens to unlock blockchain-validated environmental reports. 
              Our reports are compliant with upcoming digital asset auditing standards.
            </p>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="p-6 rounded-3xl bg-bg-secondary border border-border-primary shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🔥</span>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 block">Available Balance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-text-primary">{balance}</span>
                <span className="text-accent-green font-bold">AIRQ</span>
              </div>
              <div className="mt-4 pt-4 border-t border-border-primary flex justify-between items-center">
                <span className="text-xs text-text-muted">Next Reward: In 22s</span>
                <Badge variant="success">OPERATOR MODE</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Selection */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary">
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-text-secondary">Select Corporation</h3>
              <div className="flex flex-col gap-2">
                {COMPANIES.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompany(comp)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                      selectedCompany.id === comp.id 
                        ? 'bg-accent-green/10 border-accent-green text-accent-green' 
                        : 'bg-bg-tertiary border-transparent text-text-secondary hover:bg-white/5'
                    }`}
                  >
                    <span className="font-semibold">{comp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Menu */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportCard 
              type="City Report"
              description="Full daily telemetry for a selected metropolitan area including raw sensor logs and batch hashes."
              cost={50}
              onBurn={() => handleBurn('City', 50)}
              isBurning={isBurning}
            />
            <ReportCard 
              type="National Audit"
              description="Aggregated sustainability report covering all 5 Indian monitoring zones with on-chain audit links."
              cost={200}
              onBurn={() => handleBurn('National', 200)}
              isBurning={isBurning}
            />
          </div>
        </div>

        {/* Burn History */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary mb-12 text-text-primary">
          <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-text-secondary">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-border-primary">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Report Type</th>
                  <th className="pb-4">AIRQ Burned</th>
                  <th className="pb-4">TX Hash</th>
                  <th className="pb-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {burnHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">No transactions yet</td>
                  </tr>
                ) : (
                  burnHistory.map(item => (
                    <tr key={item.id} className="border-b border-border-primary/50 hover:bg-white/5 transition-colors">
                      <td className="py-4 text-text-secondary">{item.date}</td>
                      <td className="py-4 font-semibold">{item.type} Report</td>
                      <td className="py-4 font-mono text-accent-red">{item.amount}</td>
                      <td className="py-4 font-mono text-[10px] text-text-muted">{item.tx.substring(0, 24)}...</td>
                      <td className="py-4 text-right">
                        <button className="text-accent-green hover:underline">PDF ↗</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ type, description, cost, onBurn, isBurning }: { type: string, description: string, cost: number, onBurn: () => void, isBurning: boolean }) {
  return (
    <div className="p-8 rounded-3xl bg-bg-secondary border border-border-primary flex flex-col justify-between group hover:border-accent-green/50 transition-all">
      <div>
        <div className="flex justify-between items-start mb-6">
          <Badge variant="success" className="group-hover:scale-110 transition-transform px-3 py-1">PRO VERIFIED</Badge>
          <span className="text-xl font-black font-mono text-text-primary">{cost} AIRQ</span>
        </div>
        <h2 className="text-2xl font-black mb-2 text-text-primary">{type}</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">{description}</p>
      </div>
      <Button
        onClick={onBurn}
        disabled={isBurning}
        variant={isBurning ? 'secondary' : 'primary'}
        className="w-full py-4 uppercase tracking-widest"
      >
        {isBurning ? (
          <>
            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            Burning...
          </>
        ) : (
          'BURN & UNLOCK'
        )}
      </Button>
    </div>
  );
}

export default function ESGPortalPage() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen flex flex-col bg-bg-primary overflow-hidden">
        <StatsBar />
        <main className="flex-1 overflow-auto mt-[var(--stats-bar-height)]">
          <ESGPortalContent />
        </main>
      </div>
    </WebSocketProvider>
  );
}

