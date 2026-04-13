'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { getCityColor } from '@/utils/colors';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';

interface TxItem {
  id: number;
  batchHash: string;
  timestamp: number;
  seq: number;
  avgAqi: number;
  sensorCount: number;
  isSpike: boolean;
  cityBreakdown: { city: string; avgAqi: number; count: number }[];
}

export default function TxSidebar() {
  const { latestBatch, anomalies } = useWebSocket();
  const [transactions, setTransactions] = useState<TxItem[]>([]);

  useEffect(() => {
    if (!latestBatch) return;
    // Only add tx entry every 6th batch (30s minting cycle)
    if (latestBatch.seq % 6 !== 0) return;

    const cityMap = new Map<string, { sum: number; count: number }>();
    latestBatch.readings.forEach((r) => {
      const data = cityMap.get(r.city) || { sum: 0, count: 0 };
      data.sum += r.aqi;
      data.count += 1;
      cityMap.set(r.city, data);
    });

    const cityBreakdown = Array.from(cityMap.entries()).map(([city, data]) => ({
      city,
      avgAqi: Math.round(data.sum / data.count),
      count: data.count,
    }));

    const avgAqi = Math.round(
      latestBatch.readings.reduce((s, r) => s + r.aqi, 0) / latestBatch.readings.length
    );

    const hasSpike = anomalies.length > 0;

    const newTx: TxItem = {
      id: latestBatch.seq,
      batchHash: latestBatch.batchHash,
      timestamp: latestBatch.timestamp,
      seq: latestBatch.seq,
      avgAqi,
      sensorCount: latestBatch.activeSensors,
      isSpike: hasSpike,
      cityBreakdown,
    };

    setTransactions((prev) => [newTx, ...prev].slice(0, 20));
  }, [latestBatch, anomalies]);

  return (
    <Card 
      className="absolute top-4 right-4 z-[500] w-64 backdrop-blur-md bg-bg-secondary/90 flex flex-col hidden lg:flex"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      <CardHeader className="py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">⛓️</span>
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            On-Chain Mints
          </span>
        </div>
        <Badge variant="success" className="ml-auto">
          Live
        </Badge>
      </CardHeader>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-[10px] text-text-muted italic">
            Waiting for next block...
          </div>
        ) : (
          <div className="divide-y divide-border-primary/50">
            {transactions.map((tx) => {
              const time = new Date(tx.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={tx.id}
                  className="p-3 transition-colors hover:bg-white/5 fade-in"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-primary">
                        Batch #{tx.seq}
                      </span>
                      {tx.isSpike && (
                        <Badge variant="danger" className="scale-90 origin-left">
                          SPIKE
                        </Badge>
                      )}
                    </div>
                    <span className="text-[9px] text-text-muted">
                      {time}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {tx.cityBreakdown.map((c) => (
                      <Badge
                        key={c.city}
                        variant="default"
                        className="text-[8px] py-0 px-1"
                        style={{ background: `${getCityColor(c.city)}10`, color: getCityColor(c.city), borderColor: `${getCityColor(c.city)}20` }}
                      >
                        {c.city[0]}{c.avgAqi}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>{tx.sensorCount} Sensors</span>
                    <span>Avg {tx.avgAqi} AQI</span>
                  </div>

                  <div className="mt-1.5 text-[8px] font-mono text-text-muted truncate opacity-40">
                    {tx.batchHash}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
