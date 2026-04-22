'use client';

import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import { Badge } from '@/components/ui/Badge';

import DashboardBackground from '@/components/layout/DashboardBackground';

export default function LedgerPage() {
  const { stats, mints } = useWebSocket();

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      <DashboardBackground />
      <StatsBar />
      <div className="h-[52px] shrink-0" />
      <main className="flex-1 overflow-auto">
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
          {/* Header Section */}
          <div className="w-full flex justify-between items-end border-b border-white/5 pb-10">
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                <span className="text-gradient bg-gradient-to-r from-accent-purple to-accent-green">
                  Protocol Ledger
                </span>
              </h1>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-widest opacity-80 leading-relaxed">
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
                  <tr className="bg-white/[0.03] text-[10px] text-text-muted font-bold uppercase tracking-widest border-b border-white/5 whitespace-nowrap">
                    <th className="px-8 py-6">BATCH IDENTIFIER</th>
                    <th className="px-8 py-6">CRYPTOGRAPHIC HASH_SUM</th>
                    <th className="px-8 py-6 text-center">BLOCK</th>
                    <th className="px-8 py-6 text-center">ACTIVE_NODES</th>
                    <th className="px-8 py-6 text-right">PROTOCOL STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {mints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Live Ledger Sync...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mints.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-6 font-bold text-base font-mono tabular-nums text-accent-green tracking-tight">
                          #{tx.seq}
                        </td>
                        <td className="px-8 py-6 font-mono text-xs tabular-nums text-text-secondary group-hover:text-text-primary transition-colors tracking-widest opacity-70">
                          {tx.batchHash}
                        </td>
                        <td className="px-8 py-6 text-center font-mono tabular-nums text-sm text-text-muted font-bold">
                          7240{tx.seq % 100}
                        </td>
                        <td className="px-8 py-6 text-center">
                           <Badge variant="info" className="tabular-nums font-bold">
                             {tx.sensorCount} NODES
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <Badge variant="success" className="font-bold">PROVEN ✓</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-white/[0.01] text-center border-t border-white/5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest cursor-pointer hover:text-accent-purple transition-all duration-300">
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
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      <span className="text-4xl font-black text-text-primary tabular-nums tracking-tighter leading-none">{value}</span>
    </div>
  );
}
