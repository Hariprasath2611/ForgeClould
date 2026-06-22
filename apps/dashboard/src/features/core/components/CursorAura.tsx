import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CursorAura: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Use springs for a smooth trailing effect
  const springX = useSpring(0, { stiffness: 100, damping: 25, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 100, damping: 25, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 200); // 200 is half of the aura width
      springY.set(e.clientY - 200); // 200 is half of the aura height
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  return (
    <>
      {/* The trailing glowing aura */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 9999,
          x: springX,
          y: springY,
          mixBlendMode: 'screen',
        }}
      />
      {/* The precise cursor dot */}
      <motion.div
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          boxShadow: '0 0 10px var(--color-primary)',
        }}
      />
    </>
  );
};
