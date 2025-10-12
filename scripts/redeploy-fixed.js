const hre = require("hardhat");

async function main() {
  console.log("Redeploying without library linking...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  try {
    // Deploy HashFunctions first (but don't link it)
    console.log("Deploying HashFunctions...");
    const HashFunctions = await hre.ethers.getContractFactory("HashFunctions");
    const hashFunctions = await HashFunctions.deploy();
    await hashFunctions.deployed();
    console.log("HashFunctions deployed to:", hashFunctions.address);

    // Deploy SPHINCS without library linking
    console.log("Deploying SPHINCS without library linking...");
    const SPHINCS = await hre.ethers.getContractFactory("SPHINCS");
    const sphincs = await SPHINCS.deploy();
    await sphincs.deployed();
    console.log("SPHINCS deployed to:", sphincs.address);

    // Test basic functionality immediately
    console.log("Testing SPHINCS functionality...");
    const testResult = await sphincs.isPublicKeyRegistered(deployer.address);
    console.log("isPublicKeyRegistered test:", testResult);

    // Deploy Token without library linking
    console.log("Deploying Token...");
    const Token = await hre.ethers.getContractFactory("QuantumResistantToken");
    const token = await Token.deploy("QuantumCoin", "QTC", hre.ethers.utils.parseEther("1000000"));
    await token.deployed();
    console.log("Token deployed to:", token.address);

    // Test token functionality
    console.log("Testing Token functionality...");
    const tokenTest = await token.isPublicKeyRegistered(deployer.address);
    console.log("Token isPublicKeyRegistered test:", tokenTest);

    // Test a simple registration
    console.log("Testing public key registration...");
    const testPubSeed = "0x" + "a".repeat(64);
    const testRoot = "0x" + "b".repeat(64);
    await sphincs.registerPublicKey(testPubSeed, testRoot, 32, 32, 4, 16);
    console.log("Registration test: SUCCESS");

    console.log("\n=== NEW ADDRESSES ===");
    console.log("SPHINCS:", sphincs.address);
    console.log("Token:", token.address);
    
    return { sphincs: sphincs.address, token: token.address };

  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then((addresses) => {
    console.log("Success! Use these new addresses:");
    console.log(`export SPHINCS_ADDR=${addresses.sphincs}`);
    console.log(`export TOKEN_ADDR=${addresses.token}`);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
