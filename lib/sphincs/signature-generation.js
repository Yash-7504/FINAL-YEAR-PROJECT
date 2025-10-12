const SHA256 = require('../crypto/sha256');

class SPHINCSSignature {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.n = privateKey.n;
    this.h = privateKey.h;
    this.d = privateKey.d;
    this.w = privateKey.w;
    this.t = Math.floor((8 * this.n) / Math.log2(this.w)) + 1;
  }

  sign(message) {
    console.log('Generating SPHINCS+ signature...');
    
    // Hash the message
    const messageHash = SHA256.hash(message);
    
    // Generate deterministic randomness
    const sk_prf = Buffer.from(this.privateKey.sk_prf, 'hex');
    const randomness = SHA256.hmac(sk_prf, messageHash);
    
    // Determine leaf index
    const leafIdx = this.generateLeafIndex(messageHash, randomness);
    
    // Generate FORS signature
    const forsSignature = this.generateFORSSignature(messageHash, randomness, leafIdx);
    
    // Generate hypertree signature
    const treeSignature = this.generateTreeSignature(forsSignature.publicKey, leafIdx);
    
    return {
      signature: Buffer.concat([forsSignature.signature, treeSignature.signature]).toString('hex'),
      leafIdx: leafIdx,
      authPath: treeSignature.authPath,
      messageHash: messageHash.toString('hex'),
      forsPublicKey: forsSignature.publicKey.toString('hex')
    };
  }

  generateLeafIndex(messageHash, randomness) {
    const combined = Buffer.concat([messageHash, randomness]);
    const hash = SHA256.hash(combined);
    
    // Extract index from hash
    let index = 0;
    for (let i = 0; i < 4; i++) {
      index = (index << 8) + hash[i];
    }
    
    return index % Math.pow(2, this.h);
  }

  generateFORSSignature(messageHash, randomness, leafIdx) {
    // FORS parameters (simplified)
    const k = 35; // Number of FORS trees
    const t = 16; // FORS tree height
    
    const signature = [];
    const publicKeyParts = [];
    
    for (let i = 0; i < k; i++) {
      // Extract message bits for this FORS tree
      const treeIndex = this.extractBits(messageHash, i * t, t);
      
      // Generate FORS private key for this tree and index
      const forsPrivateKey = this.generateFORSPrivateKey(randomness, i, treeIndex, leafIdx);
      
      // Create signature (private key value)
      signature.push(forsPrivateKey);
      
      // Generate corresponding public key
      const forsPublicKey = this.generateFORSPublicKey(forsPrivateKey, i, treeIndex);
      publicKeyParts.push(forsPublicKey);
    }
    
    // Combine all FORS public keys
    const combinedPublicKey = SHA256.hashMultiple(...publicKeyParts);
    
    return {
      signature: Buffer.concat(signature),
      publicKey: combinedPublicKey
    };
  }

  generateFORSPrivateKey(randomness, treeIdx, leafIdx, globalLeafIdx) {
    const sk_seed = Buffer.from(this.privateKey.sk_seed, 'hex');
    
    const input = Buffer.concat([
      sk_seed,
      randomness,
      Buffer.from([treeIdx, leafIdx, globalLeafIdx & 0xFF])
    ]);
    
    return SHA256.hash(input);
  }

  generateFORSPublicKey(privateKey, treeIdx, leafIdx) {
    const pub_seed = Buffer.from(this.privateKey.pub_seed, 'hex');
    
    // Apply hash chain to get public key
    let current = privateKey;
    const chainLength = Math.pow(2, 4); // 2^4 = 16 iterations
    
    for (let i = 0; i < chainLength; i++) {
      const input = Buffer.concat([
        pub_seed,
        current,
        Buffer.from([treeIdx, i])
      ]);
      current = SHA256.hash(input);
    }
    
    return current;
  }

  generateTreeSignature(forsPublicKey, leafIdx) {
    const sk_seed = Buffer.from(this.privateKey.sk_seed, 'hex');
    const pub_seed = Buffer.from(this.privateKey.pub_seed, 'hex');
    
    const signatures = [];
    const authPaths = [];
    
    let currentLeafIdx = leafIdx;
    let currentPublicKey = forsPublicKey;
    
    // Generate signature for each layer of the hypertree
    for (let layer = 0; layer < this.d; layer++) {
      const treeHeight = this.h / this.d;
      const treeIdx = Math.floor(currentLeafIdx / Math.pow(2, treeHeight));
      const localLeafIdx = currentLeafIdx % Math.pow(2, treeHeight);
      
      // Generate WOTS+ signature for this layer
      const wotsSignature = this.generateWOTSSignature(
        currentPublicKey,
        sk_seed,
        pub_seed,
        treeIdx,
        localLeafIdx,
        layer
      );
      
      signatures.push(wotsSignature.signature);
      
      // Generate authentication path
      const authPath = this.generateAuthPath(localLeafIdx, treeHeight, layer);
      authPaths.push(...authPath);
      
      // Update for next layer
      currentLeafIdx = treeIdx;
      currentPublicKey = wotsSignature.publicKey;
    }
    
    return {
      signature: Buffer.concat(signatures),
      authPath: authPaths
    };
  }

  generateWOTSSignature(message, sk_seed, pub_seed, treeIdx, leafIdx, layer) {
    // Generate WOTS+ private key
    const wotsPrivateKey = this.generateWOTSPrivateKey(sk_seed, treeIdx, leafIdx, layer);
    
    // Convert message to base-w representation
    const messageInts = this.baseW(message, this.w, this.t);
    
    const signature = [];
    const publicKeyParts = [];
    
    for (let i = 0; i < this.t; i++) {
      const chainLength = messageInts[i];
      let current = wotsPrivateKey[i];
      
      // Apply hash chain
      for (let j = 0; j < chainLength; j++) {
        const input = Buffer.concat([
          pub_seed,
          current,
          Buffer.from([i, j])
        ]);
        current = SHA256.hash(input);
      }
      
      signature.push(current);
      
      // Continue to get public key
      for (let j = chainLength; j < this.w - 1; j++) {
        const input = Buffer.concat([
          pub_seed,
          current,
          Buffer.from([i, j])
        ]);
        current = SHA256.hash(input);
      }
      
      publicKeyParts.push(current);
    }
    
    return {
      signature: Buffer.concat(signature),
      publicKey: SHA256.hashMultiple(...publicKeyParts)
    };
  }

  generateWOTSPrivateKey(sk_seed, treeIdx, leafIdx, layer) {
    const privateKey = [];
    
    for (let i = 0; i < this.t; i++) {
      const input = Buffer.concat([
        sk_seed,
        Buffer.from([layer, treeIdx, leafIdx, i])
      ]);
      privateKey.push(SHA256.hash(input));
    }
    
    return privateKey;
  }

  generateAuthPath(leafIdx, treeHeight, layer) {
    const authPath = [];
    let currentIdx = leafIdx;
    
    for (let level = 0; level < treeHeight; level++) {
      const siblingIdx = currentIdx % 2 === 0 ? currentIdx + 1 : currentIdx - 1;
      
      // Generate deterministic sibling hash
      const siblingHash = SHA256.hash(
        Buffer.from(`auth_${layer}_${level}_${siblingIdx}`)
      );
      
      authPath.push(siblingHash.toString('hex'));
      currentIdx = Math.floor(currentIdx / 2);
    }
    
    return authPath;
  }

  extractBits(data, start, length) {
    const bytes = Array.from(data);
    let result = 0;
    
    for (let i = 0; i < length; i++) {
      const bitPos = start + i;
      const byteIdx = Math.floor(bitPos / 8);
      const bitIdx = bitPos % 8;
      
      if (byteIdx < bytes.length) {
        const bit = (bytes[byteIdx] >> (7 - bitIdx)) & 1;
        result = (result << 1) | bit;
      }
    }
    
    return result;
  }

  baseW(data, w, length) {
    const result = [];
    const logW = Math.log2(w);
    
    for (let i = 0; i < length; i++) {
      const bits = this.extractBits(data, i * logW, logW);
      result.push(bits);
    }
    
    return result;
  }
}

module.exports = SPHINCSSignature;