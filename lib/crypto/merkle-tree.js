const SHA256 = require('./sha256');

class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves.map(leaf => 
      Buffer.isBuffer(leaf) ? leaf : Buffer.from(leaf, 'hex')
    );
    this.tree = this.buildTree();
  }

  buildTree() {
    if (this.leaves.length === 0) {
      throw new Error('Cannot build tree with no leaves');
    }

    let currentLevel = [...this.leaves];
    const tree = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          // Hash pair of nodes
          const combined = Buffer.concat([currentLevel[i], currentLevel[i + 1]]);
          nextLevel.push(SHA256.hash(combined));
        } else {
          // Odd number of nodes, promote the last one
          nextLevel.push(currentLevel[i]);
        }
      }
      
      currentLevel = nextLevel;
      tree.push(currentLevel);
    }

    return tree;
  }

  getRoot() {
    return this.tree[this.tree.length - 1][0];
  }

  getProof(leafIndex) {
    if (leafIndex >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }

    const proof = [];
    let currentIndex = leafIndex;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const currentLevel = this.tree[level];
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;

      if (siblingIndex < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIndex],
          position: currentIndex % 2 === 0 ? 'right' : 'left'
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  static verifyProof(leaf, proof, root) {
    let computedHash = Buffer.isBuffer(leaf) ? leaf : Buffer.from(leaf, 'hex');

    for (const proofElement of proof) {
      const proofHash = Buffer.isBuffer(proofElement.hash) ? 
        proofElement.hash : Buffer.from(proofElement.hash, 'hex');

      if (proofElement.position === 'left') {
        computedHash = SHA256.hash(Buffer.concat([proofHash, computedHash]));
      } else {
        computedHash = SHA256.hash(Buffer.concat([computedHash, proofHash]));
      }
    }

    const rootBuffer = Buffer.isBuffer(root) ? root : Buffer.from(root, 'hex');
    return computedHash.equals(rootBuffer);
  }
}

module.exports = MerkleTree;
