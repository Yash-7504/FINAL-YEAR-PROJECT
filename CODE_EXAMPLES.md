# 💻 Code Examples & Implementation Guide

## Quick Integration Examples

### 1. Using Quantum Transaction Flow Component

```typescript
import { QuantumTransactionFlow } from '@/components/QuantumTransactionFlow';

// In your component:
const [quantumFlowStep, setQuantumFlowStep] = useState<
  'idle' | 'initializing' | 'generating' | 'signing' | 'securing' | 'complete' | 'error'
>('idle');
const [quantumFlowError, setQuantumFlowError] = useState<string>('');

// Trigger the flow
<QuantumTransactionFlow
  isOpen={quantumFlowStep !== 'idle'}
  currentStep={quantumFlowStep}
  errorMessage={quantumFlowError}
  onClose={() => setQuantumFlowStep('idle')}
/>

// Usage in transaction handler:
setQuantumFlowStep('initializing');
await new Promise((resolve) => setTimeout(resolve, 800));

setQuantumFlowStep('generating');
// ... do work ...
await new Promise((resolve) => setTimeout(resolve, 1200));

setQuantumFlowStep('signing');
// ... do work ...
await new Promise((resolve) => setTimeout(resolve, 1000));

// etc...
setQuantumFlowStep('complete');
```

---

### 2. Using Wallet Encryption Service

#### Generate Quantum Keys

```typescript
import { walletQuantumEncryption } from '@/services/walletQuantumEncryption';

// Generate new key pair
const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
console.log('Public Key:', keyPair.publicKey);
console.log('Private Key:', keyPair.privateKey);
```

#### Encrypt Wallet

```typescript
// Encrypt wallet with quantum keys
const encrypted = walletQuantumEncryption.encryptWalletWithQuantumKey(
  '0x1234567890123456789012345678901234567890',
  'wallet_private_key_hex',
  keyPair // optional, uses last generated if not provided
);

console.log('Encrypted Wallet:', {
  encryptedPrivateKey: encrypted.encryptedPrivateKey,
  quantumPublicKey: encrypted.quantumPublicKey,
  algorithm: encrypted.algorithm // "SPHINCS+"
});
```

#### Sign Transaction

```typescript
// Create transaction data
const transactionData = {
  to: '0xRecipient...',
  value: ethers.utils.parseEther('1.0'),
  timestamp: Date.now(),
  nonce: 42
};

// Sign with quantum-resistant signature
const signature = await walletQuantumEncryption.signTransactionQuantumSecure(
  transactionData,
  keyPair.privateKey
);

console.log('Quantum Signature:', signature);
// Output: "a1b2c3d4e5f6..." (256 char hex string)
```

#### Verify Signature

```typescript
// Verify the signature
const isValid = walletQuantumEncryption.verifyQuantumSignature(
  transactionData,
  signature,
  keyPair.publicKey
);

console.log('Signature Valid:', isValid); // true
```

#### Check Encryption Status

```typescript
// Get wallet encryption status
const status = walletQuantumEncryption.getWalletEncryptionStatus(
  '0x1234567890123456789012345678901234567890'
);

console.log(status);
// Output: {
//   isEncrypted: true,
//   algorithm: "SPHINCS+",
//   timestamp: 1702650000000
// }
```

---

### 3. Complete Transaction Flow Example

```typescript
async function handleQuantumSecureTransaction(
  recipient: string,
  amount: string,
  signer: any
) {
  try {
    // Step 1: Initialize
    setQuantumFlowStep('initializing');
    console.log('Starting quantum-secure transaction...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Step 2: Generate quantum keys
    setQuantumFlowStep('generating');
    console.log('Generating SPHINCS+ quantum keys...');
    const quantumKeyPair = walletQuantumEncryption.generateQuantumKeyPair();
    console.log('✓ Keys generated');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Step 3: Sign with quantum security
    setQuantumFlowStep('signing');
    console.log('Signing transaction with quantum signature...');
    
    const transactionData = {
      to: recipient,
      value: ethers.utils.parseEther(amount),
      timestamp: Date.now(),
      chainId: 1,
    };

    const quantumSignature = 
      await walletQuantumEncryption.signTransactionQuantumSecure(
        transactionData,
        quantumKeyPair.privateKey
      );
    console.log('✓ Transaction signed');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 4: Secure verification
    setQuantumFlowStep('securing');
    console.log('Verifying quantum signature...');
    
    const isSecure = walletQuantumEncryption.verifyQuantumSignature(
      transactionData,
      quantumSignature,
      quantumKeyPair.publicKey
    );

    if (!isSecure) {
      throw new Error('Quantum security verification failed');
    }
    console.log('✓ Signature verified');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 5: Complete - broadcast transaction
    setQuantumFlowStep('complete');
    console.log('Broadcasting quantum-secure transaction...');
    
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(amount),
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('✓ Transaction submitted:', tx.hash);

    // Wait for confirmation
    await tx.wait();
    console.log('✓ Transaction confirmed!');

    // Show success
    setTxStatus({
      success: true,
      hash: tx.hash,
      message: `✨ Successfully sent ${amount} ETH with quantum-resistant signature!`
    });

    setTimeout(() => {
      setQuantumFlowStep('idle');
    }, 2000);

  } catch (error) {
    console.error('Quantum transaction failed:', error);
    setQuantumFlowError(error.message);
    setQuantumFlowStep('error');
    setTimeout(() => {
      setQuantumFlowStep('idle');
    }, 3000);
  }
}
```

