const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying to Sepolia and minting tokens...\n");

  // Your account address
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy SPHINCS verifier
  console.log("1. Deploying SPHINCS verifier...");
  const SPHINCS = await ethers.getContractFactory("SPHINCS");
  const sphincs = await SPHINCS.deploy();
  await sphincs.deployed();
  
  console.log("SPHINCS deployed to:", sphincs.address);

  // Deploy QuantumToken
  console.log("\n2. Deploying QuantumToken...");
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = await QuantumToken.deploy(
    "QuantumCoin",
    "QTC", 
    deployer.address, // Deployer as initial owner
    sphincs.address
  );
  await quantumToken.deployed();
  
  console.log("QuantumToken deployed to:", quantumToken.address);

  // Mint tokens to your address
  console.log("\n3. Minting 1000 QTC to your address...");
  const mintAmount = ethers.utils.parseEther("1000");
  const mintTx = await quantumToken.mint(yourAddress, mintAmount);
  await mintTx.wait();
  
  console.log("Tokens minted successfully!");
  
  // Check balance
  const balance = await quantumToken.balanceOf(yourAddress);
  console.log("Your balance:", ethers.utils.formatEther(balance), "QTC");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    contracts: {
      SPHINCS: sphincs.address,
      QUANTUM_TOKEN: quantumToken.address
    },
    recipient: yourAddress,
    mintedAmount: "1000",
    timestamp: new Date().toISOString()
  };

  console.log("\nSepolia deployment completed!");
  console.log("Contract Addresses:");
  console.log("   SPHINCS:", sphincs.address);
  console.log("   QuantumToken:", quantumToken.address);
  console.log("\nAdd to MetaMask:");
  console.log("   Contract Address:", quantumToken.address);
  console.log("   Symbol: QTC");
  console.log("   Decimals: 18");
  console.log("\nUpdate frontend CONTRACT_ADDRESSES with these addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });