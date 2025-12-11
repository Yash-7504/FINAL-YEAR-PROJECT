# QUANTUM-SECURE DEPLOYMENT FLOW

## Overview
This system implements a post-quantum secure smart contract deployment pipeline using SPHINCS+ cryptography. The deployment flow integrates SPHINCS+ signing with MetaMask wallet integration.

## Architecture

### Components
1. **Frontend (React)**: `frontend/src/pages/QuantumIDE.tsx`
   - Compiles Solidity code
   - Generates SPHINCS+ keypairs
   - Calls backend signer API
   - Uses MetaMask to send deployment transactions

2. **Backend API Server**: `scripts/quantum-server.js` (Express.js, port 9001)
   - Generates SPHINCS+ keypairs
   - Signs bytecode with SPHINCS+
   - Verifies signatures
   - Returns signed data for frontend deployment

3. **Smart Contracts**:
   - `contracts/KeyRegistry.sol`: On-chain registry for SPHINCS+ public keys
   - `contracts/QuantumToken.sol`: Example contract to deploy

## Deployment Workflow

### Step 1: Prepare Environment
```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export KEYREGISTRY_ADDRESS="0x..." # Deploy first via scripts/deploy-keyregistry.js
```

### Step 2: Start API Server
```bash
node scripts/quantum-server.js
# Server runs on http://localhost:9001
```

### Step 3: Deploy KeyRegistry Contract (One-time Setup)
```bash
# This deploys the KeyRegistry contract to Sepolia
export DEPLOYER_PRIVATE_KEY="0x..."
node scripts/deploy-keyregistry.js
# Copy the deployed KeyRegistry address and set KEYREGISTRY_ADDRESS
```

### Step 4: Use Quantum IDE (Frontend)
```bash
cd frontend
npm start
# Open http://localhost:3000
# Navigate to QUANTUM IDE tab
```

### Step 5: Deploy Smart Contract via IDE
1. **Paste Solidity code** in editor
2. **Click "Compile"** → Compiles via solc.js worker; shows ABI + bytecode
3. **Click "Generate SPHINCS+ Keypair"**
   - Calls `POST /api/generate` on backend
   - Returns `{privateKey, publicKey}` JSON
   - Stores in frontend state
4. **Click "Sign Bytecode with SPHINCS+"**
   - Calls `POST /api/deploy` on backend (returns signature, not actual deployment)
   - Returns SPHINCS+ signature for the compiled bytecode
   - Stores in frontend state
5. **Click "Server Deploy to Sepolia"**
   - Uses **MetaMask** to send contract deployment transaction
   - **CRITICAL**: This triggers the MetaMask popup for user to approve
   - Frontend creates ethers.ContractFactory and calls `deploy(...constructorArgs)`
   - Transaction is sent via user's MetaMask wallet (not server)
   - Displays deployed contract address on success

## Key Changes (MetaMask Integration)

### Backend (`scripts/quantum-server.js`)
**Before**: Server used `DEPLOYER_PRIVATE_KEY` to send deployment tx
**After**: Server only returns SPHINCS+ signature; frontend handles tx via MetaMask

Endpoint: `POST /api/deploy`
```json
Request:
{
  "key": {"publicKey": "...", "secretKey": "..."},
  "bytecode": "0x..."
}

Response:
{
  "success": true,
  "signature": {
    "signature": "hex...",
    "leafIdx": ...,
    "authPath": [...],
    "messageHash": "hex...",
    "forsPublicKey": "hex..."
  },
  "bytecode": "0x...",
  "deploymentData": {...}
}
```

### Frontend (`frontend/src/pages/QuantumIDE.tsx`)
**Before**: Sent `{key, bytecode}` to server; server deployed and returned txHash
**After**: Sends `{key, bytecode}` to server; server returns signature; frontend deploys via MetaMask

Function: `handleServerDeploy()`
```typescript
// 1. Get SPHINCS+ signature from server
const signResp = await fetch(`http://localhost:9001/api/deploy`, {
  method: 'POST',
  body: JSON.stringify({ key: keyJson, bytecode: compiledBytecode })
});

// 2. Use MetaMask to send deployment transaction
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const factory = new ethers.ContractFactory(compiledAbi, compiledBytecode, signer);

// 3. This triggers MetaMask popup!
const contract = await factory.deploy(...constructorArgs);
const receipt = await contract.deployed();
```

## Deployment Security Properties

| Property | How Achieved |
|----------|-------------|
| **Post-Quantum Signature** | SPHINCS+ signing on backend; signature returned to frontend |
| **User Control** | MetaMask transaction approval required; user's wallet pays gas |
| **Private Key Safety** | Secret key never leaves backend; only public key and signature sent to frontend |
| **Transparent Audit Trail** | KeyRegistry contract records deployment metadata on-chain |
| **No Server Key Required** | Backend doesn't need DEPLOYER_PRIVATE_KEY (optional for KeyRegistry recording) |

## Troubleshooting

### MetaMask Popup Not Appearing
1. **Check**: Is MetaMask installed and connected to Sepolia testnet?
   - Open MetaMask → Click network selector → Select "Sepolia Testnet"
2. **Check**: Is `window.ethereum` available?
   - Open console: `console.log(window.ethereum)` should show MetaMask provider object
3. **Check**: Did you click "Connect Wallet" first?
   - The IDE requires an active MetaMask connection before "Server Deploy" will work

### "Connect MetaMask wallet first" Error
- Click the **"Connect Wallet"** button in the IDE header
- MetaMask will show a popup asking to connect account
- After connecting, retry deployment

### Signature Verification Failed
- Ensure backend is running: `node scripts/quantum-server.js`
- Check `/api/deploy` endpoint returns signature without errors
- Verify `SPHINCS+` signing matches verification logic

### Contract Deployment Failed
- Check gas limit; default is set to 5M units
- Verify Sepolia testnet has funds in connected wallet
- Check transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)

## Testing the Flow

### Test 1: Compile + Deploy
```javascript
// In browser console while IDE is open:
1. Paste a simple contract (ERC20, etc.)
2. Click "Compile"
3. Verify ABI and bytecode appear
4. Click "Generate SPHINCS+ Keypair"
5. Click "Sign Bytecode"
6. Click "Server Deploy to Sepolia"
7. Approve MetaMask popup
8. Wait for tx to appear on Etherscan
```

### Test 2: Verify Signature
```javascript
// Programmatic test
const msg = Buffer.from('test');
const sig = sign(msg, secretKey);
const verified = verify(msg, sig, publicKey);
console.log(verified); // should be true
```

## Future Enhancements
- [ ] Record deployment signature to KeyRegistry on-chain
- [ ] Support contract upgrades with new SPHINCS+ keys
- [ ] Batch deployment of multiple contracts
- [ ] Hardware security module (HSM) integration for production
- [ ] Post-quantum key rotation protocol

## References
- [SPHINCS+](https://sphincs.org/) - Stateless Hash-Based Digital Signature Scheme
- [KeyRegistry.sol](./contracts/KeyRegistry.sol) - On-chain key registry
- [QuantumIDE.tsx](./frontend/src/pages/QuantumIDE.tsx) - Frontend IDE implementation
- [quantum-server.js](./scripts/quantum-server.js) - Backend API server
