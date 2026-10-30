import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Focus, Crosshair, X, ChevronRight, GripHorizontal } from 'lucide-react';
import { usePersona } from '../../context/PersonaContext';

const PERSONA_HUD_THEMES = {
  patient: {
    reticlePing: 'rgba(16, 185, 129, 0.40)',
    reticleRingBg: 'rgba(16, 185, 129, 0.12)',
    reticleRingBorder: 'rgba(16, 185, 129, 0.95)',
    reticleShadow: 'rgba(16, 185, 129, 0.35)',
    reticleDot: '#10b981',
    topBarGradient: 'linear-gradient(90deg, #10b981, #34d399, #06b6d4)',
    cardBorder: '1px solid rgba(16, 185, 129, 0.25)',
    cardGlow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 10px rgba(16, 185, 129, 0.15)',
    gripBorder: '1px solid rgba(16, 185, 129, 0.15)',
    gripColor: '#34d399',
    badgeBg: 'rgba(16, 185, 129, 0.10)',
    badgeColor: '#059669',
    badgeBorder: '1px solid rgba(16, 185, 129, 0.28)',
    badgeDot: '#10b981',
    iconColor: '#10b981',
    regionColor: '#059669',
    stripBg: 'rgba(16, 185, 129, 0.07)',
    stripBorder: '1px solid rgba(16, 185, 129, 0.16)',
    scoreBg: 'rgba(16, 185, 129, 0.15)',
    scoreColor: '#059669',
    scoreBorder: '1px solid rgba(16, 185, 129, 0.30)',
    btnBg: '#10b981',
    btnHover: '#059669',
    btnShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
    pillBorder: '1px solid rgba(16, 185, 129, 0.38)',
    pillColor: '#059669',
  },
  student: {
    reticlePing: 'rgba(37, 99, 235, 0.40)',
    reticleRingBg: 'rgba(37, 99, 235, 0.12)',
    reticleRingBorder: 'rgba(37, 99, 235, 0.95)',
    reticleShadow: 'rgba(37, 99, 235, 0.35)',
    reticleDot: '#2563eb',
    topBarGradient: 'linear-gradient(90deg, #2563eb, #60a5fa, #38bdf8)',
    cardBorder: '1px solid rgba(37, 99, 235, 0.25)',
    cardGlow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 10px rgba(37, 99, 235, 0.15)',
    gripBorder: '1px solid rgba(37, 99, 235, 0.15)',
    gripColor: '#60a5fa',
    badgeBg: 'rgba(37, 99, 235, 0.10)',
    badgeColor: '#1d4ed8',
    badgeBorder: '1px solid rgba(37, 99, 235, 0.28)',
    badgeDot: '#2563eb',
    iconColor: '#2563eb',
    regionColor: '#1d4ed8',
    stripBg: 'rgba(37, 99, 235, 0.07)',
    stripBorder: '1px solid rgba(37, 99, 235, 0.16)',
    scoreBg: 'rgba(37, 99, 235, 0.15)',
    scoreColor: '#1d4ed8',
    scoreBorder: '1px solid rgba(37, 99, 235, 0.30)',
    btnBg: '#2563eb',
    btnHover: '#1d4ed8',
    btnShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
    pillBorder: '1px solid rgba(37, 99, 235, 0.38)',
    pillColor: '#1d4ed8',
  },
  technician: {
    reticlePing: 'rgba(234, 88, 12, 0.40)',
    reticleRingBg: 'rgba(234, 88, 12, 0.12)',
    reticleRingBorder: 'rgba(234, 88, 12, 0.95)',
    reticleShadow: 'rgba(234, 88, 12, 0.35)',
    reticleDot: '#ea580c',
    topBarGradient: 'linear-gradient(90deg, #ea580c, #fb923c, #f59e0b)',
    cardBorder: '1px solid rgba(234, 88, 12, 0.25)',
    cardGlow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 10px rgba(234, 88, 12, 0.15)',
    gripBorder: '1px solid rgba(234, 88, 12, 0.15)',
    gripColor: '#fb923c',
    badgeBg: 'rgba(234, 88, 12, 0.10)',
    badgeColor: '#c2410c',
    badgeBorder: '1px solid rgba(234, 88, 12, 0.28)',
    badgeDot: '#ea580c',
    iconColor: '#ea580c',
    regionColor: '#c2410c',
    stripBg: 'rgba(234, 88, 12, 0.07)',
    stripBorder: '1px solid rgba(234, 88, 12, 0.16)',
    scoreBg: 'rgba(234, 88, 12, 0.15)',
    scoreColor: '#c2410c',
    scoreBorder: '1px solid rgba(234, 88, 12, 0.30)',
    btnBg: '#ea580c',
    btnHover: '#c2410c',
    btnShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
    pillBorder: '1px solid rgba(234, 88, 12, 0.38)',
    pillColor: '#c2410c',
  },
};

/**
 * AnatomyHUDCallout — Medical Targeting Reticle + Floating Info Panel
 *
 * Renders:
 *   1. A professional medical targeting reticle at the 3D-projected anchor point
 *   2. A draggable glassmorphic info card that auto-positions near the beacon
 *      but can be repositioned by the user via drag
 */
