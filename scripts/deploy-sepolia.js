const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts to Sepolia with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Deploy SPHINCS contract first
  console.log("\nDeploying SPHINCS contract...");
  const SPHINCS = await ethers.getContractFactory("SPHINCS");
  const sphincs = await SPHINCS.deploy();
  await sphincs.deployed();
  console.log("SPHINCS deployed to:", sphincs.address);

  // Deploy QuantumToken contract
  console.log("\nDeploying QuantumToken contract...");
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = await QuantumToken.deploy(
    "QuantumCoin",
    "QTC", 
    deployer.address,
    sphincs.address
  );
  await quantumToken.deployed();
  console.log("QuantumToken deployed to:", quantumToken.address);

  // SPHINCS contract address is set in constructor
  console.log("\nSPHINCS contract address set in constructor");

  // Mint 1000 QTC tokens to your address
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  const mintAmount = ethers.utils.parseEther("1000");
  
  console.log(`\nMinting 1000 QTC tokens to ${yourAddress}...`);
  await quantumToken.mint(yourAddress, mintAmount);
  console.log("Successfully minted 1000 QTC tokens!");

  // Verify balances
  const balance = await quantumToken.balanceOf(yourAddress);
  console.log(`Balance of ${yourAddress}:`, ethers.utils.formatEther(balance), "QTC");

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("SPHINCS Contract:", sphincs.address);
  console.log("QuantumToken Contract:", quantumToken.address);
  console.log("Your Address:", yourAddress);
  console.log("Your QTC Balance:", ethers.utils.formatEther(balance), "QTC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });