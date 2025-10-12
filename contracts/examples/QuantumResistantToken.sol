// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../core/SPHINCS.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract QuantumResistantToken is ERC20, SPHINCS, Ownable, ReentrancyGuard {
    
    struct TransferData {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
        uint256 deadline;
    }
    
    mapping(bytes32 => bool) private usedTransferHashes;
    mapping(address => uint256) public nonces;
    
    event QuantumResistantTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 nonce
    );
    
    event QuantumResistantApproval(
        address indexed owner,
        address indexed spender,
        uint256 amount,
        uint256 nonce
    );
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    function quantumResistantTransfer(
        address to,
        uint256 amount,
        uint256 deadline,
        Signature calldata signature
    ) external nonReentrant returns (bool) {
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
    
    function quantumResistantApprove(
        address spender,
        uint256 amount,
        uint256 deadline,
        Signature calldata signature
    ) external nonReentrant returns (bool) {
        require(block.timestamp <= deadline, "Transaction expired");
        require(spender != address(0), "Approve to zero address");
        
        bytes32 approvalHash = keccak256(abi.encodePacked(
            "APPROVE",
            msg.sender,
            spender,
            amount,
            nonces[msg.sender],
            deadline
        ));
        
        require(
            this.verifySignature(msg.sender, approvalHash, signature),
            "Invalid quantum-resistant signature"
        );
        
        nonces[msg.sender]++;
        _approve(msg.sender, spender, amount);
        
        emit QuantumResistantApproval(msg.sender, spender, amount, nonces[msg.sender] - 1);
        return true;
    }
    
    function batchQuantumTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 deadline,
        Signature calldata signature
    ) external nonReentrant returns (bool) {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty recipients array");
        require(block.timestamp <= deadline, "Transaction expired");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        bytes32 batchHash = keccak256(abi.encode(
            "BATCH_TRANSFER",
            msg.sender,
            recipients,
            amounts,
            nonces[msg.sender],
            deadline
        ));
        
        require(
            this.verifySignature(msg.sender, batchHash, signature),
            "Invalid quantum-resistant signature"
        );
        
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        
        nonces[msg.sender]++;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Transfer to zero address");
            _transfer(msg.sender, recipients[i], amounts[i]);
            emit QuantumResistantTransfer(msg.sender, recipients[i], amounts[i], nonces[msg.sender] - 1);
        }
        
        return true;
    }
    
    // Gas-optimized balance check
    function getBalanceWithNonce(address account) external view returns (uint256 balance, uint256 userNonce) {
        return (balanceOf(account), nonces[account]);
    }
}
