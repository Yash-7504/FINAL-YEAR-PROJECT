const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy QuantumToken with initialOwner parameter
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = await QuantumToken.deploy(
    "QuantumCoin",           // Token name
    "QTC",                   // Token symbol  
    deployer.address         // Initial owner (the deployer)
  );

  await quantumToken.deployed();

  console.log("QuantumToken deployed to:", quantumToken.address);
  console.log("Owner set to:", deployer.address);
  
  // Mint some initial tokens to the deployer
  const mintAmount = ethers.utils.parseEther("1000000"); // 1 million tokens
  await quantumToken.mint(deployer.address, mintAmount);
  console.log("Minted 1,000,000 QTC tokens to deployer");

  return quantumToken.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
