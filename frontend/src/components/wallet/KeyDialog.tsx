import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';

interface KeyDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export const KeyDialog: React.FC<KeyDialogProps> = ({
  open,
  onClose,
  onGenerate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyber-cyan" />
            Generate Quantum Key
          </DialogTitle>
          <DialogDescription>
            Create a quantum-resistant key pair for enhanced security
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-sm text-text-secondary">
            Generate a quantum-resistant key pair for secure QTC transactions using SPHINCS+ cryptography.
          </p>
          
          <Alert variant="info">
            <AlertDescription>
              This will register your quantum-resistant public key on the blockchain, 
              enabling post-quantum cryptographic protection for your transactions.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onGenerate}>
            Generate Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};