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

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [anomalies]);

  if (!visible || !currentAlert) return null;

  const delta = currentAlert.delta > 0 ? `+${currentAlert.delta}` : currentAlert.delta;

  return (
    <div
      className="alert-slide-down absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4"
    >
      <div className="flex items-center gap-3 bg-accent-red px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 text-white">
        <span className="text-lg">⚠️</span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold whitespace-nowrap">
            SPIKE AT SENSOR #{currentAlert.sensorId}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-white/20 border-white/10 text-white">
              {currentAlert.city}
            </Badge>
            <span className="text-sm font-black font-mono">
              AQI {currentAlert.aqi}
            </span>
            <span className="text-[10px] opacity-80 font-medium">
              ({delta} pts)
            </span>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
        >
          <span className="sr-only">Dismiss</span>
          ✕
        </button>
      </div>
    </div>
  );
}
