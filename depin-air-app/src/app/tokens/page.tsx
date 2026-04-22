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
        data: [stats.airqBalance, stats.airqBurned],
        backgroundColor: ['rgba(0, 245, 255, 0.6)', 'rgba(255, 61, 0, 0.6)'],
        borderColor: ['#00F5FF', '#FF3D00'],
        hoverBackgroundColor: ['rgba(0, 245, 255, 0.8)', 'rgba(255, 61, 0, 0.8)'],
        borderWidth: 2,
        spacing: 12,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      }
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-10 py-12 min-h-full">
      <div className="flex flex-col gap-12">
        {/* Header Section */}
        <div className="w-full">

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
            <span className="text-gradient bg-gradient-to-r from-accent-purple to-accent-green">
              AIRQ Token Economy
            </span>
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-4xl leading-relaxed font-medium">
            AIRQ is the deflationary utility asset underpinning the DePIN-Air network. 
            Sensors extract value from atmosphere monitoring, while enterprise auditing 
            generates constant buy-side pressure through our protocol burn mechanism.
          </p>
        </div>

        {/* Main Grid: Chart + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Supply Chart - Left (5/12) */}
          <div className="col-span-12 md:col-span-5 p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl glow-box-cyan flex flex-col items-center justify-center relative overflow-hidden shadow-2xl rounded-md">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-purple/5 to-transparent pointer-events-none" />
            <h3 className="text-[10px] font-bold mb-10 uppercase tracking-widest text-text-muted">Supply Integrity</h3>
            <div className="w-full max-w-[320px] aspect-square relative z-10">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Total Supply</span>
                <span className="text-4xl font-black text-text-primary tabular-nums tracking-tighter">{Math.floor(stats.airqBalance + stats.airqBurned).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards - Right (7/12) */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <TokenStatCard 
                label="Circulating Supply" 
                value={stats.airqBalance} 
                color="var(--accent-green)" 
                suffix="AIRQ"
                description="Liquid tokens currently distributed across participant nodes."
              />
              <TokenStatCard 
                label="Deflationary Burn" 
                value={stats.airqBurned} 
                color="var(--accent-red)" 
                suffix="AIRQ"
                description="Tokens permantently removed via corporate auditing transactions."
              />
            </div>
            <div className="p-8 border border-accent-purple/20 bg-accent-purple/5 backdrop-blur-xl relative overflow-hidden rounded-md">
               <div className="absolute top-0 right-0 p-8 underline-offset-8">
                  <span className="text-4xl opacity-20">📈</span>
               </div>
              <h4 className="text-accent-purple font-bold text-sm mb-4 uppercase tracking-widest">Scarcity Propagation</h4>
              <p className="text-sm text-text-secondary leading-relaxed w-full font-medium">
                Our protocol enforces a strict 100% burn policy on all ESG report fees. As institutional demand for climate-verified data surges, the circulating supply of AIRQ contracts, ensuring network value scales with utility rather than speculation.
              </p>
            </div>
          </div>
        </div>

        {/* Economics Table - Full Width */}
        <div className="w-full p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl rounded-md">
          <h3 className="text-[10px] font-bold mb-10 uppercase tracking-widest text-text-muted">Network Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            <ParamItem label="Base Emission" value="1.00 AIRQ" sub="PER BATCH PER SENSOR" />
            <ParamItem label="Regional Report" value="50.00 AIRQ" sub="DYNAMIC BURN COST" />
            <ParamItem label="Audit Genesis" value="200.00 AIRQ" sub="INSTITUTIONAL FEE" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenStatCard({ label, value, color, suffix, description }: { label: string, value: number, color: string, suffix: string, description: string }) {
  return (
    <div className="p-8 border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl hover:bg-white/[0.05] transition-all group rounded-md">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 block group-hover:text-text-secondary">{label}</span>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-5xl font-black tabular-nums tracking-tighter text-text-primary" style={{ color }}>{value.toLocaleString()}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color }}>{suffix}</span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed font-medium uppercase tracking-widest opacity-80">{description}</p>
    </div>
  );
}

function ParamItem({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      <span className="text-3xl font-black tabular-nums text-text-primary tracking-tighter">{value}</span>
      <span className="text-[10px] text-accent-green font-bold uppercase tracking-widest">{sub}</span>
    </div>
  );
}

import DashboardBackground from '@/components/layout/DashboardBackground';

export default function TokensPage() {
  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <DashboardBackground />
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto">
        <TokensContent />
      </main>
    </div>
  );
}

