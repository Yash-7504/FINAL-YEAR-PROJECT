import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" className="space-title" sx={{ mb: 1 }}>
            QUANTUM IDE
          </Typography>
          <Typography variant="body1" className="neon-green">
            Wallet UI removed — focus on the Quantum IDE for SPHINCS+ contract signing and deployment.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Setup:</Typography>
          <ul>
            <li>Start the API server: <code>node scripts/quantum-server.js</code></li>
            <li>Deploy KeyRegistry: <code>node scripts/deploy-keyregistry.js</code></li>
            <li>Use the Quantum IDE tab to compile, sign, and deploy contracts</li>
          </ul>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;