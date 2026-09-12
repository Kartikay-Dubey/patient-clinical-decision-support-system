import React from 'react';

/**
 * WaveGraphic — Sculptural multi-layer pastel wave landscape
 * Inspired by the organic undulating curves in the reference design.
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
        className="w-full h-full"
      >
        <defs>
          {/* Wave Gradients */}
          <linearGradient id="waveSage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8AAEA1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#A4C4B8" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="waveOchre" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5CBA2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F5E3C8" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="waveBlush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9C1BB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FCE4E1" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="waveTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E29578" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F7D6CC" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Back Layer: Mineral Sage Wave */}
        <path
          d="M0,160 C180,90 320,210 520,130 C720,50 880,180 1060,110 C1140,80 1180,100 1200,120 L1200,240 L0,240 Z"
          fill="url(#waveSage)"
        />

        {/* Mid-Back Layer: Warm Ochre Wave */}
        <path
          d="M0,185 C140,130 280,70 460,140 C640,210 820,100 980,160 C1080,200 1150,170 1200,150 L1200,240 L0,240 Z"
          fill="url(#waveOchre)"
        />

        {/* Mid-Front Layer: Soft Blush Wave */}
        <path
          d="M0,205 C160,160 340,110 540,170 C740,230 920,140 1080,180 C1140,195 1180,190 1200,185 L1200,240 L0,240 Z"
          fill="url(#waveBlush)"
        />

        {/* Front Layer: Terracotta Foreground Accent */}
        <path
          d="M0,220 C220,185 420,225 640,190 C840,155 1020,210 1200,195 L1200,240 L0,240 Z"
          fill="url(#waveTerracotta)"
        />
      </svg>
    </div>
  );
}
