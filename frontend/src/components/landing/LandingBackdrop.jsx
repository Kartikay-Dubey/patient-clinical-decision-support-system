import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Cellular & Molecular Drift — Bio-inspired ambient microscope visualization.
 * Features 3 visual layers:
 * 1. Deep Cytoplasm Orbs (soft bokeh depth)
 * 2. Biological Cells (distinct membranes, nuclei, and translucent cytoplasm)
 * 3. Micro-Molecules & Ions (diatomic linked nodes and drifting bio-particles)
 */

export default function LandingBackdrop() {
  const reduceMotion = useReducedMotion();

  // Cell structures (distinct membrane + nucleus)
  const cells = useMemo(() => [
    { id: 'c1', size: 140, x: 8, y: 15, duration: 24, delay: 0, driftX: 35, driftY: -25, border: 'border-teal-500/35', bg: 'from-teal-400/25 via-emerald-300/15 to-transparent', nucleusColor: 'bg-teal-600/50' },
    { id: 'c2', size: 90, x: 88, y: 22, duration: 28, delay: -4, driftX: -30, driftY: 30, border: 'border-cyan-500/40', bg: 'from-cyan-400/25 via-sky-300/15 to-transparent', nucleusColor: 'bg-cyan-600/50' },
    { id: 'c3', size: 170, x: 82, y: 70, duration: 32, delay: -8, driftX: -40, driftY: -35, border: 'border-teal-600/30', bg: 'from-teal-500/20 via-cyan-400/10 to-transparent', nucleusColor: 'bg-teal-700/40' },
    { id: 'c4', size: 110, x: 14, y: 78, duration: 26, delay: -12, driftX: 30, driftY: 25, border: 'border-emerald-500/35', bg: 'from-emerald-400/25 via-teal-300/15 to-transparent', nucleusColor: 'bg-emerald-600/50' },
    { id: 'c5', size: 75, x: 26, y: 42, duration: 22, delay: -3, driftX: 25, driftY: -20, border: 'border-teal-400/45', bg: 'from-teal-300/30 via-emerald-200/15 to-transparent', nucleusColor: 'bg-teal-500/60' },
    { id: 'c6', size: 85, x: 74, y: 40, duration: 25, delay: -9, driftX: -25, driftY: 20, border: 'border-sky-500/40', bg: 'from-sky-400/25 via-teal-300/15 to-transparent', nucleusColor: 'bg-sky-600/50' },
    { id: 'c7', size: 60, x: 48, y: 8, duration: 20, delay: -6, driftX: 20, driftY: 15, border: 'border-teal-500/40', bg: 'from-teal-400/30 via-cyan-300/15 to-transparent', nucleusColor: 'bg-teal-600/60' },
    { id: 'c8', size: 55, x: 52, y: 92, duration: 21, delay: -15, driftX: -20, driftY: -18, border: 'border-cyan-400/45', bg: 'from-cyan-300/30 via-teal-200/15 to-transparent', nucleusColor: 'bg-cyan-600/60' },
  ], []);

  // Molecular clusters (connected dual-atoms / chemical bonds)
  const molecules = useMemo(() => [
    { id: 'm1', x: 20, y: 28, rot: 35, duration: 18, delay: 0, length: 32 },
    { id: 'm2', x: 78, y: 18, rot: -45, duration: 22, delay: -5, length: 28 },
    { id: 'm3', x: 86, y: 55, rot: 75, duration: 20, delay: -9, length: 36 },
    { id: 'm4', x: 10, y: 62, rot: -20, duration: 24, delay: -13, length: 30 },
  ], []);

  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* 1. Deep Atmospheric Cytoplasm Glows (Microscope field illumination) */}
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-teal-400/15 via-emerald-300/10 to-transparent blur-3xl opacity-80 animate-pulse-slow" />
      <div className="absolute top-1/3 -right-28 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-sky-400/15 via-cyan-300/10 to-transparent blur-3xl opacity-75 animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-28 left-1/4 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-teal-300/15 via-cyan-200/10 to-transparent blur-3xl opacity-70 animate-pulse-slow" style={{ animationDelay: '6s' }} />

      {/* 2. Living Cellular Structures */}
      {cells.map((c) => (
        <div
          key={c.id}
          className={`absolute rounded-full border ${c.border} bg-radial ${c.bg} shadow-sm backdrop-blur-[1px] transition-transform ${
            reduceMotion ? '' : 'cell-drift-anim'
          }`}
          style={{
            width: `${c.size}px`,
            height: `${c.size}px`,
            left: `${c.x}%`,
            top: `${c.y}%`,
            '--drift-x': `${c.driftX}px`,
            '--drift-y': `${c.driftY}px`,
            '--duration': `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            boxShadow: '0 4px 20px -2px rgba(13, 148, 136, 0.12), inset 0 0 14px rgba(45, 212, 191, 0.15)',
          }}
        >
          {/* Inner cell membrane / concentric organelle layer */}
          <div className="absolute inset-2.5 rounded-full border border-teal-400/20 border-dashed" />

          {/* Cell nucleus */}
          <div
            className={`absolute top-1/3 left-1/3 w-3 h-3 rounded-full ${c.nucleusColor} shadow-xs ring-2 ring-white/50`}
          />

          {/* Micro-organelle / Mitochondria dot */}
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-teal-400/60" />
        </div>
      ))}

      {/* 3. Micro-Molecular Bond Structures (Diatomic ions) */}
      {!reduceMotion && molecules.map((m) => (
        <div
          key={m.id}
          className="absolute molecular-drift-anim"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            transform: `rotate(${m.rot}deg)`,
            '--duration': `${m.duration}s`,
            animationDelay: `${m.delay}s`,
          }}
        >
          {/* Covalent bond line */}
          <div
            className="relative flex items-center"
            style={{ width: `${m.length}px` }}
          >
            {/* Atom A */}
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500/60 border border-teal-300/80 shadow-xs flex-shrink-0" />
            {/* Bond */}
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-teal-400/50 to-cyan-400/50" />
            {/* Atom B */}
            <div className="w-2 h-2 rounded-full bg-cyan-500/60 border border-cyan-300/80 shadow-xs flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
