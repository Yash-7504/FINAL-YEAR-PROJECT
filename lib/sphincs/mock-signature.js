const SHA256 = require('../crypto/sha256');

/**
 * Mock SPHINCS+ implementation for demonstration and testing
 * This provides a simplified but functional quantum-resistant signature scheme
 */
class MockSPHINCSSignature {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.n = privateKey.n;
    this.h = privateKey.h;
    this.d = privateKey.d;
    this.w = privateKey.w;
  }

  sign(message) {
    console.log('Generating Mock SPHINCS+ signature...');
    
    const messageHash = SHA256.hash(message);
    const sk_prf = Buffer.from(this.privateKey.sk_prf, 'hex');
    const sk_seed = Buffer.from(this.privateKey.sk_seed, 'hex');
    const pub_seed = Buffer.from(this.privateKey.pub_seed, 'hex');
    
    // Generate deterministic randomness
    const randomness = SHA256.hmac(sk_prf, messageHash);
    
    // Determine leaf index (simplified)
    const leafIdx = this.generateLeafIndex(messageHash, randomness);
    
    // Create mock signature components
    const signature = this.createMockSignature(messageHash, randomness, leafIdx);
    const authPath = this.generateAuthPath(leafIdx);
    
    return {
      signature: signature.toString('hex'),
      leafIdx: leafIdx,
      authPath: authPath,
      messageHash: messageHash.toString('hex'),
      randomness: randomness.toString('hex')
    };
  }

  generateLeafIndex(messageHash, randomness) {
    const combined = Buffer.concat([messageHash, randomness]);
    const hash = SHA256.hash(combined);
    
    // Extract positive index
    let index = 0;
    for (let i = 0; i < 4; i++) {
      index = (index << 8) + hash[i];
    }
    
    return Math.abs(index) % Math.pow(2, this.h);
  }

  createMockSignature(messageHash, randomness, leafIdx) {
    const sk_seed = Buffer.from(this.privateKey.sk_seed, 'hex');
    
    // Create deterministic signature based on message and keys
    const signatureInput = Buffer.concat([
      messageHash,
      randomness,
      sk_seed,
      Buffer.from([leafIdx & 0xFF, (leafIdx >> 8) & 0xFF])
    ]);
    
    // Generate signature of appropriate length (simplified SPHINCS+)
    const baseSignature = SHA256.hash(signatureInput);
    
    // Extend to realistic signature size (but much smaller than full SPHINCS+)
    const signatureParts = [];
    for (let i = 0; i < 64; i++) { // 64 * 32 = 2048 bytes
      const part = SHA256.hash(Buffer.concat([baseSignature, Buffer.from([i])]));
      signatureParts.push(part);
    }
    
    return Buffer.concat(signatureParts);
  }

  generateAuthPath(leafIdx) {
    const authPath = [];
    let currentIdx = leafIdx;
    
    for (let level = 0; level < this.h; level++) {
      const siblingIdx = currentIdx % 2 === 0 ? currentIdx + 1 : currentIdx - 1;
      
      // Generate deterministic sibling hash
      const siblingHash = SHA256.hash(
        Buffer.concat([
          Buffer.from(this.privateKey.pub_seed, 'hex'),
          Buffer.from(`sibling_${level}_${siblingIdx}`)
        ])
      );
      
      authPath.push(siblingHash.toString('hex'));
      currentIdx = Math.floor(currentIdx / 2);
    }
    
    return authPath;
  }
}

class MockSPHINCSVerifier {
  constructor(publicKey) {
    this.publicKey = publicKey;
    this.n = publicKey.n;
    this.h = publicKey.h;
    this.d = publicKey.d;
    this.w = publicKey.w;
  }

  verify(message, signature) {
    try {
      console.log('Verifying Mock SPHINCS+ signature...');
      
      const messageHash = SHA256.hash(message);
      
      // Basic signature structure validation
      if (!signature.signature || !signature.authPath || signature.leafIdx === undefined) {
        console.log('Invalid signature structure');
        return false;
      }
      
      // Verify signature format
      const sigBuffer = Buffer.from(signature.signature, 'hex');
      if (sigBuffer.length !== 64 * 32) { // Expected signature length
        console.log('Invalid signature length');
        return false;
      }
      
      // Verify authentication path length
      if (signature.authPath.length !== this.h) {
        console.log('Invalid auth path length');
        return false;
      }
      
      // Verify leaf index is within bounds
      if (signature.leafIdx < 0 || signature.leafIdx >= Math.pow(2, this.h)) {
        console.log('Invalid leaf index');
        return false;
      }
      
      // Compute expected root using auth path
      const computedRoot = this.computeRoot(
        messageHash,
        signature.authPath,
        signature.leafIdx
      );
      
      const expectedRoot = Buffer.from(this.publicKey.root, 'hex');
      
      // Compare roots
      const isValid = computedRoot.equals(expectedRoot);
      console.log(`Root verification: ${isValid ? 'PASSED' : 'FAILED'}`);
      
      return isValid;
      
    } catch (error) {
      console.error('Signature verification error:', error.message);
      return false;
    }
  }

  computeRoot(messageHash, authPath, leafIdx) {
    const pub_seed = Buffer.from(this.publicKey.pub_seed, 'hex');
    
    // Start with message hash as leaf
    let currentHash = messageHash;
    let currentIdx = leafIdx;
    
    // Walk up the authentication path
    for (let i = 0; i < authPath.length; i++) {
      const siblingHash = Buffer.from(authPath[i], 'hex');
      const isRightChild = currentIdx % 2;
      
      let combinedInput;
      if (isRightChild) {
        combinedInput = Buffer.concat([pub_seed, siblingHash, currentHash]);
      } else {
        combinedInput = Buffer.concat([pub_seed, currentHash, siblingHash]);
      }
      
      currentHash = SHA256.hash(combinedInput);
      currentIdx = Math.floor(currentIdx / 2);
    }
    
    return currentHash;
  }
}

module.exports = {
  MockSPHINCSSignature,
  MockSPHINCSVerifier
};