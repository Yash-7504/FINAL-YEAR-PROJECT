const { expect } = require("chai");
const { ethers } = require("hardhat");
const SPHINCSKeyGen = require("../../lib/sphincs/key-generation");
const SPHINCSSignature = require("../../lib/sphincs/signature-generation");

describe("Gas Analysis", function () {
  let sphincs, token, voting;
  let owner, user1, user2;
  let keyPair1, keyPair2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contracts
    const SPHINCS = await ethers.getContractFactory("SPHINCS");
    sphincs = await SPHINCS.deploy();
    
    const QuantumResistantToken = await ethers.getContractFactory("QuantumResistantToken");
    token = await QuantumResistantToken.deploy("QuantumCoin", "QTC", ethers.parseEther("1000000"));
    
    const SecureVoting = await ethers.getContractFactory("SecureVoting");
    voting = await SecureVoting.deploy();
    
    // Generate key pairs
    const keyGen = new SPHINCSKeyGen();
    keyPair1 = keyGen.generateKeyPair();
    keyPair2 = keyGen.generateKeyPair();
  });

  describe("Public Key Registration Gas Costs", function () {
    it("Should measure gas cost for public key registration", async function () {
      const tx = await token.connect(user1).registerPublicKey(
        `0x${keyPair1.publicKey.pub_seed}`,
        `0x${keyPair1.publicKey.root}`,
        32, 64, 8, 16
      );
      
      const receipt = await tx.wait();
      console.log(`Public Key Registration Gas: ${receipt.gasUsed.toString()}`);
      
      expect(receipt.gasUsed).to.be.below(200000); // Should be under 200k gas
    });
  });

  describe("Signature Verification Gas Costs", function () {
    beforeEach(async function () {
      // Register public keys
      await token.connect(user1).registerPublicKey(
        `0x${keyPair1.publicKey.pub_seed}`,
        `0x${keyPair1.publicKey.root}`,
        32, 64, 8, 16
      );
    });

    it("Should measure gas cost for quantum-resistant transfer", async function () {
      const signer = new SPHINCSSignature(keyPair1.privateKey);
      const message = ethers.solidityPackedKeccak256(
        ["address", "address", "uint256", "uint256", "uint256"],
        [user1.address, user2.address, ethers.parseEther("100"), 0, Math.floor(Date.now() / 1000) + 3600]
      );
      
      const signature = signer.sign(message.slice(2)); // Remove 0x prefix
      
      // Prepare signature for contract
      const contractSignature = {
        wots_signature: signature.wots_signature.map(s => `0x${s}`),
        auth_path: signature.auth_path.map(p => `0x${p}`),
        tree_index: signature.tree_index,
        leaf_index: signature.leaf_index,
        message_digest: `0x${signature.message_digest}`,
        randomness: `0x${signature.randomness}`
      };
      
      const tx = await token.connect(user1).quantumResistantTransfer(
        user2.address,
        ethers.parseEther("100"),
        Math.floor(Date.now() / 1000) + 3600,
        contractSignature
      );
      
      const receipt = await tx.wait();
      console.log(`Quantum-Resistant Transfer Gas: ${receipt.gasUsed.toString()}`);
      
      // Compare with regular ERC20 transfer
      const regularTx = await token.connect(user1).transfer(user2.address, ethers.parseEther("50"));
      const regularReceipt = await regularTx.wait();
      console.log(`Regular Transfer Gas: ${regularReceipt.gasUsed.toString()}`);
      
      const gasOverhead = receipt.gasUsed - regularReceipt.gasUsed;
      console.log(`Quantum-Resistant Overhead: ${gasOverhead.toString()} gas`);
    });
  });

  describe("Batch Operations Gas Efficiency", function () {
    it("Should measure gas efficiency of batch transfers", async function () {
      await token.connect(user1).registerPublicKey(
        `0x${keyPair1.publicKey.pub_seed}`,
        `0x${keyPair1.publicKey.root}`,
        32, 64, 8, 16
      );
      
      const recipients = [user2.address, owner.address];
      const amounts = [ethers.parseEther("50"), ethers.parseEther("30")];
      
      const signer = new SPHINCSSignature(keyPair1.privateKey);
      const batchHash = ethers.solidityPackedKeccak256(
        ["string", "address", "address[]", "uint256[]", "uint256", "uint256"],
        ["BATCH_TRANSFER", user1.address, recipients, amounts, 0, Math.floor(Date.now() / 1000) + 3600]
      );
      
      const signature = signer.sign(batchHash.slice(2));
      
      const contractSignature = {
        wots_signature: signature.wots_signature.map(s => `0x${s}`),
        auth_path: signature.auth_path.map(p => `0x${p}`),
        tree_index: signature.tree_index,
        leaf_index: signature.leaf_index,
        message_digest: `0x${signature.message_digest}`,
        randomness: `0x${signature.randomness}`
      };
      
      const tx = await token.connect(user1).batchQuantumTransfer(
        recipients,
        amounts,
        Math.floor(Date.now() / 1000) + 3600,
        contractSignature
      );
      
      const receipt = await tx.wait();
      console.log(`Batch Transfer Gas: ${receipt.gasUsed.toString()}`);
      
      const gasPerTransfer = receipt.gasUsed / BigInt(recipients.length);
      console.log(`Gas per transfer in batch: ${gasPerTransfer.toString()}`);
    });
  });
});
