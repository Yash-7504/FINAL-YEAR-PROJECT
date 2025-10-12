// import { useState, useCallback } from 'react';
// import { ethers } from 'ethers';
// import { QUANTUM_TOKEN_ABI } from '../contracts/abis';

// // Create singleton state management
// let globalState = {
//   provider: null as ethers.providers.JsonRpcProvider | null,
//   signer: null as ethers.Signer | null,
//   account: '',
//   isConnected: false,
//   tokenContract: null as ethers.Contract | null
// };

// const listeners: Array<() => void> = [];

// const notifyListeners = () => {
//   listeners.forEach(listener => listener());
// };

// const updateGlobalState = (newState: Partial<typeof globalState>) => {
//   globalState = { ...globalState, ...newState };
//   notifyListeners();
// };

// export const useWeb3 = () => {
//   const [, forceUpdate] = useState({});

//   const rerender = useCallback(() => {
//     forceUpdate({});
//   }, []);

//   // Subscribe to state changes
//   if (!listeners.includes(rerender)) {
//     listeners.push(rerender);
//   }

//   const connectToLocalNetwork = async () => {
//     try {
//       console.log('Attempting to connect to local network...');
      
//       // Connect to local Hardhat node
//       const localProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      
//       // Test the connection
//       const network = await localProvider.getNetwork();
//       console.log('Connected to network:', network);
      
//       // Get accounts from local node
//       const accounts = await localProvider.listAccounts();
//       if (accounts.length === 0) {
//         throw new Error('No accounts found in local node. Make sure Hardhat node is running.');
//       }
      
//       const firstAccount = accounts[0];
//       const signer = localProvider.getSigner(firstAccount);
      
//       console.log('Available accounts:', accounts.length);
//       console.log('Using account:', firstAccount);
      
//       // Updated with your new deployed contract address
//       const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
//       const tokenContract = new ethers.Contract(tokenAddress, QUANTUM_TOKEN_ABI, signer);
      
//       // Test contract connection
//       try {
//         const tokenName = await tokenContract.name();
//         console.log('Token contract connected:', tokenName);
//       } catch (contractError: any) {
//         console.error('Contract connection failed:', contractError);
//         throw new Error(`Failed to connect to token contract at ${tokenAddress}. Contract error: ${contractError.message}`);
//       }
      
//       // Update global state
//       updateGlobalState({
//         provider: localProvider,
//         signer: signer,
//         account: firstAccount,
//         tokenContract: tokenContract,
//         isConnected: true
//       });
      
//       console.log('Successfully connected to local network!');
//       console.log('Updated state - isConnected:', true, 'account:', firstAccount);
      
//     } catch (error: any) {
//       console.error('Connection error:', error);
//       alert(`Failed to connect to local network: ${error.message}`);
      
//       // Reset state on error
//       updateGlobalState({
//         provider: null,
//         signer: null,
//         account: '',
//         tokenContract: null,
//         isConnected: false
//       });
//     }
//   };

//   const disconnect = () => {
//     updateGlobalState({
//       provider: null,
//       signer: null,
//       account: '',
//       tokenContract: null,
//       isConnected: false
//     });
//     console.log('Disconnected from local network');
//   };

//   return {
//     provider: globalState.provider,
//     signer: globalState.signer,
//     account: globalState.account,
//     isConnected: globalState.isConnected,
//     tokenContract: globalState.tokenContract,
//     connectToLocalNetwork,
//     disconnect
//   };
// };


import { useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { QUANTUM_TOKEN_ABI } from '../contracts/abis';

// Create singleton state management
let globalState = {
  provider: null as ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null,
  signer: null as ethers.Signer | null,
  account: '',
  isConnected: false,
  chainId: 0,
  tokenContract: null as ethers.Contract | null,
  connectionType: '' as 'metamask' | 'local' | ''
};

const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const updateGlobalState = (newState: Partial<typeof globalState>) => {
  globalState = { ...globalState, ...newState };
  notifyListeners();
};

export const useWeb3 = () => {
  const [, forceUpdate] = useState({});

  const rerender = () => {
    forceUpdate({});
  };

  // Subscribe to state changes
  if (!listeners.includes(rerender)) {
    listeners.push(rerender);
  }

  const connectToMetaMask = async () => {
    try {
      console.log('Attempting to connect to MetaMask...');
      
      const ethereumProvider = await detectEthereumProvider();
      
      if (!ethereumProvider) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      const web3Provider = new ethers.providers.Web3Provider(ethereumProvider as any);
      await web3Provider.send("eth_requestAccounts", []);
      
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      
      console.log('Connected to MetaMask:', address);
      console.log('Network:', network);

      // For MetaMask, we'll use your deployed testnet contract address
      // You'll need to deploy to a testnet for this to work properly
      const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Use your testnet address
      
      let tokenContract = null;
      try {
        tokenContract = new ethers.Contract(tokenAddress, QUANTUM_TOKEN_ABI, signer);
        // Test contract connection
        await tokenContract.name();
        console.log('MetaMask contract connected successfully');
      } catch (contractError) {
        console.warn('Contract not available on this network:', contractError);
        // Don't throw - allow connection without contract for MetaMask
      }
      
      // Update global state
      updateGlobalState({
        provider: web3Provider,
        signer: signer,
        account: address,
        chainId: network.chainId,
        tokenContract: tokenContract,
        isConnected: true,
        connectionType: 'metamask'
      });
      
      console.log('Successfully connected to MetaMask!');
      
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      alert(`Failed to connect to MetaMask: ${error.message}`);
      
      // Reset state on error
      updateGlobalState({
        provider: null,
        signer: null,
        account: '',
        chainId: 0,
        tokenContract: null,
        isConnected: false,
        connectionType: ''
      });
    }
  };

  const connectToLocalNetwork = async () => {
    try {
      console.log('Attempting to connect to local network...');
      
      const localProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      
      // Test the connection
      const network = await localProvider.getNetwork();
      console.log('Connected to network:', network);
      
      const accounts = await localProvider.listAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found in local node. Make sure Hardhat node is running.');
      }
      
      const firstAccount = accounts[0];
      const signer = localProvider.getSigner(firstAccount);
      
      console.log('Available accounts:', accounts.length);
      console.log('Using account:', firstAccount);
      
      // Your deployed local contract address - update this after redeployment
      const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
      const tokenContract = new ethers.Contract(tokenAddress, QUANTUM_TOKEN_ABI, signer);
      
      // Test contract connection
      try {
        const tokenName = await tokenContract.name();
        console.log('Local token contract connected:', tokenName);
      } catch (contractError: any) {
        console.error('Local contract connection failed:', contractError);
        throw new Error(`Failed to connect to token contract at ${tokenAddress}. Make sure contracts are deployed on local network.`);
      }
      
      // Update global state
      updateGlobalState({
        provider: localProvider,
        signer: signer,
        account: firstAccount,
        chainId: 31337,
        tokenContract: tokenContract,
        isConnected: true,
        connectionType: 'local'
      });
      
      console.log('Successfully connected to local network!');
      
    } catch (error: any) {
      console.error('Local network connection error:', error);
      alert(`Failed to connect to local network: ${error.message}`);
      
      // Reset state on error
      updateGlobalState({
        provider: null,
        signer: null,
        account: '',
        chainId: 0,
        tokenContract: null,
        isConnected: false,
        connectionType: ''
      });
    }
  };

  const disconnect = () => {
    updateGlobalState({
      provider: null,
      signer: null,
      account: '',
      chainId: 0,
      tokenContract: null,
      isConnected: false,
      connectionType: ''
    });
    console.log('Disconnected from wallet');
  };

  return {
    provider: globalState.provider,
    signer: globalState.signer,
    account: globalState.account,
    isConnected: globalState.isConnected,
    chainId: globalState.chainId,
    tokenContract: globalState.tokenContract,
    connectionType: globalState.connectionType,
    connectToMetaMask,
    connectToLocalNetwork,
    disconnect
  };
};
