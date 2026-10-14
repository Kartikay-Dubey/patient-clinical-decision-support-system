import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Sparkles, Activity, CheckCircle2, Loader2, Bot } from 'lucide-react';
import { UserButton, Show } from '@clerk/react';
import BrandLogo from './BrandLogo';

export default function Header({ onReset, appState = 'input', onToggleAssistant, isAssistantOpen = false }) {
  const reduceMotion = useReducedMotion();

  return (
    <header className="clinical-header sticky top-0 z-50 border-b border-border/70 bg-white/95 backdrop-blur-2xl">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[56px] sm:h-[60px] gap-4">
          
          {/* Left: Brand Identity with Medical Grade Badging */}
          <div
            onClick={onReset}
            className={`flex items-center gap-3 min-w-0 ${onReset ? 'cursor-pointer group' : ''}`}
            title="CDSS Clinical Workstation"
          >
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="flex-shrink-0"
            >
              <BrandLogo />
            </motion.div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[15px] sm:text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                  CDSS <span className="font-medium text-slate-500">Atlas</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  v2.4 Live
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium truncate">
                Clinical Decision Support & 3D Spatial Anatomy
              </p>
            </div>
          </div>

          {/* Center: Bespoke Clinical Workflow Telemetry (Non-generic) */}
          <div className="hidden md:flex items-center">
            {appState === 'input' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50/90 border border-border/80 text-xs font-medium text-slate-700 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-foreground font-display">Triage Intake</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-[11px] text-muted-foreground font-mono">49 DDXPlus Models Active</span>
              </div>
            )}

            {appState === 'analyzing' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800 shadow-2xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                <span className="font-display">Neural Inference & Anatomy Pinning…</span>
              </div>
            )}

            {appState === 'results' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50/90 border border-teal-200/80 text-xs font-semibold text-teal-800 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span className="font-display">Differential Triage Report</span>
                <span className="text-teal-300">&bull;</span>
                <span className="text-[11px] text-teal-700/80 font-normal">WebGL Visualizer</span>
              </div>
            )}
          </div>

          {/* Right Action Suite: New Intake, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">

            {/* New Intake Reset Button */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer font-display"
                title="Start a new patient intake session"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">New Intake</span>
              </button>
            )}

            {/* Clerk User Button */}
            <Show when="signed-in">
              <div className="ml-0.5 flex items-center p-0.5 rounded-full border border-slate-200 bg-white shadow-2xs">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-7 h-7 rounded-full'
                    }
                  }}
                />
              </div>
            </Show>
          </div>

        </div>
      </div>
    </header>
  );
}
