import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Focus, Eye, Crosshair, X } from 'lucide-react';

/**
 * Holographic 3D-anchored Anatomical HUD Callout & Dynamic Pointer Arrow.
 * 
 * Tracks 3D coordinate in real-time, rendering a pulsing beacon, connecting leader line,
 * directional arrow, and clinical metadata card.
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

  // Responsive card width
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const cardWidth = isSmallScreen ? 215 : 245;

  // Determine ideal placement for HUD card relative to beacon point
  const cardPlacement = x > (isSmallScreen ? 180 : 250) ? 'left' : 'right';
  
  // Dynamic boundary-clamped card coordinates
  let cardX = 12;
  if (cardPlacement === 'left') {
    cardX = Math.max(8, x - cardWidth - 18);
  } else {
    const maxX = typeof window !== 'undefined' ? Math.min(window.innerWidth - cardWidth - 16, 320) : 280;
    cardX = Math.max(8, Math.min(x + 24, maxX));
  }
  const cardY = Math.max(42, Math.min(y - 65, 180));

  const targetOrgan = bodyLocalization?.targetOrgan || (region === 'Thorax' ? 'Heart & Coronary Vessels' : `${region} Structures`);
  const bodySystem = bodyLocalization?.bodySystem || 'Cardiovascular';

  // SVG Leader line anchor from Card to Target 2D Point
  const cardAnchorX = cardPlacement === 'left' ? cardX + cardWidth - 8 : cardX + 8;
  const cardAnchorY = cardY + 28;

  // Compute curved leader line
  const midX = (cardAnchorX + x) / 2;
  const pathD = `M ${cardAnchorX} ${cardAnchorY} Q ${midX} ${cardAnchorY} ${x} ${y}`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* ── 1. SVG Dynamic Leader Line & Pointer Arrow ──────────────────────── */}
      <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
        <defs>
          <linearGradient id="hudLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.85" />
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
            {/* Background Glow Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0D9488"
              strokeWidth="3.5"
              strokeOpacity="0.35"
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

      {/* ── 2. Pulsing 3D Anatomical Beacon Reticle (Pinned to 3D Coord) ───── */}
      <div
        className="absolute transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto cursor-pointer"
        style={{ left: `${x}px`, top: `${y}px` }}
        onClick={onFocusRegion}
        title={`Focus on ${targetOrgan}`}
      >
        {/* Outer Radar Ripple */}
        <span className="absolute h-9 w-9 rounded-full bg-primary/25 animate-ping duration-1000" />
        
        {/* Secondary Focus Ring */}
        <span className="absolute h-6 w-6 rounded-full border border-primary/60 animate-pulse" />
        
        {/* Central Glowing Reticle Core */}
        <div className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_12px_rgba(13,148,136,0.9)] flex items-center justify-center border-2 border-white">
          <div className="h-1 w-1 rounded-full bg-white" />
        </div>
      </div>

      {/* ── 3. Floating Holographic Clinical HUD Card ─────────────────────── */}
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.22 }}
            className="absolute pointer-events-auto"
            style={{ left: `${cardX}px`, top: `${cardY}px`, width: `${cardWidth}px` }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-primary/25 shadow-xl shadow-primary/10 p-3 flex flex-col gap-2 overflow-hidden relative">
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-sky-400" />

              {/* Header Badge & Close/Minimize */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider font-display uppercase border border-primary/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Primary Focus
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onFocusRegion}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="Re-center & Zoom into Region"
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
                <h4 className="text-xs font-bold text-foreground font-display flex items-center gap-1.5 truncate">
                  <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{targetOrgan}</span>
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                  <span className="text-primary font-semibold">{region} Cavity</span>
                  <span>•</span>
                  <span className="truncate">{bodySystem} System</span>
                </div>
              </div>

              {/* Clinical Condition & Match Badge */}
              {conditionName && (
                <div className="bg-muted/50 rounded-xl p-2 flex flex-col gap-1 border border-border/70">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="font-semibold text-foreground truncate max-w-[130px]">
                      {conditionName}
                    </span>
                    {modelScore != null && (
                      <span className="px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground font-bold text-[9px] font-display">
                        {modelScore}% Match
                      </span>
                    )}
                  </div>
                  {icd10Code && icd10Code !== 'Unknown' && (
                    <span className="text-[9px] text-muted-foreground font-mono">
                      ICD-10: <span className="font-semibold text-foreground">{icd10Code}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={onFocusRegion}
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs font-display"
                >
                  <Focus className="h-2.5 w-2.5" />
                  <span>Zoom Focus</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Minimized Floating Pill */
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsMinimized(false)}
            className="absolute pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-primary/30 shadow-md text-[10px] font-bold text-primary cursor-pointer hover:bg-primary/5 transition-all font-display"
            style={{ left: `${cardX}px`, top: `${cardY}px` }}
          >
            <Crosshair className="h-3 w-3 text-primary animate-pulse" />
            <span>Show {region} Focus</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
