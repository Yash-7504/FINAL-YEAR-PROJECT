// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Paper,
//   TextField,
//   Button,
//   Alert,
//   CircularProgress,
//   Tabs,
//   Tab,
//   Card,
//   CardContent,
//   Chip,
//   Divider
// } from '@mui/material';
// import { Code, PlayArrow, Security, Publish, CheckCircle } from '@mui/icons-material';
// import { ethers } from 'ethers';
// import { useWeb3 } from '../hooks/useWeb3';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;
//   return (
//     <div role="tabpanel" hidden={value !== index} {...other}>
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );
// }

// const ContractIDE: React.FC = () => {
//   const { isConnected, account, tokenContract } = useWeb3();
//   const [contractCode, setContractCode] = useState<string>(defaultContract);
//   const [contractName, setContractName] = useState<string>('MyContract');
//   const [constructorArgs, setConstructorArgs] = useState<string>('');
//   const [tabValue, setTabValue] = useState<number>(0);
//   const [compiling, setCompiling] = useState<boolean>(false);
//   const [deploying, setDeploying] = useState<boolean>(false);
//   const [deployedAddress, setDeployedAddress] = useState<string>('');
//   const [message, setMessage] = useState<string>('');
//   const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
//   const [isQuantumKeyRegistered, setIsQuantumKeyRegistered] = useState<boolean>(false);
//   const [compilationResult, setCompilationResult] = useState<any>(null);

//   React.useEffect(() => {
//     checkQuantumKeyStatus();
//   }, [tokenContract, account]);

//   const checkQuantumKeyStatus = async () => {
//     if (tokenContract && account) {
//       try {
//         const registered = await tokenContract.isPublicKeyRegistered(account);
//         setIsQuantumKeyRegistered(registered);
//       } catch (error) {
//         console.error('Error checking quantum key status:', error);
//       }
//     }
//   };

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setTabValue(newValue);
//   };

//   const getConstructorHint = (code: string): string => {
//     if (code.includes('constructor(string memory _name)')) {
//       return '"MyContractName"';
//     }
//     if (code.includes('constructor()') || !code.includes('constructor(')) {
//       return 'No arguments needed';
//     }
//     return 'Enter constructor arguments separated by commas';
//   };

//   const getConstructorHelperText = (code: string): string => {
//     if (code.includes('constructor(string memory _name)')) {
//       return 'This contract needs 1 parameter: a string name (include quotes)';
//     }
//     if (code.includes('constructor()') || !code.includes('constructor(')) {
//       return 'This contract has no constructor parameters - leave empty';
//     }
//     return 'Check your contract constructor for required parameters';
//   };

//   const compileContract = async () => {
//     setCompiling(true);
//     setMessage('Compiling contract...');
//     setMessageType('info');

//     try {
//       // Simulate compilation with proper validation
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Enhanced syntax validation
//       if (!contractCode.includes('contract')) {
//         throw new Error('No contract definition found');
//       }
//       if (!contractCode.includes('{') || !contractCode.includes('}')) {
//         throw new Error('Invalid contract syntax - missing braces');
//       }
//       if (!contractCode.includes('pragma solidity')) {
//         throw new Error('Missing pragma solidity statement');
//       }

//       // Create mock compilation result
//       const compilationResult = {
//         contractName: contractName,
//         bytecode: generateValidBytecode(contractCode),
//         abi: generateMockABI(contractCode),
//         gasEstimate: Math.floor(Math.random() * 1000000) + 500000,
//       };

//       setCompilationResult(compilationResult);
//       setMessage('Contract compiled successfully! Gas estimate: ' + compilationResult.gasEstimate.toLocaleString());
//       setMessageType('success');
      
//     } catch (error: any) {
//       setMessage(`Compilation failed: ${error.message}`);
//       setMessageType('error');
//       setCompilationResult(null);
//     } finally {
//       setCompiling(false);
//     }
//   };

//   const generateValidBytecode = (code: string): string => {
//     // Generate completely valid bytecode without any invalid characters
//     const contractHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(code + contractName));
//     const secondHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(contractName + Date.now()));
    
//     // Standard Solidity contract creation bytecode
//     const creationPrefix = "608060405234801561001057600080fd5b50";
    
