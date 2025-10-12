// import React, { useState, useEffect } from 'react';
// import { 
//   Container, 
//   Typography, 
//   Box, 
//   Alert, 
//   Chip,
//   Card,
//   CardContent,
//   Fade,
//   Stack,
//   Divider
// } from '@mui/material';
// import { 
//   Security as SecurityIcon,
//   AccountBalanceWallet as WalletIcon,
//   Send as SendIcon,
//   VpnKey as KeyIcon,
//   Rocket as RocketIcon
// } from '@mui/icons-material';
// import { ethers } from 'ethers';
// import WalletConnection from '../components/WalletConnection';
// import KeyManager from '../components/KeyManager';
// import TokenDashboard from '../components/TokenDashboard';
// import QuantumTransfer from '../components/QuantumTransfer';
// import { NETWORKS, QUANTUM_TOKEN_ABI, SPHINCS_ABI } from '../contracts/abis';

// const HomePage: React.FC = () => {
//   const [account, setAccount] = useState<string>('');
//   const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
//   const [quantumToken, setQuantumToken] = useState<ethers.Contract | null>(null);
//   const [sphincs, setSphincs] = useState<ethers.Contract | null>(null);
//   const [balance, setBalance] = useState<string>('0');
//   const [isKeyRegistered, setIsKeyRegistered] = useState<boolean>(false);
//   const [currentNetwork, setCurrentNetwork] = useState<string>('localhost');

//   // Auto-detect network
//   const detectNetwork = async () => {
//     if (window.ethereum) {
//       try {
//         const chainId = await window.ethereum.request({ method: 'eth_chainId' });
//         if (chainId === '0x1') setCurrentNetwork('mainnet');
//         else if (chainId === '0xaa36a7') setCurrentNetwork('sepolia');
//         else setCurrentNetwork('localhost');
//       } catch (error) {
//         console.log('Using localhost as default network');
//       }
//     }
//   };

//   useEffect(() => {
//     checkWalletConnection();
//     detectNetwork();
//   }, []);

//   useEffect(() => {
//     if (provider && account) {
//       initializeContracts();
//     }
//   }, [provider, account, currentNetwork]);

//   const checkWalletConnection = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//         if (accounts.length > 0) {
//           const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
//           setProvider(web3Provider);
//           setAccount(accounts[0]);
//         }
//       } catch (error) {
//         console.error('Error checking wallet connection:', error);
//       }
//     }
//   };

//   const initializeContracts = async () => {
//     if (!provider) return;

//     try {
//       const signer = provider.getSigner();
//       const network = NETWORKS[currentNetwork as keyof typeof NETWORKS];
      
//       if (!network.contracts.QUANTUM_TOKEN || !network.contracts.SPHINCS) {
//         console.warn('Contracts not configured for', currentNetwork, '- using localhost addresses');
//         const fallbackNetwork = NETWORKS.localhost;
//         network.contracts = fallbackNetwork.contracts;
//       }
      
//       const tokenContract = new ethers.Contract(
//         network.contracts.QUANTUM_TOKEN,
//         QUANTUM_TOKEN_ABI,
//         signer
//       );
      
//       const sphincsContract = new ethers.Contract(
//         network.contracts.SPHINCS,
//         SPHINCS_ABI,
//         signer
//       );

//       setQuantumToken(tokenContract);
//       setSphincs(sphincsContract);

//       // Check if contracts are deployed by testing a simple call
//       try {
//         const bal = await tokenContract.balanceOf(account);
//         setBalance(ethers.utils.formatEther(bal));

//         const keyRegistered = await tokenContract.isPublicKeyRegistered(account);
//         setIsKeyRegistered(keyRegistered);
//       } catch (contractError: any) {
//         console.warn('Contracts not deployed or not accessible:', contractError.message);
//         // Set default values when contracts aren't available
//         setBalance('0');
//         setIsKeyRegistered(false);
//       }

//     } catch (error) {
//       console.error('Error initializing contracts:', error);
//       // Set default values on error
//       setBalance('0');
//       setIsKeyRegistered(false);
//     }
//   };

//   const handleWalletConnect = async () => {
//     if (window.ethereum) {
//       try {
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
//         const accounts = await web3Provider.listAccounts();
//         setProvider(web3Provider);
//         setAccount(accounts[0]);
//         await detectNetwork();
//       } catch (error) {
//         console.error('Error connecting wallet:', error);
//       }
//     } else {
//       alert('Please install MetaMask!');
//     }
//   };

//   const handleKeyRegistered = () => {
//     setIsKeyRegistered(true);
//   };

