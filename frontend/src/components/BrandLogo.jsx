import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function BrandLogo({ className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`relative h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-600 shadow-md shadow-teal-500/30 flex items-center justify-center ring-2 ring-white/40 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <motion.path
          d="M4 21 H11 L14.5 12 L19.5 29 L24 16.5 L27 21 H36"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.35 }}
          animate={
            reduceMotion
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: [0, 1], opacity: [0.4, 1, 0.4] }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </svg>
    </div>
  );
}
