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

  const chartColor = '#00F5FF'; // Cyan for the main trend

  const chartData = {
    labels: sensorData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: activeTab === 'aqi' ? [
      {
        label: 'AQI INDEX',
        data: sensorData.map(d => d.aqi),
        borderColor: chartColor,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${chartColor}40`);
          gradient.addColorStop(1, 'transparent');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      }
    ] : [
      {
        label: 'PM2.5',
        data: sensorData.map(d => d.pm25),
        borderColor: '#00F5FF',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'NO2',
        data: sensorData.map(d => d.no2),
        borderColor: '#B026FF',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'CO2',
        data: sensorData.map(d => (d.co2 - 300) / 2),
        borderColor: '#FF3D00',
        borderWidth: 2,
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
        labels: { 
          color: '#ffffff90', 
          font: { size: 10, weight: 800, family: 'var(--font-space-grotesk)' },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: { 
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 12, weight: 800 },
        bodyFont: { size: 11, weight: 700 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#ffffff50', font: { size: 9, weight: 700 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#ffffff50', font: { size: 9, weight: 700 }, maxTicksLimit: 8 }
      }
    }
  };

  const avgAqi = sensorData.length > 0 
    ? Math.round(sensorData.reduce((a, b) => a + b.aqi, 0) / sensorData.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white/[0.03] border border-white/10 rounded-md shadow-2xl overflow-hidden flex flex-col fade-in backdrop-blur-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-accent-cyan tracking-widest uppercase mb-1">Node Diagnostics</span>
              <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter">NODE_#{sensorId}</h2>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-4">
               <Badge variant="info">{currentSensor?.city.toUpperCase()}</Badge>
               {sensorData.some(d => d.isSpike) && (
                 <div className="px-3 py-1 rounded-md bg-accent-red/20 text-accent-red text-[10px] font-bold uppercase tracking-widest border border-accent-red/30 animate-pulse">
                   Critical Spike
                 </div>
               )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center rounded-md border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <span className="text-xl font-black group-hover:scale-110 transition-transform">✕</span>
          </button>
        </div>

        <div className="p-10 overflow-y-auto scrollbar-hide flex-1">
          <div className="flex gap-4 mb-10">
            <button 
              onClick={() => setActiveTab('aqi')}
              className={`px-8 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'aqi' ? 'bg-accent-cyan text-black border-accent-cyan' : 'bg-transparent text-text-muted border-white/10 hover:border-white/30'}`}
            >
              AQI Trend
            </button>
            <button 
              onClick={() => setActiveTab('pollutants')}
              className={`px-8 py-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'pollutants' ? 'bg-accent-purple text-white border-accent-purple shadow-[0_0_15px_#B026FF40]' : 'bg-transparent text-text-muted border-white/10 hover:border-white/30'}`}
            >
              Pollutants
            </button>
          </div>

          <div className="h-[350px] w-full mb-10 bg-white/[0.01] rounded-md p-6 border border-white/5">
            <Line data={chartData} options={options} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox label="Session Average" value={avgAqi} unit="AQI" color="var(--accent-cyan)" />
            <StatBox label="Peak Velocity" value={Math.max(...sensorData.map(d => d.aqi), 0)} unit="AQI" color="var(--accent-red)" />
            <StatBox label="Samples Anchored" value={sensorData.length} unit="PTS" color="var(--accent-purple)" />
            <StatBox label="Network Link" value="ACTIVE" unit="LINK" color="var(--accent-green)" />
          </div>
        </div>

        <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">PROTOCOL_V2_INSIGHTS</span>
             <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_5px_#00F5FF]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-accent-green">Proof of Environmental Data (PoED) Stable</span>
             </div>
          </div>
          <button 
            className="text-[10px] text-text-primary hover:text-accent-cyan font-bold uppercase tracking-widest transition-colors"
            onClick={() => window.open('https://amoy.polygonscan.com', '_blank')}
          >
            Terminal Scan ↗
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit, color }: { label: string, value: string | number, unit: string, color: string }) {
  return (
    <div className="p-8 rounded-md bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex flex-col gap-2 shadow-xl group">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-secondary transition-colors">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black font-mono tracking-tighter" style={{ color }}>{value}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-40">{unit}</span>
      </div>
    </div>
  );
}
