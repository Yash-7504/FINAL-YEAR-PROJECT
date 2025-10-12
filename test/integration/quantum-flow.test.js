const { ethers } = require("hardhat");
const fs = require("fs");
const SPHINCSSignature = require("../../lib/sphincs/signature-generation");

let expect;

describe("Quantum-resistant end-to-end flow", () => {
  let accounts, keyPair, sigGen, Token;

  before(async () => {
    const chai = await import("chai");
    expect = chai.expect;
    
    accounts = await ethers.getSigners();
    keyPair = JSON.parse(fs.readFileSync("./test-keys/optimized_keypair_1.json"));
    sigGen = new SPHINCSSignature(keyPair.privateKey);

    Token = await ethers.getContractAt("QuantumResistantToken", process.env.TOKEN_ADDR);
  });

  it("registers public key in Token contract", async () => {
    await Token.registerPublicKey(
      "0x" + keyPair.publicKey.pub_seed,
      "0x" + keyPair.publicKey.root,
      32, 32, 4, 16
    );
    expect(await Token.isPublicKeyRegistered(accounts[0].address)).to.be.true;
  });

  it("executes quantum-resistant transfer", async () => {
    const amount = ethers.utils.parseEther("5");
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    
    const nonce = await Token.nonces(accounts[0].address);
    console.log("Got nonce from nonces():", nonce.toString());
    
    console.log("Transfer parameters:");
    console.log("  from:", accounts[0].address);
    console.log("  to:", accounts[1].address);
    console.log("  amount:", amount.toString());
    console.log("  nonce:", nonce.toString());
    console.log("  deadline:", deadline);
    
    // Encode as a struct - this matches what Solidity does with abi.encode(transferData)
    // The struct TransferData has fields: from, to, amount, nonce, deadline
    const abiCoder = new ethers.utils.AbiCoder();
    const structEncoded = abiCoder.encode(
      ["tuple(address,address,uint256,uint256,uint256)"],
      [[accounts[0].address, accounts[1].address, amount, nonce, deadline]]
    );
    const mHash = ethers.utils.keccak256(structEncoded);
    
    console.log("Message hash (struct encoded):", mHash);
    
    const s = sigGen.sign(mHash.slice(2));
    const cs = {
      wots_signature: s.wots_signature.map(x => "0x" + x),
      auth_path: s.auth_path.map(x => "0x" + x),
      tree_index: s.tree_index,
      leaf_index: s.leaf_index,
      message_digest: "0x" + s.message_digest,
      randomness: "0x" + s.randomness
    };
    
    console.log("Signature generated, attempting transfer...");
    await Token.quantumResistantTransfer(accounts[1].address, amount, deadline, cs);
    
    const finalBalance = await Token.balanceOf(accounts[1].address);
    expect(finalBalance).to.equal(amount);
    console.log("Transfer successful! Final balance:", ethers.utils.formatEther(finalBalance));
  });
});
