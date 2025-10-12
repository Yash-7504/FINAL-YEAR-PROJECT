// Simple deployment script without Hardhat dependencies
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  // Load environment variables
  require('dotenv').config();
  
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);
  
  console.log("Deploying with wallet:", wallet.address);
  console.log("Balance:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
  
  // Load compiled contract artifacts
  const sphincsArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../artifacts/contracts/core/SPHINCS.sol/SPHINCS.json'))
  );
  
  const tokenArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../artifacts/contracts/QuantumToken.sol/QuantumToken.json'))
  );
  
  // Deploy SPHINCS
  console.log("Deploying SPHINCS...");
  const sphincsFactory = new ethers.ContractFactory(
    sphincsArtifact.abi,
    sphincsArtifact.bytecode,
    wallet
  );
  const sphincs = await sphincsFactory.deploy();
  await sphincs.deployed();
  console.log("SPHINCS deployed to:", sphincs.address);
  
  // Deploy QuantumToken
  console.log("Deploying QuantumToken...");
  const tokenFactory = new ethers.ContractFactory(
    tokenArtifact.abi,
    tokenArtifact.bytecode,
    wallet
  );
  const token = await tokenFactory.deploy("QuantumCoin", "QTC", wallet.address);
  await token.deployed();
  console.log("QuantumToken deployed to:", token.address);
  
  // Configure contracts
  console.log("Setting SPHINCS contract address...");
  await token.setSPHINCSContract(sphincs.address);
  
  // Mint tokens to your address
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  const mintAmount = ethers.utils.parseEther("1000");
  
  console.log("Minting 1000 QTC tokens...");
  await token.mint(yourAddress, mintAmount);
  
  const balance = await token.balanceOf(yourAddress);
  console.log("Balance:", ethers.utils.formatEther(balance), "QTC");
  
  console.log("\n=== UPDATE FRONTEND CONFIG ===");
  console.log("SPHINCS:", sphincs.address);
  console.log("QUANTUM_TOKEN:", token.address);
}

main().catch(console.error);