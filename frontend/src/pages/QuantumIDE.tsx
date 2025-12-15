// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   TextField,
//   Alert,
//   Stack,
//   Divider,
//   CircularProgress,
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogActions
// } from '@mui/material';
// import {
//   Code as CodeIcon,
//   Rocket as DeployIcon,
//   Close,
//   CheckCircleOutline,
//   ErrorOutline,
//   InfoOutlined
// } from '@mui/icons-material';
// import { ethers } from 'ethers';

// const QuantumIDE: React.FC = () => {
//   const [solidityCode, setSolidityCode] = useState(`// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// contract MyQuantumSecureContract {
//     string public message;
    
//     constructor(string memory _message) {
//         message = _message;
//     }
    
//     function setMessage(string memory _message) public {
//         message = _message;
//     }
    
//     function getMessage() public view returns (string memory) {
//         return message;
//     }
// }`);
  
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [deployedAddress, setDeployedAddress] = useState('');
//   const [account, setAccount] = useState<string>('');
//   const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
//   const [contractName, setContractName] = useState('MyQuantumSecureContract');
//   const [constructorArgs, setConstructorArgs] = useState('"Hello Quantum World!"');
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [verificationStatus, setVerificationStatus] = useState('');
//   const [isVerified, setIsVerified] = useState(false);
//   const [apiUrl, setApiUrl] = useState('http://localhost:9001');
//   const [keyJson, setKeyJson] = useState<any>(null);
//   const [signedSig, setSignedSig] = useState<any>(null);
//   const [etherscanApiKey, setEtherscanApiKey] = useState('196YZ6JAQCMG5TMRR9MA7Y9FMQ7GC22ZGY');
//   const [compiledABI, setCompiledABI] = useState<any>(null);
//   const [compiledBytecode, setCompiledBytecode] = useState<string>('');
//   const [showABI, setShowABI] = useState(false);
//   const [showBytecode, setShowBytecode] = useState(false);
//   const [compilationError, setCompilationError] = useState('');
//   const [isGeneratingKey, setIsGeneratingKey] = useState(false);
//   const [isSigningBytecode, setIsSigningBytecode] = useState(false);
//   const [dialogMessage, setDialogMessage] = useState('');
//   const [dialogType, setDialogType] = useState<'success' | 'error' | 'info'>('info');

//   const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
//     setDialogMessage(msg);
//     setDialogType(type);
//   };

//   useEffect(() => {
//     checkWalletConnection();
//   }, []);

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



//   const handleCompile = async () => {
//     setIsCompiling(true);
//     setCompilationError('');
//     setCompiledABI(null);
//     setCompiledBytecode('');
    
//     try {
//       const worker = new Worker('/compilerWorker.js');
      
//       const result: any = await new Promise((resolve, reject) => {
//         worker.onmessage = (e) => {
//           worker.terminate();
//           resolve(e.data);
//         };
        
//         worker.onerror = (error) => {
//           worker.terminate();
//           reject(error);
//         };
        
//         worker.postMessage({
//           sourceCode: solidityCode,
//           fileName: 'contract.sol'
//         });
//       });
      
//       if (result.type === 'success') {
//         const contracts = result.data.contracts['contract.sol'];
//         const contractNames = Object.keys(contracts);
        
//         if (contractNames.length > 0) {
//           const contract = contracts[contractNames[0]];
//           setCompiledABI(contract.abi);
//           setCompiledBytecode(contract.evm.bytecode.object);
//           setContractName(contractNames[0]);
//           showMessage('Contract compiled successfully!', 'success');
//         } else {
//           setCompilationError('No contracts found');
//         }
//       } else {
//         const errorMsg = Array.isArray(result.data) 
//           ? result.data.map((e: any) => e.formattedMessage || e.message || e).join('\n')
//           : result.data.toString();
//         setCompilationError(errorMsg);
//       }
      
//     } catch (error: any) {
//       setCompilationError(`Compilation failed: ${error?.message || 'Unknown error'}`);
//     } finally {
//       setIsCompiling(false);
//     }
//   };

//   const handleDeploy = async () => {
//     if (!provider || !account) {
//       showMessage('Please connect your wallet first!', 'error');
//       return;
//     }

//     setIsDeploying(true);
//     try {
//       // Switch to Sepolia if not already
//       await window.ethereum.request({
//         method: 'wallet_switchEthereumChain',
//         params: [{ chainId: '0xaa36a7' }], // Sepolia
//       });

//       const signer = provider.getSigner();
      
//       // Check if contract is compiled
//       if (!compiledABI || !compiledBytecode) {
//         showMessage('Please compile the contract first!', 'error');
//         return;
//       }
      
//       // Use compiled contract data  
//       const abi = compiledABI;
//       let bytecode = compiledBytecode;
      
//       // Ensure bytecode has 0x prefix
//       if (bytecode && !bytecode.startsWith('0x')) {
//         bytecode = '0x' + bytecode;
//       }
      
//       const contractFactory = new ethers.ContractFactory(
//         abi,
//         bytecode,
//         signer
//       );

//       console.log('Deploying to Sepolia...');
//       const contract = await contractFactory.deploy(constructorArgs, {
//         gasLimit: 500000,
//         gasPrice: ethers.utils.parseUnits('20', 'gwei')
//       });

//       console.log('Waiting for deployment...');
//       await contract.deployed();
      
//       setDeployedAddress(contract.address);
//       showMessage(`Contract deployed to Sepolia at: ${contract.address}`, 'success');
      
//     } catch (error: any) {
//       console.error('Deployment failed:', error);
//       showMessage(`Deployment failed: ${error.message}`, 'error');
//     } finally {
//       setIsDeploying(false);
//     }
//   };

