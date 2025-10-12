const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Basic Functionality Test", function () {
  let sphincs, hashFunctions;
  let owner, user1, user2;
  
  before(async function () {
    console.log("Setting up test environment...");
    [owner, user1, user2] = await ethers.getSigners();
    
    try {
      console.log("Deploying HashFunctions library...");
      const HashFunctions = await ethers.getContractFactory("HashFunctions");
      hashFunctions = await HashFunctions.deploy();
      await hashFunctions.deployed();
      console.log("HashFunctions deployed to:", hashFunctions.address);
      
      console.log("Deploying SPHINCS contract...");
      // Try without library linking first
      const SPHINCS = await ethers.getContractFactory("SPHINCS");
      sphincs = await SPHINCS.deploy();
      await sphincs.deployed();
      console.log("SPHINCS deployed to:", sphincs.address);
      
    } catch (error) {
      console.error("Deployment failed:", error.message);
      throw error;
    }
  });

  describe("Contract Deployment", function () {
    it("Should deploy contracts successfully", async function () {
      expect(sphincs.address).to.not.equal(ethers.constants.AddressZero);
      expect(hashFunctions.address).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe("Public Key Registration", function () {
    it("Should register a public key", async function () {
      const testPubSeed = "0x" + "a".repeat(64);
      const testRoot = "0x" + "b".repeat(64);
      
      await expect(
        sphincs.connect(user1).registerPublicKey(testPubSeed, testRoot, 32, 64, 8, 16)
      ).to.emit(sphincs, "PublicKeyRegistered");
      
      const isRegistered = await sphincs.isPublicKeyRegistered(user1.address);
      expect(isRegistered).to.be.true;
    });
  });
});
