import React from 'react';
import { Activity, ShieldCheck, Database, Layers } from 'lucide-react';

/**
 * AnatomyPulse / Clinical Telemetry Showcase
 * Fills the intake left column with interactive anatomy status,
 * regional anchors, and benchmark verification stats.
 */
export default function AnatomyPulse() {
  const REGION_CHIPS = ['Head & ENT', 'Thorax', 'Abdomen', 'Spine & Joints'];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-white/95 to-slate-50/90 p-3.5 shadow-subtle flex flex-col justify-between w-full flex-1 min-h-0">
      
      {/* Top: Live Telemetry Indicator */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="text-xs font-bold text-foreground font-display tracking-tight">
            3D Spatial Localization
          </span>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
          BodyParts3D Active
        </span>
      </div>

      {/* Middle: Video Animation Framed with Clinical Overlays */}
      <div className="relative my-2 flex-1 flex items-center justify-center min-h-[140px] max-h-[170px] overflow-hidden rounded-xl bg-gradient-to-b from-teal-50/40 to-cyan-50/20 border border-teal-100/50">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Doctor Visual Video */}
        <video
          src="/assets/Doctor.webm"
          autoPlay
          loop
          muted
          playsInline
          className="relative z-10 max-h-[135px] w-auto object-contain pointer-events-none select-none drop-shadow-md"
        >
          <source src="/assets/Doctor.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Floating Quick Region Chips */}
        <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-center gap-1.5 flex-wrap">
          {REGION_CHIPS.map((chip) => (
            <span
              key={chip}
              className="text-[9px] font-medium font-mono text-slate-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-border shadow-2xs"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom: 3 Core Clinical Integrity Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
        <div className="px-2 py-1.5 rounded-lg bg-white border border-border/60 text-center shadow-2xs">
          <p className="text-[10px] font-medium text-muted-foreground">Pathologies</p>
          <p className="font-display font-bold text-xs text-foreground mt-0.5">49 Classes</p>
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-white border border-border/60 text-center shadow-2xs">
          <p className="text-[10px] font-medium text-muted-foreground">3D Meshes</p>
          <p className="font-display font-bold text-xs text-teal-700 mt-0.5">2,234 Parts</p>
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-white border border-border/60 text-center shadow-2xs">
          <p className="text-[10px] font-medium text-muted-foreground">Benchmark</p>
          <p className="font-display font-bold text-xs text-cyan-700 mt-0.5">DDXPlus</p>
        </div>
      </div>

    </div>
  );
}