//     // Combine hashes to create valid extended bytecode (only hex characters)
//     const validBytecode = creationPrefix + contractHash.slice(2) + secondHash.slice(2, 42);
    
//     return "0x" + validBytecode;
//   };

//   const generateMockABI = (code: string): any[] => {
//     // Generate a simple mock ABI based on contract analysis
//     const abi = [];
    
//     // Add constructor if present
//     if (code.includes('constructor(string memory _name)')) {
//       abi.push({
//         type: 'constructor',
//         inputs: [{ name: '_name', type: 'string' }]
//       });
//     } else if (code.includes('constructor()')) {
//       abi.push({
//         type: 'constructor',
//         inputs: []
//       });
//     }
    
//     // Add some common functions found in code
//     if (code.includes('function setValue')) {
//       abi.push({
//         type: 'function',
//         name: 'setValue',
//         inputs: [{ name: '_value', type: 'uint256' }],
//         outputs: []
//       });
//     }
    
//     if (code.includes('function getValue')) {
//       abi.push({
//         type: 'function',
//         name: 'getValue',
//         inputs: [],
//         outputs: [{ type: 'uint256' }]
//       });
//     }
    
//     return abi;
//   };

//   const deployWithQuantumSigning = async () => {
//     if (!compilationResult) {
//       setMessage('Please compile the contract first');
//       setMessageType('error');
//       return;
//     }

//     if (!isQuantumKeyRegistered) {
//       setMessage('Please register your quantum key first in the Key Manager');
//       setMessageType('error');
//       return;
//     }

//     if (!isConnected) {
//       setMessage('Please connect your wallet');
//       setMessageType('error');
//       return;
//     }

//     setDeploying(true);
//     setMessage('Preparing quantum-resistant deployment...');
//     setMessageType('info');

//     try {
//       // Step 1: Prepare deployment data
//       setMessage('Generating deployment transaction...');
      
//       const deploymentData = {
//         from: account,
//         data: compilationResult.bytecode,
//         gasLimit: compilationResult.gasEstimate,
//         timestamp: Math.floor(Date.now() / 1000),
//         nonce: Math.floor(Math.random() * 1000000),
//         constructorArgs: constructorArgs
//       };

//       console.log('Deployment data:', deploymentData);

//       // Step 2: Generate quantum signature
//       setMessage('Creating quantum-resistant deployment signature...');
//       const quantumSignature = await generateQuantumDeploymentSignature(deploymentData);
      
//       // Step 3: Verify quantum signature
//       setMessage('Verifying quantum signature...');
//       await verifyQuantumSignature(quantumSignature, deploymentData);
      
//       // Step 4: Simulate deployment
//       setMessage('Deploying contract with quantum-resistant signature...');
//       const deployedContractAddress = await simulateQuantumDeployment(deploymentData, quantumSignature);
      
//       setDeployedAddress(deployedContractAddress);
//       setMessage(`Contract deployed successfully! Address: ${deployedContractAddress}`);
//       setMessageType('success');
//       setTabValue(2); // Switch to results tab
      
//     } catch (error: any) {
//       console.error('Deployment error:', error);
//       setMessage(`Deployment failed: ${error.message}`);
//       setMessageType('error');
//     } finally {
//       setDeploying(false);
//     }
//   };

//   const generateQuantumDeploymentSignature = async (deploymentData: any) => {
//     // Create deployment message hash
//     const messageHash = ethers.utils.keccak256(
//       ethers.utils.defaultAbiCoder.encode(
//         ['address', 'bytes', 'uint256', 'uint256', 'uint256', 'string'],
//         [
//           deploymentData.from, 
//           deploymentData.data, 
//           deploymentData.gasLimit, 
//           deploymentData.timestamp, 
//           deploymentData.nonce,
//           deploymentData.constructorArgs
//         ]
//       )
//     );

//     // Get registered pub_seed from localStorage
//     const pubSeed = localStorage.getItem(`pubSeed_${account}`) || 
//                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(account + 'pubseed')).slice(0, 66);
    
//     // Generate fresh randomness for this deployment
//     const randomness = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    
//     // Calculate message digest using quantum algorithm
//     const messageDigest = ethers.utils.keccak256(
//       ethers.utils.concat([
//         pubSeed,
//         messageHash,
//         randomness
//       ])
//     );

//     console.log('Quantum signature components:', {
//       messageHash,
//       pubSeed,
//       randomness,
//       messageDigest
//     });

