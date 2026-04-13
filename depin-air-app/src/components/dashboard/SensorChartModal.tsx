'use client';

import React, { useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorChartModalProps {
  sensorId: number | null;
  onClose: () => void;
}

export default function SensorChartModal({ sensorId, onClose }: SensorChartModalProps) {
  const { readingHistory, readings } = useWebSocket();
  const [activeTab, setActiveTab] = useState<'aqi' | 'pollutants'>('aqi');
  
  const sensorData = sensorId !== null ? readingHistory.get(sensorId) || [] : [];
  const currentSensor = readings.find(r => r.sensorId === sensorId);

  if (sensorId === null) return null;

  const chartData = {
    labels: sensorData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: activeTab === 'aqi' ? [
      {
        label: 'AQI',
        data: sensorData.map(d => d.aqi),
        borderColor: currentSensor?.color || '#1D9E75',
        backgroundColor: `${currentSensor?.color || '#1D9E75'}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ] : [
      {
        label: 'PM2.5',
        data: sensorData.map(d => d.pm25),
        borderColor: '#1D9E75',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'NO2',
        data: sensorData.map(d => d.no2),
        borderColor: '#EF9F27',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'CO2',
        data: sensorData.map(d => (d.co2 - 300) / 2),
        borderColor: '#378ADD',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: activeTab === 'pollutants',
        position: 'top' as const,
        labels: { color: '#8B949E', font: { size: 10 } }
      },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(48, 54, 61, 0.2)' },
        ticks: { color: '#8B949E', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8B949E', font: { size: 10 }, maxTicksLimit: 6 }
      }
    }
  };

  const avgAqi = sensorData.length > 0 
    ? Math.round(sensorData.reduce((a, b) => a + b.aqi, 0) / sensorData.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-2xl bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                background: currentSensor?.color || '#1D9E75',
                boxShadow: `0 0 10px ${currentSensor?.color || '#1D9E75'}`
              }} 
            />
            <h2 className="text-lg font-bold text-text-primary">Sensor #{sensorId} Insights</h2>
            <Badge variant="default">{currentSensor?.city}</Badge>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeTab === 'aqi' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveTab('aqi')}
            >
              AQI Trend
            </Button>
            <Button 
              variant={activeTab === 'pollutants' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveTab('pollutants')}
            >
              Pollutants
            </Button>
          </div>

          <div className="h-[300px] w-full mb-6">
            <Line data={chartData} options={options} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Average AQI" value={avgAqi} color="var(--accent-amber)" />
            <StatBox label="Max Reading" value={Math.max(...sensorData.map(d => d.aqi), 0)} color="var(--accent-red)" />
            <StatBox label="Data Points" value={sensorData.length} color="var(--accent-blue)" />
            <StatBox label="Status" value="Live" color="var(--accent-green)" />
          </div>
        </div>

        <div className="px-6 py-4 bg-bg-primary/50 border-t border-border-primary flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="animate-pulse">Verified Node</Badge>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Proof of Environmental Data (PoED)</span>
          </div>
          <button 
            className="text-[10px] text-accent-green hover:underline font-bold"
            onClick={() => window.open('https://amoy.polygonscan.com', '_blank')}
          >
            VIEW ON POLYGON EXPLORER ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="p-3 rounded-xl bg-bg-primary border border-border-primary">
      <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-1">{label}</span>
      <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}
