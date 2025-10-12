const hre = require("hardhat");

async function main() {
  console.log("Deploying MockSPHINCS and MockToken...");
  
  const [deployer] = await hre.ethers.getSigners();

  // Deploy MockSPHINCS
  const MockSPHINCS = await hre.ethers.getContractFactory("MockSPHINCS");
  const sphincs = await MockSPHINCS.deploy();
  await sphincs.deployed();
  console.log("MockSPHINCS deployed to:", sphincs.address);

  // Deploy Token using MockSPHINCS
  const MockToken = await hre.ethers.getContractFactory("QuantumResistantToken");
  const token = await MockToken.deploy("QuantumCoin", "QTC", hre.ethers.utils.parseEther("1000000"));
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Test basic functionality
  const testPubSeed = "0x" + "a".repeat(64);
  const testRoot = "0x" + "b".repeat(64);
  await sphincs.registerPublicKey(testPubSeed, testRoot, 32, 32, 4, 16);
  console.log("Registration test: SUCCESS");

  console.log("\n=== USE THESE ADDRESSES ===");
  console.log(`export SPHINCS_ADDR=${sphincs.address}`);
  console.log(`export TOKEN_ADDR=${token.address}`);
}

main().catch(console.error);
