import { TokenType, TransactionType, NetworkName } from './enums';

// Props types (data passed to components)
export interface WalletHeaderProps {
  account: string;
  network: NetworkName;
  onCopy: () => void;
  onRefresh: () => void;
}

export interface BalanceCardProps {
  balance: string;
  token: TokenType;
  variant?: 'primary' | 'secondary';
}

export interface TransactionItemProps {
  hash: string;
  type: TransactionType;
  amount: string;
  token: TokenType;
  address: string;
  timestamp: number;
}

export interface SendDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (recipient: string, amount: string) => void;
  token: TokenType;
  maxBalance: string;
}

export interface KeyDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

// Store types (global state data)
export interface WalletState {
  account: string;
  provider: any | null;
  network: NetworkName;
  ethBalance: string;
  qtcBalance: string;
  isKeyRegistered: boolean;
  transactions: Transaction[];
}

// Query types (API response data)
export interface Transaction {
  hash: string;
  type: TransactionType;
  amount: string;
  token: TokenType;
  to?: string;
  from?: string;
  timestamp: number;
}

export interface ContractData {
  balance: string;
  isKeyRegistered: boolean;
  nonce: number;
}