// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KeyRegistry {
    struct KeyEntry {
        bytes pubKey;
        bool registered;
        uint256 updatedAt;
    }

    mapping(address => KeyEntry) public keys;

    event KeyRegistered(address indexed owner, bytes pubKey);
    event KeyRotated(address indexed owner, bytes oldPubKey, bytes newPubKey);
    event DeploymentRecorded(address indexed deployer, address contractAddress, bytes32 signatureHash, bytes pubKey, uint256 timestamp);

    // Register a new SPHINCS+ public key for the caller
    function registerKey(bytes calldata pubKey) external {
        require(pubKey.length > 0, "pubKey required");
        KeyEntry storage e = keys[msg.sender];
        require(!e.registered, "already registered");

        e.pubKey = pubKey;
        e.registered = true;
        e.updatedAt = block.timestamp;

        emit KeyRegistered(msg.sender, pubKey);
    }

    // Rotate (update) the caller's key
    function rotateKey(bytes calldata newPubKey) external {
        require(newPubKey.length > 0, "newPubKey required");
        KeyEntry storage e = keys[msg.sender];
        require(e.registered, "not registered");

        bytes memory oldKey = e.pubKey;
        e.pubKey = newPubKey;
        e.updatedAt = block.timestamp;

        emit KeyRotated(msg.sender, oldKey, newPubKey);
    }

    // Retrieve the public key for an address
    function getKey(address owner) external view returns (bytes memory) {
        return keys[owner].pubKey;
    }

    // Record a deployment metadata entry. The caller must be the owner of the pubKey provided (i.e. a registered key).
    // This contract does not perform SPHINCS+ signature verification on-chain (too heavy). Instead it ensures the
    // provided pubKey matches the registered pubKey for the caller and stores the signature hash and metadata.
    function recordDeployment(address contractAddress, bytes32 signatureHash, bytes calldata pubKey) external {
        require(keys[msg.sender].registered, "caller key not registered");
        require(keccak256(keys[msg.sender].pubKey) == keccak256(pubKey), "pubKey mismatch");
        require(contractAddress != address(0), "invalid contract address");

        emit DeploymentRecorded(msg.sender, contractAddress, signatureHash, pubKey, block.timestamp);
    }
}
