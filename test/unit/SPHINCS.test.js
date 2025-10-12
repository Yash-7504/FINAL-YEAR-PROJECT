const { expect } = require("chai");
const { ethers } = require("hardhat");
const SPHINCSKeyGen = require("../../lib/sphincs/key-generation");

describe("SPHINCS Contract", function () {
  let sphincs;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const SPHINCS = await ethers.getContractFactory("SPHINCS");
    sphincs = await SPHINCS.deploy();
    await sphincs.deployed();
  });

  describe("Public Key Registration", function () {
    it("Should register a public key", async function () {
      const keyGen = new SPHINCSKeyGen();
      const keyPair = keyGen.generateKeyPair();
      
      await expect(
        sphincs.connect(user1).registerPublicKey(
          keyPair.publicKey.pub_seed,
          keyPair.publicKey.root
        )
      ).to.emit(sphincs, "PublicKeyRegistered")
       .withArgs(user1.address, keyPair.publicKey.pub_seed, keyPair.publicKey.root);
    });
  });

  // Additional tests for signature verification, etc.
});