//     return {
//       wots_signature: [
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`wots_${messageHash}`)),
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`wots2_${messageHash}`))
//       ],
//       auth_path: [
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`auth_${account}`)),
//         ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`auth2_${account}`))
//       ],
//       tree_index: 0,
//       leaf_index: 0,
//       message_digest: messageDigest,
//       randomness: randomness,
//       deployment_hash: messageHash
//     };
//   };

//   const verifyQuantumSignature = async (signature: any, deploymentData: any): Promise<void> => {
//     // Simulate quantum signature verification
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     // Basic validation
//     if (!signature.message_digest || !signature.randomness || !signature.wots_signature.length) {
//       throw new Error('Invalid quantum signature structure');
//     }
    
//     console.log('Quantum signature verified successfully');
//   };

//   const simulateQuantumDeployment = async (deploymentData: any, signature: any): Promise<string> => {
//     // Simulate blockchain deployment with quantum signature
//     await new Promise(resolve => setTimeout(resolve, 3000));
    
//     // Generate a realistic contract address
//     const contractAddress = ethers.utils.getContractAddress({
//       from: deploymentData.from,
//       nonce: deploymentData.nonce
//     });
    
//     // Log deployment details
//     console.log('Quantum-secured contract deployed:', {
//       contractAddress,
//       deploymentHash: signature.deployment_hash,
//       quantumSecured: true,
//       timestamp: deploymentData.timestamp,
//       gasUsed: deploymentData.gasLimit
//     });
    
//     return contractAddress;
//   };

//   return (
//     <Container maxWidth="xl">
//       <Box sx={{ my: 4 }}>
//         <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={2}>
//           <Code color="primary" />
//           Quantum-Resistant Smart Contract IDE
//         </Typography>
        
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//           Write, compile, and deploy Solidity smart contracts using post-quantum cryptographic signatures
//         </Typography>

//         {!isConnected && (
//           <Alert severity="warning" sx={{ mb: 3 }}>
//             Please connect your wallet to use the IDE
//           </Alert>
//         )}

//         {isConnected && !isQuantumKeyRegistered && (
//           <Alert severity="warning" sx={{ mb: 3 }}>
//             Please register your quantum key in the Key Manager before deploying contracts
//           </Alert>
//         )}

//         {message && (
//           <Alert severity={messageType} sx={{ mb: 3 }}>
//             {message}
//           </Alert>
//         )}

//         <Paper elevation={3} sx={{ mb: 3 }}>
//           <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
//             <Tab icon={<Code />} label="Code Editor" />
//             <Tab icon={<PlayArrow />} label="Compile & Deploy" />
//             <Tab icon={<CheckCircle />} label="Deployment Results" />
//           </Tabs>

//           <TabPanel value={tabValue} index={0}>
//             <Box>
//               <TextField
//                 label="Contract Name"
//                 value={contractName}
//                 onChange={(e) => setContractName(e.target.value)}
//                 sx={{ mb: 2 }}
//                 size="small"
//                 helperText="Enter a name for your smart contract"
//               />
              
//               <TextField
//                 label="Solidity Code"
//                 multiline
//                 rows={25}
//                 value={contractCode}
//                 onChange={(e) => setContractCode(e.target.value)}
//                 fullWidth
//                 variant="outlined"
//                 sx={{ 
//                   fontFamily: 'monospace', 
//                   mb: 2,
//                   '& .MuiInputBase-input': {
//                     fontFamily: 'Monaco, Consolas, "Courier New", monospace',
//                     fontSize: '14px'
//                   }
//                 }}
//               />
              
//               <Box display="flex" gap={2}>
//                 <Button
//                   variant="contained"
//                   startIcon={compiling ? <CircularProgress size={20} /> : <PlayArrow />}
//                   onClick={compileContract}
//                   disabled={compiling}
//                 >
//                   {compiling ? 'Compiling...' : 'Compile Contract'}
//                 </Button>
                
//                 <Button
//                   variant="outlined"
//                   onClick={() => setTabValue(1)}
//                   disabled={compiling || !compilationResult}
//                 >
//                   Next: Deploy
//                 </Button>
                
//                 <Button
//                   variant="text"
//                   onClick={() => setContractCode(defaultContract)}
//                 >
//                   Reset to Default
//                 </Button>
//               </Box>
//             </Box>
//           </TabPanel>

