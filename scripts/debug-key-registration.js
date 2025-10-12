const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Debugging key registration with account:", deployer.address);

  // Connect to deployed contracts
  const quantumTokenAddress = "0x4295119614a75e1a633d0eA3F9Fc73A0019601d8";
  const sphincsAddress = "0xE1D4101FEb8966C818f76b2f93fF79531C881058";
  
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const SPHINCS = await ethers.getContractFactory("SPHINCS");
  
  const quantumToken = QuantumToken.attach(quantumTokenAddress);
  const sphincs = SPHINCS.attach(sphincsAddress);

  // Test parameters
  const mockPublicKey = {
    pub_seed: ethers.utils.randomBytes(32),
    root: ethers.utils.randomBytes(32),
    n: 32,
    h: 16,
    d: 4,
    w: 16
  };

  try {
    console.log("Testing direct SPHINCS registration...");
    const tx1 = await sphincs.registerPublicKey(
      mockPublicKey.pub_seed,
      mockPublicKey.root
    );
    await tx1.wait();
    console.log("✅ Direct SPHINCS registration successful");
    
    // Check if key is registered
    const isRegistered = await sphincs.isPublicKeyRegistered(deployer.address);
    console.log("Key registered in SPHINCS:", isRegistered);
    
  } catch (error) {
    console.error("❌ Direct SPHINCS registration failed:", error.message);
  }

  try {
    console.log("Testing QuantumToken registration...");
    const tx2 = await quantumToken.registerPublicKey(
      mockPublicKey.pub_seed,
      mockPublicKey.root,
      mockPublicKey.n,
      mockPublicKey.h,
      mockPublicKey.d,
      mockPublicKey.w,
      { gasLimit: 500000 }
    );
    await tx2.wait();
    console.log("✅ QuantumToken registration successful");
    
  } catch (error) {
    console.error("❌ QuantumToken registration failed:", error.message);
  }
}

main().catch(console.error);