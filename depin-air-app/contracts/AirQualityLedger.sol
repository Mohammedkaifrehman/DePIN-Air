// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AirQualityLedger
 * @dev Stores immutable proof of air quality data batches and anomalies.
 */
contract AirQualityLedger is Ownable {
    
    struct CityReading {
        string city;
        uint8 sensorCount;
        uint16 avgAQI;
        uint16 maxAQI;
        uint16 minAQI;
    }

    struct Batch {
        bytes32 batchHash;
        uint256 timestamp;
        uint256 blockNumber;
        uint8 totalSensors;
    }

    struct Anomaly {
        uint16 sensorId;
        uint16 aqi;
        bytes32 spikeHash;
        uint256 timestamp;
    }

    uint256 public totalBatches;
    uint256 public totalAnomalies;
    
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Anomaly) public anomalies;
    mapping(string => uint256) public lastBatchByCity;
    bytes32[] public allBatchHashes;

    event BatchMinted(
        uint256 indexed batchId, 
        bytes32 indexed batchHash, 
        uint256 blockNumber, 
        uint256 timestamp, 
        uint8 totalSensors
    );
    
    event AnomalyDetected(
        uint256 indexed anomalyId, 
        uint16 indexed sensorId, 
        uint16 aqi, 
        bytes32 spikeHash, 
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Mints a batch of data to the ledger.
     */
    function mintBatch(
        bytes32 _batchHash, 
        CityReading[] calldata _cityReadings, 
        uint256 _timestamp,
        uint8 _totalSensors
    ) external onlyOwner {
        totalBatches++;
        
        batches[totalBatches] = Batch({
            batchHash: _batchHash,
            timestamp: _timestamp,
            blockNumber: block.number,
            totalSensors: _totalSensors
        });
        
        allBatchHashes.push(_batchHash);
        
        for (uint i = 0; i < _cityReadings.length; i++) {
            lastBatchByCity[_cityReadings[i].city] = totalBatches;
        }
        
        emit BatchMinted(totalBatches, _batchHash, block.number, _timestamp, _totalSensors);
    }

    /**
     * @dev Mints a single anomaly spike immediately.
     */
    function mintSpike(
        uint16 _sensorId, 
        uint16 _aqi, 
        bytes32 _spikeHash, 
        uint256 _timestamp
    ) external onlyOwner {
        totalAnomalies++;
        
        anomalies[totalAnomalies] = Anomaly({
            sensorId: _sensorId,
            aqi: _aqi,
            spikeHash: _spikeHash,
            timestamp: _timestamp
        });
        
        emit AnomalyDetected(totalAnomalies, _sensorId, _aqi, _spikeHash, _timestamp);
    }

    function getBatchCount() external view returns (uint256) {
        return totalBatches;
    }

    function getAllHashes() external view returns (bytes32[] memory) {
        return allBatchHashes;
    }
}
