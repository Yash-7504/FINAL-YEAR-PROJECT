#!/usr/bin/env node
/**
 * Off-chain SPHINCS+ verifier CLI
 * Usage: node scripts/quantum-verify.js --key ./keys/key.json --in ./build/MyContract.bin
 */

const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const SPHINCSVerifier = require('../lib/sphincs/signature-verification');

const keyFile = argv.key || argv.k;
const inFile = argv.in || argv.i;

if (!keyFile || !inFile) {
  console.error('Usage: node scripts/quantum-verify.js --key <key.json> --in <message.bin>');
  process.exit(1);
}

const keyJson = JSON.parse(fs.readFileSync(keyFile));
const signatureHex = keyJson.signature;
const messageDigest = keyJson.messageDigest;

if (!signatureHex) {
  console.error('Key file does not include a signature');
  process.exit(1);
}

const message = fs.readFileSync(inFile);

// Reconstruct publicKey object used by verifier (expects pub_seed and root fields)
function parsePublicKey(pubStr) {
  // we stored as "pub_seed:root"
  const parts = pubStr.split(':');
  return {
    pub_seed: parts[0],
    root: parts[1],
    n: 32,
    h: 32,
    d: 4,
    w: 16
  };
}

const pubKeyObj = parsePublicKey(keyJson.publicKey);
const verifier = new SPHINCSVerifier(pubKeyObj);

const sigObj = {
  signature: signatureHex,
  leafIdx: keyJson.leafIdx,
  authPath: keyJson.authPath
};

const ok = verifier.verify(message, sigObj);
console.log('Signature valid:', ok);