//   const refreshBalance = async () => {
//     if (quantumToken && account) {
//       const bal = await quantumToken.balanceOf(account);
//       setBalance(ethers.utils.formatEther(bal));
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', py: 4, position: 'relative', zIndex: 1 }}>
//       <Container maxWidth="md">
//         {/* Header */}
//         <Fade in timeout={800}>
//           <Box textAlign="center" mb={6} className="float">
//             <RocketIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} className="pulse" />
//             <Typography variant="h1" className="space-title" sx={{ mb: 2 }}>
//               QUANTUM SECURE SMART-CONTRACT
//             </Typography>
//             <Typography variant="h6" className="neon-blue" sx={{ mb: 3, fontWeight: 300 }}>
//               Post-Quantum Blockchain Protocol
//             </Typography>
//             <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
//               {/* <Chip 
//                 label="QUANTUM SHIELD" 
//                 color="primary" 
//                 className="neon-blue"
//                 sx={{ fontWeight: 600 }}
//               />
//               <Chip  
//                 label="SPHINCS+ CORE" 
//                 color="secondary" 
//                 className="neon-purple"
//                 sx={{ fontWeight: 600 }}
//               /> */}
//             </Stack>
//             <Typography variant="body2" className="neon-green" sx={{ fontWeight: 500 }}>
//               [ DEVELOPED BY KAPARTHI SATHVIK & KORIMILLI YASH VENKAT ]
//             </Typography>
//           </Box>
//         </Fade>

//         {!account ? (
//           <Fade in timeout={1000}>
//             <Box display="flex" justifyContent="center">
//               <Card className="space-card float" sx={{ maxWidth: 450, width: '100%' }}>
//                 <CardContent sx={{ p: 4 }}>
//                   <WalletConnection onConnect={handleWalletConnect} />
//                 </CardContent>
//               </Card>
//             </Box>
//           </Fade>
//         ) : (
//           <Fade in timeout={600}>
//             <Stack spacing={4}>
//               {/* Status */}
//               <Alert 
//                 severity="success" 
//                 sx={{ 
//                   borderRadius: 4,
//                   background: 'rgba(57, 255, 20, 0.1)',
//                   border: '1px solid rgba(57, 255, 20, 0.3)',
//                   color: '#39ff14'
//                 }}
//               >
//                 <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
//                   <Typography fontWeight={600} className="neon-green">
//                     CONNECTED: {account.slice(0, 8)}...{account.slice(-6)}
//                   </Typography>
//                   <Box display="flex" alignItems="center" gap={2}>
//                     <Typography variant="body2" className="neon-green" sx={{ opacity: 0.8 }}>
//                       •
//                     </Typography>
//                     <Chip 
//                       label={currentNetwork.toUpperCase()}
//                       size="small" 
//                       color="success"
//                       sx={{ fontWeight: 600, fontSize: '0.75rem' }}
//                     />
//                   </Box>
//                 </Box>
//               </Alert>

//               {/* Main Control Panel */}
//               <Card className="space-card" sx={{ position: 'relative' }}>
//                 <CardContent sx={{ p: 5 }}>
//                   {/* Key Manager Section */}
//                   <Box mb={5}>
//                     <Box display="flex" alignItems="center" mb={4}>
//                       <KeyIcon className="neon-blue" sx={{ mr: 2, fontSize: 28 }} />
//                       <Typography variant="h6" className="neon-blue" sx={{ fontWeight: 700 }}>
//                         QUANTUM KEY MATRIX
//                       </Typography>
//                     </Box>
//                     <KeyManager
//                       account={account}
//                       quantumToken={quantumToken}
//                       sphincs={sphincs}
//                       isKeyRegistered={isKeyRegistered}
//                       onKeyRegistered={handleKeyRegistered}
//                     />
//                   </Box>

//                   <Divider sx={{ 
//                     my: 4, 
//                     background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
//                     height: 2
//                   }} />

//                   {/* Token Dashboard Section */}
//                   <Box mb={5}>
//                     <Box display="flex" alignItems="center" mb={4}>
//                       <WalletIcon className="neon-purple" sx={{ mr: 2, fontSize: 28 }} />
//                       <Typography variant="h6" className="neon-purple" sx={{ fontWeight: 700 }}>
//                         QUANTUM VAULT
//                       </Typography>
//                     </Box>
//                     <TokenDashboard
//                       balance={balance}
//                       account={account}
//                       quantumToken={quantumToken}
//                       onBalanceUpdate={refreshBalance}
//                     />
//                   </Box>

