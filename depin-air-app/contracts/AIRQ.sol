// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AIRQ Token
 * @dev Utility token for DePIN-Air network economy. 
 * Sensors earn for data contribution, companies burn for ESG reports.
 */
contract AIRQ is ERC20, Ownable {
    
    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event RewardDistributed(address indexed operator, uint256 amount);

    constructor() ERC20("DePIN-Air Utility", "AIRQ") Ownable(msg.sender) {
        // Initial supply for pool liquidity and demo
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens to a sensor operator.
     * In production, this would be restricted to the network manager contract.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit RewardDistributed(to, amount);
    }

    /**
     * @dev Public burn function for ESG portal reports.
     */
    function burn(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }

    /**
     * @dev Batch mint rewards to multiple operators (gas efficiency).
     */
    function batchMint(address[] calldata operators, uint256[] calldata amounts) external onlyOwner {
        require(operators.length == amounts.length, "Arrays length mismatch");
        for (uint i = 0; i < operators.length; i++) {
            _mint(operators[i], amounts[i]);
            emit RewardDistributed(operators[i], amounts[i]);
        }
    }
}
