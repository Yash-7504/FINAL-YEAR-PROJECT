import React from 'react';
import { Box, Typography } from '@mui/material';
import { Rocket as RocketIcon } from '@mui/icons-material';

interface RocketAnimationProps {
  isVisible: boolean;
  isFlying: boolean;
  message?: string;
}

const RocketAnimation: React.FC<RocketAnimationProps> = ({ 
  isVisible, 
  isFlying, 
  message = "Transaction Processing..." 
}) => {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        animation: isFlying ? 'rocketFlyAway 2s ease-out forwards' : 'rocketPulse 2s infinite',
        '@keyframes rocketPulse': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)' }
        },
        '@keyframes rocketFlyAway': {
          '0%': { 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 1
          },
          '100%': { 
            transform: 'translate(-50%, -300vh) scale(0.2)',
            opacity: 0
          }
        }
      }}
    >
      <RocketIcon 
        className="neon-blue"
        sx={{ 
          fontSize: 60,
          filter: 'drop-shadow(0 0 10px #00d4ff)',
          transform: 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }} 
      />
      {!isFlying && (
        <Typography 
          variant="body1" 
          className="neon-blue" 
          sx={{ 
            fontWeight: 600,
            textAlign: 'center',
            animation: 'fadeInOut 2s infinite',
            '@keyframes fadeInOut': {
              '0%, 100%': { opacity: 0.7 },
              '50%': { opacity: 1 }
            }
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default RocketAnimation;