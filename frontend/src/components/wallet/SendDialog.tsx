import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TokenType } from '@/types/enums';

interface SendDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (recipient: string, amount: string) => void;
  token: TokenType;
  maxBalance: string;
}

export const SendDialog: React.FC<SendDialogProps> = ({
  open,
  onClose,
  onSend,
  token,
  maxBalance,
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = () => {
    onSend(recipient, amount);
    setRecipient('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {token}</DialogTitle>
          <DialogDescription>
            Transfer {token} tokens to another address
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({token})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-text-secondary">
              Available: {parseFloat(maxBalance).toFixed(4)} {token}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!recipient || !amount}
          >
            Send {token}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};