---

### 4. React Hook Pattern

```typescript
import { useCallback } from 'react';
import { walletQuantumEncryption } from '@/services/walletQuantumEncryption';

export function useQuantumWallet() {
  const initializeQuantumEncryption = useCallback(
    (walletAddress: string) => {
      try {
        const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
        walletQuantumEncryption.encryptWalletWithQuantumKey(
          walletAddress,
          'wallet_private_key'
        );
        return keyPair;
      } catch (error) {
        console.error('Failed to initialize quantum encryption:', error);
        throw error;
      }
    },
    []
  );

  const signTransaction = useCallback(
    async (transactionData: any) => {
      try {
        const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
        const signature = 
          await walletQuantumEncryption.signTransactionQuantumSecure(
            transactionData,
            keyPair.privateKey
          );
        return signature;
      } catch (error) {
        console.error('Failed to sign transaction:', error);
        throw error;
      }
    },
    []
  );

  const getEncryptionStatus = useCallback(
    (walletAddress: string) => {
      return walletQuantumEncryption.getWalletEncryptionStatus(walletAddress);
    },
    []
  );

  return {
    initializeQuantumEncryption,
    signTransaction,
    getEncryptionStatus,
  };
}

// Usage:
function MyComponent() {
  const { initializeQuantumEncryption, signTransaction, getEncryptionStatus } = 
    useQuantumWallet();

  const handleConnect = async (address: string) => {
    await initializeQuantumEncryption(address);
    const status = getEncryptionStatus(address);
    console.log('Encryption status:', status);
  };

  return (
    <button onClick={() => handleConnect('0x...')}>
      Connect with Quantum Encryption
    </button>
  );
}
```

---

### 5. Error Handling Example

```typescript
async function performTransactionWithErrorHandling(
  recipient: string,
  amount: string,
  signer: any
) {
  setQuantumFlowStep('initializing');

  try {
    // Validate inputs
    if (!recipient || !recipient.startsWith('0x')) {
      throw new Error('Invalid recipient address');
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    // Generate keys
    setQuantumFlowStep('generating');
    let keyPair;
    try {
      keyPair = walletQuantumEncryption.generateQuantumKeyPair();
    } catch (error) {
      throw new Error(`Key generation failed: ${error.message}`);
    }

    // Sign transaction
    setQuantumFlowStep('signing');
    let signature;
    try {
      const txData = {
        to: recipient,
        value: ethers.utils.parseEther(amount),
        timestamp: Date.now(),
      };
      signature = await walletQuantumEncryption.signTransactionQuantumSecure(
        txData,
        keyPair.privateKey
      );
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error.message}`);
    }

    // Verify
    setQuantumFlowStep('securing');
    try {
      const isValid = walletQuantumEncryption.verifyQuantumSignature(
        { to: recipient, value: ethers.utils.parseEther(amount), timestamp: Date.now() },
        signature,
        keyPair.publicKey
      );
      if (!isValid) {
        throw new Error('Signature verification failed - possible tampering detected');
      }
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`);
    }

    // Broadcast
    setQuantumFlowStep('complete');
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(amount),
    });

    await tx.wait();
    return tx;

  } catch (error) {
    setQuantumFlowError(error.message);
    setQuantumFlowStep('error');
    throw error;
  }
}
```

---

### 6. LocalStorage Integration

```typescript
// Save encrypted wallet
function saveEncryptedWallet(address: string, encrypted: EncryptedWallet) {
  const key = `quantum_encrypted_wallet_${address}`;
  localStorage.setItem(key, JSON.stringify({
    ...encrypted,
    savedAt: new Date().toISOString(),
  }));
  console.log('✓ Encrypted wallet saved to localStorage');
}

// Retrieve encrypted wallet
function getEncryptedWallet(address: string): EncryptedWallet | null {
  const key = `quantum_encrypted_wallet_${address}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  const data = JSON.parse(stored);
  console.log('✓ Encrypted wallet retrieved from localStorage');
  return data;
}

// Clear encrypted wallet
function clearEncryptedWallet(address: string) {
  const key = `quantum_encrypted_wallet_${address}`;
  localStorage.removeItem(key);
  console.log('✓ Encrypted wallet cleared from localStorage');
}

// Check if wallet is encrypted
function isWalletEncrypted(address: string): boolean {
  return localStorage.getItem(`quantum_encrypted_wallet_${address}`) !== null;
}
```

---

### 7. TypeScript Type Definitions

```typescript
// Quantum key pair interface
interface QuantumKeyPair {
  publicKey: string;      // SPHINCS+ public key (hex)
  privateKey: string;     // SPHINCS+ private key (hex)
  timestamp: number;      // When keys were generated
}

