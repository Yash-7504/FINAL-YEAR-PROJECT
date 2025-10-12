// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../core/MockSPHINCS.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockQuantumResistantToken is ERC20, MockSPHINCS {
    
    struct TransferData {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
    }
    
    mapping(bytes32 => bool) private usedTransferHashes;
    
    event QuantumResistantTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 nonce
    );
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
    
    function quantumResistantTransfer(
        address to,
        uint256 amount,
        uint256 deadline,
        Signature calldata signature
    ) external returns (bool) {
        require(block.timestamp <= deadline, "Transaction expired");
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Invalid amount");
        
        TransferData memory transferData = TransferData({
            from: msg.sender,
            to: to,
            amount: amount,
            nonce: nonces[msg.sender],
            deadline: deadline
        });
        
        bytes32 transferHash = keccak256(abi.encode(transferData));
        require(!usedTransferHashes[transferHash], "Transfer already executed");
        
        // This now uses MockSPHINCS's simplified verification
        require(
            this.verifySignature(msg.sender, transferHash, signature),
            "Invalid quantum-resistant signature"
        );
        
        usedTransferHashes[transferHash] = true;
        nonces[msg.sender]++;
        
        _transfer(msg.sender, to, amount);
        
        emit QuantumResistantTransfer(msg.sender, to, amount, transferData.nonce);
        return true;
    }
}
