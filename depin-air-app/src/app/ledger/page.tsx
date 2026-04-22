'use client';

import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { Badge } from '@/components/ui/Badge';

export default function LedgerPage() {
  const { stats } = useWebSocket();

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--accent-purple-dim),_transparent_40%)]">
        <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-10">
          {/* Header Section */}
          <div className="w-full flex justify-between items-end border-b border-white/5 pb-10">
            <div className="flex flex-col gap-4">
               <span className="text-[10px] font-black text-accent-cyan tracking-[0.5em] uppercase">Trustless History Hub</span>
              <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter uppercase leading-[0.85]">
                Protocol <br /> Ledger
              </h1>
              <p className="text-xs text-text-secondary font-black uppercase tracking-[0.3em] opacity-80">
                Immutable Batch Records · Cross-Verification · Polygon POS Mainnet
              </p>
            </div>
            <div className="flex gap-10">
              <LogStat label="Ingested Batches" value={stats.totalReadingsMinted.toLocaleString()} />
              <LogStat label="Global Avg Index" value={stats.globalAqi} />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="w-full border border-white/5 rounded-md bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] text-text-muted font-black uppercase tracking-[0.25em] border-b border-white/5 whitespace-nowrap">
                    <th className="px-12 py-10">BATCH IDENTIFIER</th>
                    <th className="px-12 py-10">CRYPTOGRAPHIC HASH_SUM</th>
                    <th className="px-12 py-10 text-center">BLOCK</th>
                    <th className="px-12 py-10 text-center">ACTIVE_NODES</th>
                    <th className="px-12 py-10 text-right">PROTOCOL STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {[...Array(15)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="px-10 py-8 font-mono text-base font-black text-accent-green tracking-tighter">
                        #{98842 - i}
                      </td>
                      <td className="px-10 py-8 font-mono text-[11px] text-text-secondary group-hover:text-text-primary transition-colors tracking-widest opacity-70">
                        0x{Math.random().toString(16).substring(2, 18).toUpperCase()}...{Math.random().toString(16).substring(2, 10).toUpperCase()}
                      </td>
                      <td className="px-10 py-8 text-center font-mono text-sm text-text-muted font-black">
                        7240{i}
                      </td>
                      <td className="px-10 py-8 text-center">
                         <Badge variant="info">
                           {Math.floor(Math.random() * 20) + 95} NODES
                         </Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <Badge variant="success">PROVEN ✓</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-10 bg-white/[0.01] text-center border-t border-white/5">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] cursor-pointer hover:text-accent-purple transition-all duration-300">
                DECODE HISTORICAL EPOCHS ↓
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LogStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em]">{label}</span>
      <span className="text-4xl font-black text-text-primary font-mono tracking-tighter leading-none">{value}</span>
    </div>
  );
}
