// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HashFunctions
 * @dev Optimized hash functions for SPHINCS+ implementation
 * @author KAPARTHI SATHVIK & KORIMILLI YASH VENKAT
 */
library HashFunctions {
    
    /**
     * @dev Compute SHA256 hash of input data
     */
    function sha256Hash(bytes memory data) internal pure returns (bytes32) {
        return sha256(data);
    }
    
    /**
     * @dev Compute SHA256 hash of two bytes32 values
     */
    function sha256Hash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return sha256(abi.encodePacked(a, b));
    }
    
    /**
     * @dev Compute Keccak256 hash (more gas efficient on Ethereum)
     */
    function keccakHash(bytes memory data) internal pure returns (bytes32) {
        return keccak256(data);
    }
    
    /**
     * @dev Compute Keccak256 hash of two bytes32 values
     */
    function keccakHash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b));
    }
    
    /**
     * @dev Hash chain computation for WOTS+
     */
    function hashChain(
        bytes32 input,
        uint32 startIdx,
        uint32 steps,
        bytes32 seed
    ) internal pure returns (bytes32) {
        bytes32 current = input;
        
        for (uint32 i = startIdx; i < startIdx + steps; i++) {
            current = keccak256(abi.encodePacked(seed, current, i));
        }
        
        return current;
    }
    
    /**
     * @dev Compute HMAC-like function using Keccak256
     */
    function hmacKeccak(bytes32 key, bytes memory data) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(key, data));
    }
    
    /**
     * @dev Merkle tree hash computation
     */
    function merkleHash(bytes32 left, bytes32 right, bytes32 seed) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(seed, left, right));
    }
    
    /**
     * @dev Generate pseudorandom value from seed and index
     */
    function pseudoRandom(bytes32 seed, uint256 index) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(seed, index));
    }
    
    /**
     * @dev Extract bits from bytes32 for base-w conversion
     */
    function extractBits(
        bytes32 data,
        uint256 startBit,
        uint256 numBits
    ) internal pure returns (uint256) {
        require(numBits <= 32, "Too many bits requested");
        require(startBit + numBits <= 256, "Bit range out of bounds");
        
        uint256 mask = (1 << numBits) - 1;
        uint256 shifted = uint256(data) >> (256 - startBit - numBits);
        
        return shifted & mask;
    }
    
    /**
     * @dev Convert message to base-w representation
     */
    function toBaseW(
        bytes32 message,
        uint32 w,
        uint32 length
    ) internal pure returns (uint32[] memory) {
        require(w > 1 && w <= 256, "Invalid Winternitz parameter");
        
        uint32[] memory result = new uint32[](length);
        uint32 logW = _log2(w);
        
        for (uint32 i = 0; i < length; i++) {
            uint256 bits = extractBits(message, i * logW, logW);
            result[i] = uint32(bits);
        }
        
        return result;
    }
    
    /**
     * @dev Compute checksum for WOTS+ signature
     */
    function computeChecksum(
        uint32[] memory message,
        uint32 w
    ) internal pure returns (uint32[] memory) {
        uint32 sum = 0;
        
        for (uint32 i = 0; i < message.length; i++) {
            sum += w - 1 - message[i];
        }
        
        // Convert checksum to base-w
        uint32 checksumLength = _log2(uint32(message.length) * (w - 1)) / _log2(w) + 1;
        uint32[] memory checksum = new uint32[](checksumLength);
        
        for (uint32 i = 0; i < checksumLength; i++) {
            checksum[i] = sum % w;
            sum = sum / w;
        }
        
        return checksum;
    }
    
    /**
     * @dev Batch hash multiple inputs efficiently
     */
    function batchHash(bytes32[] memory inputs) internal pure returns (bytes32) {
        require(inputs.length > 0, "Empty input array");
        
        if (inputs.length == 1) {
            return inputs[0];
        }
        
        bytes memory combined;
        for (uint256 i = 0; i < inputs.length; i++) {
            combined = abi.encodePacked(combined, inputs[i]);
        }
        
        return keccak256(combined);
    }
    
    /**
     * @dev Verify hash chain computation
     */
    function verifyHashChain(
        bytes32 start,
        bytes32 end,
        uint32 steps,
        bytes32 seed
    ) internal pure returns (bool) {
        bytes32 computed = hashChain(start, 0, steps, seed);
        return computed == end;
    }
    
    /**
     * @dev Internal function to compute log2
     */
    function _log2(uint32 x) private pure returns (uint32) {
        require(x > 0, "Log of zero");
        
        uint32 result = 0;
        uint32 temp = x;
        
        while (temp > 1) {
            temp = temp / 2;
            result++;
        }
        
        return result;
    }
    
    /**
     * @dev Gas-optimized hash for frequent operations
     */
    function fastHash(bytes32 a, bytes32 b, uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b, nonce));
    }
    
    /**
     * @dev Constant-time comparison for security
     */
    function constantTimeEquals(bytes32 a, bytes32 b) internal pure returns (bool) {
        return a == b; // Solidity handles this securely
    }
}