#!/usr/bin/env node
/**
 * Compile and deploy KeyRegistry.sol using solc-js and ethers (no Hardhat)
 * Usage: SEPOLIA_RPC_URL=... DEPLOYER_PRIVATE_KEY=0x... node scripts/deploy-keyregistry.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

async function main() {
  const RPC = process.env.SEPOLIA_RPC_URL;
  const PK = process.env.DEPLOYER_PRIVATE_KEY;
  if (!RPC || !PK) {
    console.error('Please set SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY in env');
    process.exit(1);
  }

  const contractPath = path.resolve(__dirname, '..', 'contracts', 'KeyRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'KeyRegistry.sol': { content: source }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    for (const e of output.errors) {
      console.error(e.formattedMessage || e.message || e);
    }
    const fatal = output.errors.some(e => e.severity === 'error');
    if (fatal) process.exit(1);
  }

  const contractName = Object.keys(output.contracts['KeyRegistry.sol'])[0];
  const abi = output.contracts['KeyRegistry.sol'][contractName].abi;
  const bytecode = output.contracts['KeyRegistry.sol'][contractName].evm.bytecode.object;

  const provider = new ethers.providers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PK, provider);

  console.log('Deploying KeyRegistry with account:', wallet.address);

  const factory = new ethers.ContractFactory(abi, '0x' + bytecode, wallet);
  const contract = await factory.deploy({ gasLimit: 2000000 });
  console.log('Waiting for deployment...');
  await contract.deployed();
  console.log('KeyRegistry deployed at:', contract.address);
  console.log('Set KEYREGISTRY_ADDRESS env to this value for server usage.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
