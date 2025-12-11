# Quantum-Resistant Smart Contracts Using SPHINCS+

A stateless hash-based post-quantum approach for securing blockchain applications.

## Team Members
- **KORIMILLI YASH VENKAT** (42613017 - BCT)
- **KAPARTHI SATHVIK** (42613014 - BCT)

## Domain
**Blockchain Technology**

## Abstract
The explosive development of quantum computing has brought about growing vulnerabilities to classical cryptographic algorithms securing blockchain-based smart contracts, as quantum attacks can undermine commonly employed digital signatures extensively. This project aims to meet the pressing need for quantum-proof security by exploring the incorporation of a stateless hash-based post-quantum digital signature scheme into smart contracts.

This approach relies solely on established cryptographic hash functions and hence provides security against classical and quantum attacks alike and also avoids burdensome state management, which also improves security and scalability. The research entails an exploration of the underlying cryptography, the creation of prototype smart contracts based on this post-quantum signature scheme, and an evaluation of their performance and security in a blockchain environment.

## Project Structure

```
quantum-resistant-smart-contracts/
├── contracts/                 # Smart contracts
│   ├── core/                 # Core SPHINCS+ implementation
│   ├── examples/             # Example applications
│   └── interfaces/           # Contract interfaces
├── lib/                      # Cryptographic libraries
│   ├── crypto/              # Hash functions
│   └── sphincs/             # SPHINCS+ implementation
├── scripts/                  # Deployment & testing scripts
├── test/                     # Test suites
├── frontend/                 # React frontend
└── docs/                     # Documentation

```

## Features

- SPHINCS+ post-quantum digital signatures
- Quantum-resistant token transfers
- Secure multi-signature wallets
- Quantum-proof voting system
- Performance optimizations
- Frontend interface

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npm test

# Deploy locally
npx hardhat node
npm run deploy:local

# Start frontend
cd frontend && npm start
```

## Quantum Signer & Deployer (CLI)

1. Generate a SPHINCS+ keypair and sign a contract/bytecode:

```bash
# example: sign compiled bytecode
node scripts/quantum-signer.js --in ./build/MyContract.bin --out ./keys/mykey.json
```

Output JSON contains: `publicKey`, `secretKey`, `signature`, `messageDigest`, `leafIdx`, `authPath`, `timestamp`.

2. Verify signature off-chain:

```bash
node scripts/quantum-verify.js --key ./keys/mykey.json --in ./build/MyContract.bin
```

3. Deploy to Sepolia and record metadata (requires env vars):

Set environment variables in a `.env` file at project root:

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
DEPLOYER_PRIVATE_KEY=0x...
KEYREGISTRY_ADDRESS=0x...   # deployed KeyRegistry contract address
```

Then run:

```bash
node scripts/quantum-deployer.js --bytecode ./build/MyContract.bin --key ./keys/mykey.json
```

This will send a raw deploy transaction and then call `recordDeployment` on the `KeyRegistry` contract to store `signatureHash` and `pubKey` on-chain.


## Security Analysis

This implementation provides:
- **256-bit quantum security** using SPHINCS+-256s
- **Stateless signatures** avoiding key state management
- **Hash-based security** relying only on collision-resistant hash functions
- **Scalable architecture** suitable for blockchain deployment

## Performance Metrics

- Public Key Size: ~64 bytes
- Signature Size: ~17KB (optimized)
- Verification Time: ~50ms
- Gas Cost: ~500K gas per verification

## License

MIT License - Academic Project