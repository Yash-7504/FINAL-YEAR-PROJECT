import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${color}20`,
          '&::before': {
            opacity: 1,
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color,
          opacity: 0.6,
          transition: 'opacity 0.3s ease',
        }
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Box 
          sx={{ 
            color: color, 
            mb: 2,
            '& > svg': {
              fontSize: '3rem'
            }
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
