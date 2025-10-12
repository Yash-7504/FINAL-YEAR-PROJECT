import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Tabs, Tab } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import QuantumIDE from './pages/QuantumIDE';
import SpaceBackground from './components/SpaceBackground';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#4de3ff',
      dark: '#0099cc',
    },
    secondary: {
      main: '#b347d9',
      light: '#d575f0',
      dark: '#8a2eb8',
    },
    success: {
      main: '#39ff14',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(26, 26, 46, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Exo 2", "Orbitron", sans-serif',
    h1: {
      fontFamily: '"Orbitron", monospace',
      fontSize: '3.5rem',
      fontWeight: 900,
      letterSpacing: '0.1em',
    },
    h2: {
      fontFamily: '"Orbitron", monospace',
      fontSize: '2rem',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Orbitron", monospace',
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          borderRadius: 25,
          padding: '12px 30px',
          fontSize: '0.9rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 26, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 26, 46, 0.9)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <SpaceBackground />
        
        {/* Navigation Tabs */}
        <Box sx={{ position: 'fixed', top: 10, right: 20, zIndex: 1000 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#00d4ff',
                fontWeight: 600,
                fontSize: '0.8rem'
              }
            }}
          >
            <Tab label="WALLET" />
            <Tab label="QUANTUM IDE" />
          </Tabs>
        </Box>

        {/* Page Content */}
        {currentTab === 0 && <HomePage />}
        {currentTab === 1 && <QuantumIDE />}
      </div>
    </ThemeProvider>
  );
}

export default App;