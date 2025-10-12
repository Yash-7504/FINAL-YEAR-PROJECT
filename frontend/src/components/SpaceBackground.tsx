import React, { useEffect } from 'react';
import { Box } from '@mui/material';

const SpaceBackground: React.FC = () => {
  useEffect(() => {
    // Create stars
    const createStars = () => {
      const starsContainer = document.querySelector('.stars');
      if (!starsContainer) return;

      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
      }
    };

    // Create quantum particles
    const createParticles = () => {
      const particlesContainer = document.querySelector('.quantum-particles');
      if (!particlesContainer) return;

      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        particlesContainer.appendChild(particle);
      }
    };

    createStars();
    createParticles();

    return () => {
      const starsContainer = document.querySelector('.stars');
      const particlesContainer = document.querySelector('.quantum-particles');
      if (starsContainer) starsContainer.innerHTML = '';
      if (particlesContainer) particlesContainer.innerHTML = '';
    };
  }, []);

  return (
    <>
      <Box className="stars" />
      <Box className="quantum-particles" />
    </>
  );
};

export default SpaceBackground;