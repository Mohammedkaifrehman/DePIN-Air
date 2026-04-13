'use client';

import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

import { getCityColor } from '@/utils/colors';

export default function AlertLog() {
  const { allAnomalies } = useWebSocket();
  const alerts = allAnomalies.slice(0, 10);

  return (
    <Card 
      className="absolute top-4 left-4 z-[500] w-72 backdrop-blur-md bg-bg-secondary/90 flex flex-col hidden sm:flex"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      <CardHeader className="py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔔</span>
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Alert Log
          </span>
        </div>
        <Badge variant={alerts.length > 0 ? 'danger' : 'default'} className="ml-auto">
          {allAnomalies.length}
        </Badge>
      </CardHeader>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-[10px] text-text-muted italic">
            Monitoring for anomalies...
          </div>
        ) : (
          <div className="divide-y divide-border-primary/50">
            {alerts.map((alert, i) => {
              const time = new Date(alert.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const badgeColor = getCityColor(alert.city);

              return (
                <div
                  key={`${alert.sensorId}-${alert.timestamp}-${i}`}
                  className="p-3 transition-colors hover:bg-white/5 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-red shadow-[0_0_8px_var(--accent-red)] group-hover:scale-125 transition-transform" />
                      <Badge 
                        variant="default" 
                        style={{ background: `${badgeColor}15`, color: badgeColor, borderColor: `${badgeColor}30` }}
                      >
                        {alert.city}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-accent-red">
                      AQI {alert.aqi}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">
                      Sensor #{alert.sensorId}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {time}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-[9px] font-mono text-text-muted truncate opacity-50">
                    {alert.spikeHash.substring(0, 24)}...
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
