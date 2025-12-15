import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, Wallet, LogOut, Shield } from 'lucide-react';
import { formatAddress } from '@/utils/formatters';
import { NetworkName } from '@/types/enums';

interface WalletHeaderProps {
  account: string;
  network: NetworkName;
  onCopy: () => void;
  onRefresh: () => void;
  onDisconnect: () => void;
  isQuantumEncrypted?: boolean;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ 
  account, 
  network, 
  onCopy, 
  onRefresh,
  onDisconnect,
  isQuantumEncrypted = false
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              <Wallet className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-lg font-semibold text-text-primary">
              {formatAddress(account)}
            </p>
            <div className="flex gap-2 mt-1">
              
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            className="hover:bg-glass-surface"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="hover:bg-glass-surface"
            title="Refresh Wallet"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDisconnect}
            className="hover:bg-glass-surface text-red-500 hover:text-red-600"
            title="Disconnect Wallet"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};