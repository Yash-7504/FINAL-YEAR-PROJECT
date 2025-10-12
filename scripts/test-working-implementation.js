const { WorkingSPHINCSKeyGen, WorkingSPHINCSSignature, WorkingSPHINCSVerifier } = require('../lib/sphincs/working-implementation');
const fs = require('fs');

async function main() {
  console.log("Testing Working SPHINCS+ Implementation...\n");

  try {
    // Generate key pair
    console.log("1. Generating key pair...");
    const keyGen = new WorkingSPHINCSKeyGen(32, 16, 4, 16); // Reduced height for efficiency
    const keyPair = keyGen.generateKeyPair();
    
    console.log("Key pair generated successfully");
    console.log(`   Public key root: ${keyPair.publicKey.root.substring(0, 16)}...`);
    console.log(`   Tree height: ${keyPair.publicKey.h}`);

    // Test message signing
    console.log("\n2. Testing signature generation...");
    const message = "Hello, quantum-resistant blockchain!";
    const messageBuffer = Buffer.from(message, 'utf8');
    
    const signer = new WorkingSPHINCSSignature(keyPair.privateKey);
    const signature = signer.sign(messageBuffer);
    
    console.log("Signature generated successfully");
    console.log(`   Signature length: ${signature.signature.length / 2} bytes`);
    console.log(`   Leaf index: ${signature.leafIdx}`);
    console.log(`   Auth path length: ${signature.authPath.length}`);

    // Test signature verification
    console.log("\n3. Testing signature verification...");
    const verifier = new WorkingSPHINCSVerifier(keyPair.publicKey);
    const isValid = verifier.verify(messageBuffer, signature);
    
    console.log(`Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);

    if (!isValid) {
      console.log("Signature verification failed - debugging...");
      return;
    }

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
    let successCount = 0;
    
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
      
      if (testValid) {
        successCount++;
      } else {
        console.log(`Performance test ${i} failed verification`);
      }
    }
    
    console.log(`Success rate: ${successCount}/${numTests} (${(successCount/numTests*100).toFixed(1)}%)`);
    console.log(`Average signing time: ${(totalSignTime / numTests).toFixed(2)}ms`);
    console.log(`Average verification time: ${(totalVerifyTime / numTests).toFixed(2)}ms`);

    // Generate multiple key pairs for smart contract testing
    console.log("\n7. Generating key pairs for smart contract testing...");
    const contractKeyPairs = [];
    
    for (let i = 0; i < 3; i++) {
      const contractKeyPair = keyGen.generateKeyPair();
      contractKeyPairs.push(contractKeyPair);
      console.log(`   Key pair ${i + 1}: ${contractKeyPair.publicKey.root.substring(0, 16)}...`);
    }

    // Save test results
    const testResults = {
      mainKeyPair: keyPair,
      contractKeyPairs,
      testSignature: signature,
      message,
      isValid,
      performance: {
        avgSignTime: totalSignTime / numTests,
        avgVerifyTime: totalVerifyTime / numTests,
        successRate: successCount / numTests,
        numTests
      },
      parameters: {
        n: keyPair.publicKey.n,
        h: keyPair.publicKey.h,
        d: keyPair.publicKey.d,
        w: keyPair.publicKey.w
      },
      timestamp: new Date().toISOString()
    };

    const keysDir = './test-keys';
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    // Save individual key pairs
    contractKeyPairs.forEach((kp, index) => {
      fs.writeFileSync(
        `${keysDir}/working_keypair_${index + 1}.json`,
        JSON.stringify(kp, null, 2)
      );
    });

    fs.writeFileSync(
      `${keysDir}/working_test_results.json`, 
      JSON.stringify(testResults, null, 2)
    );

    console.log("\nWorking SPHINCS+ testing completed successfully!");
    console.log("Test results saved to: ./test-keys/working_test_results.json");
    console.log("Key pairs saved for smart contract testing");
    
    console.log("\nSummary:");
    console.log(`   Key generation: Working`);
    console.log(`   Signature generation: Working`);
    console.log(`   Signature verification: ${isValid ? 'Working' : 'Failed'}`);
    console.log(`   Tamper detection: ${!isTamperedValid ? 'Working' : 'Failed'}`);
    console.log(`   Performance: ${successCount === numTests ? 'Excellent' : 'Needs improvement'}`);
    console.log(`   Success rate: ${(successCount/numTests*100).toFixed(1)}%`);
    
    if (isValid && !isTamperedValid && successCount === numTests) {
      console.log("\nReady for smart contract integration!");
    } else {
      console.log("\nSome tests failed - review implementation");
    }

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