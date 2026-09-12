import React from 'react';
import { Activity, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ onReset }) {
  return (
    <header className="border-b border-border/80 bg-white/85 backdrop-blur-xl sticky top-0 z-50 shadow-[0_2px_16px_-4px_rgba(16,185,129,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 gap-4">
          
          {/* System Identity & Branding */}
          <div 
            onClick={onReset}
            className={`flex items-center gap-3.5 ${onReset ? 'cursor-pointer group' : ''}`}
            title={onReset ? 'Click to reset consultation' : 'CDSS Platform'}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 shadow-md shadow-primary/25 flex items-center justify-center text-primary-foreground group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/35 transition-all duration-200 ring-2 ring-primary/15">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-foreground text-sm sm:text-base tracking-tight group-hover:text-primary transition-colors duration-150">
                  Patient Clinical Decision Support
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/20 font-display shadow-2xs">
                  <Sparkles className="h-2.5 w-2.5 text-primary" /> 3D AI-Assisted
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium">
                Interactive Symptom Analysis & Anatomical Localization
              </p>
            </div>
          </div>

          {/* Right Clinical Badges & Navigation Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live System Indicator */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-medium text-foreground bg-accent/60 px-3 py-1 rounded-full border border-border font-display">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Diagnostic Engine Active</span>
            </div>

            {/* Evidence-Based Pill */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-white px-3.5 py-1 rounded-full border border-border shadow-xs font-display">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Evidence-Based</span> Support
            </div>

            {/* New Consultation Reset Button */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary bg-white hover:bg-accent px-3 py-1.5 rounded-full border border-border hover:border-primary/40 shadow-xs transition-all cursor-pointer font-display"
                title="Start a new patient intake"
              >
                <RefreshCw className="h-3 w-3 text-primary" />
                <span className="hidden sm:inline">New Intake</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
