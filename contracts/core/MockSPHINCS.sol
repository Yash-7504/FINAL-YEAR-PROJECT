// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPostQuantumSignature.sol";

contract MockSPHINCS is IPostQuantumSignature {
    mapping(address => PublicKey) private publicKeys;
    mapping(address => uint256) public nonces;
    
    function registerPublicKey(
        bytes32 _pub_seed,
        bytes32 _root,
        uint8 _n,
        uint8 _h,
        uint8 _d,
        uint8 _w
    ) external override {
        require(_root != bytes32(0), "Invalid root");
        
        publicKeys[msg.sender] = PublicKey({
            pub_seed: _pub_seed,
            root: _root,
            n: _n,
            h: _h,
            d: _d,
            w: _w
        });
        
        emit PublicKeyRegistered(msg.sender, _pub_seed, _root);
    }
    
    function verifySignature(
        address signer,
        bytes32 message,
        Signature calldata signature
    ) external view override returns (bool) {
        PublicKey memory pubKey = publicKeys[signer];
        require(pubKey.root != bytes32(0), "Public key not registered");
        
        // Simplified verification: just check message digest reconstruction
        bytes32 expectedDigest = keccak256(abi.encodePacked(
            pubKey.pub_seed, 
            message, 
            signature.randomness
        ));
        
        // For testing: just check if message digest matches
        return expectedDigest == signature.message_digest;
    }
    
    function getPublicKey(address user) external view override returns (PublicKey memory) {
        return publicKeys[user];
    }
    
    function isPublicKeyRegistered(address user) external view override returns (bool) {
        return publicKeys[user].root != bytes32(0);
    }
    
    function getUserNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    function incrementNonce() external {
        nonces[msg.sender]++;
    }
}
