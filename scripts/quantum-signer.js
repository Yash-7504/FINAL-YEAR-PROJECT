#!/usr/bin/env node
/**
 * Simple SPHINCS+ signer script (Node.js)
 * Usage:
 *  NODE_ENV=production node scripts/quantum-signer.js --in ./build/MyContract.bin --out ./keys/key.json
 */

const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');
const SPHINCSKeyGen = require('../lib/sphincs/key-generation');
const SPHINCSSignature = require('../lib/sphincs/signature-generation');

function usage() {
  console.log('Usage: node scripts/quantum-signer.js --in <file> --out <file>');
  process.exit(1);
}

const argv = require('minimist')(process.argv.slice(2));
const infile = argv.in || argv.i;
const outfile = argv.out || argv.o || `keys/sphincs_key_${Date.now()}.json`;

if (!infile) {
  usage();
}

if (!fs.existsSync(path.dirname(outfile))) {
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
}

// Read bytecode (or any message payload)
const payload = fs.readFileSync(infile);

// Generate keypair
const keygen = new SPHINCSKeyGen();
const { privateKey, publicKey } = keygen.generateKeyPair();

// Sign payload
const signer = new SPHINCSSignature(privateKey);
const sig = signer.sign(payload);

// Build JSON output
const out = {
  publicKey: publicKey.pub_seed + ':' + publicKey.root,
  secretKey: JSON.stringify(privateKey),
  signature: sig.signature,
  messageDigest: sig.messageHash,
  leafIdx: sig.leafIdx,
  authPath: sig.authPath,
  timestamp: Date.now(),
  inputFile: infile
};

fs.writeFileSync(outfile, JSON.stringify(out, null, 2));

console.log('SPHINCS+ keypair generated and message signed.');
console.log('Output:', outfile);