//                   {/* Transfer Section */}
//                   {isKeyRegistered && (
//                     <>
//                       <Divider sx={{ 
//                         my: 4, 
//                         background: 'linear-gradient(90deg, transparent, #b347d9, transparent)',
//                         height: 2
//                       }} />
//                       <Box>
//                         <Box display="flex" alignItems="center" mb={4}>
//                           <SendIcon className="neon-green" sx={{ mr: 2, fontSize: 28 }} />
//                           <Typography variant="h6" className="neon-green" sx={{ fontWeight: 700 }}>
//                             QUANTUM TRANSFER PROTOCOL
//                           </Typography>
//                         </Box>
//                         <QuantumTransfer
//                           account={account}
//                           quantumToken={quantumToken}
//                           balance={balance}
//                           onTransferComplete={refreshBalance}
//                         />
//                       </Box>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Footer */}
//               <Box textAlign="center" mt={4}>
//                 <Typography variant="body2" className="neon-blue" sx={{ opacity: 0.7 }}>
//                   [ FINAL YEAR PROJECT - BLOCKCHAIN TECHNOLOGY ]
//                 </Typography>
//               </Box>
//             </Stack>
//           </Fade>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default HomePage;

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Chip,
  Card,
  CardContent,
  Fade,
  Stack,
  Divider,
  Button
} from '@mui/material';
import { 
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
  VpnKey as KeyIcon,
  Rocket as RocketIcon
} from '@mui/icons-material';
import { ethers } from 'ethers';
import WalletConnection from '../components/WalletConnection';
import KeyManager from '../components/KeyManager';
import TokenDashboard from '../components/TokenDashboard';
import QuantumTransfer from '../components/QuantumTransfer';
import { NETWORKS, QUANTUM_TOKEN_ABI, SPHINCS_ABI } from '../contracts/abis';

