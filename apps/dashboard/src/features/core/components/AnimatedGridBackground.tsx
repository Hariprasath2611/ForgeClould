import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'var(--color-background)'
    }}>
      {/* Animated 3D Grid */}
      <div className="forge-animated-grid" />
      
      {/* Floating Orbs for extra WOW background effects */}
      <motion.div
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--color-primary-glow)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen'
        }}
      />

      <motion.div
        animate={{
          y: [0, 80, 0],
          x: [0, -40, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.5, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(52, 211, 153, 0.1)', // Accent color glow
          filter: 'blur(100px)',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Vignette Overlay for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, var(--color-background) 100%)',
      }} />
      
      <style>{`
        .forge-animated-grid {
          position: absolute;
          width: 200vw;
          height: 200vh;
          top: -50vh;
          left: -50vw;
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(50px) translateZ(-200px); }
        }
      `}</style>
    </div>
  );
};
