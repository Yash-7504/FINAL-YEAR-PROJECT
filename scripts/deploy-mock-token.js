const hre = require("hardhat");

async function main() {
  console.log("Deploying MockQuantumResistantToken...");
  
  const [deployer] = await hre.ethers.getSigners();

  // Deploy MockQuantumResistantToken
  const MockToken = await hre.ethers.getContractFactory("MockQuantumResistantToken");
  const token = await MockToken.deploy("QuantumCoin", "QTC", hre.ethers.utils.parseEther("1000000"));
  await token.deployed();
  console.log("MockQuantumResistantToken deployed to:", token.address);

  // Test basic functionality
  const testPubSeed = "0x" + "a".repeat(64);
  const testRoot = "0x" + "b".repeat(64);
  await token.registerPublicKey(testPubSeed, testRoot, 32, 32, 4, 16);
  console.log("Registration test: SUCCESS");

  console.log("\n=== USE THIS ADDRESS ===");
  console.log(`export TOKEN_ADDR=${token.address}`);
  console.log("Keep the existing SPHINCS_ADDR");
}

main().catch(console.error);
