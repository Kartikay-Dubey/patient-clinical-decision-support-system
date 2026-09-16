import React from 'react';

/**
 * WaveGraphic — layered clinical wave landscape with a slow drift animation.
 */
export default function WaveGraphic({ className = '', height = 110, opacity = 1 }) {
  return (
    <div
      className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height, opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-full wave-graphic"
      >
        <defs>
          <linearGradient id="waveSage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="waveOchre" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="waveBlush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#99F6E4" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="waveTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        <g className="wave-layer wave-layer--back">
          <path
            d="M0,160 C180,90 320,210 520,130 C720,50 880,180 1060,110 C1140,80 1180,100 1200,120 L1200,240 L0,240 Z"
            fill="url(#waveSage)"
          />
        </g>
        <g className="wave-layer wave-layer--mid">
          <path
            d="M0,185 C140,130 280,70 460,140 C640,210 820,100 980,160 C1080,200 1150,170 1200,150 L1200,240 L0,240 Z"
            fill="url(#waveOchre)"
          />
        </g>
        <g className="wave-layer wave-layer--front">
          <path
            d="M0,205 C160,160 340,110 540,170 C740,230 920,140 1080,180 C1140,195 1180,190 1200,185 L1200,240 L0,240 Z"
            fill="url(#waveBlush)"
          />
        </g>
        <g className="wave-layer wave-layer--accent">
          <path
            d="M0,220 C220,185 420,225 640,190 C840,155 1020,210 1200,195 L1200,240 L0,240 Z"
            fill="url(#waveTerracotta)"
          />
        </g>
      </svg>
    </div>
  );
}
