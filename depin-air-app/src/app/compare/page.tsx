'use client';

import React, { useMemo } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import DashboardBackground from '@/components/layout/DashboardBackground';

// Mock government data
const GOVT_DATA = [
  { city: 'Delhi', aqi: 155, pm25: 110, no2: 45, co2: 410 },
  { city: 'Mumbai', aqi: 98, pm25: 65, no2: 32, co2: 405 },
  { city: 'Bengaluru', aqi: 85, pm25: 58, no2: 24, co2: 402 },
  { city: 'Chennai', aqi: 92, pm25: 60, no2: 28, co2: 404 },
  { city: 'Hyderabad', aqi: 105, pm25: 72, no2: 35, co2: 408 },
];

function ComparisonContent() {
  const { readings, connected } = useWebSocket();

  // Calculate city averages from live data
  const cityAverages = useMemo(() => {
    const cityMap = new Map<string, { sum: number; count: number }>();
    readings.forEach((r) => {
      const data = cityMap.get(r.city) || { sum: 0, count: 0 };
      data.sum += r.aqi;
      data.count += 1;
      cityMap.set(r.city, data);
    });

    return Array.from(cityMap.entries()).map(([city, data]) => ({
      city,
      avgAqi: Math.round(data.sum / data.count),
    }));
  }, [readings]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-10 py-12 min-h-full">
      <div className="flex flex-col gap-12 w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[1]">
              <span className="text-gradient bg-gradient-to-r from-accent-purple to-accent-green">
                Network Accuracy Verification
              </span>
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed font-medium">
              Real-time synchronization audit comparing sovereign government data streams 
              against the decentralized DePIN-Air telemetry network. Powered by on-chain batch verification.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-6 py-6 border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center min-w-[160px] shadow-2xl rounded-md">
              <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">NODE STATUS</span>
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green shadow-[0_0_10px_#00F5FF]' : 'bg-accent-red shadow-[0_0_10px_#FF3D00]'} animate-pulse`} />
                <span className="text-lg font-bold text-text-primary uppercase tracking-tight">{connected ? 'STABLE' : 'DROPPED'}</span>
              </div>
            </div>
            <div className="px-6 py-6 border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col items-center min-w-[160px] shadow-2xl rounded-md">
              <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">INTEGRITY</span>
              <span className="text-lg font-bold text-accent-green uppercase tracking-tight">VERIFIED✓</span>
            </div>
          </div>
        </div>

        {/* Comparison Table Section */}
        <div className="w-full">
          <div className="border border-white/5 bg-white/[0.01] backdrop-blur-xl overflow-hidden shadow-2xl rounded-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] text-text-muted font-bold uppercase tracking-widest border-b border-white/5 whitespace-nowrap">
                    <th className="px-8 py-6">REGION AUTHORITY</th>
                    <th className="px-8 py-6">GOVERNMENT INDEX</th>
                    <th className="px-8 py-6 text-center">DePIN-AIR LIVE</th>
                    <th className="px-8 py-6 text-right">VARIANT DELTA</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {GOVT_DATA.map((govt) => {
                    const live = cityAverages.find((c) => c.city === govt.city);
                    const liveAqi = live?.avgAqi || 0;
                    const diff = Math.abs(govt.aqi - liveAqi);
                    const isSignificant = diff > 20;

                    return (
                      <tr 
                        key={govt.city} 
                        className={`transition-colors border-b border-white/5 group ${isSignificant ? 'bg-accent-amber/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        <td className="px-8 py-6 font-bold text-lg tracking-tight uppercase">{govt.city}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black tabular-nums text-text-secondary tracking-tight">{govt.aqi}</span>
                            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase opacity-60">CPCB_SN_632</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-black tabular-nums tracking-tighter" style={{ color: getAqiColor(liveAqi) }}>
                              {liveAqi || '--'}
                            </span>
                            <Badge variant="premium">LIVE_MINT_OK</Badge>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className={`text-2xl font-bold tabular-nums tracking-tight ${isSignificant ? 'text-accent-amber' : 'text-text-secondary'}`}>
                              {liveAqi ? (liveAqi > govt.aqi ? `+${diff}` : `-${diff}`) : '--'}
                            </div>
                            {isSignificant && (
                              <span className="text-[10px] px-3 py-1 rounded-md bg-accent-amber/10 text-accent-amber font-bold uppercase tracking-widest border border-accent-amber/30">
                                ! DISCREPANCY DETECTED
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col gap-12 w-full">
          <div className="p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl text-text-muted text-sm font-medium leading-relaxed w-full tracking-wide opacity-80 rounded-md">
            <strong className="text-accent-purple font-bold">LEGAL_DISCLAIMER:</strong> Protocol figures represent decentralized citizen-operated nodes. Discrepancies may arise from local sensor positioning or asynchronous polling intervals. This audit is for technical verification of data integrity and not for environmental health certification.
          </div>
          
          <div className="flex justify-center pb-20">
             <Button onClick={() => window.location.href = '/dashboard'} size="lg" className="px-12 py-8 text-base">
                RETURN TO NETWORK HUB
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return '#00F5FF';
  if (aqi <= 100) return '#FFD600';
  if (aqi <= 150) return '#FF8A00';
  if (aqi <= 200) return '#FF3D00';
  return '#B026FF';
}

export default function ComparePage() {
  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <DashboardBackground />
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto">
        <ComparisonContent />
       </main>
    </div>
  );
}

