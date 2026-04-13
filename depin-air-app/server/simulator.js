const { WebSocketServer } = require('ws');
const http = require('http');
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Load Sensor Data ───
const sensorsPath = path.join(__dirname, '..', 'public', 'data', 'sensors.json');
const sensors = JSON.parse(fs.readFileSync(sensorsPath, 'utf-8'));

// ─── City Base AQI ───
const CITY_BASE_AQI = {
  Delhi: 180,
  Mumbai: 120,
  Bengaluru: 90,
  Chennai: 100,
  Hyderabad: 110,
};

// ─── State ───
const sensorState = new Map();
const rollingWindows = new Map();
let batchSequence = 0;
let spikeQueue = [];          // Manual spike requests
let activeSpikeCountdown = new Map(); // sensorId → remaining spike readings

// Initialize sensor state with slight randomness
sensors.forEach((s) => {
  const base = CITY_BASE_AQI[s.city];
  sensorState.set(s.id, {
    aqi: base + (Math.random() - 0.5) * 20,
    pm25: base * 0.7 + Math.random() * 10,
    no2: 20 + Math.random() * 30,
    co2: 350 + Math.random() * 100,
  });
  rollingWindows.set(s.id, []);
});

// ─── Gaussian Random (Box-Muller) ───
function gaussianRandom(mean = 0, sigma = 12) {
  let u1 = Math.random();
  let u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * sigma;
}

// ─── keccak256 via crypto (SHA-256 as stand-in, real keccak needs ethers) ───
function computeBatchHash(readings) {
  const data = JSON.stringify(readings.map(r => ({
    id: r.sensorId,
    aqi: r.aqi,
    ts: r.timestamp,
  })));
  return '0x' + createHash('sha256').update(data).digest('hex');
}

// ─── AQI Color ───
function getAqiColor(aqi) {
  if (aqi <= 50) return '#1D9E75';
  if (aqi <= 100) return '#EF9F27';
  if (aqi <= 150) return '#D85A30';
  if (aqi <= 200) return '#E24B4A';
  return '#7F77DD';
}

// ─── Spike Management ───
let naturalSpikeTimer = 0;
const NATURAL_SPIKE_INTERVAL = 18; // Every 18 broadcasts = 90s (18 × 5s)

function selectRandomSensorForSpike() {
  return sensors[Math.floor(Math.random() * sensors.length)].id;
}

// ─── Generate Readings ───
function generateReadings() {
  const now = Date.now();
  naturalSpikeTimer++;

  // Natural spike trigger
  if (naturalSpikeTimer >= NATURAL_SPIKE_INTERVAL) {
    naturalSpikeTimer = 0;
    const spikeId = selectRandomSensorForSpike();
    if (!activeSpikeCountdown.has(spikeId)) {
      activeSpikeCountdown.set(spikeId, 3);
      console.log(`\x1b[33m⚡ Natural spike triggered on sensor #${spikeId}\x1b[0m`);
    }
  }

  // Process manual spike queue
  while (spikeQueue.length > 0) {
    const manualId = spikeQueue.shift();
    if (!activeSpikeCountdown.has(manualId)) {
      activeSpikeCountdown.set(manualId, 3);
      console.log(`\x1b[35m🎯 Manual spike triggered on sensor #${manualId}\x1b[0m`);
    }
  }

  const readings = sensors.map((sensor) => {
    const state = sensorState.get(sensor.id);
    const baseAqi = CITY_BASE_AQI[sensor.city];
    let isSpike = false;

    // Check if this sensor is in spike mode
    if (activeSpikeCountdown.has(sensor.id)) {
      const remaining = activeSpikeCountdown.get(sensor.id);
      if (remaining > 0) {
        // Spike: AQI 240-290
        state.aqi = 240 + Math.random() * 50;
        isSpike = true;
        activeSpikeCountdown.set(sensor.id, remaining - 1);
      } else {
        // Exponential decay back to base
        state.aqi = state.aqi * 0.7 + baseAqi * 0.3;
        if (Math.abs(state.aqi - baseAqi) < 15) {
          activeSpikeCountdown.delete(sensor.id);
        }
      }
    } else {
      // Normal: Gaussian drift around base
      state.aqi = state.aqi * 0.85 + baseAqi * 0.15 + gaussianRandom(0, 12);
    }

    // Clamp AQI
    state.aqi = Math.max(10, Math.min(500, state.aqi));

    // Derive pollutant values from AQI with independent noise
    state.pm25 = state.aqi * 0.68 + gaussianRandom(0, 5);
    state.no2 = 15 + state.aqi * 0.18 + gaussianRandom(0, 3);
    state.co2 = 320 + state.aqi * 0.5 + gaussianRandom(0, 8);

    // Update rolling window for Z-score
    const window = rollingWindows.get(sensor.id);
    window.push(state.aqi);
    if (window.length > 20) window.shift();

    return {
      sensorId: sensor.id,
      city: sensor.city,
      lat: sensor.lat,
      lng: sensor.lng,
      timestamp: now,
      pm25: Math.round(state.pm25 * 10) / 10,
      no2: Math.round(state.no2 * 10) / 10,
      co2: Math.round(state.co2 * 10) / 10,
      aqi: Math.round(state.aqi),
      isSpike,
      color: getAqiColor(Math.round(state.aqi)),
    };
  });

  const batchHash = computeBatchHash(readings);
  batchSequence++;

  return {
    seq: batchSequence,
    timestamp: now,
    batchHash,
    readings,
    activeSensors: 97 + Math.floor(Math.random() * 7), // 97-103
  };
}

