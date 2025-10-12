const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying Quantum-Resistant Smart Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  try {
    // Deploy SPHINCS verifier first
    console.log("1. Deploying SPHINCS verifier...");
    const SPHINCS = await ethers.getContractFactory("SPHINCS");
    const sphincs = await SPHINCS.deploy();
    await sphincs.deployed();
    const sphincsAddress = sphincs.address;
    
    console.log("SPHINCS deployed to:", sphincsAddress);

    // Deploy QuantumToken
    console.log("\n2. Deploying QuantumToken...");
    const QuantumToken = await ethers.getContractFactory("QuantumToken");
    const quantumToken = await QuantumToken.deploy(
      "QuantumCoin",
      "QTC", 
      deployer.address,
      sphincsAddress
    );
    await quantumToken.deployed();
    const tokenAddress = quantumToken.address;
    
    console.log("QuantumToken deployed to:", tokenAddress);

    // Test basic functionality
    console.log("\n3. Testing basic functionality...");
    
    // Mint some tokens
    const mintAmount = ethers.utils.parseEther("1000");
    await quantumToken.mint(deployer.address, mintAmount);
    console.log("Minted 1000 QTC to deployer");
    
    const balance = await quantumToken.balanceOf(deployer.address);
    console.log("Deployer balance:", ethers.utils.formatEther(balance), "QTC");

    // Load test keys if available
    const keysPath = './test-keys/fixed_keypair_1.json';
    if (fs.existsSync(keysPath)) {
      console.log("\n4. Testing with generated keys...");
      
      const keyData = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
      const publicKey = keyData.publicKey;
      
      // Register public key
      await quantumToken.registerPublicKey(
        `0x${publicKey.pub_seed}`,
        `0x${publicKey.root}`,
        publicKey.n,
        publicKey.h,
        publicKey.d,
        publicKey.w
      );
      
      console.log("Public key registered successfully");
      
      const isRegistered = await quantumToken.isPublicKeyRegistered(deployer.address);
      console.log("Key registration verified:", isRegistered);
    }

    // Save deployment info
    const deploymentInfo = {
      network: "localhost",
      deployer: deployer.address,
      contracts: {
        SPHINCS: sphincsAddress,
        QuantumToken: tokenAddress
      },
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };

    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      `${deploymentsDir}/localhost-fixed.json`, 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\nDeployment completed successfully!");
    console.log("Deployment info saved to: ./deployments/localhost-fixed.json");
    console.log("\nContract Addresses:");
    console.log("   SPHINCS:", sphincsAddress);
    console.log("   QuantumToken:", tokenAddress);
    console.log("\nReady for frontend integration!");

  } catch (error) {
    console.error("Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });