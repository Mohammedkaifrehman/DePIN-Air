'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from '@/context/WebSocketContext';
import StatsBar from '@/components/dashboard/StatsBar';
import SensorMap from '@/components/map/SensorMap';
import AlertBanner from '@/components/dashboard/AlertBanner';
import AlertLog from '@/components/dashboard/AlertLog';
import TxSidebar from '@/components/dashboard/TxSidebar';
import SensorChartModal from '@/components/dashboard/SensorChartModal';

export default function DashboardPage() {
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);

  useEffect(() => {
    const handleOpenChart = (e: any) => {
      setSelectedSensorId(e.detail);
    };

    window.addEventListener('open-chart', handleOpenChart);
    return () => window.removeEventListener('open-chart', handleOpenChart);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-primary">
      <StatsBar />
      
      <main className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - var(--stats-bar-height))', marginTop: 'var(--stats-bar-height)' }}>
        <SensorMap />
        <AlertBanner />
        <AlertLog />
        <TxSidebar />
      </main>

      {selectedSensorId !== null && (
        <SensorChartModal 
          sensorId={selectedSensorId} 
          onClose={() => setSelectedSensorId(null)} 
        />
      )}
    </div>
  );
}


