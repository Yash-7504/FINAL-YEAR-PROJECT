import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatBalance } from '@/utils/formatters';
import { TokenType } from '@/types/enums';

interface BalanceCardProps {
  balance: string;
  token: TokenType;
  variant?: 'primary' | 'secondary';
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, token, variant = 'primary' }) => {
  const isETH = token === 'ETH';
  
  return (
    <Card className={cn(
      "relative overflow-hidden p-6 transition-all hover:scale-105",
      isETH ? "gradient-primary" : "gradient-accent"
    )}>
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80 mb-2">{token}</p>
        <p className="text-4xl font-bold text-white mb-1">
          {formatBalance(balance, 4)}
        </p>
        <p className="text-xs text-white/60">{token === 'ETH' ? 'Ethereum' : 'Quantum Token'}</p>
      </div>
      
      {/* Decorative glow */}
      <div className={cn(
        "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-30",
        isETH ? "bg-steel-azure" : "bg-cyber-cyan"
      )} />
    </Card>
  );
};