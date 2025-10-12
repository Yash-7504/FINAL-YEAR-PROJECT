const crypto = require('crypto');

class SHAKE256 {
  static hash(data, outputLength = 32) {
    // Node.js doesn't have native SHAKE256, so we'll use a workaround
    // In production, you'd want to use a proper SHAKE implementation
    let result = crypto.createHash('sha256').update(data).digest();
    
    // Simulate SHAKE by hashing multiple times for longer output
    if (outputLength > 32) {
      const rounds = Math.ceil(outputLength / 32);
      let extended = Buffer.alloc(0);
      
      for (let i = 0; i < rounds; i++) {
        const input = Buffer.concat([result, Buffer.from([i])]);
        const round = crypto.createHash('sha256').update(input).digest();
        extended = Buffer.concat([extended, round]);
      }
      result = extended.slice(0, outputLength);
    }
    
    return result;
  }

  static hashToHex(data, outputLength = 32) {
    return this.hash(data, outputLength).toString('hex');
  }
}

module.exports = SHAKE256;
