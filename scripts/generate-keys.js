const SPHINCSKeyGen = require('../lib/sphincs/key-generation');
const SPHINCSSignature = require('../lib/sphincs/signature-generation');
const SPHINCSVerifier = require('../lib/sphincs/signature-verification');
const fs = require('fs');

async function main() {
  console.log("Generating SPHINCS+ Key Pairs for Testing...\n");

  const keyGen = new SPHINCSKeyGen();
  
  // Generate multiple key pairs for testing
  const numKeyPairs = 3;
  const keyPairs = [];

  console.log(`Generating ${numKeyPairs} key pairs...`);
  
  for (let i = 0; i < numKeyPairs; i++) {
    console.log(`Generating key pair ${i + 1}/${numKeyPairs}...`);
    const keyPair = keyGen.generateKeyPair();
    keyPairs.push(keyPair);
  }

  console.log("Key generation completed!\n");

  // Test signature generation and verification
  console.log("Testing signature generation and verification...");
  
  const testKeyPair = keyPairs[0];
  const message = "Hello, quantum-resistant world!";
  
  console.log("Signing message:", message);
  const signer = new SPHINCSSignature(testKeyPair.privateKey);
  const signature = signer.sign(Buffer.from(message));
  
  console.log("Verifying signature...");
  const verifier = new SPHINCSVerifier(testKeyPair.publicKey);
  const isValid = verifier.verify(Buffer.from(message), signature);
  
  console.log("Signature valid:", isValid ? "Yes" : "No");

  // Calculate statistics
  const stats = {
    publicKeySize: JSON.stringify(testKeyPair.publicKey).length,
    privateKeySize: JSON.stringify(testKeyPair.privateKey).length,
    signatureSize: JSON.stringify(signature).length,
    securityLevel: testKeyPair.publicKey.n * 8,
    treeHeight: testKeyPair.publicKey.h,
    layers: testKeyPair.publicKey.d,
    winternitzParameter: testKeyPair.publicKey.w
  };

  console.log("\nKey and Signature Statistics:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Security Level: ${stats.securityLevel} bits`);
  console.log(`Tree Height: ${stats.treeHeight}`);
  console.log(`Layers: ${stats.layers}`);
  console.log(`Winternitz Parameter: ${stats.winternitzParameter}`);
  console.log(`Public Key Size: ${stats.publicKeySize} bytes`);
  console.log(`Private Key Size: ${stats.privateKeySize} bytes`);
  console.log(`Signature Size: ${stats.signatureSize} bytes`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save keys to files
  const keysDir = './test-keys';
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
  }

  keyPairs.forEach((keyPair, index) => {
    const filename = `${keysDir}/keypair_${index + 1}.json`;
    fs.writeFileSync(filename, JSON.stringify(keyPair, null, 2));
    console.log(`Key pair ${index + 1} saved to: ${filename}`);
  });

  // Save test data
  const testData = {
    message,
    signature,
    isValid,
    stats,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(`${keysDir}/test_results.json`, JSON.stringify(testData, null, 2));
  console.log(`Test results saved to: ${keysDir}/test_results.json`);

  console.log("\nKey generation and testing completed!");
  console.log("Use these keys for testing the smart contracts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(" Key generation failed:", error);
    process.exit(1);
  });
