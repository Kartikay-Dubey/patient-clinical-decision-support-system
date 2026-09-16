import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Decorative atmosphere for the intake landing view.
 * Purely visual — no pointer events, no functional side effects.
 */
export default function LandingBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="landing-backdrop" aria-hidden="true">
      <div className="landing-grid" />
      <div className="landing-orb landing-orb--teal" />
      <div className="landing-orb landing-orb--sky" />
      <div className="landing-orb landing-orb--mint" />

      {!reduceMotion && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="landing-spark"
              style={{
                left: `${12 + i * 14}%`,
                top: `${18 + (i % 3) * 22}%`,
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [0.15, 0.55, 0.15],
              }}
              transition={{
                duration: 5 + i * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
