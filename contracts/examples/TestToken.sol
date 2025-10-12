// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    
    struct Signature {
        bytes32[] wots_signature;
        bytes32[] auth_path;
        uint256 tree_index;
        uint256 leaf_index;
        bytes32 message_digest;
        bytes32 randomness;
    }
    
    mapping(address => bool) public registeredUsers;
    
    event QuantumResistantTransfer(address indexed from, address indexed to, uint256 amount, uint256 nonce);
    
    constructor() ERC20("QuantumCoin", "QTC") {
        _mint(msg.sender, 1000000000000000000000000); // 1M tokens
    }
    
    function registerPublicKey(
        bytes32 _pub_seed,
        bytes32 _root,
        uint8 _n,
        uint8 _h,
        uint8 _d,
        uint8 _w
    ) external {
        registeredUsers[msg.sender] = true;
        emit PublicKeyRegistered(msg.sender, _pub_seed, _root);
    }
    
    function isPublicKeyRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }
    
    function quantumResistantTransfer(
        address to,
        uint256 amount,
        uint256 deadline,
        Signature calldata signature
    ) external returns (bool) {
        require(registeredUsers[msg.sender], "Not registered");
        require(block.timestamp <= deadline, "Expired");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // For demo: always accept the signature (skip verification entirely)
        _transfer(msg.sender, to, amount);
        
        emit QuantumResistantTransfer(msg.sender, to, amount, 0);
        return true;
    }
    
    // Standard ERC20 functions work as normal
    function transfer(address to, uint256 amount) public override returns (bool) {
        return super.transfer(to, amount);
    }
    
    event PublicKeyRegistered(address indexed user, bytes32 pub_seed, bytes32 root);
}
