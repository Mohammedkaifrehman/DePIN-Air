'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket, SensorReading } from '@/context/WebSocketContext';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';

// We need to lazy-load this component since Leaflet requires window
const SensorMapInner = () => {
  const { readings, anomalies, triggerSpike } = useWebSocket();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.CircleMarker>>(new Map());
  const heatLayerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [heatmapActive, setHeatmapActive] = useState(false);
  const [coverageActive, setCoverageActive] = useState(false);
  const [L, setL] = useState<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    async function loadLeaflet() {
      const leaflet = await import('leaflet');
      setL(leaflet.default || leaflet);
    }
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5, 80],
      zoom: 5,
      zoomControl: false, // Move zoom control to a better place
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Handle keyboard spike trigger
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 's' || e.key === 'S') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        triggerSpike();
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      map.remove();
      mapRef.current = null;
    };
  }, [L, triggerSpike]);

  // Update markers
  useEffect(() => {
    if (!L || !mapRef.current || readings.length === 0) return;
    const map = mapRef.current;
    const markers = markersRef.current;

    readings.forEach((r) => {
      const isAnomaly = anomalies.some((a) => a.sensorId === r.sensorId);
      const radius = isAnomaly ? 16 : 7;
      const fillOpacity = isAnomaly ? 0.9 : 0.7;
      const fillColor = r.color;

      if (markers.has(r.sensorId)) {
        const marker = markers.get(r.sensorId)!;
        marker.setLatLng([r.lat, r.lng]);
        marker.setStyle({
          fillColor,
          radius,
          fillOpacity,
          color: isAnomaly ? '#FF0000' : fillColor,
          weight: isAnomaly ? 3 : 1,
        });

        if (marker.isPopupOpen()) {
          marker.setPopupContent(createPopupContent(r, isAnomaly));
        }
      } else {
        const marker = L.circleMarker([r.lat, r.lng], {
          radius,
          fillColor,
          fillOpacity,
          color: fillColor,
          weight: 1,
          className: isAnomaly ? 'spike-flash' : 'sensor-pulse',
        }).addTo(map);

        marker.bindPopup(createPopupContent(r, isAnomaly), {
          maxWidth: 280,
          className: 'sensor-popup',
        });

        markers.set(r.sensorId, marker);
      }
    });

    // Update heatmap
    if (heatmapActive && heatLayerRef.current) {
      const heatData = readings.map((r) => [r.lat, r.lng, r.aqi / 300]);
      heatLayerRef.current.setLatLngs(heatData);
    }
  }, [readings, anomalies, L, heatmapActive]);

  // Toggle heatmap
  const toggleHeatmap = useCallback(async () => {
    if (!L || !mapRef.current) return;

    if (heatmapActive) {
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      setHeatmapActive(false);
    } else {
      try {
        // @ts-ignore
        await import('leaflet.heat');
        const heatData = readings.map((r) => [r.lat, r.lng, r.aqi / 300]);
        // @ts-ignore
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 30,
          blur: 20,
          maxZoom: 10,
          gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' },
        }).addTo(mapRef.current);
        setHeatmapActive(true);
      } catch {
        console.warn('Heatmap plugin not available');
      }
    }
  }, [L, readings, heatmapActive]);

  const toggleCoverage = () => setCoverageActive(!coverageActive);

  function createPopupContent(r: SensorReading, isAnomaly: boolean): string {
    const time = new Date(r.timestamp).toLocaleTimeString();
    return `
      <div style="font-family: 'Inter', sans-serif; padding: 4px 0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="
            display: inline-block;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: ${r.color};
            box-shadow: 0 0 6px ${r.color};
          "></span>
          <strong style="font-size: 14px;">Sensor #${r.sensorId}</strong>
          <span style="
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            color: #8B949E;
          ">${r.city}</span>
          ${isAnomaly ? '<span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(226,75,74,0.2); color: #E24B4A;">⚠ SPIKE</span>' : ''}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; margin-bottom: 8px;">
          <div style="color: #8B949E;">AQI</div>
          <div style="font-weight: 600; color: ${r.color}; font-family: 'JetBrains Mono', monospace;">${r.aqi}</div>
          <div style="color: #8B949E;">PM2.5</div>
          <div style="font-family: 'JetBrains Mono', monospace;">${r.pm25} µg/m³</div>
          <div style="color: #8B949E;">NO₂</div>
          <div style="font-family: 'JetBrains Mono', monospace;">${r.no2} ppb</div>
          <div style="color: #8B949E;">CO₂</div>
          <div style="font-family: 'JetBrains Mono', monospace;">${r.co2} ppm</div>
        </div>
        <div style="font-size: 10px; color: #6E7681; margin-bottom: 6px;">Updated: ${time}</div>
        <button
          onclick="window.dispatchEvent(new CustomEvent('open-chart', { detail: ${r.sensorId} }))"
          style="
            width: 100%;
            padding: 8px 12px;
            background: rgba(29,158,117,0.15);
            border: 1px solid rgba(29,158,117,0.3);
            border-radius: 8px;
            color: #1D9E75;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='rgba(29,158,117,0.25)'"
          onmouseout="this.style.background='rgba(29,158,117,0.15)'"
        >Analyze History</button>
      </div>
    `;
  }

  return (
    <div className="relative w-full h-full bg-bg-primary">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Map Controls */}
      <div className="absolute bottom-6 left-6 z-[500] flex flex-row gap-2">
        <Button
          variant={heatmapActive ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleHeatmap}
          className="shadow-2xl"
        >
          <span>🌡</span>
          <span className="ml-2 hidden sm:inline">AQI Heatmap</span>
        </Button>
        <Button
          variant={coverageActive ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleCoverage}
          className="shadow-2xl"
        >
          <span>⬢</span>
          <span className="ml-2 hidden sm:inline">Coverage Grid</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => triggerSpike()}
          className="shadow-2xl"
        >
          <span>⚡</span>
          <span className="ml-2 hidden sm:inline">Stress Test</span>
        </Button>
      </div>
    </div>
  );
};

// Dynamic import with no SSR
const SensorMap = dynamic(() => Promise.resolve(SensorMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-accent-green border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse">
          Initializing Global Network...
        </span>
      </div>
    </div>
  ),
});

export default SensorMap;
