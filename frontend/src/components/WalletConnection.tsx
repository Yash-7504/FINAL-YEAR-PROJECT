import React, { useState } from 'react';
import { Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface WalletConnectionProps {
  onConnect: () => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('localhost');

  const switchNetwork = async (network: string) => {
    if (!window.ethereum) return;
    
    try {
      if (network === 'localhost') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hex
        });
      } else if (network === 'sepolia') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
        });
      }
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add localhost
        if (network === 'localhost') {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a69',
              chainName: 'Localhost 8545',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              }
            }]
          });
        }
      }
    }
  };

  const handleConnect = async () => {
    await switchNetwork(selectedNetwork);
    onConnect();
  };

  return (
    <Box textAlign="center">
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Connect Your Wallet
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Select network and connect your MetaMask wallet
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Network</InputLabel>
        <Select
          value={selectedNetwork}
          label="Network"
          onChange={(e) => setSelectedNetwork(e.target.value)}
        >
          <MenuItem value="localhost">Localhost</MenuItem>
          <MenuItem value="sepolia">Sepolia Testnet</MenuItem>
        </Select>
      </FormControl>
      
      <Button 
        variant="contained" 
        size="large" 
        onClick={handleConnect}
        sx={{ px: 4, py: 1.5 }}
      >
        Connect to {selectedNetwork === 'localhost' ? 'Localhost' : 'Sepolia'}
      </Button>
    </Box>
  );
};

export default WalletConnection;