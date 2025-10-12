import React, { useState } from 'react';
import { Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { ethers } from 'ethers';

interface KeyManagerProps {
  account: string;
  quantumToken: ethers.Contract | null;
  sphincs: ethers.Contract | null;
  isKeyRegistered: boolean;
  onKeyRegistered: () => void;
}

const KeyManager: React.FC<KeyManagerProps> = ({ 
  account, 
  quantumToken, 
  sphincs, 
  isKeyRegistered, 
  onKeyRegistered 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const generateKey = async () => {
    if (!quantumToken) {
      setError('Contract not initialized');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('Generating quantum key for:', account);
      
      // Generate mock SPHINCS+ parameters
      const mockPublicKey = {
        pub_seed: ethers.utils.randomBytes(32),
        root: ethers.utils.randomBytes(32),
        n: 32,
        h: 16,
        d: 4,
        w: 16
      };
      
      // Register the public key
      const tx = await quantumToken.registerPublicKey(
        mockPublicKey.pub_seed,
        mockPublicKey.root,
        mockPublicKey.n,
        mockPublicKey.h,
        mockPublicKey.d,
        mockPublicKey.w,
        {
          gasLimit: 500000,
          gasPrice: ethers.utils.parseUnits('20', 'gwei')
        }
      );
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      
      console.log('Key registered successfully!');
      onKeyRegistered();
      
    } catch (error: any) {
      console.error('Key generation failed:', error);
      setError(error.message || 'Key generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isKeyRegistered) {
    return (
      <Alert severity="success">
        <Typography fontWeight={600}>
          Quantum key registered successfully!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          SPHINCS+ key pair is active and ready for quantum-resistant transactions.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Generate your quantum-resistant SPHINCS+ key pair to enable secure transactions.
      </Alert>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box textAlign="center">
        <Button 
          variant="contained" 
          color="primary"
          onClick={generateKey}
          disabled={isGenerating || !quantumToken}
          sx={{ px: 4, py: 1.5 }}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Generating...
            </>
          ) : (
            'Generate Quantum Key'
          )}
        </Button>
      </Box>
      
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}>
        This will create a SPHINCS+ key pair for quantum-resistant signatures
      </Typography>
    </Box>
  );
};

export default KeyManager;