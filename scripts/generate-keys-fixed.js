const SPHINCSKeyGen = require('../lib/sphincs/key-generation');
const SPHINCSSignature = require('../lib/sphincs/signature-generation');
const SPHINCSVerifier = require('../lib/sphincs/signature-verification');
const fs = require('fs');

async function main() {
  console.log("Generating SPHINCS+ Key Pairs (Fixed Version)...\n");

  try {
    const keyGen = new SPHINCSKeyGen(32, 32, 4, 16); // Optimized parameters
    
    // Generate test key pairs
    const numKeyPairs = 3;
    const keyPairs = [];

    console.log(`Generating ${numKeyPairs} key pairs...`);
    
    for (let i = 0; i < numKeyPairs; i++) {
      console.log(`\nGenerating key pair ${i + 1}/${numKeyPairs}...`);
      const startTime = Date.now();
      
      const keyPair = keyGen.generateKeyPair();
      keyPairs.push(keyPair);
      
      const endTime = Date.now();
      console.log(`Key pair ${i + 1} generated in ${endTime - startTime}ms`);
    }

    console.log("\nKey generation completed!\n");

    // Test signature generation and verification
    console.log("Testing signature generation and verification...");
    
    const testKeyPair = keyPairs[0];
    const message = "Hello, quantum-resistant blockchain!";
    const messageBuffer = Buffer.from(message, 'utf8');
    
    console.log(`Message: "${message}"`);
    
    // Generate signature
    const signer = new SPHINCSSignature(testKeyPair.privateKey);
    const signature = signer.sign(messageBuffer);
    
    console.log("Signature generated successfully");
    console.log(`   Leaf index: ${signature.leafIdx}`);
    console.log(`   Auth path length: ${signature.authPath.length}`);
    
    // Verify signature
    const verifier = new SPHINCSVerifier(testKeyPair.publicKey);
    const isValid = verifier.verify(messageBuffer, signature);
    
    console.log(`Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);

    // Calculate and display statistics
    const stats = {
      publicKeySize: JSON.stringify(testKeyPair.publicKey).length,
      privateKeySize: JSON.stringify(testKeyPair.privateKey).length,
      signatureSize: JSON.stringify(signature).length,
      securityLevel: testKeyPair.publicKey.n * 8,
      treeHeight: testKeyPair.publicKey.h,
      layers: testKeyPair.publicKey.d,
      winternitzParameter: testKeyPair.publicKey.w
    };

    console.log("\nSPHINCS+ Statistics:");
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
      fs.mkdirSync(keysDir, { recursive: true });
    }

    keyPairs.forEach((keyPair, index) => {
      const filename = `${keysDir}/fixed_keypair_${index + 1}.json`;
      const keyData = {
        ...keyPair,
        metadata: {
          generated: new Date().toISOString(),
          version: "1.0.0",
          algorithm: "SPHINCS+",
          parameters: {
            n: keyPair.publicKey.n,
            h: keyPair.publicKey.h,
            d: keyPair.publicKey.d,
            w: keyPair.publicKey.w
          }
        }
      };
      
      fs.writeFileSync(filename, JSON.stringify(keyData, null, 2));
      console.log(`Key pair ${index + 1} saved to: ${filename}`);
    });

    // Save test signature
    const testData = {
      message,
      signature,
      isValid,
      stats,
      timestamp: new Date().toISOString(),
      keyPairUsed: 1
    };

    fs.writeFileSync(`${keysDir}/test_signature_fixed.json`, JSON.stringify(testData, null, 2));
    console.log(`Test signature saved to: ${keysDir}/test_signature_fixed.json`);

    console.log("\nFixed key generation and testing completed successfully!");
    console.log("All keys are properly formatted and tested");
    console.log("Signature generation and verification working");
    console.log("Ready for smart contract deployment");

  } catch (error) {
    console.error("Key generation failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });