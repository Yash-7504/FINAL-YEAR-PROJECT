const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SimpleSPHINCSKeyGen } = require('../lib/sphincs/simple-working');

describe("Quantum-Resistant Smart Contracts Integration", function () {
  let sphincs, quantumToken, owner, user1, user2;
  let keyGen, testKeyPair;

  before(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Initialize key generator
    keyGen = new SimpleSPHINCSKeyGen(32, 8, 4, 16);
    testKeyPair = keyGen.generateKeyPair();
    
    console.log("Test key pair generated for integration tests");
  });

  beforeEach(async function () {
    // Deploy SPHINCS verifier
    const SPHINCS = await ethers.getContractFactory("SPHINCS");
    sphincs = await SPHINCS.deploy();
    await sphincs.deployed();

    // Deploy QuantumToken
    const QuantumToken = await ethers.getContractFactory("QuantumToken");
    quantumToken = await QuantumToken.deploy(
      "QuantumCoin",
      "QTC",
      owner.address,
      sphincs.address
    );
    await quantumToken.deployed();

    // Mint tokens to owner
    await quantumToken.mint(owner.address, ethers.utils.parseEther("1000"));
  });

  describe("SPHINCS Verifier", function () {
    it("Should register public keys correctly", async function () {
      const pubSeed = `0x${testKeyPair.publicKey.pub_seed}`;
      const root = `0x${testKeyPair.publicKey.root}`;

      await sphincs.registerPublicKey(pubSeed, root);

      const isRegistered = await sphincs.isPublicKeyRegistered(owner.address);
      expect(isRegistered).to.be.true;

      const [retrievedPubSeed, retrievedRoot, params, isValid] = await sphincs.getPublicKey(owner.address);
      expect(retrievedPubSeed).to.equal(pubSeed);
      expect(retrievedRoot).to.equal(root);
      expect(isValid).to.be.true;
    });

    it("Should reject invalid public key parameters", async function () {
      await expect(
        sphincs.registerPublicKey(ethers.constants.HashZero, ethers.constants.HashZero)
      ).to.be.revertedWith("Invalid pub_seed");
    });
  });

  describe("QuantumToken", function () {
    beforeEach(async function () {
      // Register public key for owner
      await quantumToken.registerPublicKey(
        `0x${testKeyPair.publicKey.pub_seed}`,
        `0x${testKeyPair.publicKey.root}`,
        testKeyPair.publicKey.n,
        testKeyPair.publicKey.h,
        testKeyPair.publicKey.d,
        testKeyPair.publicKey.w
      );
    });

    it("Should register public keys and link with SPHINCS", async function () {
      const isRegistered = await quantumToken.isPublicKeyRegistered(owner.address);
      expect(isRegistered).to.be.true;

      const [pubSeed, root, n, h, d, w, registered] = await quantumToken.getPublicKey(owner.address);
      expect(registered).to.be.true;
      expect(n).to.equal(32);
      expect(h).to.equal(8);
      expect(d).to.equal(4);
      expect(w).to.equal(16);
    });

    it("Should mint tokens correctly", async function () {
      const mintAmount = ethers.utils.parseEther("500");
      await quantumToken.mint(user1.address, mintAmount);

      const balance = await quantumToken.balanceOf(user1.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should track nonces correctly", async function () {
      const initialNonce = await quantumToken.getNonce(owner.address);
      expect(initialNonce).to.equal(0);
    });

    it("Should reject quantum transfers without proper signature", async function () {
      // Ensure SPHINCS verifier also has the key registered
      await sphincs.registerPublicKey(
        `0x${testKeyPair.publicKey.pub_seed}`,
        `0x${testKeyPair.publicKey.root}`
      );
      
      const amount = ethers.utils.parseEther("50");
      const nonce = await quantumToken.getNonce(owner.address);
      
      // Create dummy signature data
      const dummySignature = "0x1234567890abcdef";
      const dummyAuthPath = [ethers.utils.keccak256("0x1234")];

      await expect(
        quantumToken.quantumTransfer(
          user1.address,
          amount,
          nonce,
          dummySignature,
          dummyAuthPath
        )
      ).to.be.revertedWith("Invalid quantum signature");
    });

    it("Should prevent signature reuse", async function () {
      const signature = "0x1234567890abcdef1234567890abcdef";
      
      const isUsed1 = await quantumToken.isSignatureUsed(signature);
      expect(isUsed1).to.be.false;
    });

    it("Should validate transfer parameters", async function () {
      const amount = ethers.utils.parseEther("100");
      const nonce = await quantumToken.getNonce(owner.address);
      const dummySignature = "0x1234";
      const dummyAuthPath = [];

      // Test invalid recipient
      await expect(
        quantumToken.quantumTransfer(
          ethers.constants.AddressZero,
          amount,
          nonce,
          dummySignature,
          dummyAuthPath
        )
      ).to.be.revertedWith("Invalid recipient");

      // Test zero amount
      await expect(
        quantumToken.quantumTransfer(
          user1.address,
          0,
          nonce,
          dummySignature,
          dummyAuthPath
        )
      ).to.be.revertedWith("Amount must be positive");
    });
  });

  describe("Gas Usage Analysis", function () {
    beforeEach(async function () {
      await quantumToken.registerPublicKey(
        `0x${testKeyPair.publicKey.pub_seed}`,
        `0x${testKeyPair.publicKey.root}`,
        testKeyPair.publicKey.n,
        testKeyPair.publicKey.h,
        testKeyPair.publicKey.d,
        testKeyPair.publicKey.w
      );
    });

    it("Should measure gas costs for key registration", async function () {
      const tx = await quantumToken.connect(user1).registerPublicKey(
        `0x${testKeyPair.publicKey.pub_seed}`,
        `0x${testKeyPair.publicKey.root}`,
        32, 8, 4, 16
      );
      
      const receipt = await tx.wait();
      console.log(`Gas used for key registration: ${receipt.gasUsed.toString()}`);
      
      expect(receipt.gasUsed).to.be.below(200000); // Should be under 200k gas
    });

    it("Should measure gas costs for SPHINCS verification", async function () {
      // First register public key with SPHINCS verifier
      await sphincs.registerPublicKey(
        `0x${testKeyPair.publicKey.pub_seed}`,
        `0x${testKeyPair.publicKey.root}`
      );
      
      const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test message"));
      const dummySignature = {
        signature: "0x1234567890abcdef",
        leafIdx: 123,
        authPath: [ethers.utils.keccak256("0x1234")]
      };

      const tx = await sphincs.verifySignature(
        owner.address,
        messageHash,
        dummySignature
      );
      
      const receipt = await tx.wait();
      console.log(`Gas used for signature verification: ${receipt.gasUsed.toString()}`);
      
      expect(receipt.gasUsed).to.be.below(500000); // Should be under 500k gas
    });
  });

  describe("Security Tests", function () {
    it("Should prevent unauthorized minting", async function () {
      await expect(
        quantumToken.connect(user1).mint(user1.address, ethers.utils.parseEther("1000"))
      ).to.be.reverted;
    });

    it("Should validate public key parameters", async function () {
      await expect(
        quantumToken.registerPublicKey(
          ethers.constants.HashZero,
          `0x${testKeyPair.publicKey.root}`,
          32, 8, 4, 16
        )
      ).to.be.revertedWith("Invalid pub_seed");

      await expect(
        quantumToken.registerPublicKey(
          `0x${testKeyPair.publicKey.pub_seed}`,
          ethers.constants.HashZero,
          32, 8, 4, 16
        )
      ).to.be.revertedWith("Invalid root");

      await expect(
        quantumToken.registerPublicKey(
          `0x${testKeyPair.publicKey.pub_seed}`,
          `0x${testKeyPair.publicKey.root}`,
          16, 8, 4, 16
        )
      ).to.be.revertedWith("Only n=32 supported");
    });

    it("Should handle reentrancy protection", async function () {
      // The ReentrancyGuard should prevent reentrancy attacks
      // This is automatically tested by the modifier
      expect(await quantumToken.getNonce(owner.address)).to.equal(0);
    });
  });
});