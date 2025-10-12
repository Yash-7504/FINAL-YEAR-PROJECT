const { ethers } = require("hardhat");

async function main() {
  const QUANTUM_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const yourAddress = "0xaA91592fD2e0Ad8575E292AA71a284c6C59ADCfF";
  
  const QuantumToken = await ethers.getContractFactory("QuantumToken");
  const quantumToken = QuantumToken.attach(QUANTUM_TOKEN_ADDRESS);
  
  const balance = await quantumToken.balanceOf(yourAddress);
  const name = await quantumToken.name();
  const symbol = await quantumToken.symbol();
  
  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Your Address:", yourAddress);
  console.log("Your Balance:", ethers.utils.formatEther(balance), symbol);
}

main().catch(console.error);