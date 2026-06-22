import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Use springs for a smooth trailing effect for the outer ring
  const springX = useSpring(0, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 150, damping: 20, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 16); // 16 is half of the 32px ring width
      springY.set(e.clientY - 16); // 16 is half of the 32px ring height
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  return (
    <>
      {/* Global style to hide the default cursor everywhere */}
      <style>{`
        * { cursor: none !important; }
      `}</style>
      
      {/* The trailing hollow ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--color-primary)',
          pointerEvents: 'none',
          zIndex: 9999,
          x: springX,
          y: springY,
        }}
      />
      {/* The precise inner dot */}
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
