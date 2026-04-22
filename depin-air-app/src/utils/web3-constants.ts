// ─── Polygon Amoy Testnet ───
export const AMOY_CHAIN_ID = 80002;
export const AMOY_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';

// Contract addresses — set these via .env once deployed
export const LEDGER_ADDRESS = process.env.NEXT_PUBLIC_LEDGER_ADDRESS || '';
export const AIRQ_ADDRESS = process.env.NEXT_PUBLIC_AIRQ_ADDRESS || '';

/** Returns true only when both contract addresses are real (non-zero, non-empty) */
export function isBlockchainConfigured(): boolean {
  const ZERO = '0x0000000000000000000000000000000000000000';
  return !!(
    LEDGER_ADDRESS &&
    AIRQ_ADDRESS &&
    LEDGER_ADDRESS !== ZERO &&
    AIRQ_ADDRESS !== ZERO
  );
}

export const LEDGER_ABI = [
  "function mintBatch(bytes32 _batchHash, tuple(string city, uint8 sensorCount, uint16 avgAQI, uint16 maxAQI, uint16 minAQI)[] _cityReadings, uint256 _timestamp, uint8 _totalSensors) external",
  "function mintSpike(uint16 _sensorId, uint16 _aqi, bytes32 _spikeHash, uint256 _timestamp) external",
  "function totalBatches() external view returns (uint256)",
  "function totalAnomalies() external view returns (uint256)",
  "event BatchMinted(uint256 indexed batchId, bytes32 indexed batchHash, uint256 blockNumber, uint256 timestamp, uint8 totalSensors)",
  "event AnomalyDetected(uint256 indexed anomalyId, uint16 indexed sensorId, uint16 aqi, bytes32 spikeHash, uint256 timestamp)"
];

export const AIRQ_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount, string calldata reason) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensBurned(address indexed burner, uint256 amount, string reason)"
];
