import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Netflix-style sophisticated keyframes
const netflixZoom = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const lineExpand = keyframes`
  0% {
    width: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
`;

const textReveal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3),
                0 0 40px rgba(0, 212, 255, 0.2),
                0 0 60px rgba(0, 212, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.5),
                0 0 60px rgba(0, 212, 255, 0.3),
                0 0 90px rgba(0, 212, 255, 0.2);
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const blastExpand = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
`;

const starTwinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
`;

interface NetflixOpeningProps {
  onComplete?: () => void;
  duration?: number;
}

const NetflixOpening: React.FC<NetflixOpeningProps> = ({ 
  onComplete, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 600);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        animation: `${fadeOut} 0.6s ease ${duration - 600}ms forwards`,
      }}
    >
      {/* Animated expanding lines - Netflix style */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${40 + i * 5}%`,
              left: '50%',
              transform: 'translateX(-50%)',
              height: '3px',
              background: `linear-gradient(90deg, transparent, ${
                i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#b347d9' : '#39ff14'
              }, transparent)`,
              animation: `${lineExpand} 1.5s ease ${i * 0.15}s forwards`,
              boxShadow: `0 0 10px ${
                i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#b347d9' : '#39ff14'
              }`,
            }}
          />
        ))}
      </Box>

      {/* Space background with stars */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Twinkling stars */}
        {[...Array(50)].map((_, i) => (
          <Box
            key={`star-${i}`}
            sx={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              borderRadius: '50%',
              background: '#ffffff',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `${starTwinkle} ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Space blasts/explosions */}
        {[
          { top: '20%', left: '15%', delay: 0.5, color: '#00d4ff', size: 300 },
          { top: '70%', left: '80%', delay: 1.2, color: '#b347d9', size: 250 },
          { top: '40%', left: '70%', delay: 1.8, color: '#39ff14', size: 200 },
          { top: '60%', left: '25%', delay: 2.3, color: '#ff6b6b', size: 280 },
          { top: '85%', left: '50%', delay: 2.8, color: '#00d4ff', size: 220 },
        ].map((blast, i) => (
          <Box
            key={`blast-${i}`}
            sx={{
              position: 'absolute',
              top: blast.top,
              left: blast.left,
              width: `${blast.size}px`,
              height: `${blast.size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${blast.color}40 0%, ${blast.color}20 30%, transparent 70%)`,
              animation: `${blastExpand} 2s ease-out ${blast.delay}s forwards`,
              filter: 'blur(20px)',
              boxShadow: `0 0 60px ${blast.color}`,
            }}
          />
        ))}
      </Box>

      {/* Glowing center orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
          animation: `${pulseGlow} 2s ease-in-out infinite`,
          filter: 'blur(30px)',
        }}
      />

      {/* Main Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          animation: `${netflixZoom} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        }}
      >
        {/* QUANTUM */}
        <Typography
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontSize: { xs: '3.5rem', sm: '5rem', md: '6.5rem', lg: '8rem' },
            fontWeight: 900,
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #00d4ff 0%, #4de3ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 80px rgba(0, 212, 255, 0.5)',
            marginBottom: 2,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '110%',
              height: '110%',
              background: 'radial-gradient(ellipse, rgba(0, 212, 255, 0.2) 0%, transparent 60%)',
              filter: 'blur(40px)',
              zIndex: -1,
            },
          }}
        >
          QUANTUM
        </Typography>

        {/* Elegant divider */}
        <Box
          sx={{
            width: '0',
            maxWidth: '600px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #00d4ff, #b347d9, #39ff14, transparent)',
            margin: '0 auto 32px',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)',
            animation: `${keyframes`
              0% { width: 0; opacity: 0; }
              50% { opacity: 1; }
              100% { width: 80%; opacity: 1; }
            `} 1s ease 1s forwards`,
          }}
        />

        {/* RESISTANT */}
        <Typography
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontSize: { xs: '1.8rem', sm: '2.6rem', md: '3.6rem', lg: '4.4rem' },
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: '#ffffff',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
            marginBottom: 2,
            opacity: 0,
            animation: `${textReveal} 0.8s ease 1.2s forwards`,
          }}
        >
          RESISTANT
        </Typography>

        {/* SMART CONTRACTS */}
        <Typography
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' },
            fontWeight: 500,
            letterSpacing: '0.2em',
            background: 'linear-gradient(135deg, #39ff14 0%, #7fff00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(57, 255, 20, 0.3)',
            opacity: 0,
            animation: `${textReveal} 0.8s ease 1.5s forwards`,
          }}
        >
          SMART CONTRACTS
        </Typography>

        {/* Powered by badge */}
        <Box
          sx={{
            marginTop: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            padding: '10px 24px',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '30px',
            backdropFilter: 'blur(10px)',
            opacity: 0,
            animation: `${textReveal} 0.8s ease 1.8s forwards`,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Exo 2", sans-serif',
              fontSize: { xs: '0.7rem', sm: '0.85rem' },
              fontWeight: 600,
              color: '#808080',
              letterSpacing: '0.1em',
            }}
          >
            POWERED BY
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              fontWeight: 700,
              background: 'linear-gradient(90deg, #00d4ff, #b347d9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.05em',
            }}
          >
            SPHINCS+
          </Typography>
        </Box>
      </Box>

    </Box>
  );
};

export default NetflixOpening;