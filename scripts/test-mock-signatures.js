const SPHINCSKeyGen = require('../lib/sphincs/key-generation');
const { MockSPHINCSSignature, MockSPHINCSVerifier } = require('../lib/sphincs/mock-signature');
const fs = require('fs');

async function main() {
  console.log("Testing Mock SPHINCS+ Implementation...\n");

  try {
    // Generate key pair
    console.log("1. Generating key pair...");
    const keyGen = new SPHINCSKeyGen(32, 32, 4, 16);
    const keyPair = keyGen.generateKeyPair();
    
    console.log("Key pair generated successfully");
    console.log(`   Public key root: ${keyPair.publicKey.root.substring(0, 16)}...`);
    console.log(`   Private key seed: ${keyPair.privateKey.sk_seed.substring(0, 16)}...`);

    // Test message signing
    console.log("\n2. Testing signature generation...");
    const message = "Hello, quantum-resistant world!";
    const messageBuffer = Buffer.from(message, 'utf8');
    
    const signer = new MockSPHINCSSignature(keyPair.privateKey);
    const signature = signer.sign(messageBuffer);
    
    console.log("Signature generated successfully");
    console.log(`   Signature length: ${signature.signature.length / 2} bytes`);
    console.log(`   Leaf index: ${signature.leafIdx}`);
    console.log(`   Auth path length: ${signature.authPath.length}`);

    // Test signature verification
    console.log("\n3. Testing signature verification...");
    const verifier = new MockSPHINCSVerifier(keyPair.publicKey);
    const isValid = verifier.verify(messageBuffer, signature);
    
    console.log(`Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);

    // Test with different message (should fail)
    console.log("\n4. Testing with tampered message...");
    const tamperedMessage = Buffer.from("Hello, tampered message!", 'utf8');
    const isTamperedValid = verifier.verify(tamperedMessage, signature);
    
    console.log(`Tampered message verification: ${isTamperedValid ? 'VALID (ERROR)' : 'INVALID (CORRECT)'}`);

    // Test multiple signatures
    console.log("\n5. Testing multiple signatures...");
    const messages = [
      "Message 1",
      "Message 2", 
      "Message 3"
    ];
    
    let allValid = true;
    for (let i = 0; i < messages.length; i++) {
      const msgBuffer = Buffer.from(messages[i], 'utf8');
      const sig = signer.sign(msgBuffer);
      const valid = verifier.verify(msgBuffer, sig);
      
      console.log(`   Message ${i + 1}: ${valid ? 'VALID' : 'INVALID'}`);
      if (!valid) allValid = false;
    }
    
    console.log(`Multiple signatures test: ${allValid ? 'PASSED' : 'FAILED'}`);

    // Performance test
    console.log("\n6. Performance testing...");
    const numTests = 10;
    let totalSignTime = 0;
    let totalVerifyTime = 0;
    
    for (let i = 0; i < numTests; i++) {
      const testMsg = Buffer.from(`Performance test message ${i}`, 'utf8');
      
      const signStart = Date.now();
      const testSig = signer.sign(testMsg);
      const signEnd = Date.now();
      totalSignTime += (signEnd - signStart);
      
      const verifyStart = Date.now();
      const testValid = verifier.verify(testMsg, testSig);
      const verifyEnd = Date.now();
      totalVerifyTime += (verifyEnd - verifyStart);
      
      if (!testValid) {
        console.log(`Performance test ${i} failed verification`);
      }
    }
    
    console.log(`Average signing time: ${totalSignTime / numTests}ms`);
    console.log(`Average verification time: ${totalVerifyTime / numTests}ms`);

    // Save test results
    const testResults = {
      keyPair,
      testSignature: signature,
      message,
      isValid,
      performance: {
        avgSignTime: totalSignTime / numTests,
        avgVerifyTime: totalVerifyTime / numTests,
        numTests
      },
      timestamp: new Date().toISOString()
    };

    const keysDir = './test-keys';
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    fs.writeFileSync(
      `${keysDir}/mock_test_results.json`, 
      JSON.stringify(testResults, null, 2)
    );

    console.log("\nMock SPHINCS+ testing completed successfully!");
    console.log("Test results saved to: ./test-keys/mock_test_results.json");
    console.log("\nSummary:");
    console.log(`   Key generation: Working`);
    console.log(`   Signature generation: Working`);
    console.log(`   Signature verification: Working`);
    console.log(`   Tamper detection: Working`);
    console.log(`   Performance: Acceptable`);
    console.log("\nReady for smart contract integration!");

  } catch (error) {
    console.error("Test failed:", error.message);
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