const HomePage: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [quantumToken, setQuantumToken] = useState<ethers.Contract | null>(null);
  const [sphincs, setSphincs] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isKeyRegistered, setIsKeyRegistered] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('localhost');

  const detectNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId === '0x1') setCurrentNetwork('mainnet');
        else if (chainId === '0xaa36a7') setCurrentNetwork('sepolia');
        else setCurrentNetwork('localhost');
      } catch (error) {
        console.log('Using localhost as default network');
      }
    }
  };

  useEffect(() => {
    checkWalletConnection();
    detectNetwork();
  }, []);

  useEffect(() => {
    if (provider && account) {
      initializeContracts();
    }
  }, [provider, account, currentNetwork]);

  useEffect(() => {
    if (quantumToken && account) {
      refreshBalance();
    }
  }, [quantumToken, account]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const initializeContracts = async () => {
    if (!provider) return;

    try {
      const signer = provider.getSigner();
      const network = NETWORKS[currentNetwork as keyof typeof NETWORKS];
      
      if (!network.contracts.QUANTUM_TOKEN || !network.contracts.SPHINCS) {
        console.warn('Contracts not configured for', currentNetwork, '- using localhost addresses');
        const fallbackNetwork = NETWORKS.localhost;
        network.contracts = fallbackNetwork.contracts;
      }
      
      const tokenContract = new ethers.Contract(
        network.contracts.QUANTUM_TOKEN,
        QUANTUM_TOKEN_ABI,
        signer
      );
      
      const sphincsContract = new ethers.Contract(
        network.contracts.SPHINCS,
        SPHINCS_ABI,
        signer
      );

      setQuantumToken(tokenContract);
      setSphincs(sphincsContract);

      try {
        const bal = await tokenContract.balanceOf(account);
        setBalance(ethers.utils.formatEther(bal));
        console.log('Balance loaded:', ethers.utils.formatEther(bal));

        const keyRegistered = await tokenContract.isPublicKeyRegistered(account);
        setIsKeyRegistered(keyRegistered);
      } catch (contractError: any) {
        console.warn('Contracts not deployed or not accessible:', contractError.message);
        setBalance('0');
        setIsKeyRegistered(false);
      }

    } catch (error) {
      console.error('Error initializing contracts:', error);
      setBalance('0');
      setIsKeyRegistered(false);
    }
  };

  const handleWalletConnect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.listAccounts();
        setProvider(web3Provider);
        setAccount(accounts[0]);
        await detectNetwork();
        // Force contract initialization after connection
        setTimeout(async () => {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId === '0xaa36a7') setCurrentNetwork('sepolia');
          else if (chainId === '0x1') setCurrentNetwork('mainnet');
          else setCurrentNetwork('localhost');
        }, 100);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleKeyRegistered = () => {
    setIsKeyRegistered(true);
  };

  const handleWalletDisconnect = async () => {
    try {
      if (window.ethereum && window.ethereum.request) {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }
    } catch (error) {
      console.log('Permission revoke not supported, clearing state only');
    }
    
    // Clear all state
    setAccount('');
    setProvider(null);
    setQuantumToken(null);
    setSphincs(null);
    setBalance('0');
    setIsKeyRegistered(false);
    setCurrentNetwork('localhost');
  };

  const refreshBalance = async () => {
    if (quantumToken && account) {
      try {
        const bal = await quantumToken.balanceOf(account);
        setBalance(ethers.utils.formatEther(bal));
      } catch (error) {
        console.log('Balance refresh failed, will retry on next render');
        setBalance('0');
      }
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative', 
      zIndex: 1,
      p: 2
    }}>
      <Container maxWidth="lg" sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header - Compact */}
        <Fade in timeout={800}>
          <Box textAlign="center" mb={4} mt={3} className="float">
            <Typography variant="h2" className="space-title" sx={{ mb: 0.5, fontSize: '2rem' }}>
              QUANTUM SECURE SMART-CONTRACT
            </Typography>
            <Typography variant="body2" className="neon-green" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
              [ DEVELOPED BY KORIMILLI YASH VENKAT ]
            </Typography>
          </Box>
        </Fade>

        {!account ? (
          <Fade in timeout={1000}>
            <Box display="flex" justifyContent="center" alignItems="flex-start" flex={1} pt={4}>
              <Card className="space-card float" sx={{ maxWidth: 450, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <WalletConnection onConnect={handleWalletConnect} />
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ) : (
          <Fade in timeout={600}>
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Status - Compact */}
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 2,
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  color: '#39ff14',
                  mb: 2,
                  py: 0.5
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Typography fontWeight={600} className="neon-green" fontSize="0.85rem">
                    CONNECTED: {account.slice(0, 8)}...{account.slice(-6)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3} sx={{ ml: 'auto', pl: 4 }}>
                    <Chip 
                      label={currentNetwork.toUpperCase()}
                      size="small" 
                      color="success"
                      sx={{ fontWeight: 600, fontSize: '0.7rem', height: '20px' }}
                    />
                    <Button
                      size="small"
                      onClick={handleWalletDisconnect}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.25,
                        fontSize: '0.7rem',
                        textTransform: 'none',
                        color: '#39ff14',
                        border: '1px solid rgba(57, 255, 20, 0.3)',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(57, 255, 20, 0.1)',
                          borderColor: 'rgba(57, 255, 20, 0.5)'
                        }
                      }}
                    >
                      Disconnect
                    </Button>
                  </Box>
                </Box>
              </Alert>

              {/* Main Control Panel - Single Screen */}
              <Card className="space-card" sx={{ flex: 1, overflow: 'auto' }}>
                <CardContent sx={{ p: 2 }}>
                  {/* Key Manager Section */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <KeyIcon className="neon-blue" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="h6" className="neon-blue" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        QUANTUM KEY GENERATOR
                      </Typography>
                    </Box>
                    <KeyManager
                      account={account}
                      quantumToken={quantumToken}
                      sphincs={sphincs}
                      isKeyRegistered={isKeyRegistered}
                      onKeyRegistered={handleKeyRegistered}
                    />
                  </Box>

                  <Divider sx={{ 
                    my: 1.5, 
                    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                    height: 1
                  }} />

                  {/* Token Dashboard Section */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WalletIcon className="neon-purple" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="h6" className="neon-purple" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        QUANTUM VAULT
                      </Typography>
                    </Box>
                    <TokenDashboard
                      balance={balance}
                      account={account}
                      quantumToken={quantumToken}
                      onBalanceUpdate={refreshBalance}
                    />
                  </Box>

                  {/* Transfer Section */}
                  {isKeyRegistered && (
                    <>
                      <Divider sx={{ 
                        my: 1.5, 
                        background: 'linear-gradient(90deg, transparent, #b347d9, transparent)',
                        height: 1
                      }} />
                      <Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <SendIcon className="neon-green" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="h6" className="neon-green" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            QUANTUM TRANSFER PROTOCOL
                          </Typography>
                        </Box>
                        <QuantumTransfer
                          account={account}
                          quantumToken={quantumToken}
                          balance={balance}
                          onTransferComplete={refreshBalance}
                        />
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Footer - Compact */}
              <Box textAlign="center" mt={1}>
                <Typography variant="body2" className="neon-blue" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                  [ FINAL YEAR PROJECT - BLOCKCHAIN TECHNOLOGY ]
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;