'use client';

import React, { useMemo } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function TokensContent() {
  const { stats } = useWebSocket();

  const chartData = {
    labels: ['Circulating', 'Burned'],
    datasets: [
      {
        data: [stats.totalReadingsMinted, stats.airqBurned + 1200], // +1200 for demo visual data
        backgroundColor: ['rgba(29, 158, 117, 0.8)', 'rgba(226, 75, 74, 0.8)'],
        borderColor: ['#1D9E75', '#E24B4A'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#8B949E',
          padding: 20,
          font: { size: 12, weight: 'bold' as any }
        }
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 text-text-primary">💎 AIRQ Token Economy</h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            AIRQ is the utility token powering DePIN-Air. Sensors earn AIRQ for every verified batch, while corporations must buy and burn AIRQ to unlock environmental data reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Supply Chart */}
          <div className="p-8 rounded-3xl bg-bg-secondary border border-border-primary flex flex-col items-center">
            <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-text-secondary">Supply Distribution</h3>
            <div className="w-full max-w-[300px] h-[300px] relative">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-text-muted">Total Minted</span>
                <span className="text-2xl font-black text-text-primary">{stats.totalReadingsMinted + stats.airqBurned + 1200}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col gap-6">
            <TokenStatCard 
              label="Circulating Supply" 
              value={stats.totalReadingsMinted} 
              color="var(--accent-green)" 
              suffix="AIRQ"
              description="Tokens available in operator wallets earned through data contribution."
            />
            <TokenStatCard 
              label="Cumulative Burn" 
              value={stats.airqBurned + 1200} 
              color="var(--accent-red)" 
              suffix="AIRQ"
              description="Tokens permanently removed from supply by ESG corporate report generation."
            />
            <div className="p-6 rounded-2xl bg-accent-green/10 border border-accent-green/20">
              <h4 className="text-accent-green font-black text-sm mb-2">NETWORK VALUE MECHANIC</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Sustainability standards require verifiable data. Every ESG report generated increases token scarcity through our 100% burn mechanism.
              </p>
            </div>
          </div>
        </div>

        {/* Economics Table */}
        <div className="p-8 rounded-3xl bg-bg-secondary border border-border-primary text-text-primary">
          <h3 className="text-sm font-bold mb-8 uppercase tracking-widest text-text-secondary">Economic Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <ParamItem label="Earning Rate" value="1 AIRQ" sub="/ batch / sensor" />
            <ParamItem label="City Report" value="50 AIRQ" sub="Burn requirement" />
            <ParamItem label="National Audit" value="200 AIRQ" sub="Burn requirement" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenStatCard({ label, value, color, suffix, description }: { label: string, value: number, color: string, suffix: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 block">{label}</span>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-black font-mono text-text-primary" style={{ color }}>{value.toLocaleString()}</span>
        <span className="text-xs font-bold" style={{ color }}>{suffix}</span>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function ParamItem({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{label}</span>
      <span className="text-xl font-black text-text-primary">{value}</span>
      <span className="text-[10px] text-text-secondary">{sub}</span>
    </div>
  );
}

export default function TokensPage() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen flex flex-col bg-bg-primary overflow-hidden">
        <StatsBar />
        <main className="flex-1 overflow-auto mt-[var(--stats-bar-height)]">
          <TokensContent />
        </main>
      </div>
    </WebSocketProvider>
  );
}

