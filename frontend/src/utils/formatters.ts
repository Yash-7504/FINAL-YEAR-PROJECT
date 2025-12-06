import { TokenType, NetworkName } from '../types/enums';

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0.0000';
  return num.toFixed(decimals);
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
};

export const formatTokenSymbol = (token: TokenType): string => {
  return token;
};

export const formatNetworkName = (network: NetworkName): string => {
  return network;
};