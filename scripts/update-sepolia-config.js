// Script to update frontend config with Sepolia contract addresses
const fs = require('fs');
const path = require('path');

// UPDATE THESE ADDRESSES AFTER DEPLOYMENT
const SEPOLIA_CONTRACTS = {
  SPHINCS: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318', // Replace with your deployed address
  QUANTUM_TOKEN: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A' // Replace with your deployed address
};

function updateConfig() {
  const configPath = path.join(__dirname, '../frontend/src/contracts/abis.ts');
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Update Sepolia contract addresses
  content = content.replace(
    /sepolia: \{[\s\S]*?\}/,
    `sepolia: {
    name: 'Sepolia',
    contracts: {
      QUANTUM_TOKEN: '${SEPOLIA_CONTRACTS.QUANTUM_TOKEN}',
      SPHINCS: '${SEPOLIA_CONTRACTS.SPHINCS}'
    }
  }`
  );
  
  fs.writeFileSync(configPath, content);
  console.log('✅ Updated Sepolia contract addresses in frontend config');
  console.log('SPHINCS:', SEPOLIA_CONTRACTS.SPHINCS);
  console.log('QUANTUM_TOKEN:', SEPOLIA_CONTRACTS.QUANTUM_TOKEN);
}

updateConfig();