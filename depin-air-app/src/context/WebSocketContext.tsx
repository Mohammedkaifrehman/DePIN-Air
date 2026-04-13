'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface SensorReading {
  sensorId: number;
  city: string;
  lat: number;
  lng: number;
  timestamp: number;
  pm25: number;
  no2: number;
  co2: number;
  aqi: number;
  isSpike: boolean;
  color: string;
}

export interface Anomaly {
  sensorId: number;
  city: string;
  aqi: number;
  delta: number;
  zscore: number;
  mean: number;
  stddev: number;
  type: string;
  timestamp: number;
  spikeHash: string;
}

export interface SensorBatch {
  type: string;
  seq: number;
  timestamp: number;
  batchHash: string;
  readings: SensorReading[];
  anomalies: Anomaly[];
  activeSensors: number;
}

export interface NetworkStats {
  activeSensors: number;
  totalReadingsMinted: number;
  globalAqi: number;
  airqBurned: number;
  citiesMonitored: number;
}

interface WebSocketContextType {
  readings: SensorReading[];
  latestBatch: SensorBatch | null;
  anomalies: Anomaly[];
  allAnomalies: Anomaly[];
  stats: NetworkStats;
  connected: boolean;
  triggerSpike: (sensorId?: number) => void;
  readingHistory: Map<number, SensorReading[]>;
}

const WebSocketContext = createContext<WebSocketContextType>({
  readings: [],
  latestBatch: null,
  anomalies: [],
  allAnomalies: [],
  stats: {
    activeSensors: 100,
    totalReadingsMinted: 0,
    globalAqi: 0,
    airqBurned: 0,
    citiesMonitored: 5,
  },
  connected: false,
  triggerSpike: () => {},
  readingHistory: new Map(),
});

export const useWebSocket = () => useContext(WebSocketContext);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const MAX_HISTORY_PER_SENSOR = 300; // ~25 minutes at 5s intervals
const MAX_ANOMALY_LOG = 50;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestBatch, setLatestBatch] = useState<SensorBatch | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [allAnomalies, setAllAnomalies] = useState<Anomaly[]>([]);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<NetworkStats>({
    activeSensors: 100,
    totalReadingsMinted: 0,
    globalAqi: 0,
    airqBurned: 0,
    citiesMonitored: 5,
  });

  const readingHistoryRef = useRef<Map<number, SensorReading[]>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const mintedCountRef = useRef(0);

  const triggerSpike = useCallback(async (sensorId?: number) => {
    try {
      const url = sensorId !== undefined
        ? `${API_URL}/api/spike?id=${sensorId}`
        : `${API_URL}/api/spike`;
      await fetch(url, { method: 'POST' });
    } catch (e) {
      console.warn('Failed to trigger spike:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    function connect() {
      if (!mounted) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted) return;
        setConnected(true);
        reconnectAttempt.current = 0;
        console.log('🟢 WebSocket connected');
      };

      ws.onmessage = async (event) => {
        if (!mounted) return;

        try {
          let textData;
          if (event.data instanceof Blob) {
            textData = await event.data.text();
          } else {
            textData = event.data;
          }
          const data: SensorBatch = JSON.parse(textData);

          if (data.type === 'SENSOR_UPDATE') {
            setReadings(data.readings);
            setLatestBatch(data);

            // Update reading history
            const history = readingHistoryRef.current;
            data.readings.forEach((r) => {
              if (!history.has(r.sensorId)) {
                history.set(r.sensorId, []);
              }
              const arr = history.get(r.sensorId)!;
              arr.push(r);
              if (arr.length > MAX_HISTORY_PER_SENSOR) arr.shift();
            });

            // Process anomalies
            if (data.anomalies && data.anomalies.length > 0) {
              setAnomalies(data.anomalies);
              setAllAnomalies((prev) => {
                const next = [...data.anomalies, ...prev];
                return next.slice(0, MAX_ANOMALY_LOG);
              });
            } else {
              setAnomalies([]);
            }

            // Update stats
            // Simulate minted count: +100 every 30s (every 6th batch)
            if (data.seq % 6 === 0) {
              mintedCountRef.current += 100;
            }

            const avgAqi = Math.round(
              data.readings.reduce((sum, r) => sum + r.aqi, 0) / data.readings.length
            );

            setStats({
              activeSensors: data.activeSensors,
              totalReadingsMinted: mintedCountRef.current,
              globalAqi: avgAqi,
              airqBurned: 0, // Updated via blockchain events
              citiesMonitored: 5,
            });
          }
        } catch (e) {
          console.warn('Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        if (!mounted) return;
        setConnected(false);
        console.log('🔴 WebSocket disconnected');

        // Exponential backoff with jitter
        const attempt = reconnectAttempt.current++;
        const base = Math.min(30000, 1000 * Math.pow(2, attempt));
        const jitter = Math.random() * base * 0.3;
        const delay = base + jitter;

        console.log(`Reconnecting in ${(delay / 1000).toFixed(1)}s...`);
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (!mounted) return;
        setConnected(false);
      };
    }

    connect();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        readings,
        latestBatch,
        anomalies,
        allAnomalies,
        stats,
        connected,
        triggerSpike,
        readingHistory: readingHistoryRef.current,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