// Encrypted wallet interface
interface EncryptedWallet {
  encryptedPrivateKey: string;  // Encrypted wallet private key
  quantumPublicKey: string;     // SPHINCS+ public key
  encryptionNonce: string;      // Random encryption nonce
  timestamp: number;            // When wallet was encrypted
  algorithm: 'SPHINCS+';        // Encryption algorithm
}

// Transaction data interface
interface QuantumTransaction {
  to: string;           // Recipient address
  value: BigNumberish;  // Amount to send
  timestamp: number;    // Transaction timestamp
  chainId?: number;     // Chain ID
  nonce?: number;       // Nonce
  data?: string;        // Optional data
}

// Component props
interface QuantumTransactionFlowProps {
  isOpen: boolean;
  currentStep: 'idle' | 'initializing' | 'generating' | 'signing' | 'securing' | 'complete' | 'error';
  errorMessage?: string;
  onClose?: () => void;
}

// Service interface
interface IWalletQuantumEncryption {
  generateQuantumKeyPair(): QuantumKeyPair;
  encryptWalletWithQuantumKey(
    walletAddress: string,
    walletPrivateKey: string,
    quantumKeyPair?: QuantumKeyPair
  ): EncryptedWallet;
  decryptWalletWithQuantumKey(
    walletAddress: string,
    quantumPrivateKey: string
  ): string;
  signTransactionQuantumSecure(
    transactionData: any,
    quantumPrivateKey: string
  ): Promise<string>;
  verifyQuantumSignature(
    transactionData: any,
    signature: string,
    quantumPublicKey: string
  ): boolean;
  getWalletEncryptionStatus(walletAddress: string): {
    isEncrypted: boolean;
    algorithm: string;
    timestamp?: number;
  };
}
```

---

### 8. Testing Examples

```typescript
// Jest test example
describe('QuantumTransactionFlow', () => {
  it('should display all steps in order', async () => {
    const { getByText } = render(
      <QuantumTransactionFlow
        isOpen={true}
        currentStep="initializing"
      />
    );

    expect(getByText('Initializing Transaction')).toBeInTheDocument();
  });

  it('should show error state correctly', () => {
    const { getByText } = render(
      <QuantumTransactionFlow
        isOpen={true}
        currentStep="error"
        errorMessage="Transaction failed"
      />
    );

    expect(getByText('Transaction Failed')).toBeInTheDocument();
    expect(getByText('Transaction failed')).toBeInTheDocument();
  });
});

describe('walletQuantumEncryption', () => {
  it('should generate valid key pair', () => {
    const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
    
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.timestamp).toBeDefined();
    expect(keyPair.publicKey.startsWith('sphinx_pub_')).toBe(true);
    expect(keyPair.privateKey.startsWith('sphinx_priv_')).toBe(true);
  });

  it('should encrypt and decrypt wallet', () => {
    const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
    const originalKey = 'my_secret_key_12345';
    
    const encrypted = walletQuantumEncryption.encryptWalletWithQuantumKey(
      '0x1234567890123456789012345678901234567890',
      originalKey,
      keyPair
    );
    
    const decrypted = walletQuantumEncryption.decryptWalletWithQuantumKey(
      '0x1234567890123456789012345678901234567890',
      keyPair.privateKey
    );
    
    expect(decrypted).toBeDefined();
  });

  it('should sign and verify transactions', async () => {
    const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
    const txData = { to: '0x...', amount: '1.0' };
    
    const signature = 
      await walletQuantumEncryption.signTransactionQuantumSecure(
        txData,
        keyPair.privateKey
      );
    
    const isValid = walletQuantumEncryption.verifyQuantumSignature(
      txData,
      signature,
      keyPair.publicKey
    );
    
    expect(isValid).toBe(true);
  });
});
```

---

## 📚 Best Practices

### 1. Always Initialize Before Use
```typescript
// GOOD
const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
const signature = await walletQuantumEncryption.signTransactionQuantumSecure(
  data,
  keyPair.privateKey
);

// BAD - no key pair generated
// const signature = await walletQuantumEncryption.signTransactionQuantumSecure(data, null);
```

### 2. Handle Errors Properly
```typescript
// GOOD
try {
  const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
} catch (error) {
  console.error('Key generation failed:', error);
  setQuantumFlowError(error.message);
  setQuantumFlowStep('error');
}

// BAD - no error handling
// const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
```

### 3. Use TypeScript Types
```typescript
// GOOD
const keyPair: QuantumKeyPair = walletQuantumEncryption.generateQuantumKeyPair();
const status: { isEncrypted: boolean; algorithm: string } = 
  walletQuantumEncryption.getWalletEncryptionStatus(address);

// BAD - no types
// const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
```

### 4. Always Verify Signatures
```typescript
// GOOD
const isValid = walletQuantumEncryption.verifyQuantumSignature(
  txData,
  signature,
  keyPair.publicKey
);
if (!isValid) {
  throw new Error('Signature verification failed');
}

// BAD - don't verify
// await broadcastTransaction(tx); // dangerous!
```

---

**Now you're ready to build quantum-secure dApps! 🚀🔐**