//   const handleVerifyContract = async () => {
//     if (!deployedAddress || !etherscanApiKey) {
//       showMessage('Please deploy contract and enter API key first!', 'error');
//       return;
//     }

//     setIsVerifying(true);
//     setVerificationStatus('Submitting contract for verification...');

//     try {
//       // Prepare verification data
//       const verificationData = {
//         apikey: etherscanApiKey,
//         module: 'contract',
//         action: 'verifysourcecode',
//         contractaddress: deployedAddress,
//         sourceCode: solidityCode,
//         codeformat: 'solidity-single-file',
//         contractname: contractName,
//         compilerversion: 'v0.8.19+commit.7dd6d404',
//         optimizationUsed: '0',
//         runs: '200',
//         constructorArguements: ethers.utils.defaultAbiCoder.encode(['string'], [constructorArgs.replace(/"/g, '')]).slice(2) // ABI-encoded constructor args
//       };

//       // Submit for verification
//       const response = await fetch('https://api-sepolia.etherscan.io/api', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams(verificationData)
//       });

//       const result = await response.json();
//       console.log('Verification response:', JSON.stringify(result, null, 2));
      
//       if (result.status === '1') {
//         // Immediately start checking verification status
//         const checkStatus = async () => {
//           try {
//             const statusResponse = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=checkverifystatus&guid=${result.result}&apikey=${etherscanApiKey}`);
//             const statusResult = await statusResponse.json();
//             console.log('Status check:', JSON.stringify(statusResult, null, 2));
            
//             if (statusResult.status === '1' && statusResult.result === 'Pass - Verified') {
//               setVerificationStatus('Contract verified successfully on Etherscan!');
//               setIsVerified(true);
//               setIsVerifying(false);
//             } else if (statusResult.result === 'Already Verified') {
//               setVerificationStatus('Contract is already verified on Etherscan!');
//               setIsVerified(true);
//               setIsVerifying(false);
//             } else if (statusResult.result && statusResult.result.includes('Fail')) {
//               setVerificationStatus(`Verification failed: ${statusResult.result}`);
//               setIsVerifying(false);
//             } else {
//               setVerificationStatus(`Checking verification status...`);
//               setTimeout(checkStatus, 3000);
//             }
//           } catch (error) {
//             console.error('Status check error:', error);
//             setVerificationStatus('Error checking verification status');
//             setIsVerifying(false);
//           }
//         };
        
//         setTimeout(checkStatus, 5000);
        
//       } else if (result.result.includes('already verified')) {
//         setVerificationStatus('Contract is already verified on Etherscan!');
//         setIsVerified(true);
//         setIsVerifying(false);
//       } else {
//         setVerificationStatus(`Verification failed: ${result.result}`);
//         setIsVerifying(false);
//       }
      
//     } catch (error: any) {
//       console.error('Verification error:', error);
//       setVerificationStatus(`Verification error: ${error.message}`);
//       setIsVerifying(false);
//     }
//   };

//   // Generate SPHINCS+ keypair via API
//   const handleGenerateKey = async () => {
//     try {
//       setIsGeneratingKey(true);
//       const resp = await fetch(`${apiUrl}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
//       const data = await resp.json();
//       setKeyJson(data);
//       setIsGeneratingKey(false);
//       showMessage('SPHINCS+ keypair generated successfully', 'success');
//     } catch (err: any) {
//       setIsGeneratingKey(false);
//       console.error('Generate key error:', err);
//       showMessage('Generate key failed: ' + err.message, 'error');
//     }
//   };

//   const handleSignBytecode = async () => {
//     if (!compiledBytecode) {
//       showMessage('Compile contract first', 'error');
//       return;
//     }
//     if (!keyJson) {
//       showMessage('Generate or provide a key first', 'error');
//       return;
//     }

//     try {
//       setIsSigningBytecode(true);
//       const payload = compiledBytecode.startsWith('0x') ? compiledBytecode : compiledBytecode;
//       const resp = await fetch(`${apiUrl}/api/sign`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           secretKey: keyJson.secretKey, 
//           payload,
//           payloadEncoding: 'hex'
//         })
//       });
//       const data = await resp.json();
//       setSignedSig(data);
//       setIsSigningBytecode(false);
//       showMessage('Bytecode signed successfully (SPHINCS+)', 'success');
//     } catch (err: any) {
//       setIsSigningBytecode(false);
//       console.error('Sign error:', err);
//       showMessage('Sign failed: ' + err.message, 'error');
//     }
//   };

//   const handleVerifySignature = async () => {
//     if (!signedSig || !keyJson || !compiledBytecode) {
//       showMessage('Need key, compiled bytecode and signature', 'error');
//       return;
//     }
//     try {
//       const payload = compiledBytecode.startsWith('0x') ? compiledBytecode : compiledBytecode;
//       const resp = await fetch(`${apiUrl}/api/verify`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           publicKey: keyJson.publicKey, 
//           signature: signedSig.signature,
//           leafIdx: signedSig.leafIdx,
//           authPath: signedSig.authPath,
//           payload,
//           payloadEncoding: 'hex'
//         })
//       });
//       const data = await resp.json();
//       if (data.error) {
//         showMessage('Verification error: ' + data.error, 'error');
//       } else {
//         showMessage(data.valid ? 'Signature is VALID!' : 'Signature is INVALID', data.valid ? 'success' : 'error');
//       }
//     } catch (err: any) {
//       console.error('Verify error:', err);
//       showMessage('Verify failed: ' + err.message, 'error');
//     }
//   };

//   const handleServerDeploy = async () => {
//     if (!compiledBytecode) {
//       showMessage('Compile first', 'error');
//       return;
//     }
//     if (!keyJson) {
//       showMessage('Generate or upload key first', 'error');
//       return;
//     }
//     if (!account) {
//       showMessage('Connect MetaMask wallet first', 'error');
//       return;
//     }
    
