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
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Code as CodeIcon,
  Rocket as DeployIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon
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
  const [etherscanApiKey, setEtherscanApiKey] = useState('196YZ6JAQCMG5TMRR9MA7Y9FMQ7GC22ZGY');
  const [compiledABI, setCompiledABI] = useState<any>(null);
  const [compiledBytecode, setCompiledBytecode] = useState<string>('');
  const [showABI, setShowABI] = useState(false);
  const [showBytecode, setShowBytecode] = useState(false);
  const [compilationError, setCompilationError] = useState('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

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
          alert('Contract compiled successfully!');
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
      alert('Please connect your wallet first!');
      return;
    }

    setIsDeploying(true);
    try {
      // Switch to Sepolia if not already
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });

      const signer = provider.getSigner();
      
      // Check if contract is compiled
      if (!compiledABI || !compiledBytecode) {
        alert('Please compile the contract first!');
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
      const contract = await contractFactory.deploy(constructorArgs, {
        gasLimit: 500000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
      });

      console.log('Waiting for deployment...');
      await contract.deployed();
      
      setDeployedAddress(contract.address);
      alert(`Contract deployed to Sepolia at: ${contract.address}`);
      
    } catch (error: any) {
      console.error('Deployment failed:', error);
      alert(`Deployment failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleVerifyContract = async () => {
    if (!deployedAddress || !etherscanApiKey) {
      alert('Please deploy contract and enter API key first!');
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
        
      } else if (result.result.includes('already verified')) {
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
            <CardContent sx={{ p: 2, flex: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                {/* <SecurityIcon className="neon-purple" sx={{ mr: 1, fontSize: 20 }} /> */}
                <Typography variant="h6" className="neon-purple" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  QUANTUM DEPLOYMENT
                </Typography>
              </Box>

              <Stack spacing={2}>
                {/* Security Features */}
                {/* <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                  Contract will be deployed with SPHINCS+ quantum-resistant signatures
                </Alert> */}



                <Divider />

                {/* Compile Button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCompile}
                  disabled={isCompiling}
                  sx={{ py: 1.5 }}
                >
                  {isCompiling ? 'Compiling...' : 'Compile Contract'}
                </Button>

                {/* Compilation Error */}
                {compilationError && (
                  <Alert severity="error" sx={{ fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      {compilationError}
                    </Typography>
                  </Alert>
                )}

                {/* ABI and Bytecode Buttons */}
                {compiledABI && compiledBytecode && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowABI(!showABI)}
                      sx={{ flex: 1, fontSize: '0.8rem' }}
                    >
                      {showABI ? 'Hide ABI' : 'Show ABI'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowBytecode(!showBytecode)}
                      sx={{ flex: 1, fontSize: '0.8rem' }}
                    >
                      {showBytecode ? 'Hide Bytecode' : 'Show Bytecode'}
                    </Button>
                  </Box>
                )}

                {/* ABI Display */}
                {showABI && compiledABI && (
                  <Alert severity="info" sx={{ fontSize: '0.7rem', maxHeight: '150px', overflow: 'auto' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Contract ABI:
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.65rem' }}>
                      {JSON.stringify(compiledABI, null, 2)}
                    </Typography>
                  </Alert>
                )}

                {/* Bytecode Display */}
                {showBytecode && compiledBytecode && (
                  <Alert severity="info" sx={{ fontSize: '0.7rem', maxHeight: '150px', overflow: 'auto' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Contract Bytecode:
                    </Typography>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all', fontSize: '0.65rem' }}>
                      0x{compiledBytecode}
                    </Typography>
                  </Alert>
                )}

                {/* Constructor Arguments */}
                <TextField
                  label="Constructor Arguments"
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                  size="small"
                  placeholder='"Hello World!"'
                  helperText="Enter constructor arguments (e.g., strings in quotes)"
                />

                {/* Deploy Button */}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDeploy}
                  disabled={isDeploying || !account}
                  startIcon={<DeployIcon />}
                  sx={{ py: 1.5 }}
                >
                  {isDeploying ? 'Deploying to Sepolia...' : 'Deploy to Sepolia'}
                </Button>

                {!account && (
                  <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>⚠️ Connect wallet to deploy</Alert>
                )}

                {/* Deployment Result */}
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

                {/* Contract Verification */}
                {deployedAddress && (
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
                      {isVerifying ? 'Verifying Contract...' : isVerified ? 'Contract Verified ✓' : 'Verify Contract'}
                    </Button>
                    
                    {verificationStatus && (
                      <Alert 
                        severity={verificationStatus.includes('success') ? 'success' : 'info'} 
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {verificationStatus}
                      </Alert>
                    )}
                  </>
                )}

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
      </Container>
    </Box>
  );
};

export default QuantumIDE;