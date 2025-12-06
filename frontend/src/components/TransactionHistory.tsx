import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box
} from '@mui/material';
import { Send, CallReceived } from '@mui/icons-material';

interface Transaction {
  hash: string;
  type: 'sent' | 'received';
  amount: string;
  token: 'ETH' | 'QTC';
  to?: string;
  from?: string;
  timestamp: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No transactions yet
          </Typography>
        ) : (
          <List>
            {transactions.map((tx, index) => (
              <ListItem key={index} divider={index < transactions.length - 1}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: tx.type === 'sent' ? 'error.main' : 'success.main',
                    width: 32,
                    height: 32
                  }}>
                    {tx.type === 'sent' ? <Send fontSize="small" /> : <CallReceived fontSize="small" />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                      </Typography>
                      <Chip 
                        label={tx.token} 
                        size="small" 
                        color={tx.token === 'QTC' ? 'secondary' : 'primary'}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {tx.type === 'sent' ? `To: ${formatAddress(tx.to!)}` : `From: ${formatAddress(tx.from!)}`}
                      {' • '}
                      {formatTime(tx.timestamp)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;