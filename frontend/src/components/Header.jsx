import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Activity } from 'lucide-react';
import { UserButton, Show } from '@clerk/react';
import BrandLogo from './BrandLogo';
import { usePersona } from '../context/PersonaContext';

export default function Header({ onReset, appState = 'input' }) {
  const reduceMotion = useReducedMotion();
  const { personaConfig, setShowExperiencePicker } = usePersona();

  return (
    <header className="clinical-header sticky top-0 z-50 border-b border-border/70 bg-white/95 backdrop-blur-2xl">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[56px] sm:h-[60px] gap-2 sm:gap-4">
          
          {/* Left: Brand Identity with Persona Badge */}
          <div
            onClick={onReset}
            className={`flex items-center gap-2.5 sm:gap-3 min-w-0 ${onReset ? 'cursor-pointer group' : ''}`}
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-bold text-sm sm:text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                  CDSS <span className="font-medium text-slate-500">Atlas</span>
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${personaConfig.badgeColor}`}>
                  {personaConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden lg:block font-medium truncate">
                {personaConfig.description}
              </p>
            </div>
          </div>

          {/* Center: Session Telemetry */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="font-display font-semibold text-foreground">{personaConfig.label} Mode</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setShowExperiencePicker(true)}
              className="text-primary hover:text-primary/80 font-semibold cursor-pointer transition-colors"
              title="Change user experience mode"
            >
              Change
            </button>
          </div>

          {/* Right Action Suite: New Intake, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* New Intake Reset Button */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer font-display"
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
