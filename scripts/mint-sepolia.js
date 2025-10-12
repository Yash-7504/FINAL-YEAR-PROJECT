const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Minting tokens with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Connect to deployed QuantumToken
  const quantumTokenAddress = "0x4295119614a75e1a633d0eA3F9Fc73A0019601d8";
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = QuantumToken.attach(quantumTokenAddress);

  // Mint 1000 QTC tokens to your address
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  const mintAmount = ethers.utils.parseEther("1000");
  
  console.log(`Minting 1000 QTC tokens to ${yourAddress}...`);
  
  try {
    const tx = await quantumToken.mint(yourAddress, mintAmount, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Successfully minted 1000 QTC tokens!");
    
    // Check balance
    const balance = await quantumToken.balanceOf(yourAddress);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} QTC`);
    
  } catch (error) {
    console.error("Minting failed:", error.message);
    console.log("You can mint tokens manually using MetaMask or Remix IDE");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });