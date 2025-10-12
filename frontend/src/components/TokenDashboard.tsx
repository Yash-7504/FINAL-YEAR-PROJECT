// import React from 'react';
// import { 
//   Box, 
//   Typography, 
//   Chip,
//   Stack
// } from '@mui/material';
// import { ethers } from 'ethers';

// interface TokenDashboardProps {
//   balance: string;
//   account: string;
//   quantumToken: ethers.Contract | null;
//   onBalanceUpdate: () => void;
// }

// const TokenDashboard: React.FC<TokenDashboardProps> = ({ balance }) => {
//   const balanceNum = parseFloat(balance);

//   return (
//     <Stack spacing={3}>
//       {/* Balance Display */}
//       <Box 
//         sx={{ 
//           p: 3,
//           borderRadius: 3,
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           color: 'white',
//           textAlign: 'center'
//         }}
//       >
//         <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
//           Your Balance
//         </Typography>
//         <Typography variant="h3" fontWeight={700}>
//           {balanceNum.toFixed(2)}
//         </Typography>
//         <Typography variant="h6" sx={{ opacity: 0.9 }}>
//           QTC Tokens
//         </Typography>
//       </Box>

//       {/* Token Info */}
//       <Stack spacing={2}>
//         <Box display="flex" justifyContent="space-between">
//           <Typography color="text.secondary">Token Name</Typography>
//           <Typography fontWeight={500}>QuantumCoin</Typography>
//         </Box>
//         <Box display="flex" justifyContent="space-between">
//           <Typography color="text.secondary">Symbol</Typography>
//           <Typography fontWeight={500}>QTC</Typography>
//         </Box>
//         <Box display="flex" justifyContent="space-between">
//           <Typography color="text.secondary">Standard</Typography>
//           <Chip label="ERC-20" size="small" color="primary" />
//         </Box>
//         <Box display="flex" justifyContent="space-between">
//           <Typography color="text.secondary">Security</Typography>
//           <Chip label="Quantum-Resistant" size="small" color="secondary" />
//         </Box>
//       </Stack>
//     </Stack>
//   );
// };

// export default TokenDashboard;

import React from 'react';
import { 
  Box, 
  Typography, 
  Chip
} from '@mui/material';
import { ethers } from 'ethers';

interface TokenDashboardProps {
  balance: string;
  account: string;
  quantumToken: ethers.Contract | null;
  onBalanceUpdate: () => void;
}

const TokenDashboard: React.FC<TokenDashboardProps> = ({ balance }) => {
  const balanceNum = parseFloat(balance);

  return (
    <Box 
      sx={{ 
        p: 2,
        borderRadius: 2,
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 2,
        width: '100%',
        minHeight: '60px'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Your Balance:</Typography>
        <Typography variant="h5" fontWeight={700}>{balanceNum.toFixed(2)} QTC</Typography>
      </Box>
      
      <Typography variant="body1" fontWeight={600}>QuantumCoin</Typography>
      <Typography variant="body1" fontWeight={600}>QTC</Typography>
      
      <Chip 
        label="ERC-20" 
        size="small" 
        sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600 }} 
      />
      
      <Chip 
        label="Quantum-Resistant" 
        size="small" 
        sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600 }} 
      />
    </Box>
  );
};

export default TokenDashboard;