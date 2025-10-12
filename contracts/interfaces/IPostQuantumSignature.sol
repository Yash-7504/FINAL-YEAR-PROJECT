// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPostQuantumSignature {
    struct PublicKey {
        bytes32 pub_seed;
        bytes32 root;
        uint8 n;
        uint8 h;
        uint8 d;
        uint8 w;
    }
    
    struct Signature {
        bytes32[] wots_signature;
        bytes32[] auth_path;
        uint256 tree_index;
        uint256 leaf_index;
        bytes32 message_digest;
        bytes32 randomness;
    }
    
    event PublicKeyRegistered(
        address indexed user, 
        bytes32 pub_seed, 
        bytes32 root
    );
    
    event SignatureVerified(
        address indexed user, 
        bytes32 message_hash, 
        bool valid
    );
    
    function registerPublicKey(
        bytes32 _pub_seed,
        bytes32 _root,
        uint8 _n,
        uint8 _h,
        uint8 _d,
        uint8 _w
    ) external;
    
    function verifySignature(
        address signer,
        bytes32 message,
        Signature calldata signature
    ) external view returns (bool);
    
    function getPublicKey(address user) external view returns (PublicKey memory);
    
    function isPublicKeyRegistered(address user) external view returns (bool);
}
