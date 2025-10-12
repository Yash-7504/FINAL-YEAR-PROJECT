const { ethers } = require("hardhat");

async function main() {
  const quantumTokenAddress = "0x4295119614a75e1a633d0eA3F9Fc73A0019601d8";
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = QuantumToken.attach(quantumTokenAddress);

  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  
  const isRegistered = await quantumToken.isPublicKeyRegistered(yourAddress);
  console.log(`Key registered for ${yourAddress}:`, isRegistered);
  
  if (isRegistered) {
    const keyData = await quantumToken.getPublicKey(yourAddress);
    console.log("Key data:", {
      pub_seed: keyData[0],
      root: keyData[1],
      n: keyData[2].toString(),
      h: keyData[3].toString(),
      d: keyData[4].toString(),
      w: keyData[5].toString(),
      isRegistered: keyData[6]
    });
  }
}

main().catch(console.error);