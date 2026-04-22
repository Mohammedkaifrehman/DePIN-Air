'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { getCityColor } from '@/utils/colors';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { LEDGER_ADDRESS, LEDGER_ABI, isBlockchainConfigured } from '@/utils/web3-constants';

export default function TxSidebar() {
  const { mints } = useWebSocket();
  const transactions = mints;

  return (
    <div 
      className="absolute top-6 right-6 z-[1200] w-80 lg:w-96 backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-md flex flex-col hidden sm:flex shadow-2xl overflow-hidden"
      style={{ maxHeight: 'calc(100% - 120px)' }}
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse shadow-[0_0_8px_var(--accent-purple)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary">
            Network Ledger
          </span>
        </div>
        <Badge variant="premium">Live</Badge>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin opacity-40" />
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest animate-pulse">
              Syncing Chain...
            </span>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const time = new Date(tx.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              });

              return (
                <div
                  key={tx.id}
                  className="p-6 transition-all hover:bg-white/[0.05] group cursor-default"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-accent-green uppercase tracking-tighter">
                        BATCH #{tx.seq}
                      </span>
                      {tx.isSpike && (
                        <div className="bg-accent-red/20 text-accent-red text-[8px] font-black px-1.5 py-0.5 rounded border border-accent-red/30">
                          SPIKE
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-text-muted font-black opacity-60">
                      {time}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tx.cityBreakdown.map((c) => (
                      <div
                        key={c.city}
                        className="text-[9px] font-black uppercase px-2 py-1 rounded bg-white/5 border border-white/10 text-text-secondary"
                      >
                        <span className="text-accent-purple mr-1">{c.city[0]}</span>
                        {c.avgAqi}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">
                    <span className="group-hover:text-text-secondary transition-colors">{tx.sensorCount} Nodes</span>
                    <span className="group-hover:text-text-primary transition-colors">Avg {tx.avgAqi} AQI</span>
                  </div>

                  <div className="text-[8px] font-mono text-text-muted truncate opacity-30 group-hover:opacity-60 transition-opacity">
                    HSH: {tx.batchHash}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
         <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Protocol v2.0 Hyper</span>
      </div>
    </div>
  );
}
