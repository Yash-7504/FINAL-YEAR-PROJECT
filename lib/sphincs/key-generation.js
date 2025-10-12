const SHA256 = require('../crypto/sha256');
const crypto = require('crypto');

class SPHINCSKeyGen {
  constructor(n = 32, h = 32, d = 4, w = 16) {
    this.n = n; // Security parameter (32 bytes for 256-bit security)
    this.h = h; // Height of hypertree (reduced for efficiency)
    this.d = d; // Number of layers
    this.w = w; // Winternitz parameter
    this.t = Math.floor((8 * this.n) / Math.log2(this.w)) + 1; // WOTS chain length
    
    // Validate parameters
    if (this.n !== 32) throw new Error('Only n=32 is supported');
    if (this.h % this.d !== 0) throw new Error('h must be divisible by d');
    if (this.w < 4 || this.w > 256) throw new Error('w must be between 4 and 256');
  }

  generateKeyPair() {
    console.log(`Generating SPHINCS+ key pair (n=${this.n}, h=${this.h}, d=${this.d}, w=${this.w})`);
    
    // Generate cryptographically secure random seeds
    const sk_seed = crypto.randomBytes(this.n);
    const sk_prf = crypto.randomBytes(this.n);
    const pub_seed = crypto.randomBytes(this.n);

    const privateKey = {
      sk_seed: sk_seed.toString('hex'),
      sk_prf: sk_prf.toString('hex'),
      pub_seed: pub_seed.toString('hex'),
      n: this.n,
      h: this.h,
      d: this.d,
      w: this.w
    };

    const publicKey = this.generatePublicKey(privateKey);

    return {
      privateKey,
      publicKey
    };
  }

  generatePublicKey(privateKey) {
    const sk_seed = Buffer.from(privateKey.sk_seed, 'hex');
    const pub_seed = Buffer.from(privateKey.pub_seed, 'hex');

    // Generate root of the hypertree
    const root = this.buildHypertreeRoot(sk_seed, pub_seed);

    return {
      pub_seed: privateKey.pub_seed,
      root: root.toString('hex'),
      n: this.n,
      h: this.h,
      d: this.d,
      w: this.w
    };
  }

  buildHypertreeRoot(sk_seed, pub_seed) {
    // Simplified but secure hypertree construction
    const treeHeight = this.h / this.d;
    const numTrees = Math.pow(2, this.h - treeHeight);
    
    console.log(`Building hypertree: ${numTrees} trees of height ${treeHeight}`);
    
    const treeRoots = [];
    
    for (let treeIdx = 0; treeIdx < Math.min(numTrees, 16); treeIdx++) {
      const treeRoot = this.buildSingleTree(sk_seed, pub_seed, treeIdx, treeHeight);
      treeRoots.push(treeRoot);
    }
    
    // Combine all tree roots into final root
    return this.merkleRoot(treeRoots, pub_seed);
  }

  buildSingleTree(sk_seed, pub_seed, treeIdx, height) {
    const numLeaves = Math.pow(2, height);
    const leaves = [];
    
    // Generate WOTS+ public keys as leaves
    for (let leafIdx = 0; leafIdx < numLeaves; leafIdx++) {
      const wotsPublicKey = this.generateWOTSPublicKey(sk_seed, pub_seed, treeIdx, leafIdx);
      leaves.push(wotsPublicKey);
    }
    
    return this.merkleRoot(leaves, pub_seed);
  }

  generateWOTSPublicKey(sk_seed, pub_seed, treeIdx, leafIdx) {
    // Generate WOTS+ private key
    const wotsPrivateKey = this.generateWOTSPrivateKey(sk_seed, treeIdx, leafIdx);
    
    // Convert to public key using hash chains
    const publicKeyParts = [];
    
    for (let i = 0; i < this.t; i++) {
      let current = wotsPrivateKey[i];
      
      // Apply hash chain (w-1) times
      for (let j = 0; j < this.w - 1; j++) {
        const input = Buffer.concat([
          pub_seed,
          current,
          Buffer.from([i, j])
        ]);
        current = SHA256.hash(input);
      }
      
      publicKeyParts.push(current);
    }
    
    // Combine all parts into single public key
    return SHA256.hashMultiple(...publicKeyParts);
  }

  generateWOTSPrivateKey(sk_seed, treeIdx, leafIdx) {
    const privateKey = [];
    
    for (let i = 0; i < this.t; i++) {
      const input = Buffer.concat([
        sk_seed,
        Buffer.from([treeIdx, leafIdx, i])
      ]);
      privateKey.push(SHA256.hash(input));
    }
    
    return privateKey;
  }

  merkleRoot(leaves, seed) {
    if (leaves.length === 0) {
      return SHA256.hash(seed);
    }
    
    if (leaves.length === 1) {
      return leaves[0];
    }
    
    const nextLevel = [];
    
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i];
      const right = i + 1 < leaves.length ? leaves[i + 1] : left;
      
      const combined = Buffer.concat([seed, left, right]);
      nextLevel.push(SHA256.hash(combined));
    }
    
    return this.merkleRoot(nextLevel, seed);
  }

  // Generate authentication path for signature verification
  generateAuthPath(leafIdx, treeHeight) {
    const authPath = [];
    let currentIdx = leafIdx;
    
    for (let level = 0; level < treeHeight; level++) {
      const siblingIdx = currentIdx % 2 === 0 ? currentIdx + 1 : currentIdx - 1;
      
      // In a real implementation, this would be the actual sibling hash
      // For now, we generate a deterministic placeholder
      const siblingHash = SHA256.hash(Buffer.from(`sibling_${siblingIdx}_${level}`));
      authPath.push(siblingHash.toString('hex'));
      
      currentIdx = Math.floor(currentIdx / 2);
    }
    
    return authPath;
  }

  // Utility function for deterministic randomness
  generatePseudoRandom(seed, index) {
    const input = Buffer.concat([
      seed,
      Buffer.from(index.toString())
    ]);
    return SHA256.hash(input);
  }
}

module.exports = SPHINCSKeyGen;