export default function AnatomyHUDCallout({
  target2D,
  region,
  bodyLocalization,
  conditionName,
  icd10Code,
  modelScore,
  onFocusRegion,
  isHoveringPart = false,
}) {
  const { persona } = usePersona();
  const theme = PERSONA_HUD_THEMES[persona] || PERSONA_HUD_THEMES.patient;
  const [isMinimized, setIsMinimized] = useState(false);
  // Drag state — offset from the auto-position
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Reset drag when region changes
  useEffect(() => {
    setDragOffset({ dx: 0, dy: 0 });
    setIsMinimized(false);
  }, [region]);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      dx: dragOffset.dx,
      dy: dragOffset.dy,
    };
  }, [dragOffset]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      if (!dragStart.current) return;
      setDragOffset({
        dx: dragStart.current.dx + (e.clientX - dragStart.current.mx),
        dy: dragStart.current.dy + (e.clientY - dragStart.current.my),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // Touch drag
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    setIsDragging(true);
    dragStart.current = {
      mx: t.clientX,
      my: t.clientY,
      dx: dragOffset.dx,
      dy: dragOffset.dy,
    };
  }, [dragOffset]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      if (e.cancelable) e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      setDragOffset({
        dx: dragStart.current.dx + (t.clientX - dragStart.current.mx),
        dy: dragStart.current.dy + (t.clientY - dragStart.current.my),
      });
    };
    const onEnd = () => setIsDragging(false);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging]);

  // ── Guard ───────────────────────────────────────────────────────────────────
  if (!target2D || !target2D.visible) {
    return null;
  }

  const { x, y } = target2D;

  const targetOrgan = bodyLocalization?.targetOrgan
    || (region === 'Thorax' ? 'Heart & Coronary Vessels' : `${region} Structures`);
  const bodySystem = bodyLocalization?.bodySystem || 'General';

  // ── Card auto-position (responsive for mobile & desktop, clamped inside canvas container) ────
  const cw = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? Math.min(window.innerWidth, 800) : 600);
  const ch = containerRef.current?.clientHeight || (typeof window !== 'undefined' ? 440 : 400);
  const isMobile = cw < 640;

  const CARD_W = isMobile ? Math.min(208, cw - 20) : 228;
  const CARD_H = isMobile ? (persona === 'patient' ? 140 : 155) : (persona === 'patient' ? 150 : 165);
  const BEACON_GAP = isMobile ? 14 : 26;
  const TOP_SAFE_Y = isMobile ? 44 : 48;
  const BOTTOM_SAFE_Y = isMobile ? 48 : 52;

  let baseLeft = 0;
  let baseTop = 0;

  if (isMobile) {
    // Check if card fits to the right of beacon
    if (x + BEACON_GAP + CARD_W <= cw - 8) {
      baseLeft = x + BEACON_GAP;
    } else if (x - BEACON_GAP - CARD_W >= 8) {
      // Or fits to the left
      baseLeft = x - BEACON_GAP - CARD_W;
    } else {
      // Center horizontally within canvas boundaries
      baseLeft = Math.max(8, Math.min(cw - CARD_W - 8, x - CARD_W / 2));
    }

    // Vertically center on beacon, clamped inside safe canvas viewport
    const maxTop = Math.max(TOP_SAFE_Y, ch - CARD_H - BOTTOM_SAFE_Y);
    baseTop = Math.max(TOP_SAFE_Y, Math.min(maxTop, y - CARD_H / 2));
  } else {
    // Prefer right; flip left if overflow
    baseLeft = x + BEACON_GAP;
    if (baseLeft + CARD_W > cw - 12) {
      baseLeft = x - BEACON_GAP - CARD_W;
    }
    // Never overlap layers panel
    if (baseLeft < 156 && x + BEACON_GAP + CARD_W <= cw - 12) {
      baseLeft = x + BEACON_GAP;
    }
    if (baseLeft < 8) baseLeft = 8;

    // Vertically center on beacon; clamp edges
    const maxTop = Math.max(TOP_SAFE_Y, ch - CARD_H - 52);
    baseTop = Math.max(TOP_SAFE_Y, Math.min(maxTop, y - CARD_H / 2));
  }

  const cardLeft = Math.max(4, Math.min(cw - CARD_W - 4, baseLeft + dragOffset.dx));
  const cardTop  = Math.max(TOP_SAFE_Y, Math.min(ch - CARD_H - 8, baseTop + dragOffset.dy));

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-20 transition-opacity duration-200 ${
        isHoveringPart ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── 1. MINIMAL MEDICAL TARGETING RETICLE ── */}
      <div
        className="absolute pointer-events-auto cursor-pointer group transition-all duration-200 hover:opacity-40"
        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
        onClick={onFocusRegion}
        title={`Primary Clinical Focus: ${targetOrgan} (Click to center)`}
      >
        {/* Soft ambient pulse wave (single clean thin ring) */}
        <div
          className="absolute -inset-2 rounded-full animate-ping pointer-events-none"
          style={{
            border: `1px solid ${theme.reticlePing}`,
            animationDuration: '2.6s',
          }}
        />

        {/* Minimal clean outer target ring */}
        <div
          className="relative flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
          style={{
            width: 20,
            height: 20,
            background: theme.reticleRingBg,
            border: `1.5px solid ${theme.reticleRingBorder}`,
            boxShadow: `0 0 10px ${theme.reticleShadow}`,
          }}
        >
          {/* Crisp center micro-dot */}
          <div
            className="rounded-full"
            style={{
              width: 5,
              height: 5,
              background: theme.reticleDot,
              boxShadow: `0 0 4px ${theme.reticleDot}`,
            }}
          />
        </div>
      </div>

      {/* ── 2. DRAGGABLE INFO CARD ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isMinimized ? (
          <motion.div
            key="card"
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute pointer-events-auto"
            style={{
              left: cardLeft,
              top: cardTop,
              width: CARD_W,
              userSelect: 'none',
              cursor: isDragging ? 'grabbing' : 'default',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                border: theme.cardBorder,
                boxShadow: theme.cardGlow,
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: 3, background: theme.topBarGradient }}
              />

              {/* Drag handle */}
              <div
                className="flex items-center justify-center py-1.5 cursor-grab active:cursor-grabbing select-none"
                style={{ borderBottom: theme.gripBorder, touchAction: 'none' }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                title="Drag to reposition"
              >
                <GripHorizontal className="h-3.5 w-3.5 opacity-70" style={{ color: theme.gripColor }} />
              </div>

              <div className="px-3 pb-3 pt-2 flex flex-col gap-2">

                {/* Header: badge + actions */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                    style={{
                      background: theme.badgeBg,
                      color: theme.badgeColor,
                      border: theme.badgeBorder,
                    }}
                  >
                    <span
                      className="animate-pulse rounded-full"
                      style={{ width: 6, height: 6, background: theme.badgeDot, display:'inline-block' }}
                    />
                    Primary Focus
                  </span>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={onFocusRegion}
                      className="p-1 rounded-lg transition-colors cursor-pointer"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.background = theme.badgeBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      title="Re-center camera"
                    >
                      <Focus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="p-1 rounded-lg transition-colors cursor-pointer"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}
                      title="Minimize"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Organ / region title */}
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-[11.5px] font-bold flex items-center gap-1.5 truncate leading-snug" style={{ color:'#0f172a' }}>
                    <Activity className="h-3 w-3 flex-shrink-0" style={{ color: theme.iconColor }} />
                    <span className="truncate">{targetOrgan}</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] font-medium flex-wrap" style={{ color:'#64748b' }}>
                    <span className="font-semibold" style={{ color: theme.regionColor }}>{region}</span>
                    <span>•</span>
                    <span className="truncate">{bodySystem}</span>
                  </div>
                </div>

                {/* Clinical match strip */}
                {conditionName && (
                  <div
                    className="rounded-xl px-2 py-1.5 flex items-center justify-between gap-1"
                    style={{
                      background: theme.stripBg,
                      border: theme.stripBorder,
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[10px] truncate max-w-[120px]" style={{ color:'#0f172a' }}>
                        {conditionName}
                      </span>
                      {persona !== 'patient' && icd10Code && icd10Code !== 'Unknown' && (
                        <span className="text-[8px] font-mono" style={{ color:'#94a3b8' }}>
                          ICD-10: <span className="font-semibold" style={{ color:'#475569' }}>{icd10Code}</span>
                        </span>
                      )}
                    </div>
                    {modelScore != null && (
                      <span
                        className="px-1.5 py-0.5 rounded-md font-bold text-[9px] flex-shrink-0"
                        style={{
                          background: theme.scoreBg,
                          color: theme.scoreColor,
                          border: theme.scoreBorder,
                        }}
                      >
                        {modelScore}%
                      </span>
                    )}
                  </div>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={onFocusRegion}
                  className="w-full flex items-center justify-center gap-1.5 text-[9.5px] font-semibold py-1.5 px-2 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: theme.btnBg,
                    color: 'white',
                    boxShadow: theme.btnShadow,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.btnHover}
                  onMouseLeave={e => e.currentTarget.style.background = theme.btnBg}
                >
                  <Focus className="h-2.5 w-2.5" />
                  Zoom & Center Target
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Minimized pill */
          <motion.button
            key="pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMinimized(false)}
            className="absolute pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer transition-all"
            style={{
              left: cardLeft,
              top: cardTop,
              background: 'rgba(255,255,255,0.90)',
              backdropFilter: 'blur(16px)',
              border: theme.pillBorder,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              color: theme.pillColor,
            }}
          >
            <Crosshair className="h-3 w-3 animate-pulse" style={{ color: theme.reticleDot }} />
            <span className="truncate max-w-[140px]">{targetOrgan}</span>
            <ChevronRight className="h-2.5 w-2.5" style={{ color:'#94a3b8' }} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
