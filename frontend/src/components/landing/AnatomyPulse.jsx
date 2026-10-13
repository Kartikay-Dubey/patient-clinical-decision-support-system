import React from 'react';

/**
 * AnatomyPulse / Landing Visual Animation
 * Displays the Doctor.webm visual asset on the clinical intake landing page.
 */
export default function AnatomyPulse() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-white/85 px-4 pt-3.5 pb-3 shadow-subtle flex flex-col w-full flex-1">
      <div className="relative z-10 mb-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">
            Live anatomical mapping
          </p>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-foreground font-display leading-snug">
          Regions highlight as symptoms are localized
        </p>
      </div>

      <div className="relative mx-auto flex-1 w-full max-w-[220px] flex items-center justify-center overflow-hidden rounded-2xl">
        <video
          src="/assets/Doctor.webm"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm"
        >
          <source src="/assets/Doctor.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
