'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  LEDGER_ADDRESS, LEDGER_ABI,
  AIRQ_ADDRESS, AIRQ_ABI,
  AMOY_RPC_URL, isBlockchainConfigured,
} from '@/utils/web3-constants';

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

export interface TxItem {
  id: number;
  batchHash: string;
  timestamp: number;
  seq: number;
  avgAqi: number;
  sensorCount: number;
  isSpike: boolean;
  cityBreakdown: { city: string; avgAqi: number; count: number }[];
}

export interface NetworkStats {
  activeSensors: number;
  totalReadingsMinted: number;
  globalAqi: number;
  airqBurned: number;
  citiesMonitored: number;
  airqBalance: number;
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
  burnAirq: (amount: number) => void;
  mints: TxItem[];
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
    airqBalance: 5000,
  },
  connected: false,
  triggerSpike: () => {},
  readingHistory: new Map(),
  burnAirq: () => {},
  mints: [],
});

export const useWebSocket = () => useContext(WebSocketContext);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const MAX_HISTORY_PER_SENSOR = 300;
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
    airqBalance: 5000,
  });
  const [mints, setMints] = useState<TxItem[]>([]);

  const [history, setHistory] = useState<Map<number, SensorReading[]>>(new Map());
  const readingHistoryRef = useRef<Map<number, SensorReading[]>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const mintedCountRef = useRef(0);

  // Token economy: start at 5000, +~100 every 30s batch
  const airqBalanceRef = useRef(5000);
  const airqBurnedRef = useRef(0);

  const burnAirq = useCallback((amount: number) => {
    airqBalanceRef.current -= amount;
    airqBurnedRef.current += amount;
  }, []);

  // Blockchain state — only populated when contracts are deployed
  const onChainBatchCountRef = useRef(0);
  const onChainBurnAmountRef = useRef(0);

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

  // ─── Blockchain Event Listeners (only when contracts are deployed) ───
  useEffect(() => {
    if (!isBlockchainConfigured()) {
      console.log('⚠️ Blockchain not configured — running in simulation-only mode');
      return;
    }

    let ledgerContract: ethers.Contract | null = null;
    let airqContract: ethers.Contract | null = null;

    try {
      const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
      ledgerContract = new ethers.Contract(LEDGER_ADDRESS, LEDGER_ABI, provider);
      airqContract = new ethers.Contract(AIRQ_ADDRESS, AIRQ_ABI, provider);

      // Fetch initial totals
      ledgerContract.totalBatches()
        .then((count: bigint) => { onChainBatchCountRef.current = Number(count); })
        .catch((e: Error) => console.warn('Failed to fetch batch count:', e.message));

      // Live event listeners
      ledgerContract.on('BatchMinted', (batchId: bigint, batchHash: string, block: bigint, ts: bigint, sensors: number) => {
        console.log('⛓ On-chain BatchMinted event:', Number(batchId));
        onChainBatchCountRef.current = Number(batchId);

        setMints(prev => {
          const existingIdx = prev.findIndex(t => t.batchHash === batchHash);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...updated[existingIdx], seq: Number(batchId) };
            return updated;
          }

          const newTx: TxItem = {
            id: Number(batchId),
            batchHash,
            timestamp: Number(ts) * 1000,
            seq: Number(batchId),
            avgAqi: 0,
            sensorCount: sensors,
            isSpike: false,
            cityBreakdown: []
          };
          return [newTx, ...prev].slice(0, 50);
        });
      });

      airqContract.on('TokensBurned', (_burner: string, amount: bigint) => {
        const formatted = Number(ethers.formatEther(amount));
        console.log('🔥 On-chain TokensBurned event:', formatted);
        onChainBurnAmountRef.current += formatted;
      });

      console.log('✅ Blockchain listeners active on Amoy');
    } catch (e) {
      console.warn('Blockchain listener setup failed:', e);
    }

    return () => {
      if (ledgerContract) ledgerContract.removeAllListeners();
      if (airqContract) airqContract.removeAllListeners();
    };
  }, []); // Runs once on mount — no deps that cause reconnects

  // ─── WebSocket Effect ───
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
          const textData = event.data instanceof Blob ? await event.data.text() : event.data;
          const data: SensorBatch = JSON.parse(textData);

          if (data.type === 'SENSOR_UPDATE') {
            setReadings(data.readings);
            setLatestBatch(data);

            // Update reading history
            const nextHistory = new Map(readingHistoryRef.current);
            data.readings.forEach((r) => {
              const arr = [...(nextHistory.get(r.sensorId) || [])];
              arr.push(r);
              if (arr.length > MAX_HISTORY_PER_SENSOR) arr.shift();
              nextHistory.set(r.sensorId, arr);
            });
            readingHistoryRef.current = nextHistory;
            setHistory(nextHistory);

            // Process anomalies
            if (data.anomalies && data.anomalies.length > 0) {
              setAnomalies(data.anomalies);
              setAllAnomalies((prev) => [...data.anomalies, ...prev].slice(0, MAX_ANOMALY_LOG));
            } else {
              setAnomalies([]);
            }

            // Token economy: Every 6th sequence (30s) = 1 AIRQ per active sensor per batch
            if (data.seq % 6 === 0) {
              const batchReward = data.activeSensors; // ~100 sensors = ~100 AIRQ
              mintedCountRef.current += batchReward;
              airqBalanceRef.current += batchReward;
            }

            const avgAqi = Math.round(
              data.readings.reduce((sum, r) => sum + r.aqi, 0) / data.readings.length
            );

            // Use on-chain data if available, otherwise fall back to simulation
            const minted = onChainBatchCountRef.current > 0
              ? onChainBatchCountRef.current * 100
              : mintedCountRef.current;

            setStats({
              activeSensors: data.activeSensors,
              totalReadingsMinted: minted,
              globalAqi: avgAqi,
              airqBurned: airqBurnedRef.current,
              citiesMonitored: 5,
              airqBalance: airqBalanceRef.current,
            });

            // Persist Tx Items
            if (data.seq % 6 === 0) {
              const cityMap = new Map<string, { sum: number; count: number }>();
              data.readings.forEach((r) => {
                const cityData = cityMap.get(r.city) || { sum: 0, count: 0 };
                cityData.sum += r.aqi;
                cityData.count += 1;
                cityMap.set(r.city, cityData);
              });

              const cityBreakdown = Array.from(cityMap.entries()).map(([city, d]) => ({
                city,
                avgAqi: Math.round(d.sum / d.count),
                count: d.count,
              }));

              setMints(prev => {
                const exists = prev.find(t => t.batchHash === data.batchHash);
                if (exists) return prev;
                
                const newTx: TxItem = {
                  id: data.seq,
                  batchHash: data.batchHash,
                  timestamp: data.timestamp,
                  seq: data.seq,
                  avgAqi,
                  sensorCount: data.activeSensors,
                  isSpike: data.anomalies && data.anomalies.length > 0,
                  cityBreakdown,
                };
                return [newTx, ...prev].slice(0, 50);
              });
            }
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
        if (!mounted) setConnected(false);
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
  }, []); // ← stable deps: no blockchain state here

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
        readingHistory: history,
        burnAirq,
        mints,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
