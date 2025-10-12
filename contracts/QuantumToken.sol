// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./core/SPHINCS.sol";

/**
 * @title QuantumToken
 * @dev ERC20 token with quantum-resistant SPHINCS+ signatures
 * @author KORIMILLI YASH VENKAT
 */
contract QuantumToken is ERC20, Ownable, ReentrancyGuard {
    
    SPHINCS public immutable sphincsVerifier;
    
    struct PublicKey {
        bytes32 pub_seed;
        bytes32 root;
        uint32 n;
        uint32 h;
        uint32 d;
        uint32 w;
        bool isRegistered;
    }
    
    mapping(address => PublicKey) public publicKeys;
    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public usedSignatures;
    
    event PublicKeyRegistered(address indexed user, bytes32 pub_seed, bytes32 root);
    event QuantumTransferExecuted(address indexed from, address indexed to, uint256 amount, uint256 nonce);
    event SignatureUsed(bytes32 indexed signatureHash);
    
    constructor(
        string memory name, 
        string memory symbol,
        address initialOwner,
        address _sphincsVerifier
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(_sphincsVerifier != address(0), "Invalid SPHINCS verifier");
        sphincsVerifier = SPHINCS(_sphincsVerifier);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        _mint(to, amount);
    }
    
    function registerPublicKey(
        bytes32 _pub_seed,
        bytes32 _root,
        uint32 _n,
        uint32 _h,
        uint32 _d,
        uint32 _w
    ) external {
        require(_pub_seed != bytes32(0), "Invalid pub_seed");
        require(_root != bytes32(0), "Invalid root");
        require(_n == 32, "Only n=32 supported");
        require(_h == 8 || _h == 16 || _h == 32, "Invalid h parameter");
        require(_d == 4, "Only d=4 supported");
        require(_w == 16, "Only w=16 supported");
        
        publicKeys[msg.sender] = PublicKey({
            pub_seed: _pub_seed,
            root: _root,
            n: _n,
            h: _h,
            d: _d,
            w: _w,
            isRegistered: true
        });
        
        // Also register with SPHINCS verifier
        sphincsVerifier.registerPublicKey(_pub_seed, _root);
        
        emit PublicKeyRegistered(msg.sender, _pub_seed, _root);
    }
    
    function quantumTransfer(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature,
        bytes32[] calldata authPath
    ) external nonReentrant {
        // Basic validation
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(nonce == nonces[msg.sender], "Invalid nonce");
        require(publicKeys[msg.sender].isRegistered, "Public key not registered");
        
        // Check signature hasn't been used
        bytes32 sigHash = keccak256(signature);
        require(!usedSignatures[sigHash], "Signature already used");
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender, to, amount, nonce, block.chainid, address(this)
        ));
        
        // Verify SPHINCS+ signature
        uint256 leafIdx = uint256(keccak256(abi.encodePacked(messageHash, nonce))) % (2 ** publicKeys[msg.sender].h);
        
        SPHINCS.Signature memory sphincsSignature = SPHINCS.Signature({
            signature: signature,
            leafIdx: leafIdx,
            authPath: authPath
        });
        
        bool isValid = sphincsVerifier.verifySignature(msg.sender, messageHash, sphincsSignature);
        require(isValid, "Invalid quantum signature");
        
        // Mark signature as used and execute transfer
        usedSignatures[sigHash] = true;
        nonces[msg.sender]++;
        _transfer(msg.sender, to, amount);
        
        emit SignatureUsed(sigHash);
        emit QuantumTransferExecuted(msg.sender, to, amount, nonce);
    }
    
    function isPublicKeyRegistered(address user) external view returns (bool) {
        return publicKeys[user].isRegistered;
    }
    
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    function getPublicKey(address user) external view returns (
        bytes32 pub_seed,
        bytes32 root,
        uint32 n,
        uint32 h,
        uint32 d,
        uint32 w,
        bool isRegistered
    ) {
        PublicKey memory key = publicKeys[user];
        return (key.pub_seed, key.root, key.n, key.h, key.d, key.w, key.isRegistered);
    }
    
    function isSignatureUsed(bytes calldata signature) external view returns (bool) {
        return usedSignatures[keccak256(signature)];
    }
}