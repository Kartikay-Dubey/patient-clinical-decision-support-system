import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Focus, Crosshair, X, ChevronRight } from 'lucide-react';

/**
 * Holographic 3D-anchored Anatomical HUD Callout & Dynamic Pointer Arrow.
 * 
 * Renders a pulsing beacon on the 3D coordinate, a connecting curved leader line,
 * and a translucent glassmorphic clinical focus card docked in the top-left area
 * so it never obscures the central 3D anatomical model.
 */
export default function AnatomyHUDCallout({
  target2D, // { x: number, y: number, visible: boolean }
  region,
  bodyLocalization,
  conditionName,
  icd10Code,
  modelScore,
  onFocusRegion,
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  // If region is All/Full Body or target is not visible, hide callout
  if (!target2D || !target2D.visible || region === 'All' || region === 'Full Body') {
    return null;
  }

  const { x, y } = target2D;

  const targetOrgan = bodyLocalization?.targetOrgan || (region === 'Thorax' ? 'Heart & Coronary Vessels' : `${region} Structures`);
  const bodySystem = bodyLocalization?.bodySystem || 'Cardiovascular';

  // Card is docked gracefully on the upper-left of the 3D canvas so it NEVER obstructs the central body
  const cardLeft = 14;
  const cardTop = 14;
  const cardWidth = 230;

  // SVG Leader line anchor from bottom-right of the docked card to Target 2D Point
  const cardAnchorX = cardLeft + cardWidth - 12;
  const cardAnchorY = cardTop + 46;

  // Compute curved smooth leader line
  const midX = (cardAnchorX + x) / 2;
  const pathD = `M ${cardAnchorX} ${cardAnchorY} Q ${midX} ${cardAnchorY} ${x} ${y}`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* ── 1. SVG Dynamic Leader Line & Pointer Arrow ──────────────────────── */}
      <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
        <defs>
          <linearGradient id="hudLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.95" />
          </linearGradient>
          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker
            id="hudArrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <polygon points="0 1, 8 4, 0 7, 2 4" fill="#0D9488" />
          </marker>
        </defs>

        {!isMinimized && (
          <>
            {/* Background Soft Glow Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0D9488"
              strokeWidth="3.5"
              strokeOpacity="0.25"
              filter="url(#hudGlow)"
            />
            {/* Main Crisp Leader Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#hudLineGrad)"
              strokeWidth="1.75"
              strokeDasharray="4 2"
              markerEnd="url(#hudArrowhead)"
            />
          </>
        )}
      </svg>

      {/* ── 2. Pulsing 3D Anatomical Beacon Reticle (Pinned to exact 3D Coord) ─ */}
      <div
        className="absolute transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto cursor-pointer group"
        style={{ left: `${x}px`, top: `${y}px` }}
        onClick={onFocusRegion}
        title={`Focus on ${targetOrgan}`}
      >
        {/* Outer Radar Ripple */}
        <span className="absolute h-10 w-10 rounded-full bg-teal-500/20 animate-ping duration-1000" />
        
        {/* Secondary Focus Ring */}
        <span className="absolute h-6 w-6 rounded-full border border-teal-500/60 animate-pulse" />
        
        {/* Central Glowing Reticle Core */}
        <div className="h-3.5 w-3.5 rounded-full bg-teal-600 shadow-[0_0_14px_rgba(13,148,136,0.95)] flex items-center justify-center border-2 border-white group-hover:scale-125 transition-transform">
          <div className="h-1 w-1 rounded-full bg-white" />
        </div>
      </div>

      {/* ── 3. Translucent Glassmorphic Clinical HUD Card (Corner-Docked) ── */}
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, x: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-auto"
            style={{ left: `${cardLeft}px`, top: `${cardTop}px`, width: `${cardWidth}px` }}
          >
            {/* Frosted Glass Container with high translucency so body behind is visible */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-lg shadow-teal-950/5 p-2.5 flex flex-col gap-1.5 overflow-hidden relative hover:bg-white/85 transition-colors">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-400" />

              {/* Header Badge & Action Icons */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[9.5px] font-bold tracking-wider font-display uppercase border border-teal-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Primary Focus
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onFocusRegion}
                    className="p-1 rounded-lg hover:bg-teal-500/15 text-muted-foreground hover:text-teal-700 transition-colors cursor-pointer"
                    title="Zoom camera to focus area"
                  >
                    <Focus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="Minimize HUD"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Region & Target Organ Title */}
              <div className="flex flex-col gap-0.5">
                <h4 className="text-[11.5px] font-bold text-foreground font-display flex items-center gap-1.5 truncate">
                  <Activity className="h-3 w-3 text-teal-600 flex-shrink-0" />
                  <span className="truncate">{targetOrgan}</span>
                </h4>
                <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground font-medium">
                  <span className="text-teal-700 font-semibold">{region} Cavity</span>
                  <span>•</span>
                  <span className="truncate">{bodySystem}</span>
                </div>
              </div>

              {/* Clinical Match Mini Strip */}
              {conditionName && (
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl px-2 py-1.5 flex items-center justify-between gap-1 border border-teal-900/5">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground text-[10px] truncate max-w-[130px]">
                      {conditionName}
                    </span>
                    {icd10Code && icd10Code !== 'Unknown' && (
                      <span className="text-[8.5px] text-muted-foreground font-mono">
                        ICD-10: <span className="font-semibold text-foreground">{icd10Code}</span>
                      </span>
                    )}
                  </div>
                  {modelScore != null && (
                    <span className="px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold text-[9px] font-display flex-shrink-0">
                      {modelScore}% Match
                    </span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={onFocusRegion}
                className="w-full flex items-center justify-center gap-1 text-[9.5px] font-semibold py-1 px-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-all cursor-pointer shadow-xs font-display"
              >
                <Focus className="h-2.5 w-2.5" />
                <span>Zoom & Center Target</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Minimized Frosted Floating Pill */
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsMinimized(false)}
            className="absolute pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-teal-500/30 shadow-md text-[10px] font-bold text-teal-700 dark:text-teal-300 cursor-pointer hover:bg-white/95 transition-all font-display"
            style={{ left: `${cardLeft}px`, top: `${cardTop}px` }}
          >
            <Crosshair className="h-3 w-3 text-teal-600 animate-pulse" />
            <span className="truncate max-w-[140px]">{targetOrgan}</span>
            <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

