import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Focus, Crosshair, X, ChevronRight, GripHorizontal } from 'lucide-react';

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
  const [isMinimized, setIsMinimized] = useState(false);
  // Drag state — offset from the auto-position
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const cardRef = useRef(null);

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

  // ── Card auto-position (responsive for mobile & desktop) ───────────────────
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
  const isMobile = vw < 640;

  const CARD_W = isMobile ? Math.min(215, vw - 24) : 228;
  const CARD_H = 165;
  const BEACON_GAP = isMobile ? 18 : 28;
  const TOP_SAFE_Y = isMobile ? 42 : 48;

  let baseLeft = 0;
  let baseTop = 0;

  if (isMobile) {
    baseLeft = Math.max(10, Math.min(vw - CARD_W - 10, x - CARD_W / 2));
    if (y < vh * 0.48) {
      baseTop = y + BEACON_GAP + 6;
    } else {
      baseTop = y - BEACON_GAP - CARD_H;
    }
    baseTop = Math.max(TOP_SAFE_Y, Math.min(vh - CARD_H - 52, baseTop));
  } else {
    // Prefer right; flip left if overflow
    baseLeft = x + BEACON_GAP;
    if (baseLeft + CARD_W > vw - 12) {
      baseLeft = x - BEACON_GAP - CARD_W;
    }
    // Never overlap layers panel
    if (baseLeft < 156 && x + BEACON_GAP + CARD_W <= vw - 12) {
      baseLeft = x + BEACON_GAP;
    }
    if (baseLeft < 8) baseLeft = 8;

    // Vertically center on beacon; clamp edges
    baseTop = y - CARD_H / 2;
    if (baseTop < TOP_SAFE_Y) baseTop = TOP_SAFE_Y;
    if (baseTop + CARD_H > vh - 56) baseTop = vh - 56 - CARD_H;
    if (baseTop < TOP_SAFE_Y) baseTop = TOP_SAFE_Y;
  }

  const cardLeft = baseLeft + dragOffset.dx;
  const cardTop  = baseTop  + dragOffset.dy;

  return (
    <div
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
            border: '1px solid rgba(16,185,129,0.35)',
            animationDuration: '2.6s',
          }}
        />

        {/* Minimal clean outer target ring */}
        <div
          className="relative flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
          style={{
            width: 20,
            height: 20,
            background: 'rgba(16,185,129,0.12)',
            border: '1.5px solid rgba(16,185,129,0.95)',
            boxShadow: '0 0 10px rgba(16,185,129,0.35)',
          }}
        >
          {/* Crisp center micro-dot */}
          <div
            className="rounded-full"
            style={{
              width: 5,
              height: 5,
              background: '#10b981',
              boxShadow: '0 0 4px #10b981',
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
                border: '1px solid rgba(16,185,129,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(16,185,129,0.10)',
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: 3, background: 'linear-gradient(90deg, #10b981, #34d399, #06b6d4)' }}
              />

              {/* Drag handle */}
              <div
                className="flex items-center justify-center py-1.5 cursor-grab active:cursor-grabbing select-none"
                style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', touchAction: 'none' }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                title="Drag to reposition"
              >
                <GripHorizontal className="h-3.5 w-3.5 text-emerald-400 opacity-70" />
              </div>

              <div className="px-3 pb-3 pt-2 flex flex-col gap-2">

                {/* Header: badge + actions */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                    style={{
                      background: 'rgba(16,185,129,0.10)',
                      color: '#059669',
                      border: '1px solid rgba(16,185,129,0.28)',
                    }}
                  >
                    <span
                      className="animate-pulse rounded-full"
                      style={{ width: 6, height: 6, background: '#10b981', display:'inline-block' }}
                    />
                    Primary Focus
                  </span>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={onFocusRegion}
                      className="p-1 rounded-lg transition-colors cursor-pointer"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
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
                    <Activity className="h-3 w-3 flex-shrink-0" style={{ color:'#10b981' }} />
                    <span className="truncate">{targetOrgan}</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] font-medium flex-wrap" style={{ color:'#64748b' }}>
                    <span className="font-semibold" style={{ color:'#059669' }}>{region}</span>
                    <span>•</span>
                    <span className="truncate">{bodySystem}</span>
                  </div>
                </div>

                {/* Clinical match strip */}
                {conditionName && (
                  <div
                    className="rounded-xl px-2 py-1.5 flex items-center justify-between gap-1"
                    style={{
                      background: 'rgba(16,185,129,0.07)',
                      border: '1px solid rgba(16,185,129,0.16)',
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[10px] truncate max-w-[120px]" style={{ color:'#0f172a' }}>
                        {conditionName}
                      </span>
                      {icd10Code && icd10Code !== 'Unknown' && (
                        <span className="text-[8px] font-mono" style={{ color:'#94a3b8' }}>
                          ICD-10: <span className="font-semibold" style={{ color:'#475569' }}>{icd10Code}</span>
                        </span>
                      )}
                    </div>
                    {modelScore != null && (
                      <span
                        className="px-1.5 py-0.5 rounded-md font-bold text-[9px] flex-shrink-0"
                        style={{
                          background:'rgba(16,185,129,0.15)',
                          color:'#059669',
                          border:'1px solid rgba(16,185,129,0.30)',
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
                    background: '#10b981',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#059669'}
                  onMouseLeave={e => e.currentTarget.style.background='#10b981'}
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
              border: '1px solid rgba(16,185,129,0.38)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              color: '#059669',
            }}
          >
            <Crosshair className="h-3 w-3 animate-pulse" style={{ color:'#10b981' }} />
            <span className="truncate max-w-[140px]">{targetOrgan}</span>
            <ChevronRight className="h-2.5 w-2.5" style={{ color:'#94a3b8' }} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
