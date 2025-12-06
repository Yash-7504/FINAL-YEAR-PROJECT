import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Send, ShieldCheck, Atom, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../App';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { WalletHeader } from '@/components/wallet/WalletHeader';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { SendDialog } from '@/components/wallet/SendDialog';
import { KeyDialog } from '@/components/wallet/KeyDialog';
import { NETWORKS, QUANTUM_TOKEN_ABI } from '../contracts/abis';
import { Transaction } from '@/types/schema';
import { TokenType, NetworkName } from '@/types/enums';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [quantumToken, setQuantumToken] = useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [qtcBalance, setQtcBalance] = useState<string>('0');
  const [isKeyRegistered, setIsKeyRegistered] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkName>('Localhost');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [sendType, setSendType] = useState<TokenType>('ETH');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wallet_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [txStatusOpen, setTxStatusOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<{ success: boolean; hash?: string; message: string }>({ success: false, message: '' });
  const [currentPage, setCurrentPage] = useState(0);

  const detectNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkNames: { [key: string]: NetworkName } = {
          '0x1': 'Ethereum',
          '0xaa36a7': 'Sepolia',
          '0x89': 'Polygon',
          '0x13881': 'Mumbai'
        };
        setCurrentNetwork(networkNames[chainId] || 'Unknown');
      } catch (error) {
        setCurrentNetwork('Unknown');
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
      refreshBalances();
    }
  }, [provider, account]);

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
      const network = NETWORKS.localhost;
      
      const tokenContract = new ethers.Contract(
        network.contracts.QUANTUM_TOKEN,
        QUANTUM_TOKEN_ABI,
        signer
      );

      setQuantumToken(tokenContract);

      // Check localStorage first, then contract if not found
      const savedKeyStatus = localStorage.getItem(`quantum_key_${account}`);
      if (savedKeyStatus === 'true') {
        setIsKeyRegistered(true);
      } else {
        try {
          const keyRegistered = await tokenContract.isPublicKeyRegistered(account);
          setIsKeyRegistered(keyRegistered);
          if (keyRegistered) {
            localStorage.setItem(`quantum_key_${account}`, 'true');
          }
        } catch (error) {
          setIsKeyRegistered(false);
        }
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
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
        toast.success('Wallet connected successfully!');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      }
    } else {
      toast.error('Please install MetaMask!');
    }
  };

  const refreshBalances = async () => {
    if (!provider || !account) return;

    try {
      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.utils.formatEther(ethBal));

      if (quantumToken) {
        try {
          const qtcBal = await quantumToken.balanceOf(account);
          setQtcBalance(ethers.utils.formatEther(qtcBal));
        } catch (error) {
          setQtcBalance('0');
        }
      }
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const handleSendETH = async (recipient: string, amount: string) => {
    if (!provider || !recipient || !amount) return;

    setIsLoading(true);
    setSendDialogOpen(false);
    
    try {
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount)
      });
      
      setIsLoading(false);
      setTxStatus({ success: true, hash: tx.hash, message: 'Transaction submitted! Waiting for confirmation...' });
      setTxStatusOpen(true);
      
      await tx.wait();
      
      const newTx: Transaction = {
        hash: tx.hash,
        type: 'sent',
        amount: amount,
        token: 'ETH',
        to: recipient,
        timestamp: Date.now()
      };
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('wallet_transactions', JSON.stringify(updatedTxs));
      
      setTxStatus({ success: true, hash: tx.hash, message: `Successfully sent ${amount} ETH!` });
      refreshBalances();
    } catch (error: any) {
      console.error('ETH transfer failed:', error);
      setIsLoading(false);
      setTxStatus({ success: false, message: `Transaction failed: ${error.message}` });
      setTxStatusOpen(true);
    }
  };

  const handleSendQTC = async (recipient: string, amount: string) => {
    if (!quantumToken || !recipient || !amount) return;

    setIsLoading(true);
    setSendDialogOpen(false);
    
    try {
      const tx = await quantumToken.transfer(recipient, ethers.utils.parseEther(amount));
      
      setIsLoading(false);
      setTxStatus({ success: true, hash: tx.hash, message: 'Quantum transaction submitted! Waiting for confirmation...' });
      setTxStatusOpen(true);
      
      await tx.wait();
      
      const newTx: Transaction = {
        hash: tx.hash,
        type: 'sent',
        amount: amount,
        token: 'QTC',
        to: recipient,
        timestamp: Date.now()
      };
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('wallet_transactions', JSON.stringify(updatedTxs));
      
      setTxStatus({ success: true, hash: tx.hash, message: `Successfully sent ${amount} QTC with quantum security!` });
      refreshBalances();
    } catch (error: any) {
      console.error('QTC transfer failed:', error);
      setIsLoading(false);
      setTxStatus({ success: false, message: `Quantum transaction failed: ${error.message}` });
      setTxStatusOpen(true);
    }
  };

  const generateQuantumKey = async () => {
    if (!quantumToken) return;

    setIsGeneratingKey(true);
    setKeyDialogOpen(false);
    
    try {
      const pubSeed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(account + Date.now()));
      const root = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(pubSeed + 'root'));
      
      const tx = await quantumToken.registerPublicKey(pubSeed, root, 32, 16, 4, 16);
      await tx.wait();
      
      setIsKeyRegistered(true);
      localStorage.setItem(`quantum_key_${account}`, 'true');
      toast.success('Quantum key generated successfully!');
    } catch (error) {
      console.error('Key registration failed:', error);
      toast.error('Failed to generate quantum key');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Address copied to clipboard!');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-space-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-deep-space rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-quantum-cyan rounded-full blur-3xl opacity-12 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-quantum-green rounded-full blur-3xl opacity-8 animate-pulse" style={{ animationDuration: '7s', animationDelay: '4s' }} />
        <div className="absolute top-1/6 right-1/3 w-56 h-56 bg-quantum-amber rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDuration: '5.5s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/6 left-1/2 w-68 h-68 bg-cyber-cyan rounded-full blur-3xl opacity-9 animate-pulse" style={{ animationDuration: '6.5s', animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            style={{
              backgroundColor: darkMode ? '#374151' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1e293b'
            }}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Atom className="h-12 w-12 text-cyber-cyan animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary" style={{ color: darkMode ? '#ffffff' : '#1e293b' }}>
              Quantum Secure Wallet
            </h1>
          </div>
          <p className="text-text-secondary text-lg flex items-center justify-center gap-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            {/* <ShieldCheck className="h-5 w-5 text-quantum-green" /> */}
            Quantum Secure WEB3 Wallet
          </p>
        </div>

        {!account ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-6">
              <div className="relative">
                <Wallet className="h-20 w-20 mx-auto text-cyber-cyan mb-4" />
                <Sparkles className="h-6 w-6 absolute top-0 right-1/3 text-quantum-amber animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2" style={{ color: darkMode ? '#ffffff' : '#1e293b' }}>
                  Connect Wallet
                </h2>
                <p className="text-text-secondary" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Connect your wallet to get started
                </p>
                <p className="text-sm text-text-secondary mt-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  Secure your assets with quantum-resistant technology
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleWalletConnect}
                className="w-full"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Wallet Header */}
            <WalletHeader
              account={account}
              network={currentNetwork}
              onCopy={copyAddress}
              onRefresh={refreshBalances}
            />

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BalanceCard balance={ethBalance} token="ETH" variant="primary" />
              <BalanceCard balance={qtcBalance} token="QTC" variant="secondary" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => { setSendType('ETH'); setSendDialogOpen(true); }}
                className="w-full"
                style={{ color: '#ffffff' }}
              >
                <Send className="h-5 w-5 mr-2" />
                <span style={{ color: '#ffffff' }}>Send ETH</span>
              </Button>
              <Button
                variant="accent"
                size="lg"
                onClick={() => { setSendType('QTC'); setSendDialogOpen(true); }}
                disabled={!quantumToken}
                className="w-full"
                style={{ color: '#ffffff' }}
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                <span style={{ color: '#ffffff' }}>Send QTC</span>
              </Button>
            </div>

            {/* Quantum Key Status */}
            {!isKeyRegistered && quantumToken && (
              <Alert variant="info">
                {/* <ShieldCheck className="h-4 w-4" /> */}
                <AlertDescription className="flex items-center justify-between">
                  <span>Quantum key provides enhanced security for QTC transactions</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setKeyDialogOpen(true)}
                    className="ml-4"
                    style={{ color: darkMode ? '#ffffff' : '#1e293b', borderColor: darkMode ? '#ffffff' : '#1e293b' }}
                  >
                    Generate Key
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-text-secondary py-8" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    No transactions yet
                  </p>
                ) : (
                  <div>
                    <div className="space-y-2">
                      {transactions.slice(currentPage * 3, (currentPage + 1) * 3).map((tx, index) => (
                        <TransactionItem
                          key={currentPage * 3 + index}
                          hash={tx.hash}
                          type={tx.type}
                          amount={tx.amount}
                          token={tx.token}
                          address={tx.to || tx.from || ''}
                          timestamp={tx.timestamp}
                          network={currentNetwork}
                        />
                      ))}
                    </div>
                    {transactions.length > 3 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: currentPage === 0 ? 'transparent' : (darkMode ? '#374151' : '#f3f4f6'),
                            color: currentPage === 0 ? (darkMode ? '#6b7280' : '#9ca3af') : (darkMode ? '#ffffff' : '#1e293b'),
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                          Page {currentPage + 1} of {Math.ceil(transactions.length / 3)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(transactions.length / 3) - 1, currentPage + 1))}
                          disabled={currentPage >= Math.ceil(transactions.length / 3) - 1}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: currentPage >= Math.ceil(transactions.length / 3) - 1 ? 'transparent' : (darkMode ? '#374151' : '#f3f4f6'),
                            color: currentPage >= Math.ceil(transactions.length / 3) - 1 ? (darkMode ? '#6b7280' : '#9ca3af') : (darkMode ? '#ffffff' : '#1e293b'),
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage >= Math.ceil(transactions.length / 3) - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialogs */}
        <SendDialog
          open={sendDialogOpen}
          onClose={() => setSendDialogOpen(false)}
          onSend={sendType === 'ETH' ? handleSendETH : handleSendQTC}
          token={sendType}
          maxBalance={sendType === 'ETH' ? ethBalance : qtcBalance}
        />

        <KeyDialog
          open={keyDialogOpen}
          onClose={() => setKeyDialogOpen(false)}
          onGenerate={generateQuantumKey}
        />

        {(isLoading || isGeneratingKey) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 style={{ color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '0.5rem' }}>
                {isGeneratingKey ? 'Generating Quantum Key' : 'Processing Transaction'}
              </h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                {isGeneratingKey ? 'Creating quantum-resistant cryptographic keys...' : 'Please wait while your transaction is being processed...'}
              </p>
            </div>
          </div>
        )}

        {txStatusOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '1rem' }}>
                {txStatus.success ? 'Transaction Successful' : '❌ Transaction Failed'}
              </h3>
              <p style={{ color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '1rem' }}>
                {txStatus.message}
              </p>
              {txStatus.hash && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.875rem' }}>
                    Transaction Hash:
                  </p>
                  <div style={{
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    color: darkMode ? '#ffffff' : '#1e293b',
                    fontSize: '0.875rem'
                  }}>
                    {txStatus.hash}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setTxStatusOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${darkMode ? '#ffffff' : '#1e293b'}`,
                    color: darkMode ? '#ffffff' : '#1e293b',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                {txStatus.hash && (
                  <button 
                    onClick={() => window.open(`https://etherscan.io/tx/${txStatus.hash}`, '_blank')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6366f1',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    View on Explorer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;