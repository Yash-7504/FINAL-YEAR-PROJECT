import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface StatsCardProps {
  label: string;
  value: string;
  trend: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, trend }) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0, 255, 136, 0.1)',
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h3" color="primary" fontWeight={800} mb={1}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {label}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
          <TrendingUp color="success" fontSize="small" />
          <Typography variant="caption" color="success.main" fontWeight={600}>
            {trend}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
