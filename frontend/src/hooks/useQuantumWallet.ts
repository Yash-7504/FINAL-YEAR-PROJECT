import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const LOCALHOST_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCALHOST_CHAIN_ID = 31337;

const CONTRACT_ABI = [
  "function registerQuantumKey(bytes32 _publicKeySeed, bytes32 _rootHash)",
  "function quantumTransfer(address to, uint256 amount, bytes32 quantumSignature)",
  "function isQuantumKeyRegistered(address user) view returns (bool)",
  "function getUserNonce(address user) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

export const useQuantumWallet = () => {
  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    checkExistingConnection();
    setupEventListeners();
    
    return () => {
      removeEventListeners();
    };
  }, []);

  const checkExistingConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          
          if (network.chainId === LOCALHOST_CHAIN_ID) {
            const signer = provider.getSigner();
            const quantumContract = new ethers.Contract(LOCALHOST_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            setAccount(accounts[0]);
            setContract(quantumContract);
            setIsConnected(true);
          }
        }
      }
    } catch (error) {
      console.error('Auto-connection check failed:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && !window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum!);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      
      if (network.chainId !== LOCALHOST_CHAIN_ID) {
        try {
          await window.ethereum!.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7a69' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum!.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69',
                chainName: 'Localhost 8545',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://localhost:8545'],
              }]
            });
          }
        }
      }

      const signer = provider.getSigner();
      const quantumContract = new ethers.Contract(LOCALHOST_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setAccount(accounts[0]);
      setContract(quantumContract);
      setIsConnected(true);
      
    } catch (error: any) {
      console.error('Connection failed:', error);
      alert(`Connection failed: ${error.message}`);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setIsConnected(false);
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const removeEventListeners = () => {
    // Simple cleanup without removeAllListeners
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  return {
    account,
    contract,
    isConnected,
    connectWallet,
    disconnectWallet
  };
};