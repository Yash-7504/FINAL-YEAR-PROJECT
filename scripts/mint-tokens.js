const { ethers } = require("hardhat");

async function main() {
  console.log("Minting QTC tokens...\n");

  // Your account address
  const recipientAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  
  // Contract addresses (update these with your deployed contract addresses)
  const QUANTUM_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Update this
  
  const [deployer] = await ethers.getSigners();
  console.log("Minting with account:", deployer.address);

  // Connect to the deployed contract
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = QuantumToken.attach(QUANTUM_TOKEN_ADDRESS);

  // Mint 1000 QTC tokens
  const mintAmount = ethers.utils.parseEther("1000");
  
  console.log(`Minting ${ethers.utils.formatEther(mintAmount)} QTC to ${recipientAddress}...`);
  
  const tx = await quantumToken.mint(recipientAddress, mintAmount);
  await tx.wait();
  
  console.log("Tokens minted successfully!");
  console.log("Transaction hash:", tx.hash);
  
  // Check balance
  const balance = await quantumToken.balanceOf(recipientAddress);
  console.log(`New balance: ${ethers.utils.formatEther(balance)} QTC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Minting failed:", error);
    process.exit(1);
  });