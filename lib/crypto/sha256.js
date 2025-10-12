const crypto = require('crypto');

class SHA256 {
  static hash(data) {
    if (!data) throw new Error('Data is required for hashing');
    
    if (Buffer.isBuffer(data)) {
      return crypto.createHash('sha256').update(data).digest();
    }
    if (typeof data === 'string') {
      return crypto.createHash('sha256').update(Buffer.from(data, 'utf8')).digest();
    }
    if (data instanceof Uint8Array) {
      return crypto.createHash('sha256').update(Buffer.from(data)).digest();
    }
    
    throw new Error('Unsupported data type for hashing');
  }
  
  static hashToHex(data) {
    return this.hash(data).toString('hex');
  }

  static hashMultiple(...inputs) {
    if (inputs.length === 0) throw new Error('At least one input is required');
    
    const hash = crypto.createHash('sha256');
    for (const input of inputs) {
      if (Buffer.isBuffer(input)) {
        hash.update(input);
      } else if (typeof input === 'string') {
        hash.update(Buffer.from(input, 'utf8'));
      } else if (input instanceof Uint8Array) {
        hash.update(Buffer.from(input));
      } else {
        throw new Error('Unsupported input type for hashing');
      }
    }
    return hash.digest();
  }

  static hashChain(data, iterations) {
    if (iterations < 0) throw new Error('Iterations must be non-negative');
    
    let result = Buffer.isBuffer(data) ? data : Buffer.from(data, 'hex');
    for (let i = 0; i < iterations; i++) {
      result = this.hash(result);
    }
    return result;
  }

  static hashWithAddress(data, address) {
    const addressBuffer = Buffer.from(address.replace('0x', ''), 'hex');
    return this.hash(Buffer.concat([addressBuffer, data]));
  }

  static hmac(key, data) {
    if (!key || !data) throw new Error('Key and data are required for HMAC');
    
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key);
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    return crypto.createHmac('sha256', keyBuffer).update(dataBuffer).digest();
  }

  static doubleHash(data) {
    return this.hash(this.hash(data));
  }

  static verify(data, expectedHash) {
    const actualHash = this.hash(data);
    return actualHash.equals(Buffer.from(expectedHash, 'hex'));
  }
}

module.exports = SHA256;