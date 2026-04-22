'use client';

import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Badge } from '@/components/ui/Badge';
import { getCityColor } from '@/utils/colors';

export default function AlertLog() {
  const { allAnomalies } = useWebSocket();
  const alerts = allAnomalies.slice(0, 15);

  return (
    <div 
      className="alert-log-container absolute top-6 left-6 z-[1200] w-64 lg:w-80 backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-md flex flex-col hidden sm:flex shadow-2xl overflow-hidden"
      style={{ maxHeight: 'calc(100% - 120px)' }}
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse shadow-[0_0_8px_var(--accent-red)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary">
            Anomaly Stream
          </span>
        </div>
        <div className="px-2 py-0.5 rounded bg-accent-red/20 border border-accent-red/30">
           <span className="text-[9px] font-black text-accent-red">{allAnomalies.length}</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
             <div className="w-6 h-6 border border-text-muted border-t-transparent rounded-full animate-spin" />
             <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">
               Scanning Network...
             </span>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts.map((alert, i) => {
              const time = new Date(alert.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              });

              return (
                <div
                  key={`${alert.sensorId}-${alert.timestamp}-${i}`}
                  className="p-6 transition-all hover:bg-white/[0.05] group cursor-default"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-red group-hover:scale-150 transition-transform shadow-[0_0_5px_var(--accent-red)]" />
                      <Badge variant="info" className="scale-90 origin-left">
                        {alert.city.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-black font-mono text-accent-red tracking-tighter">
                      {alert.aqi} AQI
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between opacity-80">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-text-secondary transition-colors">
                      NODE_#{alert.sensorId}
                    </span>
                    <span className="text-[9px] font-black uppercase text-text-muted">
                      {time}
                    </span>
                  </div>
                  
                  <div className="mt-3 text-[8px] font-mono text-text-muted truncate opacity-30 group-hover:opacity-60 transition-opacity">
                    HSH: {alert.spikeHash.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
         <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Sentinel Module Active</span>
      </div>
    </div>
  );
}