//     try {
//       // Step 1: Get SPHINCS+ signature from server
//       const signResp = await fetch(`${apiUrl}/api/deploy`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ key: keyJson, bytecode: compiledBytecode })
//       });
//       const signData = await signResp.json();
//       if (signData.error) throw new Error(signData.error);

//       // Step 2: Use MetaMask to send deployment transaction
//       if (!window.ethereum) {
//         showMessage('MetaMask not found', 'error');
//         return;
//       }
      
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
      
//       // Create contract factory
//       const factory = new ethers.ContractFactory(compiledABI, compiledBytecode, signer);
      
//       // Deploy contract via MetaMask (this triggers the transaction popup)
//       // Parse constructor arguments if provided
//       const args: any[] = [];
//       if (constructorArgs && constructorArgs.trim()) {
//         try {
//           const parsed = JSON.parse(`[${constructorArgs}]`);
//           args.push(...parsed);
//         } catch {
//           args.push(constructorArgs);
//         }
//       }
//       const contract = await factory.deploy(...args);
//       const receipt = await contract.deployed();
      
//       const deployedAddr = contract.address;
//       setDeployedAddress(deployedAddr);
      
//       // Step 3: Record deployment in KeyRegistry (optional, for off-chain metadata)
//       showMessage(`Contract deployed at: ${deployedAddr}\n\nTx: ${contract.deployTransaction?.hash}`, 'success');
      
//     } catch (err: any) {
//       console.error('Server deploy error:', err);
//       showMessage('Deploy failed: ' + err.message, 'error');
//     }
//   };

//   return (
//     <Box sx={{ height: '100vh', overflow: 'hidden', p: 2, position: 'relative', zIndex: 1 }}>
//       <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//         {/* Header */}
//         <Box textAlign="center" mb={3}>
//           <Typography variant="h2" className="space-title" sx={{ fontSize: '2rem', mb: 1 }}>
//             QUANTUM-SECURE IDE
//           </Typography>
//           <Typography variant="body2" className="neon-green" sx={{ fontSize: '0.8rem' }}>
//             [ DEPLOY SMART CONTRACTS WITH POST-QUANTUM CRYPTOGRAPHY ]
//           </Typography>
//         </Box>

//         {/* Main IDE Layout */}
//         <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
//           {/* Code Editor */}
//           <Card className="space-card" sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
//             <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
//               <Box display="flex" alignItems="center" mb={2}>
//                 <CodeIcon className="neon-blue" sx={{ mr: 1, fontSize: 20 }} />
//                 <Typography variant="h6" className="neon-blue" sx={{ fontWeight: 700, fontSize: '1rem' }}>
//                   SOLIDITY EDITOR
//                 </Typography>
//               </Box>
              
//               <TextField
//                 multiline
//                 value={solidityCode}
//                 onChange={(e) => setSolidityCode(e.target.value)}
//                 sx={{
//                   flex: 1,
//                   '& .MuiInputBase-root': {
//                     height: '100%',
//                     alignItems: 'flex-start',
//                     fontFamily: 'monospace',
//                     fontSize: '0.85rem'
//                   },
//                   '& .MuiInputBase-input': {
//                     height: '100% !important',
//                     overflow: 'auto !important'
//                   }
//                 }}
//                 placeholder="Write your Solidity code here..."
//               />
//             </CardContent>
//           </Card>

//           {/* Control Panel */}
//           <Card className="space-card" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//               <Box display="flex" alignItems="center" mb={2}>
//                 {/* <SecurityIcon className="neon-purple" sx={{ mr: 1, fontSize: 20 }} /> */}
//                 <Typography variant="h6" className="neon-purple" sx={{ fontWeight: 700, fontSize: '1rem' }}>
//                   QUANTUM DEPLOYMENT
//                 </Typography>
//               </Box>

//               <Stack spacing={2} sx={{ overflow: 'auto', flex: 1, paddingRight: '8px' }}>
//                 {/* Security Features */}
//                 {/* <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
//                   Contract will be deployed with SPHINCS+ quantum-resistant signatures
//                 </Alert> */}
//                 {/* Security Features */}
//                 {/* <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
//                   Contract will be deployed with SPHINCS+ quantum-resistant signatures
//                 </Alert> */}



//                 <Divider />

//                 {/* Compile Button */}
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={handleCompile}
//                   disabled={isCompiling}
//                   fullWidth
//                   sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
//                 >
//                   {isCompiling ? 'Compiling...' : 'Compile Contract'}
//                 </Button>

//                 {/* Compilation Error */}
//                 {compilationError && (
//                   <Alert severity="error" sx={{ fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>
//                     <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
//                       {compilationError}
//                     </Typography>
//                   </Alert>
//                 )}

//                 {/* ABI and Bytecode Buttons */}
//                 {compiledABI && compiledBytecode && (
//                   <Box display="flex" gap={1}>
//                     <Button
//                       variant="outlined"
//                       onClick={() => setShowABI(!showABI)}
//                       fullWidth
//                       sx={{ py: 1, fontWeight: 600, minHeight: '44px' }}
//                     >
//                       {showABI ? 'Hide ABI' : 'Show ABI'}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       onClick={() => setShowBytecode(!showBytecode)}
//                       fullWidth
//                       sx={{ py: 1, fontWeight: 600, minHeight: '44px' }}
//                     >
//                       {showBytecode ? 'Hide Bytecode' : 'Show Bytecode'}
//                     </Button>
//                   </Box>
//                 )}