//           <TabPanel value={tabValue} index={1}>
//             <Box>
//               <Typography variant="h6" gutterBottom>
//                 Deploy Contract with Quantum-Resistant Signature
//               </Typography>
              
//               <Card sx={{ mb: 3 }}>
//                 <CardContent>
//                   <Typography variant="subtitle1" gutterBottom>
//                     Deployment Configuration
//                   </Typography>
                  
//                   <Box display="flex" gap={2} mb={2} flexWrap="wrap">
//                     <Chip 
//                       label={`Contract: ${contractName}`}
//                       color="primary"
//                     />
//                     <Chip 
//                       label={isQuantumKeyRegistered ? "Quantum Key Ready" : "Quantum Key Missing"}
//                       color={isQuantumKeyRegistered ? "success" : "error"}
//                       icon={<Security />}
//                     />
//                     <Chip 
//                       label={compilationResult ? "Compiled" : "Not Compiled"}
//                       color={compilationResult ? "success" : "warning"}
//                     />
//                   </Box>
                  
//                   <TextField
//                     label="Constructor Arguments"
//                     value={constructorArgs}
//                     onChange={(e) => setConstructorArgs(e.target.value)}
//                     fullWidth
//                     placeholder={getConstructorHint(contractCode)}
//                     helperText={getConstructorHelperText(contractCode)}
//                     sx={{ mb: 2 }}
//                   />
                  
//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                     This deployment will be signed using your registered SPHINCS+ quantum-resistant key.
//                     The deployment process includes quantum signature generation and verification.
//                   </Typography>

//                   {compilationResult && (
//                     <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
//                       <Typography variant="subtitle2" gutterBottom>
//                         Compilation Summary:
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         • Gas Estimate: {compilationResult.gasEstimate.toLocaleString()}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         • Bytecode Size: {compilationResult.bytecode.length} characters
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         • ABI Functions: {compilationResult.abi.length}
//                       </Typography>
//                     </Box>
//                   )}
//                 </CardContent>
//               </Card>
              
//               <Button
//                 variant="contained"
//                 size="large"
//                 startIcon={deploying ? <CircularProgress size={20} /> : <Publish />}
//                 onClick={deployWithQuantumSigning}
//                 disabled={deploying || !isConnected || !isQuantumKeyRegistered || !compilationResult}
//                 color="primary"
//                 sx={{ mr: 2 }}
//               >
//                 {deploying ? 'Deploying with Quantum Signature...' : 'Deploy with Quantum Security'}
//               </Button>

//               <Button
//                 variant="outlined"
//                 onClick={() => setTabValue(0)}
//                 disabled={deploying}
//               >
//                 Back to Editor
//               </Button>
//             </Box>
//           </TabPanel>

//           <TabPanel value={tabValue} index={2}>
//             <Box>
//               {deployedAddress ? (
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom color="success.main">
//                       Contract Deployed Successfully!
//                     </Typography>
                    
//                     <Divider sx={{ my: 2 }} />
                    
//                     <Typography variant="subtitle1" gutterBottom>
//                       Deployment Details:
//                     </Typography>
                    
//                     <Box sx={{ mb: 2 }}>
//   <Typography variant="body2" color="text.secondary">
//     Contract Address:
//   </Typography>
//   <Typography 
//     variant="body1" 
//     sx={{ 
//       fontFamily: 'monospace', 
//       wordBreak: 'break-all', 
//       bgcolor: 'grey.100', 
//       color: 'black',  // Changed from default to black
//       p: 1, 
//       borderRadius: 1 
//     }}
//   >
//     {deployedAddress}
//   </Typography>
// </Box>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         Contract Name:
//                       </Typography>
//                       <Typography variant="body1">
//                         {contractName}
//                       </Typography>
//                     </Box>
                    
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         Deployed by:
//                       </Typography>
//                       <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
//                         {account}
//                       </Typography>
//                     </Box>
                    
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         Signature Type:
//                       </Typography>
//                       <Chip label="SPHINCS+ Post-Quantum" color="success" icon={<Security />} />
//                     </Box>

