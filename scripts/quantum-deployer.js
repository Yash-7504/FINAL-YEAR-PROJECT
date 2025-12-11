#!/usr/bin/env node
/**
 * Quantum Deployer (plain ethers.js)
 * Requires environment variables:
 *  - SEPOLIA_RPC_URL  (e.g. https://sepolia.infura.io/v3/...) 
 *  - DEPLOYER_PRIVATE_KEY (ETH key to pay gas)
 *  - KEYREGISTRY_ADDRESS (address of deployed KeyRegistry contract)
 * Usage:
 *  node scripts/quantum-deployer.js --bytecode ./build/MyContract.bin --key ./keys/key.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const argv = require('minimist')(process.argv.slice(2));
const bytecodeFile = argv.bytecode || argv.b;
const keyFile = argv.key || argv.k;

if (!bytecodeFile || !keyFile) {
  console.error('Missing --bytecode and/or --key arguments');
  process.exit(1);
}

const RPC = process.env.SEPOLIA_RPC_URL;
const DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY;
const KEYREGISTRY_ADDRESS = process.env.KEYREGISTRY_ADDRESS;

if (!RPC || !DEPLOYER_PK || !KEYREGISTRY_ADDRESS) {
  console.error('Please set SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY and KEYREGISTRY_ADDRESS in env');
  process.exit(1);
}

const keyJson = JSON.parse(fs.readFileSync(keyFile));
const pubKeyString = keyJson.publicKey;

// We stored publicKey as "pub_seed:root" in signer; convert back to bytes
function pubKeyStringToBytes(s) {
  const parts = s.split(':');
  if (parts.length !== 2) return Buffer.from(s, 'hex');
  const pub_seed = Buffer.from(parts[0], 'hex');
  const root = Buffer.from(parts[1], 'hex');
  return Buffer.concat([pub_seed, root]);
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(DEPLOYER_PK, provider);

  // Read bytecode
  const bytecode = fs.readFileSync(bytecodeFile);

  console.log('Sending raw contract deployment transaction...');

  const tx = {
    to: null,
    value: 0,
    data: '0x' + bytecode.toString('hex'),
    gasLimit: 5000000
  };

  const sent = await wallet.sendTransaction(tx);
  console.log('Deployment tx hash:', sent.hash);
  const receipt = await sent.wait();
  console.log('Contract deployed at:', receipt.contractAddress || '(create contract)');

  const deployedAddress = receipt.contractAddress || ethers.utils.getContractAddress({from: wallet.address, nonce: receipt.transactionIndex});

  // Record deployment metadata in KeyRegistry
  const keyRegistryAbi = [
    'function recordDeployment(address contractAddress, bytes32 signatureHash, bytes pubKey) external',
    'function registerKey(bytes pubKey) external',
    'function getKey(address owner) view returns (bytes)'
  ];

  const kr = new ethers.Contract(KEYREGISTRY_ADDRESS, keyRegistryAbi, wallet);

  // Prepare pubKey bytes
  const pubKeyBytes = pubKeyStringToBytes(pubKeyString);

  // Compute signature hash from signer JSON (if present)
  const signatureHex = keyJson.signature || '';
  const signatureHash = ethers.utils.keccak256('0x' + signatureHex);

  // Ensure key is registered; try to register if not
  try {
    const existing = await kr.getKey(wallet.address);
    if (!existing || existing.length === 0) {
      console.log('Registering public key in KeyRegistry for deployer address');
      const registerTx = await kr.registerKey(pubKeyBytes);
      await registerTx.wait();
    }
  } catch (err) {
    // If getKey queried for the wrong address, just attempt register
    console.log('Attempting to register key (fallback)');
    const registerTx = await kr.registerKey(pubKeyBytes);
    await registerTx.wait();
  }

  // Record deployment
  const recTx = await kr.recordDeployment(deployedAddress, signatureHash, pubKeyBytes);
  const recRcpt = await recTx.wait();
  console.log('Deployment metadata recorded in KeyRegistry, tx:', recRcpt.transactionHash);

  // Print Etherscan link (Sepolia)
  console.log('View deployment at:', `https://sepolia.etherscan.io/tx/${sent.hash}`);

}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