//                 {/* ABI Display */}
//                 {showABI && compiledABI && (
//                   <Alert severity="info" sx={{ fontSize: '0.7rem', maxHeight: '150px', overflow: 'auto' }}>
//                     <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
//                       Contract ABI:
//                     </Typography>
//                     <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.65rem' }}>
//                       {JSON.stringify(compiledABI, null, 2)}
//                     </Typography>
//                   </Alert>
//                 )}

//                 {/* Bytecode Display */}
//                 {showBytecode && compiledBytecode && (
//                   <Alert severity="info" sx={{ fontSize: '0.7rem', maxHeight: '150px', overflow: 'auto' }}>
//                     <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
//                       Contract Bytecode:
//                     </Typography>
//                     <Typography variant="caption" sx={{ wordBreak: 'break-all', fontSize: '0.65rem' }}>
//                       0x{compiledBytecode}
//                     </Typography>
//                   </Alert>
//                 )}

//                 {/* Constructor Arguments */}
//                 <TextField
//                   label="Constructor Arguments"
//                   value={constructorArgs}
//                   onChange={(e) => setConstructorArgs(e.target.value)}
//                   size="small"
//                   placeholder='"Hello World!"'
//                   helperText="Enter constructor arguments (e.g., strings in quotes)"
//                 />

//                 {/* Quantum Key Actions */}
//                 <Divider />
//                 <Button 
//                   variant="contained" 
//                   color="primary" 
//                   onClick={handleGenerateKey} 
//                   fullWidth 
//                   disabled={isGeneratingKey}
//                   sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
//                 >
//                   {isGeneratingKey ? (
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <CircularProgress size={20} color="inherit" />
//                       <span>Generating SPHINCS+ Keypair...</span>
//                     </Box>
//                   ) : (
//                     'Generate SPHINCS+ Keypair'
//                   )}
//                 </Button>
//                 {keyJson && (
//                   <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
//                     <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Public Key:</Typography>
//                     <Typography variant="caption" sx={{ wordBreak: 'break-all' }}> {keyJson.publicKey}</Typography>
//                   </Alert>
//                 )}

//                 <Button 
//                   variant="outlined" 
//                   onClick={handleSignBytecode} 
//                   disabled={!compiledBytecode || !keyJson || isSigningBytecode}
//                   fullWidth 
//                   sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
//                 >
//                   {isSigningBytecode ? (
//                     <Box display="flex" alignItems="center" gap={1}>
//                       <CircularProgress size={20} />
//                       <span>Signing Bytecode...</span>
//                     </Box>
//                   ) : (
//                     'Sign Compiled Bytecode (SPHINCS+)'
//                   )}
//                 </Button>
//                 {signedSig && (
//                   <Alert severity="success" sx={{ fontSize: '0.75rem' }}>
//                     <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Signature (truncated):</Typography>
//                     <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{signedSig.signature.slice(0, 120)}...</Typography>
//                   </Alert>
//                 )}

//                 <Button variant="outlined" onClick={handleVerifySignature} disabled={!signedSig || !keyJson || !compiledBytecode} fullWidth sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}>Verify Signature</Button>

//                 <Button variant="contained" color="secondary" onClick={handleServerDeploy} fullWidth sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}>Server Deploy to Sepolia (no wallet)</Button>

//                 {/* Deploy Button */}
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={handleDeploy}
//                   disabled={isDeploying || !account}
//                   startIcon={<DeployIcon />}
//                   fullWidth
//                   sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
//                 >
//                   {isDeploying ? 'Deploying to Sepolia...' : 'Deploy to Sepolia'}
//                 </Button>

//                 {!account && (
//                   <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>⚠️ Connect wallet to deploy</Alert>
//                 )}

//                 {/* Deployment Result */}
//                 {deployedAddress && (
//                   <Alert severity="success" sx={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
//                     <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
//                       Deployed to Sepolia!
//                     </Typography>
//                     <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
//                       Address: {deployedAddress}
//                     </Typography>
//                     <Typography variant="caption" sx={{ color: 'success.main' }}>
//                       Protected with SPHINCS+ quantum-resistant security
//                     </Typography>
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       onClick={() => window.open(`https://sepolia.etherscan.io/address/${deployedAddress}`, '_blank')}
//                       sx={{ mt: 1, mr: 1, fontSize: '0.7rem' }}
//                     >
//                       View on Etherscan
//                     </Button>
//                   </Alert>
//                 )}

//                 {/* Contract Verification */}
//                 {deployedAddress && (
//                   <>
//                     <Divider sx={{ mt: 1 }} />
//                     <Typography variant="subtitle2" className="neon-green" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
//                       CONTRACT VERIFICATION
//                     </Typography>
                    
//                     <TextField
//                       label="Etherscan API Key"
//                       value={etherscanApiKey}
//                       onChange={(e) => setEtherscanApiKey(e.target.value)}
//                       size="small"
//                       placeholder="Enter your Etherscan API key"
//                       helperText="Get API key from etherscan.io/apis"
//                     />
                    
//                     <Button
//                       variant="contained"
//                       onClick={handleVerifyContract}
//                       disabled={isVerifying || !etherscanApiKey || isVerified}
//                       sx={{
//                             py: 1,
//                             mt: 2,
//                             mb: 3,
//                             alignSelf: 'center',
//                             width: '100%',
//                          }}
//                     >
//                       {isVerifying ? 'Verifying Contract...' : isVerified ? 'Contract Verified' : 'Verify Contract'}
//                     </Button>
                    
//                     {verificationStatus && (
//                       <Alert 
//                         severity={verificationStatus.includes('success') ? 'success' : 'info'} 
//                         sx={{ fontSize: '0.8rem' }}
//                       >
//                         {verificationStatus}
//                       </Alert>
//                     )}
//                   </>
//                 )}

//                 <Divider sx={{ mt: 1 }} />


//               </Stack>
//             </CardContent>
//           </Card>
//         </Box>

//         {/* Footer */}
//         <Box textAlign="center" mt={2}>
//           <Typography variant="body2" className="neon-blue" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
//             [ QUANTUM-RESISTANT SMART CONTRACT DEVELOPMENT ENVIRONMENT ]
//           </Typography>
//         </Box>

//         {/* Dialog for Messages */}
//         <Dialog open={dialogMessage.length > 0} onClose={() => setDialogMessage('')} maxWidth="sm" fullWidth>
//           <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
//             {dialogType === 'success' && <CheckCircleOutline sx={{ color: 'success.main', fontSize: 28 }} />}
//             {dialogType === 'error' && <ErrorOutline sx={{ color: 'error.main', fontSize: 28 }} />}
//             {dialogType === 'info' && <InfoOutlined sx={{ color: 'info.main', fontSize: 28 }} />}
//             <Typography variant="h6" sx={{ flex: 1 }}>
//               {dialogType === 'success' ? 'Success' : dialogType === 'error' ? 'Error' : 'Information'}
//             </Typography>
//             <Button onClick={() => setDialogMessage('')} sx={{ minWidth: 'auto', p: 1 }}>
//               <Close />
//             </Button>
//           </DialogTitle>
//           <DialogContent sx={{ py: 2 }}>
//             <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{dialogMessage}</Typography>
//           </DialogContent>
//           <DialogActions sx={{ p: 2 }}>
//             <Button 
//               onClick={() => setDialogMessage('')} 
//               variant="contained" 
//               color={dialogType === 'success' ? 'success' : dialogType === 'error' ? 'error' : 'primary'}
//             >
//               OK
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   );
// };

// export default QuantumIDE;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Code as CodeIcon,
  Rocket as DeployIcon
} from '@mui/icons-material';
import { ethers } from 'ethers';

