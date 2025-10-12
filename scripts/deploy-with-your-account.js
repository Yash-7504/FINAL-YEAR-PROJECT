const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts with your account as owner...\n");

  // Your account address
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy SPHINCS verifier
  console.log("1. Deploying SPHINCS verifier...");
  const SPHINCS = await ethers.getContractFactory("SPHINCS");
  const sphincs = await SPHINCS.deploy();
  await sphincs.deployed();
  
  console.log("SPHINCS deployed to:", sphincs.address);

  // Deploy QuantumToken with YOUR address as owner
  console.log("\n2. Deploying QuantumToken with your address as owner...");
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = await QuantumToken.deploy(
    "QuantumCoin",
    "QTC", 
    yourAddress,  // YOU are the owner
    sphincs.address
  );
  await quantumToken.deployed();
  
  console.log("QuantumToken deployed to:", quantumToken.address);
  console.log("Owner set to:", yourAddress);

  // Mint 1000 tokens to your address
  console.log("\n3. Minting 1000 QTC to your address...");
  const mintAmount = ethers.utils.parseEther("1000");
  await quantumToken.mint(yourAddress, mintAmount);
  
  const balance = await quantumToken.balanceOf(yourAddress);
  console.log("Your balance:", ethers.utils.formatEther(balance), "QTC");

  // Update frontend contract addresses
  const deploymentInfo = {
    network: "localhost",
    contracts: {
      SPHINCS: sphincs.address,
      QUANTUM_TOKEN: quantumToken.address
    },
    owner: yourAddress,
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment completed!");
  console.log("Update your frontend with these addresses:");
  console.log("SPHINCS:", sphincs.address);
  console.log("QuantumToken:", quantumToken.address);
  console.log("Owner:", yourAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });