import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Import, ExternalLink } from 'lucide-react';
import { formatAddress, formatTime } from '@/utils/formatters';
import { TransactionType, TokenType, NetworkName } from '@/types/enums';

interface TransactionItemProps {
  hash: string;
  type: TransactionType;
  amount: string;
  token: TokenType;
  address: string;
  timestamp: number;
  network: NetworkName;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  hash,
  type,
  amount,
  token,
  address,
  timestamp,
  network,
}) => {
  const isSent = type === 'sent';
  
  const getExplorerUrl = () => {
    const urls = {
      'Ethereum': `https://etherscan.io/tx/${hash}`,
      'Sepolia': `https://sepolia.etherscan.io/tx/${hash}`,
      'Polygon': `https://polygonscan.com/tx/${hash}`,
      'Mumbai': `https://mumbai.polygonscan.com/tx/${hash}`,
      'Localhost': `https://etherscan.io/tx/${hash}`,
      'Unknown': `https://etherscan.io/tx/${hash}`
    };
    return urls[network] || urls['Ethereum'];
  };
  
  const openExplorer = () => {
    window.open(getExplorerUrl(), '_blank');
  };
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-opacity-5 hover:bg-white" 
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Avatar className={isSent ? 'bg-quantum-red/20' : 'bg-quantum-green/20'}>
        <AvatarFallback>
          {isSent ? (
            <Send className="h-4 w-4 text-quantum-red" />
          ) : (
            <Import className="h-4 w-4 text-quantum-green" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-text-primary">
            {isSent ? 'Sent' : 'Received'} {amount} {token}
          </p>
          <Badge 
            variant={token === 'QTC' ? 'secondary' : 'default'} 
            className="text-xs"
            style={{
              backgroundColor: token === 'ETH' ? '#3b82f6' : undefined,
              color: token === 'ETH' ? '#ffffff' : undefined
            }}
          >
            {token}
          </Badge>
        </div>
        <p className="text-xs text-text-secondary">
          {isSent ? 'To: ' : 'From: '}
          {formatAddress(address)} • {formatTime(timestamp)}
        </p>
      </div>
      
      <button
        onClick={openExplorer}
        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        title={`View on ${network === 'Sepolia' ? 'Sepolia Etherscan' : network === 'Polygon' ? 'Polygonscan' : network === 'Mumbai' ? 'Mumbai Polygonscan' : 'Etherscan'}`}
      >
        <ExternalLink className="h-4 w-4 text-gray-500 hover:text-blue-500" />
      </button>
    </div>
  );
};