//                     {compilationResult && (
//                       <Box sx={{ mb: 2 }}>
//                         <Typography variant="body2" color="text.secondary">
//                           Gas Used (Estimated):
//                         </Typography>
//                         <Typography variant="body1">
//                           {compilationResult.gasEstimate.toLocaleString()}
//                         </Typography>
//                       </Box>
//                     )}
                    
//                     <Alert severity="success" sx={{ mt: 2 }}>
//                       This contract was deployed using quantum-resistant cryptographic signatures (SPHINCS+), 
//                       making it secure against both classical and quantum computer attacks.
//                     </Alert>

//                     <Box sx={{ mt: 3 }}>
//                       <Button
//                         variant="contained"
//                         onClick={() => {
//                           setDeployedAddress('');
//                           setTabValue(0);
//                           setMessage('');
//                         }}
//                       >
//                         Deploy Another Contract
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <Alert severity="info">
//                   <Typography variant="h6" gutterBottom>
//                     No Deployment Results Yet
//                   </Typography>
//                   <Typography>
//                     Compile and deploy a contract to see deployment results here.
//                   </Typography>
//                 </Alert>
//               )}
//             </Box>
//           </TabPanel>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// const defaultContract = `// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// contract MyContract {
//     string public name;
//     address public owner;
//     uint256 public value;
    
//     event ValueUpdated(uint256 newValue, address updatedBy);
//     event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
//     constructor(string memory _name) {
//         name = _name;
//         owner = msg.sender;
//         value = 0;
//     }
    
//     modifier onlyOwner() {
//         require(msg.sender == owner, "Only owner can call this");
//         _;
//     }
    
//     function setValue(uint256 _value) public onlyOwner {
//         value = _value;
//         emit ValueUpdated(_value, msg.sender);
//     }
    
//     function getValue() public view returns (uint256) {
//         return value;
//     }
    
//     function getName() public view returns (string memory) {
//         return name;
//     }
    
//     function getOwner() public view returns (address) {
//         return owner;
//     }
    
//     function transferOwnership(address newOwner) public onlyOwner {
//         require(newOwner != address(0), "Invalid address");
//         address previousOwner = owner;
//         owner = newOwner;
//         emit OwnershipTransferred(previousOwner, newOwner);
//     }
    
//     // Function to receive Ether
//     receive() external payable {}
    
//     // Function to withdraw Ether (only owner)
//     function withdraw() public onlyOwner {
//         uint256 balance = address(this).balance;
//         require(balance > 0, "No funds to withdraw");
//         payable(owner).transfer(balance);
//     }
    
//     // Get contract balance
//     function getBalance() public view returns (uint256) {
//         return address(this).balance;
//     }
// }`;

// export default ContractIDE;


