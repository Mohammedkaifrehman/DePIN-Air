'use client';

import React, { useMemo } from 'react';
import { WebSocketProvider, useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import Link from 'next/link';

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
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-bg-primary">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3 text-text-primary">
              🏛 vs 🌐 Network Audit
            </h1>
            <p className="text-text-secondary text-sm max-w-lg">
              Comparing official government AQI figures against DePIN-Air live network readings city by city.
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-bg-secondary border border-border-primary flex flex-col items-center">
              <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Live Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`status-dot ${connected ? 'green' : 'red'}`} />
                <span className="text-xs font-bold text-text-primary">{connected ? 'CONNECTED' : 'OFFLINE'}</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-bg-secondary border border-border-primary flex flex-col items-center">
              <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Blockchain</span>
              <span className="text-xs font-bold text-accent-green">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary/50">
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">CPCB Official (Govt)</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">DePIN-Air Live</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Discrepancy</th>
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
                      className={`transition-colors border-t border-border-primary ${isSignificant ? 'bg-accent-amber/5' : 'hover:bg-white/5'}`}
                    >
                      <td className="px-6 py-6 font-bold text-lg">{govt.city}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xl font-mono text-text-secondary">{govt.aqi}</span>
                          <span className="text-[10px] text-text-muted">Source: CPCB API</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black font-mono" style={{ color: getAqiColor(liveAqi) }}>
                            {liveAqi || '--'}
                          </span>
                          <span className="text-[10px] text-accent-green font-semibold">RECORDS MINTED ✓</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className={`text-xl font-bold font-mono ${isSignificant ? 'text-accent-amber' : 'text-text-secondary'}`}>
                            {liveAqi ? (liveAqi > govt.aqi ? `+${diff}` : `-${diff}`) : '--'}
                          </div>
                          {isSignificant && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-amber/20 text-accent-amber font-black uppercase">
                              Significant Discrepancy 🔴
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

        {/* Footer Disclaimer */}
        <div className="mt-8 p-6 rounded-xl bg-bg-secondary border border-border-primary text-text-muted text-[11px] leading-relaxed">
          <strong>DISCLAIMER:</strong> Government figures are sourced from CPCB (Central Pollution Control Board) historical public snapshots for demonstration purposes. DePIN-Air figures represent a simulated citizen-owned sensor network. Discrepancies may arise from sensor calibration, positioning, or reporting lag. These figures are for demonstration of network audit capabilities and not to be used for health decisions or legal evidence.
        </div>
        
        <div className="flex justify-center mt-12 pb-12">
          <Link 
            href="/dashboard"
            className="px-8 py-4 rounded-xl font-black text-sm text-white no-underline shadow-2xl transition-all hover:scale-105 bg-gradient-to-br from-accent-green to-[#148a63]"
          >
            ← BACK TO LIVE MAP
          </Link>
        </div>
      </div>
    </div>
  );
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return 'var(--accent-green)';
  if (aqi <= 100) return 'var(--accent-amber)';
  if (aqi <= 150) return 'var(--accent-orange)';
  if (aqi <= 200) return 'var(--accent-red)';
  return 'var(--accent-purple)';
}

export default function ComparePage() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen flex flex-col bg-bg-primary overflow-hidden">
        <StatsBar />
        <main className="flex-1 overflow-auto mt-[var(--stats-bar-height)]">
          <ComparisonContent />
        </main>
      </div>
    </WebSocketProvider>
  );
}

