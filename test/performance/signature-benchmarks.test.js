const { expect } = require("chai");
const SPHINCSKeyGen = require("../../lib/sphincs/key-generation");
const SPHINCSSignature = require("../../lib/sphincs/signature-generation");
const SPHINCSVerifier = require("../../lib/sphincs/signature-verification");

describe("SPHINCS+ Performance Benchmarks", function () {
  let keyGen, keyPair, signer, verifier;

  before(function () {
    keyGen = new SPHINCSKeyGen();
    keyPair = keyGen.generateKeyPair();
    signer = new SPHINCSSignature(keyPair.privateKey);
    verifier = new SPHINCSVerifier(keyPair.publicKey);
  });

  describe("Key Generation Performance", function () {
    it("Should benchmark key generation time", async function () {
      const iterations = 10;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const testKeyGen = new SPHINCSKeyGen();
        testKeyGen.generateKeyPair();
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average key generation time: ${avgTime}ms`);
      expect(avgTime).to.be.below(1000); // Should be under 1 second
    });
  });

  describe("Signature Generation Performance", function () {
    it("Should benchmark signature generation time", async function () {
      const message = "Hello, quantum-resistant world!";
      const iterations = 100;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        signer.sign(Buffer.from(message + i));
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average signature generation time: ${avgTime}ms`);
      expect(avgTime).to.be.below(100); // Should be under 100ms
    });

    it("Should measure signature size", function () {
      const message = "Test message for size measurement";
      const signature = signer.sign(Buffer.from(message));
      
      const signatureSize = JSON.stringify(signature).length;
      console.log(`Signature size: ${signatureSize} bytes`);
      console.log(`WOTS signature elements: ${signature.wots_signature.length}`);
      console.log(`Auth path elements: ${signature.auth_path.length}`);
      
      // SPHINCS+ signatures are large, but this is expected
      expect(signatureSize).to.be.above(1000);
    });
  });

  describe("Signature Verification Performance", function () {
    it("Should benchmark signature verification time", async function () {
      const message = "Verification benchmark message";
      const signature = signer.sign(Buffer.from(message));
      
      const iterations = 100;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const isValid = verifier.verify(Buffer.from(message), signature);
        expect(isValid).to.be.true;
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;
      
      console.log(`Average signature verification time: ${avgTime}ms`);
      expect(avgTime).to.be.below(50); // Should be under 50ms
    });
  });

  describe("Security Parameter Analysis", function () {
    it("Should test different security parameters", function () {
      const parameters = [
        { n: 32, h: 32, d: 4, w: 16 },
        { n: 32, h: 48, d: 6, w: 16 },
        { n: 32, h: 64, d: 8, w: 16 }
      ];
      
      parameters.forEach(param => {
        const testKeyGen = new SPHINCSKeyGen(param.n, param.h, param.d, param.w);
        const startTime = Date.now();
        const testKeyPair = testKeyGen.generateKeyPair();
        const endTime = Date.now();
        
        console.log(`Parameters (h=${param.h}, d=${param.d}): ${endTime - startTime}ms`);
        expect(testKeyPair.privateKey).to.not.be.null;
        expect(testKeyPair.publicKey).to.not.be.null;
      });
    });
  });
});
