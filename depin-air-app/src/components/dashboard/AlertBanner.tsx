'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket, Anomaly } from '@/context/WebSocketContext';
import { Badge } from '@/components/ui/Badge';

export default function AlertBanner() {
  const { anomalies } = useWebSocket();
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Anomaly | null>(null);

  useEffect(() => {
    if (anomalies.length > 0) {
      // Show the most severe anomaly 
      const sorted = [...anomalies].sort((a, b) => b.aqi - a.aqi);
      setCurrentAlert(sorted[0]);
      setVisible(true);

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => setVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [anomalies]);

  if (!visible || !currentAlert) return null;

  const delta = currentAlert.delta > 0 ? `+${currentAlert.delta}` : currentAlert.delta;

  return (
    <div className="alert-slide-down fixed top-20 inset-x-0 z-[1500] flex justify-center pointer-events-none">
      <div className="w-full max-w-2xl px-6 pointer-events-auto">
        <div className="flex items-center gap-6 bg-accent-red px-8 py-5 rounded-md shadow-[0_0_50px_rgba(255,61,0,0.4)] border border-white/20 text-white relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
          <span className="text-2xl animate-pulse">⚠️</span>
          <div className="flex items-center gap-8 flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Critical Network Event</span>
              <span className="text-sm font-bold whitespace-nowrap uppercase tracking-tight">
                SPIKE DETECTED AT SENSOR_#{currentAlert.sensorId}
              </span>
            </div>
            <div className="flex items-center gap-4 border-l border-white/20 pl-8">
              <Badge variant="default" className="bg-white/20 border-white/10 text-white shadow-none">
                {currentAlert.city.toUpperCase()}
              </Badge>
              <div className="flex flex-col">
                 <span className="text-xl font-bold tabular-nums leading-none tracking-tight">
                   {currentAlert.aqi} AQI
                 </span>
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                   DELTA {delta} PTS
                 </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all cursor-pointer border border-white/10 ml-4 group"
          >
            <span className="text-sm font-black group-hover:scale-110 transition-transform">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
