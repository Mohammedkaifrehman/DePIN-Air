const { WebSocketServer } = require('ws');
const http = require('http');
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// ─── Blockchain Configuration ───
// These should ideally be in .env
const RPC_URL = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const LEDGER_ADDRESS = process.env.LEDGER_ADDRESS;

let wallet = null;
let ledgerContract = null;

if (PRIVATE_KEY && LEDGER_ADDRESS) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const abi = [
      "function mintBatch(bytes32 _batchHash, tuple(string city, uint8 sensorCount, uint16 avgAQI, uint16 maxAQI, uint16 minAQI)[] _cityReadings, uint256 _timestamp, uint8 _totalSensors) external",
      "function mintSpike(uint16 _sensorId, uint16 _aqi, bytes32 _spikeHash, uint256 _timestamp) external"
    ];
    ledgerContract = new ethers.Contract(LEDGER_ADDRESS, abi, wallet);
    console.log(`\x1b[32m⛓ Blockchain integrated. Operator: ${wallet.address}\x1b[0m`);
  } catch (e) {
    console.error('\x1b[31mFailed to initialize blockchain connection:\x1b[0m', e.message);
  }
} else {
  console.log('\x1b[33m⚠️ Blockchain credentials missing. Running in simulation-only mode.\x1b[0m');
}

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
let spikeQueue = [];          
let activeSpikeCountdown = new Map(); 

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

// ─── Gaussian Random ───
function gaussianRandom(mean = 0, sigma = 12) {
  let u1 = Math.random();
  let u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * sigma;
}

// ─── Keccak256 Hash ───
function computeBatchHash(readings) {
  const data = JSON.stringify(readings.map(r => ({
    id: r.sensorId,
    aqi: r.aqi,
    ts: r.timestamp,
  })));
  // Use ethers if possible for real Keccak256, else fallback to SHA256 bytes
  if (typeof ethers !== 'undefined' && ethers.keccak256) {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
  return '0x' + createHash('sha256').update(data).digest('hex');
}

function getAqiColor(aqi) {
  if (aqi <= 50) return '#1D9E75';
  if (aqi <= 100) return '#EF9F27';
  if (aqi <= 150) return '#D85A30';
  if (aqi <= 200) return '#E24B4A';
  return '#7F77DD';
}

// ─── Spike Management ───
let naturalSpikeTimer = 0;
const NATURAL_SPIKE_INTERVAL = 18; 

function selectRandomSensorForSpike() {
  return sensors[Math.floor(Math.random() * sensors.length)].id;
}

// ─── Blockchain Sync ───
async function mintBatchOnChain(batch) {
  if (!ledgerContract) return;

  try {
    const cityMap = new Map();
    batch.readings.forEach(r => {
      const data = cityMap.get(r.city) || { city: r.city, sensorCount: 0, sum: 0, max: 0, min: 999 };
      data.sensorCount++;
      data.sum += r.aqi;
      data.max = Math.max(data.max, r.aqi);
      data.min = Math.min(data.min, r.aqi);
      cityMap.set(r.city, data);
    });

    const cityReadings = Array.from(cityMap.values()).map(c => ({
      city: c.city,
      sensorCount: c.sensorCount,
      avgAQI: Math.round(c.sum / c.sensorCount),
      maxAQI: Math.round(c.max),
      minAQI: Math.round(c.min)
    }));

    const tx = await ledgerContract.mintBatch(
      batch.batchHash,
      cityReadings,
      Math.floor(batch.timestamp / 1000),
      batch.activeSensors
    );
    console.log(`\x1b[32m✅ Batch #${batch.seq} minted on-chain: ${tx.hash}\x1b[0m`);
    // No await here to not block the simulator loop
  } catch (e) {
    console.error(`\x1b[31m❌ Failed to mint batch #${batch.seq}:\x1b[0m`, e.message);
  }
}

async function mintSpikeOnChain(anomaly) {
  if (!ledgerContract) return;

  try {
    const tx = await ledgerContract.mintSpike(
      anomaly.sensorId,
      Math.round(anomaly.aqi),
      anomaly.spikeHash,
      Math.floor(anomaly.timestamp / 1000)
    );
    console.log(`\x1b[35m🚨 Anomaly #${anomaly.sensorId} minted on-chain: ${tx.hash}\x1b[0m`);
  } catch (e) {
    console.error(`\x1b[31m❌ Failed to mint spike for #${anomaly.sensorId}:\x1b[0m`, e.message);
  }
}

// ─── Generate Readings ───
function generateReadings() {
  const now = Date.now();
  naturalSpikeTimer++;

  if (naturalSpikeTimer >= NATURAL_SPIKE_INTERVAL) {
    naturalSpikeTimer = 0;
    const spikeId = selectRandomSensorForSpike();
    if (!activeSpikeCountdown.has(spikeId)) {
      activeSpikeCountdown.set(spikeId, 3);
      console.log(`\x1b[33m⚡ Natural spike triggered on sensor #${spikeId}\x1b[0m`);
    }
  }

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

    if (activeSpikeCountdown.has(sensor.id)) {
      const remaining = activeSpikeCountdown.get(sensor.id);
      if (remaining > 0) {
        state.aqi = 240 + Math.random() * 50;
        isSpike = true;
        activeSpikeCountdown.set(sensor.id, remaining - 1);
      } else {
        state.aqi = state.aqi * 0.7 + baseAqi * 0.3;
        if (Math.abs(state.aqi - baseAqi) < 15) {
          activeSpikeCountdown.delete(sensor.id);
        }
      }
    } else {
      state.aqi = state.aqi * 0.85 + baseAqi * 0.15 + gaussianRandom(0, 12);
    }

    state.aqi = Math.max(10, Math.min(500, state.aqi));
    state.pm25 = state.aqi * 0.68 + gaussianRandom(0, 5);
    state.no2 = 15 + state.aqi * 0.18 + gaussianRandom(0, 3);
    state.co2 = 320 + state.aqi * 0.5 + gaussianRandom(0, 8);

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
    activeSensors: 97 + Math.floor(Math.random() * 7), 
  };
}

