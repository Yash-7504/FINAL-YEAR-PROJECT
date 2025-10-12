// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuantumWallet is ERC20, Ownable {
    
    struct QuantumKey {
        bytes32 publicKeySeed;
        bytes32 rootHash;
        bool isRegistered;
    }
    
    mapping(address => QuantumKey) public quantumKeys;
    mapping(address => uint256) public nonces;
    
    event QuantumKeyRegistered(address indexed user, bytes32 publicKeySeed);
    event QuantumTransferExecuted(address indexed from, address indexed to, uint256 amount);
    event SmartContractDeployed(address indexed deployer, address contractAddress, bytes32 quantumSignature);
    
    constructor() ERC20("QuantumToken", "QTC") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens for testing
    }
    
    // Register quantum-resistant public key
    function registerQuantumKey(bytes32 _publicKeySeed, bytes32 _rootHash) external {
        quantumKeys[msg.sender] = QuantumKey({
            publicKeySeed: _publicKeySeed,
            rootHash: _rootHash,
            isRegistered: true
        });
        
        emit QuantumKeyRegistered(msg.sender, _publicKeySeed);
    }
    
    // Quantum-secure token transfer
    function quantumTransfer(
        address to,
        uint256 amount,
        bytes32 quantumSignature
    ) external {
        require(quantumKeys[msg.sender].isRegistered, "Quantum key not registered");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // In production, verify the quantum signature here
        // For now, we trust that frontend generated valid signature
        
        nonces[msg.sender]++;
        _transfer(msg.sender, to, amount);
        
        emit QuantumTransferExecuted(msg.sender, to, amount);
    }
    
    // Record quantum-secure smart contract deployment
    function recordQuantumDeployment(
        address contractAddress,
        bytes32 quantumSignature
    ) external {
        require(quantumKeys[msg.sender].isRegistered, "Quantum key not registered");
        
        emit SmartContractDeployed(msg.sender, contractAddress, quantumSignature);
    }
    
    // Utility functions
    function isQuantumKeyRegistered(address user) external view returns (bool) {
        return quantumKeys[user].isRegistered;
    }
    
    function getUserNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
