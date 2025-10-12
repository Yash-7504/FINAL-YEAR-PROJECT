const hre = require("hardhat");

async function main() {
  console.log("Deploying TestToken (no signature verification)...");
  
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const token = await TestToken.deploy();
  await token.deployed();
  
  console.log("TestToken deployed to:", token.address);
  console.log("This contract accepts all quantum transfers for testing");
  console.log(`Update your frontend tokenAddress to: "${token.address}"`);
}

main().catch(console.error);