// ─── Anomaly Detection ───
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

    if (zscore > 2.5 || delta > 80 || r.aqi > 220) {
      const anomaly = {
        sensorId: r.sensorId,
        city: r.city,
        aqi: r.aqi,
        delta: Math.round(delta),
        zscore: Math.round(zscore * 100) / 100,
        mean: Math.round(mean),
        stddev: Math.round(stddev * 10) / 10,
        type: zscore > 2.5 ? 'Z_SCORE' : delta > 80 ? 'DELTA' : 'ABSOLUTE',
        timestamp: r.timestamp,
        spikeHash: ethers.keccak256(ethers.toUtf8Bytes(`spike-${r.sensorId}-${r.aqi}-${r.timestamp}`)),
      };
      anomalies.push(anomaly);
      
      // Trigger instant blockchain mint for spike
      mintSpikeOnChain(anomaly);
    }
  });

  return anomalies;
}

// ─── HTTP + WebSocket Server ───
const PORT = process.env.PORT || 8080;

const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

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

  if (url.pathname === '/api/spike' && req.method === 'POST') {
    const sensorId = parseInt(url.searchParams.get('id') || '-1');
    const targetId = (sensorId >= 0 && sensorId < 100) ? sensorId : selectRandomSensorForSpike();
    spikeQueue.push(targetId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, sensorId: targetId, message: `Spike queued for sensor #${targetId}` }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  console.log(`\x1b[32m+ Client connected (total: ${wss.clients.size})\x1b[0m`);
  ws.on('close', () => console.log(`\x1b[31m- Client disconnected (total: ${wss.clients.size})\x1b[0m`));
  ws.on('error', (err) => console.error('WebSocket error:', err.message));
});

// ─── Broadcast Loop ───
function broadcast() {
  const batch = generateReadings();
  const anomalies = detectAnomalies(batch.readings);

  const payload = JSON.stringify({
    type: 'SENSOR_UPDATE',
    ...batch,
    anomalies,
  });

  const buf = Buffer.from(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(buf);
  });

  // Mint batch every 30s (every 6th broadcast at 5s interval)
  if (batch.seq % 6 === 0) {
    mintBatchOnChain(batch);
  }

  const avgAqi = Math.round(batch.readings.reduce((sum, r) => sum + r.aqi, 0) / batch.readings.length);
  const time = new Date().toISOString().slice(11, 19);
  console.log(`[${time}] Batch #${batch.seq} | AQI avg: ${avgAqi} | Sensors: ${batch.activeSensors} | Clients: ${wss.clients.size}`);
}

setInterval(broadcast, 5000);

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     🌍 DePIN-Air Sensor Simulator v2.0       ║
║     WebSocket: ws://localhost:${PORT}           ║
║     Features:  On-chain Minting (Mumbai)      ║
╚═══════════════════════════════════════════════╝
  `);
  broadcast();
});

process.on('SIGTERM', () => {
  wss.clients.forEach(client => client.close(1001, 'Server shutting down'));
  httpServer.close(() => process.exit(0));
});