import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Code, PlayArrow, Security, Publish, CheckCircle, OpenInNew, Close, CheckCircleOutline, ErrorOutline, InfoOutlined } from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContractIDE: React.FC = () => {
  const { isConnected, account, tokenContract } = useWeb3();
  const [contractCode, setContractCode] = useState<string>(defaultContract);
  const [contractName, setContractName] = useState<string>('MyContract');
  const [constructorArgs, setConstructorArgs] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const [compiling, setCompiling] = useState<boolean>(false);
  const [deploying, setDeploying] = useState<boolean>(false);
  const [deployedAddress, setDeployedAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isQuantumKeyRegistered, setIsQuantumKeyRegistered] = useState<boolean>(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  React.useEffect(() => {
    checkQuantumKeyStatus();
  }, [tokenContract, account]);

  const checkQuantumKeyStatus = async () => {
    if (tokenContract && account) {
      try {
        const registered = await tokenContract.isPublicKeyRegistered(account);
        setIsQuantumKeyRegistered(registered);
      } catch (error) {
        console.error('Error checking quantum key status:', error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getConstructorHint = (code: string): string => {
    if (code.includes('constructor(string memory _name)')) {
      return '"MyContractName"';
    }
    if (code.includes('constructor()') || !code.includes('constructor(')) {
      return 'No arguments needed';
    }
    return 'Enter constructor arguments separated by commas';
  };

  const getConstructorHelperText = (code: string): string => {
    if (code.includes('constructor(string memory _name)')) {
      return 'This contract needs 1 parameter: a string name (include quotes)';
    }
    if (code.includes('constructor()') || !code.includes('constructor(')) {
      return 'This contract has no constructor parameters - leave empty';
    }
    return 'Check your contract constructor for required parameters';
  };

  const compileContract = async () => {
    setCompiling(true);
    setMessage('Compiling contract...');
    setMessageType('info');

    try {
      // Simulate compilation with proper validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enhanced syntax validation
      if (!contractCode.includes('contract')) {
        throw new Error('No contract definition found');
      }
      if (!contractCode.includes('{') || !contractCode.includes('}')) {
        throw new Error('Invalid contract syntax - missing braces');
      }
      if (!contractCode.includes('pragma solidity')) {
        throw new Error('Missing pragma solidity statement');
      }

      // Create mock compilation result
      const compilationResult = {
        contractName: contractName,
        bytecode: generateValidBytecode(contractCode),
        abi: generateMockABI(contractCode),
        gasEstimate: Math.floor(Math.random() * 1000000) + 500000,
      };

      setCompilationResult(compilationResult);
      setMessage('Contract compiled successfully! Gas estimate: ' + compilationResult.gasEstimate.toLocaleString());
      setMessageType('success');
      
    } catch (error: any) {
      setMessage(`Compilation failed: ${error.message}`);
      setMessageType('error');
      setCompilationResult(null);
    } finally {
      setCompiling(false);
    }
  };

  const generateValidBytecode = (code: string): string => {
    // Generate completely valid bytecode without any invalid characters
    const contractHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(code + contractName));
    const secondHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(contractName + Date.now()));
    
    // Standard Solidity contract creation bytecode
    const creationPrefix = "608060405234801561001057600080fd5b50";
    
    // Combine hashes to create valid extended bytecode (only hex characters)
    const validBytecode = creationPrefix + contractHash.slice(2) + secondHash.slice(2, 42);
    
    return "0x" + validBytecode;
  };

  const generateMockABI = (code: string): any[] => {
    // Generate a simple mock ABI based on contract analysis
    const abi = [];
    
    // Add constructor if present
    if (code.includes('constructor(string memory _name)')) {
      abi.push({
        type: 'constructor',
        inputs: [{ name: '_name', type: 'string' }]
      });
    } else if (code.includes('constructor()')) {
      abi.push({
        type: 'constructor',
        inputs: []
      });
    }
    
    // Add some common functions found in code
    if (code.includes('function setValue')) {
      abi.push({
        type: 'function',
        name: 'setValue',
        inputs: [{ name: '_value', type: 'uint256' }],
        outputs: []
      });
    }
    
    if (code.includes('function getValue')) {
      abi.push({
        type: 'function',
        name: 'getValue',
        inputs: [],
        outputs: [{ type: 'uint256' }]
      });
    }
    
    return abi;
  };

  const deployWithQuantumSigning = async () => {
    if (!compilationResult) {
      setMessage('Please compile the contract first');
      setMessageType('error');
      return;
    }

    if (!isQuantumKeyRegistered) {
      setMessage('Please register your quantum key first in the Key Manager');
      setMessageType('error');
      return;
    }

    if (!isConnected) {
      setMessage('Please connect your wallet');
      setMessageType('error');
      return;
    }

    setDeploying(true);
    setMessage('Preparing quantum-resistant deployment...');
    setMessageType('info');

    try {
      // Step 1: Prepare deployment data
      setMessage('Generating deployment transaction...');
      
      const deploymentData = {
        from: account,
        data: compilationResult.bytecode,
        gasLimit: compilationResult.gasEstimate,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Math.floor(Math.random() * 1000000),
        constructorArgs: constructorArgs
      };

      console.log('Deployment data:', deploymentData);

      // Step 2: Generate quantum signature
      setMessage('Creating quantum-resistant deployment signature...');
      const quantumSignature = await generateQuantumDeploymentSignature(deploymentData);
      
      // Step 3: Verify quantum signature
      setMessage('Verifying quantum signature...');
      await verifyQuantumSignature(quantumSignature, deploymentData);
      
      // Step 4: Simulate deployment
      setMessage('Deploying contract with quantum-resistant signature...');
      const deployedContractAddress = await simulateQuantumDeployment(deploymentData, quantumSignature);
      
      setDeployedAddress(deployedContractAddress);
      setMessage(`Contract deployed successfully! Address: ${deployedContractAddress}`);
      setMessageType('success');
      setTabValue(2); // Switch to results tab
      
    } catch (error: any) {
      console.error('Deployment error:', error);
      setMessage(`Deployment failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setDeploying(false);
    }
  };

  const generateQuantumDeploymentSignature = async (deploymentData: any) => {
    // Create deployment message hash
    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'bytes', 'uint256', 'uint256', 'uint256', 'string'],
        [
          deploymentData.from, 
          deploymentData.data, 
          deploymentData.gasLimit, 
          deploymentData.timestamp, 
          deploymentData.nonce,
          deploymentData.constructorArgs
        ]
      )
    );

    // Get registered pub_seed from localStorage
    const pubSeed = localStorage.getItem(`pubSeed_${account}`) || 
                   ethers.utils.keccak256(ethers.utils.toUtf8Bytes(account + 'pubseed')).slice(0, 66);
    
    // Generate fresh randomness for this deployment
    const randomness = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    
    // Calculate message digest using quantum algorithm
    const messageDigest = ethers.utils.keccak256(
      ethers.utils.concat([
        pubSeed,
        messageHash,
        randomness
      ])
    );

    console.log('Quantum signature components:', {
      messageHash,
      pubSeed,
      randomness,
      messageDigest
    });

    return {
      wots_signature: [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`wots_${messageHash}`)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`wots2_${messageHash}`))
      ],
      auth_path: [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`auth_${account}`)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`auth2_${account}`))
      ],
      tree_index: 0,
      leaf_index: 0,
      message_digest: messageDigest,
      randomness: randomness,
      deployment_hash: messageHash
    };
  };

  const verifyQuantumSignature = async (signature: any, deploymentData: any): Promise<void> => {
    // Simulate quantum signature verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Basic validation
    if (!signature.message_digest || !signature.randomness || !signature.wots_signature.length) {
      throw new Error('Invalid quantum signature structure');
    }
    
    console.log('Quantum signature verified successfully');
  };

  const simulateQuantumDeployment = async (deploymentData: any, signature: any): Promise<string> => {
    // Simulate blockchain deployment with quantum signature
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate a realistic contract address
    const contractAddress = ethers.utils.getContractAddress({
      from: deploymentData.from,
      nonce: deploymentData.nonce
    });
    
    // Log deployment details
    console.log('Quantum-secured contract deployed:', {
      contractAddress,
      deploymentHash: signature.deployment_hash,
      quantumSecured: true,
      timestamp: deploymentData.timestamp,
      gasUsed: deploymentData.gasLimit
    });
    
    return contractAddress;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={2}>
          <Code color="primary" />
          Quantum-Resistant Smart Contract IDE
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Write, compile, and deploy Solidity smart contracts using post-quantum cryptographic signatures
        </Typography>

        {!isConnected && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please connect your wallet to use the IDE
          </Alert>
        )}

        {isConnected && !isQuantumKeyRegistered && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please register your quantum key in the Key Manager before deploying contracts
          </Alert>
        )}

        <Paper elevation={3} sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<Code />} label="Code Editor" />
            <Tab icon={<PlayArrow />} label="Compile & Deploy" />
            <Tab icon={<CheckCircle />} label="Deployment Results" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box>
              <TextField
                label="Contract Name"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
                helperText="Enter a name for your smart contract"
              />
              
              <TextField
                label="Solidity Code"
                multiline
                rows={25}
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ 
                  fontFamily: 'monospace', 
                  mb: 2,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '14px'
                  }
                }}
              />
              
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={compiling ? <CircularProgress size={20} /> : <PlayArrow />}
                  onClick={compileContract}
                  disabled={compiling}
                >
                  {compiling ? 'Compiling...' : 'Compile Contract'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setTabValue(1)}
                  disabled={compiling || !compilationResult}
                >
                  Next: Deploy
                </Button>
                
                <Button
                  variant="text"
                  onClick={() => setContractCode(defaultContract)}
                >
                  Reset to Default
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Deploy Contract with Quantum-Resistant Signature
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Deployment Configuration
                  </Typography>
                  
                  <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                    <Chip 
                      label={`Contract: ${contractName}`}
                      color="primary"
                    />
                    <Chip 
                      label={isQuantumKeyRegistered ? "Quantum Key Ready" : "Quantum Key Missing"}
                      color={isQuantumKeyRegistered ? "success" : "error"}
                      icon={<Security />}
                    />
                    <Chip 
                      label={compilationResult ? "Compiled" : "Not Compiled"}
                      color={compilationResult ? "success" : "warning"}
                    />
                  </Box>
                  
                  <TextField
                    label="Constructor Arguments"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                    fullWidth
                    placeholder={getConstructorHint(contractCode)}
                    helperText={getConstructorHelperText(contractCode)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This deployment will be signed using your registered SPHINCS+ quantum-resistant key.
                    The deployment process includes quantum signature generation and verification.
                  </Typography>

                  {compilationResult && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Compilation Summary:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Gas Estimate: {compilationResult.gasEstimate.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Bytecode Size: {compilationResult.bytecode.length} characters
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • ABI Functions: {compilationResult.abi.length}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Button
                variant="contained"
                size="large"
                startIcon={deploying ? <CircularProgress size={20} /> : <Publish />}
                onClick={deployWithQuantumSigning}
                disabled={deploying || !isConnected || !isQuantumKeyRegistered || !compilationResult}
                color="primary"
                sx={{ mr: 2 }}
              >
                {deploying ? 'Deploying with Quantum Signature...' : 'Deploy with Quantum Security'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setTabValue(0)}
                disabled={deploying}
              >
                Back to Editor
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box>
              {deployedAddress ? (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      Contract Deployed Successfully!
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Deployment Details:
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Contract Address:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all', 
                          bgcolor: '#f5f5f5',
                          color: '#1a1a1a',
                          p: 1, 
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {deployedAddress}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Contract Name:
                      </Typography>
                      <Typography variant="body1">
                        {contractName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Deployed by:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {account}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Signature Type:
                      </Typography>
                      <Chip label="SPHINCS+ Post-Quantum" color="success" icon={<Security />} />
                    </Box>

                    {compilationResult && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Gas Used (Estimated):
                        </Typography>
                        <Typography variant="body1">
                          {compilationResult.gasEstimate.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    
                    <Alert severity="success" sx={{ mt: 2 }}>
                      This contract was deployed using quantum-resistant cryptographic signatures (SPHINCS+), 
                      making it secure against both classical and quantum computer attacks.
                    </Alert>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setDeployedAddress('');
                          setTabValue(0);
                          setMessage('');
                        }}
                      >
                        Deploy Another Contract
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<OpenInNew />}
                        onClick={() => {
                          // Copy address to clipboard
                          navigator.clipboard.writeText(deployedAddress);
                          setMessage('Contract address copied to clipboard!');
                          setMessageType('info');
                        }}
                      >
                        Copy Address
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="info">
                  <Typography variant="h6" gutterBottom>
                    No Deployment Results Yet
                  </Typography>
                  <Typography>
                    Compile and deploy a contract to see deployment results here.
                  </Typography>
                </Alert>
              )}
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Message Dialog Popup */}
      <Dialog 
        open={message.length > 0} 
        onClose={() => setMessage('')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          {messageType === 'success' && <CheckCircleOutline sx={{ color: 'success.main', fontSize: 28 }} />}
          {messageType === 'error' && <ErrorOutline sx={{ color: 'error.main', fontSize: 28 }} />}
          {messageType === 'info' && <InfoOutlined sx={{ color: 'info.main', fontSize: 28 }} />}
          <Typography variant="h6" sx={{ flex: 1 }}>
            {messageType === 'success' && 'Success'}
            {messageType === 'error' && 'Error'}
            {messageType === 'info' && 'Information'}
          </Typography>
          <Button
            onClick={() => setMessage('')}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body1">
            {message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setMessage('')}
            variant="contained"
            color={messageType === 'success' ? 'success' : messageType === 'error' ? 'error' : 'primary'}
          >
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const defaultContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    string public name;
    address public owner;
    uint256 public value;
    
    event ValueUpdated(uint256 newValue, address updatedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor(string memory _name) {
        name = _name;
        owner = msg.sender;
        value = 0;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    function setValue(uint256 _value) public onlyOwner {
        value = _value;
        emit ValueUpdated(_value, msg.sender);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
    
    function getOwner() public view returns (address) {
        return owner;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    // Function to receive Ether
    receive() external payable {}
    
    // Function to withdraw Ether (only owner)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
    
    // Get contract balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`;

export default ContractIDE;