// ─── Anomaly Detection (Z-Score) ───
function detectAnomalies(readings) {
  const anomalies = [];

  readings.forEach((r) => {
    const window = rollingWindows.get(r.sensorId);
    if (window.length < 5) return;

    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, v) => sum + (v - mean) ** 2, 0) / window.length;
    const stddev = Math.sqrt(variance);
    const zscore = stddev > 0 ? (r.aqi - mean) / stddev : 0;

    const prevAqi = window.length > 1 ? window[window.length - 2] : r.aqi;
    const delta = r.aqi - prevAqi;

    // Z > 2.5 OR delta > 80 OR absolute > 220
    if (zscore > 2.5 || delta > 80 || r.aqi > 220) {
      anomalies.push({
        sensorId: r.sensorId,
        city: r.city,
        aqi: r.aqi,
        delta: Math.round(delta),
        zscore: Math.round(zscore * 100) / 100,
        mean: Math.round(mean),
        stddev: Math.round(stddev * 10) / 10,
        type: zscore > 2.5 ? 'Z_SCORE' : delta > 80 ? 'DELTA' : 'ABSOLUTE',
        timestamp: r.timestamp,
        spikeHash: '0x' + createHash('sha256')
          .update(`spike-${r.sensorId}-${r.aqi}-${r.timestamp}`)
          .digest('hex'),
      });
    }
  });

  return anomalies;
}

// ─── HTTP + WebSocket Server ───
const PORT = process.env.PORT || 8080;

const httpServer = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      connections: wss.clients.size,
      batchSequence,
      timestamp: Date.now(),
    }));
    return;
  }

  // Manual spike trigger
  if (url.pathname === '/api/spike' && req.method === 'POST') {
    const sensorId = parseInt(url.searchParams.get('id') || '-1');
    if (sensorId >= 0 && sensorId < 100) {
      spikeQueue.push(sensorId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, sensorId, message: `Spike queued for sensor #${sensorId}` }));
    } else {
      // Random sensor
      const randomId = selectRandomSensorForSpike();
      spikeQueue.push(randomId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, sensorId: randomId, message: `Spike queued for random sensor #${randomId}` }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  console.log(`\x1b[32m+ Client connected (total: ${wss.clients.size})\x1b[0m`);

  ws.on('close', () => {
    console.log(`\x1b[31m- Client disconnected (total: ${wss.clients.size})\x1b[0m`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

// ─── Broadcast Loop ───
let broadcastCount = 0;

function broadcast() {
  const batch = generateReadings();
  const anomalies = detectAnomalies(batch.readings);

  const payload = JSON.stringify({
    type: 'SENSOR_UPDATE',
    ...batch,
    anomalies,
  });

  const buf = Buffer.from(payload);
  let sent = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(buf);
      sent++;
    }
  });

  broadcastCount++;
  const spikeSensors = batch.readings.filter(r => r.isSpike);
  const avgAqi = Math.round(
    batch.readings.reduce((sum, r) => sum + r.aqi, 0) / batch.readings.length
  );

  // Console logging
  const time = new Date().toISOString().slice(11, 19);
  let logLine = `[${time}] Batch #${batch.seq} | AQI avg: ${avgAqi} | Sensors: ${batch.activeSensors} | Clients: ${sent}`;

  if (spikeSensors.length > 0) {
    const spikeInfo = spikeSensors.map(s => `#${s.sensorId}(${s.aqi})`).join(', ');
    logLine += ` | \x1b[31m🔴 SPIKES: ${spikeInfo}\x1b[0m`;
  }

  if (anomalies.length > 0) {
    logLine += ` | \x1b[33m⚠ Anomalies: ${anomalies.length}\x1b[0m`;
  }

  console.log(logLine);
  console.log(`  Hash: ${batch.batchHash.substring(0, 18)}...`);
}

// Start broadcasting every 5 seconds
setInterval(broadcast, 5000);

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🌍 DePIN-Air Sensor Simulator v1.0       ║
║     WebSocket: ws://localhost:${PORT}           ║
║     HTTP API:  http://localhost:${PORT}          ║
║     Sensors:   ${sensors.length} across 5 cities           ║
║     Interval:  5 seconds                      ║
╚═══════════════════════════════════════════════╝
  `);

  // Initial broadcast
  broadcast();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\\nShutting down gracefully...');
  wss.clients.forEach(client => client.close(1001, 'Server shutting down'));
  httpServer.close(() => process.exit(0));
});