const QuantumIDE: React.FC = () => {
  const [solidityCode, setSolidityCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyQuantumSecureContract {
    string public message;
    
    constructor(string memory _message) {
        message = _message;
    }
    
    function setMessage(string memory _message) public {
        message = _message;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}`);
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('');
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contractName, setContractName] = useState('MyQuantumSecureContract');
  const [constructorArgs, setConstructorArgs] = useState('"Hello Quantum World!"');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  
  // Use environment variable for API URL, fallback to localhost for development
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:9001';
  
  const [keyJson, setKeyJson] = useState<any>(null);
  const [signedSig, setSignedSig] = useState<any>(null);
  const [etherscanApiKey, setEtherscanApiKey] = useState('196YZ6JAQCMG5TMRR9MA7Y9FMQ7GC22ZGY');
  const [compiledABI, setCompiledABI] = useState<any>(null);
  const [compiledBytecode, setCompiledBytecode] = useState<string>('');
  const [showABI, setShowABI] = useState(false);
  const [showBytecode, setShowBytecode] = useState(false);
  const [compilationError, setCompilationError] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isSigningBytecode, setIsSigningBytecode] = useState(false);

  // Minimal toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    // trim very long messages for UI neatness but keep some context
    const trimmed = typeof msg === 'string' && msg.length > 100 ? msg.slice(0, 100) + ' …' : msg;
    setToastMessage(trimmed);
    setToastSeverity(type);
  };

  // Clean transaction error parser — converts verbose provider/RPC errors to user-friendly short text
  const parseTxError = (error: any): string => {
    if (!error) return 'Transaction failed';

    // MetaMask / EIP-1193 rejection code
    try {
      // Common numeric code when user rejects in MetaMask
      if (error?.code === 4001) return 'Transaction cancelled by user';
    } catch (e) {
      // ignore
    }

    const msg = (error && (error.message || error?.data?.message || error?.error?.message || error.toString())) || '';

    const normalized = msg.toString().toLowerCase();

    // User rejection patterns
    if (
      normalized.includes('user rejected') ||
      normalized.includes('user denied') ||
      normalized.includes('denied') ||
      normalized.includes('rejected') ||
      normalized.includes('cancelled by user') ||
      normalized.includes('cancelled')
    ) {
      return 'Transaction cancelled by user';
    }

    // Revert / execution failed patterns
    if (
      normalized.includes('execution reverted') ||
      normalized.includes('revert') ||
      normalized.includes('insufficient funds') ||
      normalized.includes('insufficient') ||
      normalized.includes('out of gas') ||
      normalized.includes('gas required') ||
      normalized.includes('gas') ||
      normalized.includes('failed') ||
      normalized.includes('replacement transaction underpriced')
    ) {
      return 'Transaction failed';
    }

    // RPC/body large objects sometimes contain "message":"..."
    if (normalized.includes('internal json-rpc error') || normalized.includes('server error') || normalized.includes('invalid')) {
      return 'Transaction failed';
    }

    // Fallback short message without dumping the whole error object
    return 'Transaction failed';
  };



  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationError('');
    setCompiledABI(null);
    setCompiledBytecode('');
    
    try {
      const worker = new Worker('/compilerWorker.js');
      
      const result: any = await new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          worker.terminate();
          resolve(e.data);
        };
        
        worker.onerror = (error) => {
          worker.terminate();
          reject(error);
        };
        
        worker.postMessage({
          sourceCode: solidityCode,
          fileName: 'contract.sol'
        });
      });
      
      if (result.type === 'success') {
        const contracts = result.data.contracts['contract.sol'];
        const contractNames = Object.keys(contracts);
        
        if (contractNames.length > 0) {
          const contract = contracts[contractNames[0]];
          setCompiledABI(contract.abi);
          setCompiledBytecode(contract.evm.bytecode.object);
          setContractName(contractNames[0]);
          showMessage('Contract compiled successfully!', 'success');
        } else {
          setCompilationError('No contracts found');
        }
      } else {
        const errorMsg = Array.isArray(result.data) 
          ? result.data.map((e: any) => e.formattedMessage || e.message || e).join('\n')
          : result.data.toString();
        setCompilationError(errorMsg);
      }
      
    } catch (error: any) {
      setCompilationError(`Compilation failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!provider || !account) {
      showMessage('Please connect your wallet first!', 'error');
      return;
    }

    setIsDeploying(true);
    try {
      // Switch to Sepolia if not already
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });

      const signer = provider.getSigner();
      
      // Check if contract is compiled
      if (!compiledABI || !compiledBytecode) {
        showMessage('Please compile the contract first!', 'error');
        setIsDeploying(false);
        return;
      }
      
      // Use compiled contract data  
      const abi = compiledABI;
      let bytecode = compiledBytecode;
      
      // Ensure bytecode has 0x prefix
      if (bytecode && !bytecode.startsWith('0x')) {
        bytecode = '0x' + bytecode;
      }
      
      const contractFactory = new ethers.ContractFactory(
        abi,
        bytecode,
        signer
      );

      console.log('Deploying to Sepolia...');
      // Parse constructor args
      const args: any[] = [];
      if (constructorArgs && constructorArgs.trim()) {
        try {
          const parsed = JSON.parse(`[${constructorArgs}]`);
          args.push(...parsed);
        } catch {
          args.push(constructorArgs);
        }
      }

      const contract = await contractFactory.deploy(...args, {
        gasLimit: 500000
      });

      console.log('Waiting for deployment...');
      await contract.deployed();
      
      setDeployedAddress(contract.address);
      showMessage(`Contract deployed to Sepolia at: ${contract.address}`, 'success');
      
    } catch (error: any) {
      console.error('Deploy error (dev-only):', error); // keep raw in console for debugging
      const cleanMsg = parseTxError(error);
      showMessage(cleanMsg, 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleVerifyContract = async () => {
    if (!deployedAddress || !etherscanApiKey) {
      showMessage('Please deploy contract and enter API key first!', 'error');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('Submitting contract for verification...');

    try {
      // Prepare verification data
      const verificationData = {
        apikey: etherscanApiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: deployedAddress,
        sourceCode: solidityCode,
        codeformat: 'solidity-single-file',
        contractname: contractName,
        compilerversion: 'v0.8.19+commit.7dd6d404',
        optimizationUsed: '0',
        runs: '200',
        constructorArguements: ethers.utils.defaultAbiCoder.encode(['string'], [constructorArgs.replace(/"/g, '')]).slice(2) // ABI-encoded constructor args
      };

      // Submit for verification
      const response = await fetch('https://api-sepolia.etherscan.io/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(verificationData)
      });

      const result = await response.json();
      console.log('Verification response:', JSON.stringify(result, null, 2));
      
      if (result.status === '1') {
        // Immediately start checking verification status
        const checkStatus = async () => {
          try {
            const statusResponse = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=checkverifystatus&guid=${result.result}&apikey=${etherscanApiKey}`);
            const statusResult = await statusResponse.json();
            console.log('Status check:', JSON.stringify(statusResult, null, 2));
            
            if (statusResult.status === '1' && statusResult.result === 'Pass - Verified') {
              setVerificationStatus('Contract verified successfully on Etherscan!');
              setIsVerified(true);
              setIsVerifying(false);
            } else if (statusResult.result === 'Already Verified') {
              setVerificationStatus('Contract is already verified on Etherscan!');
              setIsVerified(true);
              setIsVerifying(false);
            } else if (statusResult.result && statusResult.result.includes('Fail')) {
              setVerificationStatus(`Verification failed: ${statusResult.result}`);
              setIsVerifying(false);
            } else {
              setVerificationStatus(`Checking verification status...`);
              setTimeout(checkStatus, 3000);
            }
          } catch (error) {
            console.error('Status check error:', error);
            setVerificationStatus('Error checking verification status');
            setIsVerifying(false);
          }
        };
        
        setTimeout(checkStatus, 5000);
        
      } else if (result.result && typeof result.result === 'string' && result.result.includes('already verified')) {
        setVerificationStatus('Contract is already verified on Etherscan!');
        setIsVerified(true);
        setIsVerifying(false);
      } else {
        setVerificationStatus(`Verification failed: ${result.result}`);
        setIsVerifying(false);
      }
      
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus(`Verification error: ${error.message}`);
      setIsVerifying(false);
    }
  };

  // Generate SPHINCS+ keypair via API
  const handleGenerateKey = async () => {
    try {
      setIsGeneratingKey(true);
      const resp = await fetch(`${apiUrl}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await resp.json();
      setKeyJson(data);
      setIsGeneratingKey(false);
      showMessage('SPHINCS+ keypair generated successfully', 'success');
    } catch (err: any) {
      setIsGeneratingKey(false);
      console.error('Generate key error:', err);
      showMessage('Generate key failed', 'error');
    }
  };

  const handleSignBytecode = async () => {
    if (!compiledBytecode) {
      showMessage('Compile contract first', 'error');
      return;
    }
    if (!keyJson) {
      showMessage('Generate or provide a key first', 'error');
      return;
    }

    try {
      setIsSigningBytecode(true);
      const payload = compiledBytecode.startsWith('0x') ? compiledBytecode : compiledBytecode;
      const resp = await fetch(`${apiUrl}/api/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secretKey: keyJson.secretKey, 
          payload,
          payloadEncoding: 'hex'
        })
      });
      const data = await resp.json();
      setSignedSig(data);
      setIsSigningBytecode(false);
      showMessage('Bytecode signed successfully (SPHINCS+)', 'success');
    } catch (err: any) {
      setIsSigningBytecode(false);
      console.error('Sign error:', err);
      showMessage('Sign failed', 'error');
    }
  };

  const handleVerifySignature = async () => {
    if (!signedSig || !keyJson || !compiledBytecode) {
      showMessage('Need key, compiled bytecode and signature', 'error');
      return;
    }
    try {
      const payload = compiledBytecode.startsWith('0x') ? compiledBytecode : compiledBytecode;
      const resp = await fetch(`${apiUrl}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publicKey: keyJson.publicKey, 
          signature: signedSig.signature,
          leafIdx: signedSig.leafIdx,
          authPath: signedSig.authPath,
          payload,
          payloadEncoding: 'hex'
        })
      });
      const data = await resp.json();
      if (data.error) {
        showMessage('Verification error: ' + data.error, 'error');
      } else {
        showMessage(data.valid ? 'Signature is VALID!' : 'Signature is INVALID', data.valid ? 'success' : 'error');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      showMessage('Verify failed', 'error');
    }
  };

  const handleServerDeploy = async () => {
    if (!compiledBytecode) {
      showMessage('Compile first', 'error');
      return;
    }
    if (!keyJson) {
      showMessage('Generate or upload key first', 'error');
      return;
    }
    if (!account) {
      showMessage('Connect MetaMask wallet first', 'error');
      return;
    }
    
    try {
      // Step 1: Get SPHINCS+ signature from server
      const signResp = await fetch(`${apiUrl}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyJson, bytecode: compiledBytecode })
      });
      const signData = await signResp.json();
      if (signData.error) throw new Error(signData.error);

      // Step 2: Use MetaMask to send deployment transaction
      if (!(window as any).ethereum) {
        showMessage('MetaMask not found', 'error');
        return;
      }
      
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      
      // Create contract factory
      const factory = new ethers.ContractFactory(compiledABI, compiledBytecode, signer);
      
      // Deploy contract via MetaMask (this triggers the transaction popup)
      // Parse constructor arguments if provided
      const args: any[] = [];
      if (constructorArgs && constructorArgs.trim()) {
        try {
          const parsed = JSON.parse(`[${constructorArgs}]`);
          args.push(...parsed);
        } catch {
          args.push(constructorArgs);
        }
      }

      const contract = await factory.deploy(...args);
      await contract.deployed();
      
      const deployedAddr = contract.address;
      setDeployedAddress(deployedAddr);
      
      // Step 3: Record deployment in KeyRegistry (optional, for off-chain metadata)
      showMessage(`Contract deployed at: ${deployedAddr}`, 'success');
      
    } catch (err: any) {
      console.error('Server deploy error (dev-only):', err);
      const cleanMsg = parseTxError(err);
      // If the server returned a clear server-side error (not tx) show concise server message
      if (err?.message && !err?.message.toLowerCase().includes('user')) {
        // keep short
        showMessage(cleanMsg, 'error');
      } else {
        showMessage(cleanMsg, 'error');
      }
    }
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', p: 2, position: 'relative', zIndex: 1 }}>
      <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h2" className="space-title" sx={{ fontSize: '2rem', mb: 1 }}>
            QUANTUM-SECURE IDE
          </Typography>
          <Typography variant="body2" className="neon-green" sx={{ fontSize: '0.8rem' }}>
            [ DEPLOY SMART CONTRACTS WITH POST-QUANTUM CRYPTOGRAPHY ]
          </Typography>
        </Box>

        {/* Wallet Connection Banner */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 1.5,
            mb: 2,
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(179, 71, 217, 0.08) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '6px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
            {account ? (
              <>
                <span style={{ color: '#39ff14', fontWeight: 600 }}>Connected:</span> {account.slice(0, 6)}...{account.slice(-4)}
              </>
            ) : (
              <span style={{ color: '#ffaa00' }}>Wallet not connected</span>
            )}
          </Typography>
          {account ? (
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => {
                setAccount('');
                setProvider(null);
                showMessage('Wallet disconnected', 'info');
              }}
              sx={{
                borderColor: 'rgba(255, 68, 68, 0.5)',
                color: '#ff4444',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                px: 2,
                '&:hover': {
                  borderColor: '#ff4444',
                  backgroundColor: 'rgba(255, 68, 68, 0.1)'
                }
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              size="small" 
              variant="contained"
              onClick={async () => {
                try {
                  if (!(window as any).ethereum) {
                    showMessage('MetaMask not installed', 'error');
                    return;
                  }
                  console.log('Requesting wallet permissions from MetaMask...');
                  // Use wallet_requestPermissions to always show account picker
                  await (window as any).ethereum.request({ 
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                  });
                  console.log('Permission granted, getting accounts...');
                  const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
                  console.log('Accounts received:', accounts);
                  if (accounts && accounts.length > 0) {
                    const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
                    setProvider(web3Provider);
                    setAccount(accounts[0]);
                    console.log('Wallet connected:', accounts[0]);
                    showMessage('Wallet connected successfully', 'success');
                  }
                } catch (error: any) {
                  console.error('Connect wallet error:', error);
                  showMessage('Failed to connect wallet: ' + error.message, 'error');
                }
              }}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                color: '#000',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                px: 2,
                '&:hover': {
                  opacity: 0.9
                }
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>

        {/* Main IDE Layout */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
          {/* Code Editor */}
          <Card className="space-card" sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <CodeIcon className="neon-blue" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="h6" className="neon-blue" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  SOLIDITY EDITOR
                </Typography>
              </Box>
              
              <TextField
                multiline
                value={solidityCode}
                onChange={(e) => setSolidityCode(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  },
                  '& .MuiInputBase-input': {
                    height: '100% !important',
                    overflow: 'auto !important'
                  }
                }}
                placeholder="Write your Solidity code here..."
              />
            </CardContent>
          </Card>

          {/* Control Panel */}
          <Card className="space-card" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6" className="neon-purple" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  QUANTUM DEPLOYMENT
                </Typography>
              </Box>

              <Stack spacing={2} sx={{ overflow: 'auto', flex: 1, paddingRight: '8px' }}>
                <Divider />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCompile}
                  disabled={isCompiling}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
                >
                  {isCompiling ? 'Compiling...' : 'Compile Contract'}
                </Button>

                {compilationError && (
                  <Alert severity="error" sx={{ fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      {compilationError}
                    </Typography>
                  </Alert>
                )}

                {compiledABI && compiledBytecode && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(compiledABI, null, 2));
                        showMessage('ABI copied to clipboard!', 'success');
                      }}
                      fullWidth
                      sx={{ py: 1, fontWeight: 600, minHeight: '44px' }}
                    >
                      Copy ABI
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const bytecode = compiledBytecode.startsWith('0x') ? compiledBytecode : `0x${compiledBytecode}`;
                        navigator.clipboard.writeText(bytecode);
                        showMessage('Bytecode copied to clipboard!', 'success');
                      }}
                      fullWidth
                      sx={{ py: 1, fontWeight: 600, minHeight: '44px' }}
                    >
                      Copy Bytecode
                    </Button>
                  </Box>
                )}



                <TextField
                  label="Constructor Arguments"
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                  size="small"
                  placeholder='"Hello World!"'
                  helperText="Enter constructor arguments (e.g., strings in quotes)"
                />

                <Divider />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGenerateKey} 
                  fullWidth 
                  disabled={isGeneratingKey}
                  sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
                >
                  {isGeneratingKey ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Generating SPHINCS+ Keypair...</span>
                    </Box>
                  ) : (
                    'Generate SPHINCS+ Keypair'
                  )}
                </Button>
                {keyJson && (
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Public Key:</Typography>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}> {keyJson.publicKey}</Typography>
                  </Alert>
                )}

                <Button 
                  variant="outlined" 
                  onClick={handleSignBytecode} 
                  disabled={!compiledBytecode || !keyJson || isSigningBytecode}
                  fullWidth 
                  sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
                >
                  {isSigningBytecode ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} />
                      <span>Signing Bytecode...</span>
                    </Box>
                  ) : (
                    'Sign Compiled Bytecode (SPHINCS+)'
                  )}
                </Button>
                {signedSig && (
                  <Alert severity="success" sx={{ fontSize: '0.75rem' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Signature (truncated):</Typography>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{signedSig.signature.slice(0, 120)}...</Typography>
                  </Alert>
                )}

                <Button variant="outlined" onClick={handleVerifySignature} disabled={!signedSig || !keyJson || !compiledBytecode} fullWidth sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}>Verify Signature</Button>

                {/* <Button variant="contained" color="secondary" onClick={handleServerDeploy} fullWidth sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}>Server Deploy to Sepolia (no wallet)</Button> */}

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDeploy}
                  disabled={isDeploying || !account}
                  startIcon={<DeployIcon />}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 600, minHeight: '48px' }}
                >
                  {isDeploying ? 'Deploying to Sepolia...' : 'Deploy to Sepolia'}
                </Button>

                {!account && (
                  <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>⚠️ Connect wallet to deploy</Alert>
                )}

                {deployedAddress && (
                  <Alert severity="success" sx={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Deployed to Sepolia!
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Address: {deployedAddress}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      Protected with SPHINCS+ quantum-resistant security
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(`https://sepolia.etherscan.io/address/${deployedAddress}`, '_blank')}
                      sx={{ mt: 1, mr: 1, fontSize: '0.7rem' }}
                    >
                      View on Etherscan
                    </Button>
                  </Alert>
                )}

                {/* {deployedAddress && (
                  <>
                    <Divider sx={{ mt: 1 }} />
                    <Typography variant="subtitle2" className="neon-green" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      CONTRACT VERIFICATION
                    </Typography>
                    
                    <TextField
                      label="Etherscan API Key"
                      value={etherscanApiKey}
                      onChange={(e) => setEtherscanApiKey(e.target.value)}
                      size="small"
                      placeholder="Enter your Etherscan API key"
                      helperText="Get API key from etherscan.io/apis"
                    />
                    
                    <Button
                      variant="contained"
                      onClick={handleVerifyContract}
                      disabled={isVerifying || !etherscanApiKey || isVerified}
                      sx={{
                            py: 1,
                            mt: 2,
                            mb: 3,
                            alignSelf: 'center',
                            width: '100%',
                         }}
                    >
                      {isVerifying ? 'Verifying Contract...' : isVerified ? 'Contract Verified' : 'Verify Contract'}
                    </Button>
                    
                    {verificationStatus && (
                      <Alert 
                        severity={verificationStatus.toLowerCase().includes('success') ? 'success' : 'info'} 
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {verificationStatus}
                      </Alert>
                    )}
                  </>
                )} */}

                <Divider sx={{ mt: 1 }} />

              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={2}>
          <Typography variant="body2" className="neon-blue" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
            [ QUANTUM-RESISTANT SMART CONTRACT DEVELOPMENT ENVIRONMENT ]
          </Typography>
        </Box>

        {/* Minimal toast (Snackbar + Alert) */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={4000}
          onClose={() => setToastMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setToastMessage('')}
            severity={toastSeverity}
            elevation={0}
            variant="standard"
            sx={{
              borderRadius: 1,
              fontSize: '0.95rem',
              minWidth: 260,
              boxShadow: 1,
              alignItems: 'center',
              py: 0.8,
              px: 1.2
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{toastMessage}</Typography>
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default QuantumIDE;
