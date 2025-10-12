const SHA256 = require('../crypto/sha256');

class SPHINCSVerifier {
  constructor(publicKey) {
    this.publicKey = publicKey;
    this.n = publicKey.n;
    this.h = publicKey.h;
    this.d = publicKey.d;
    this.w = publicKey.w;
    this.t = Math.floor((8 * this.n) / Math.log2(this.w)) + 1;
  }

  verify(message, signature) {
    try {
      console.log('Verifying SPHINCS+ signature...');
      
      // Hash the message
      const messageHash = SHA256.hash(message);
      
      // Parse signature components
      const parsedSig = this.parseSignature(signature);
      
      // Verify FORS signature and recover public key
      const recoveredForsKey = this.verifyFORSSignature(
        messageHash,
        parsedSig.forsSignature,
        parsedSig.leafIdx
      );
      
      if (!recoveredForsKey) {
        console.log('FORS signature verification failed');
        return false;
      }
      
      // Verify hypertree signature
      const isTreeValid = this.verifyTreeSignature(
        recoveredForsKey,
        parsedSig.treeSignature,
        parsedSig.authPath,
        parsedSig.leafIdx
      );
      
      console.log(`Signature verification: ${isTreeValid ? 'VALID' : 'INVALID'}`);
      return isTreeValid;
      
    } catch (error) {
      console.error('Signature verification error:', error.message);
      return false;
    }
  }

  parseSignature(signature) {
    // Parse the signature components
    const sigBuffer = Buffer.from(signature.signature, 'hex');
    
    // FORS signature length (simplified calculation)
    const k = 35; // Number of FORS trees
    const forsLength = k * this.n;
    
    const forsSignature = sigBuffer.slice(0, forsLength);
    const treeSignature = sigBuffer.slice(forsLength);
    
    return {
      forsSignature,
      treeSignature,
      leafIdx: signature.leafIdx,
      authPath: signature.authPath || []
    };
  }

  verifyFORSSignature(messageHash, forsSignature, leafIdx) {
    try {
      const k = 35; // Number of FORS trees
      const t = 16; // FORS tree height
      
      const publicKeyParts = [];
      
      for (let i = 0; i < k; i++) {
        // Extract message bits for this FORS tree
        const treeIndex = this.extractBits(messageHash, i * t, t);
        
        // Extract signature part for this tree
        const sigStart = i * this.n;
        const sigEnd = (i + 1) * this.n;
        const forsPrivateKey = forsSignature.slice(sigStart, sigEnd);
        
        // Recover public key from signature
        const recoveredPublicKey = this.recoverFORSPublicKey(
          forsPrivateKey,
          i,
          treeIndex
        );
        
        publicKeyParts.push(recoveredPublicKey);
      }
      
      // Combine all FORS public keys
      return SHA256.hashMultiple(...publicKeyParts);
      
    } catch (error) {
      console.error('FORS verification error:', error.message);
      return null;
    }
  }

  recoverFORSPublicKey(privateKey, treeIdx, leafIdx) {
    const pub_seed = Buffer.from(this.publicKey.pub_seed, 'hex');
    
    // Apply hash chain to recover public key
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

  verifyTreeSignature(forsPublicKey, treeSignature, authPath, leafIdx) {
    try {
      const pub_seed = Buffer.from(this.publicKey.pub_seed, 'hex');
      const expectedRoot = Buffer.from(this.publicKey.root, 'hex');
      
      let currentPublicKey = forsPublicKey;
      let currentLeafIdx = leafIdx;
      let sigOffset = 0;
      let pathOffset = 0;
      
      // Verify each layer of the hypertree
      for (let layer = 0; layer < this.d; layer++) {
        const treeHeight = this.h / this.d;
        const localLeafIdx = currentLeafIdx % Math.pow(2, treeHeight);
        
        // Extract WOTS+ signature for this layer
        const wotsSignature = treeSignature.slice(sigOffset, sigOffset + (this.t * this.n));
        sigOffset += this.t * this.n;
        
        // Verify WOTS+ signature and recover public key
        const recoveredKey = this.verifyWOTSSignature(
          currentPublicKey,
          wotsSignature,
          pub_seed,
          layer
        );
        
        if (!recoveredKey) {
          console.log(`WOTS+ verification failed at layer ${layer}`);
          return false;
        }
        
        // Verify authentication path for this layer
        const layerAuthPath = authPath.slice(pathOffset, pathOffset + treeHeight);
        pathOffset += treeHeight;
        
        const computedRoot = this.computeMerkleRoot(
          recoveredKey,
          layerAuthPath,
          localLeafIdx,
          pub_seed
        );
        
        // For intermediate layers, the computed root becomes the next public key
        if (layer < this.d - 1) {
          currentPublicKey = computedRoot;
          currentLeafIdx = Math.floor(currentLeafIdx / Math.pow(2, treeHeight));
        } else {
          // Final layer: compare with expected root
          if (!computedRoot.equals(expectedRoot)) {
            console.log('Root verification failed');
            return false;
          }
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('Tree signature verification error:', error.message);
      return false;
    }
  }

  verifyWOTSSignature(message, signature, pub_seed, layer) {
    try {
      // Convert message to base-w representation
      const messageInts = this.baseW(message, this.w, this.t);
      
      const publicKeyParts = [];
      
      for (let i = 0; i < this.t; i++) {
        const chainLength = messageInts[i];
        const sigStart = i * this.n;
        const sigEnd = (i + 1) * this.n;
        
        let current = signature.slice(sigStart, sigEnd);
        
        // Continue hash chain from signature to public key
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
      
      return SHA256.hashMultiple(...publicKeyParts);
      
    } catch (error) {
      console.error('WOTS+ verification error:', error.message);
      return null;
    }
  }

  computeMerkleRoot(leafHash, authPath, leafIdx, seed) {
    let currentHash = leafHash;
    let currentIdx = leafIdx;
    
    for (const pathNode of authPath) {
      const pathNodeBuffer = Buffer.from(pathNode, 'hex');
      const isRightChild = currentIdx % 2;
      
      let input;
      if (isRightChild) {
        input = Buffer.concat([seed, pathNodeBuffer, currentHash]);
      } else {
        input = Buffer.concat([seed, currentHash, pathNodeBuffer]);
      }
      
      currentHash = SHA256.hash(input);
      currentIdx = Math.floor(currentIdx / 2);
    }
    
    return currentHash;
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

  // Utility method for constant-time comparison
  constantTimeEquals(a, b) {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }
}

module.exports = SPHINCSVerifier;