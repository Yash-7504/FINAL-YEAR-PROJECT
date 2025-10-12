export const QUANTUM_TOKEN_ABI = [
  "function registerPublicKey(bytes32 _pub_seed, bytes32 _root, uint32 _n, uint32 _h, uint32 _d, uint32 _w) external",
  "function isPublicKeyRegistered(address user) external view returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function getNonce(address user) external view returns (uint256)",
  "function quantumTransfer(address to, uint256 amount, uint256 nonce, bytes calldata signature, bytes32[] calldata authPath) external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function mint(address to, uint256 amount) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event QuantumTransferExecuted(address indexed from, address indexed to, uint256 amount, uint256 nonce)"
];

export const SPHINCS_ABI = [
  "function registerPublicKey(bytes32 _pub_seed, bytes32 _root, uint8 _n, uint8 _h, uint8 _d, uint8 _w) external",
  "function isPublicKeyRegistered(address user) external view returns (bool)",
  "function getPublicKey(address user) external view returns (tuple(bytes32 pub_seed, bytes32 root, uint8 n, uint8 h, uint8 d, uint8 w))",
  "function verifySignature(address signer, bytes32 message, tuple(bytes32[] wots_signature, bytes32[] auth_path, uint256 tree_index, uint256 leaf_index, bytes32 message_digest, bytes32 randomness) signature) external view returns (bool)",
  "event PublicKeyRegistered(address indexed user, bytes32 pub_seed, bytes32 root)"
];

export const NETWORKS = {
  localhost: {
    name: 'Localhost',
    contracts: {
      QUANTUM_TOKEN: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      SPHINCS: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  },
  sepolia: {
    name: 'Sepolia',
    contracts: {
      QUANTUM_TOKEN: '0x4295119614a75e1a633d0eA3F9Fc73A0019601d8',
      SPHINCS: '0xE1D4101FEb8966C818f76b2f93fF79531C881058'
    }
  }
};
