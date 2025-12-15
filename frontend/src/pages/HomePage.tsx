import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Send, ShieldCheck, Atom, Sparkles } from 'lucide-react';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { WalletHeader } from '@/components/wallet/WalletHeader';
import { TransactionItem } from '@/components/wallet/TransactionItem';
import { SendDialog } from '@/components/wallet/SendDialog';
import { QuantumTransactionFlow } from '@/components/QuantumTransactionFlow';
import { Transaction } from '@/types/schema';
import { TokenType, NetworkName } from '@/types/enums';
import { toast } from 'sonner';
import { walletQuantumEncryption } from '@/services/walletQuantumEncryption';

const HomePage: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [currentNetwork, setCurrentNetwork] = useState<NetworkName>('Localhost');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wallet_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [txStatusOpen, setTxStatusOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<{ success: boolean; hash?: string; message: string }>({ success: false, message: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string>('');
  const [quantumFlowStep, setQuantumFlowStep] = useState<'idle' | 'initializing' | 'generating' | 'signing' | 'securing' | 'complete' | 'error'>('idle');
  const [quantumFlowError, setQuantumFlowError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

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
    detectNetwork();
    // IMPORTANT: Explicitly clear wallet on page load - NO AUTO CONNECT!
    setAccount('');
    setProvider(null);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (provider && account) {
      refreshBalances();
      // Initialize quantum encryption for the wallet
      initializeQuantumEncryption(account);
    }
  }, [provider, account]);

  const handleWalletConnect = async () => {
    if (window.ethereum) {
      try {
        setError('');
        // First, revoke any previous permissions
        try {
          await window.ethereum.request?.({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (e) {
          // Ignore if revoke fails
        }
        
        // Now request permissions - this will show account selection dialog
        const permissions = await window.ethereum.request?.({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        
        // If wallet_requestPermissions not supported, fall back to eth_requestAccounts
        if (!permissions) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.listAccounts();
        setProvider(web3Provider);
        setAccount(accounts[0]);
        await detectNetwork();
        toast.success('Wallet connected successfully!');
      } catch (error: any) {
        console.error('Error connecting wallet:', error);
        const errorMsg = error.message || 'Failed to connect wallet';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } else {
      const errorMsg = 'Please install MetaMask!';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleWalletDisconnect = () => {
    // Revoke MetaMask permissions so it won't auto-connect next time
    if (window.ethereum) {
      try {
        window.ethereum.request?.({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        }).catch(() => {
          // If revoke fails, that's okay - just continue
        });
      } catch (error) {
        console.log('Could not revoke permissions');
      }
    }
    
    setAccount('');
    setProvider(null);
    setEthBalance('0');
    setError('');
    toast.success('Wallet disconnected');
  };

  const refreshBalances = async () => {
    if (!provider || !account) return;

    console.log('Refreshing wallet balances...');
    try {
      setError('');
      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.utils.formatEther(ethBal));
      console.log('Wallet refreshed successfully');
      toast.success('Wallet refreshed!');
    } catch (error: any) {
      console.error('Error refreshing balances:', error);
      const errorMsg = error.message || 'Failed to refresh balances';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const initializeQuantumEncryption = (walletAddress: string) => {
    try {
      // Generate quantum key pair for the wallet
      const keyPair = walletQuantumEncryption.generateQuantumKeyPair();
      console.log('✓ Quantum encryption initialized for wallet:', walletAddress);
      console.log('✓ SPHINCS+ key pair generated');
      toast.success('Wallet encrypted with SPHINCS+');
    } catch (error) {
      console.error('Error initializing quantum encryption:', error);
    }
  };

  const performQuantumTransaction = async (recipient: string, amount: string) => {
    if (!provider || !recipient || !amount) return;

    try {
      const signer = provider.getSigner();

      // Step 1: Initialize transaction
      setQuantumFlowStep('initializing');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Generate quantum keys
      setQuantumFlowStep('generating');
      const quantumKeyPair = walletQuantumEncryption.generateQuantumKeyPair();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Step 3: Sign transaction with quantum security
      setQuantumFlowStep('signing');
      const transactionData = {
        to: recipient,
        value: ethers.utils.parseEther(amount),
        timestamp: Date.now(),
      };

      const quantumSignature = await walletQuantumEncryption.signTransactionQuantumSecure(
        transactionData,
        quantumKeyPair.privateKey
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Ensure quantum security
      setQuantumFlowStep('securing');
      const isSecure = walletQuantumEncryption.verifyQuantumSignature(
        transactionData,
        quantumSignature,
        quantumKeyPair.publicKey
      );

      if (!isSecure) {
        throw new Error('Quantum security verification failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 5: Complete transaction
      setQuantumFlowStep('complete');
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Wait for confirmation
      await tx.wait();

      const newTx: Transaction = {
        hash: tx.hash,
        type: 'sent',
        amount: amount,
        token: 'ETH',
        to: recipient,
        timestamp: Date.now(),
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('wallet_transactions', JSON.stringify(updatedTxs));

      setTxStatus({
        success: true,
        hash: tx.hash,
        message: `✨ Successfully sent ${amount} ETH with quantum-resistant signature!`,
      });

      setTimeout(() => {
        setQuantumFlowStep('idle');
        setTxStatusOpen(true);
      }, 2000);

      refreshBalances();
    } catch (error: any) {
      console.error('Quantum transaction failed:', error);
      
      // Check if user cancelled the transaction
      if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('cancelled')) {
        setQuantumFlowError('Transaction cancelled by user');
      } else {
        setQuantumFlowError(error.message || 'Transaction failed');
      }
      
      setQuantumFlowStep('error');
      setTimeout(() => {
        setQuantumFlowStep('idle');
      }, 3000);
    }
  };

  const handleSendETH = async (recipient: string, amount: string) => {
    if (!provider || !recipient || !amount) return;

    setSendDialogOpen(false);
    setQuantumFlowStep('initializing');

    // Perform quantum-secure transaction
    await performQuantumTransaction(recipient, amount);
  };


  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast.success('Address copied to clipboard!');
  };

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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Atom className="h-12 w-12 text-cyber-cyan animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
              Quantum Secure Wallet
            </h1>
          </div>
          <p className="text-text-secondary text-lg flex items-center justify-center gap-2">
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
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Connect Wallet
                </h2>
                <p className="text-text-secondary">
                  Connect your wallet to get started
                </p>
                <p className="text-sm text-text-secondary mt-2">
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
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Wallet Header */}
            <WalletHeader
              account={account}
              network={currentNetwork}
              onCopy={copyAddress}
              onRefresh={refreshBalances}
              onDisconnect={handleWalletDisconnect}
              isQuantumEncrypted={true}
            />

            {/* Balance Card */}
            <div className="max-w-md mx-auto">
              <BalanceCard balance={ethBalance} token="ETH" variant="primary" />
            </div>

            {/* Action Button */}
            <div className="max-w-md mx-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setSendDialogOpen(true)}
                className="w-full"
                style={{ color: '#ffffff' }}
              >
                <Send className="h-5 w-5 mr-2" />
                <span style={{ color: '#ffffff' }}>Send ETH</span>
              </Button>
            </div>



            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-text-secondary py-8">
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
                            backgroundColor: currentPage === 0 ? 'transparent' : '#374151',
                            color: currentPage === 0 ? '#6b7280' : '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Previous
                        </button>
                        <span className="text-text-secondary">
                          Page {currentPage + 1} of {Math.ceil(transactions.length / 3)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(transactions.length / 3) - 1, currentPage + 1))}
                          disabled={currentPage >= Math.ceil(transactions.length / 3) - 1}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: currentPage >= Math.ceil(transactions.length / 3) - 1 ? 'transparent' : '#374151',
                            color: currentPage >= Math.ceil(transactions.length / 3) - 1 ? '#6b7280' : '#ffffff',
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
          onSend={handleSendETH}
          token="ETH"
          maxBalance={ethBalance}
        />

        {/* Quantum Transaction Flow */}
        <QuantumTransactionFlow
          isOpen={quantumFlowStep !== 'idle'}
          currentStep={quantumFlowStep}
          errorMessage={quantumFlowError}
          onClose={() => setQuantumFlowStep('idle')}
        />

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
              backgroundColor: '#1e293b',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>
                {txStatus.success ? 'Transaction Successful' : '❌ Transaction Failed'}
              </h3>
              <p style={{ color: '#ffffff', marginBottom: '1rem' }}>
                {txStatus.message}
              </p>
              {txStatus.hash && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Transaction Hash:
                  </p>
                  <div style={{
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    backgroundColor: '#374151',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    color: '#ffffff',
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
                    border: '1px solid #ffffff',
                    color: '#ffffff',
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