import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ChatbotFab — Compact dynamic floating action button featuring medical_robot.mp4.
 */
export default function ChatbotFab({ onClick, isOpen }) {
  const reduceMotion = useReducedMotion();

  if (isOpen) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 p-1.5 pr-3 sm:pr-4 rounded-full bg-white/95 backdrop-blur-2xl border border-teal-200/90 shadow-xl shadow-teal-950/15 hover:shadow-teal-600/25 transition-all cursor-pointer group active:scale-95"
      title="Chat with MedAssist"
      aria-label="Open MedAssist Clinical Assistant"
    >
      {/* 3D Floating Medical Robot Video Avatar */}
      <div
        className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0"
        style={{ boxShadow: '0 4px 18px 0 rgba(20,184,166,0.38), 0 2px 6px 0 rgba(0,0,0,0.25)' }}
      >
        <video
          src="/assets/medical_robot.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-110 pointer-events-none select-none"
        >
          <source src="/assets/medical_robot.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Label - Compact on mobile, rich on desktop */}
      <div className="text-left flex flex-col leading-tight pr-0.5">
        <span className="font-display font-bold text-xs sm:text-sm text-foreground group-hover:text-teal-700 transition-colors tracking-tight">
          MedAssist
        </span>
        <span className="hidden xs:inline sm:inline text-[9px] sm:text-[10px] text-muted-foreground font-medium">
          Clinical Assistant
        </span>
      </div>
    </motion.button>
  );
}
