import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Stethoscope, Scan, ClipboardList } from 'lucide-react';
import BrandLogo from './BrandLogo';

const STAGES = [
  { id: 'input', label: 'Intake', icon: Stethoscope },
  { id: 'analyzing', label: 'Analyze', icon: Scan },
  { id: 'results', label: 'Results', icon: ClipboardList },
];

export default function Header({ onReset, appState = 'input' }) {
  const reduceMotion = useReducedMotion();

  return (
    <header className="clinical-header sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-2xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[68px] gap-4">
          <div
            onClick={onReset}
            className={`flex items-center gap-3 min-w-0 ${onReset ? 'cursor-pointer group' : ''}`}
            title={onReset ? 'Return to intake' : 'CDSS Platform'}
          >
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="flex-shrink-0"
            >
              <BrandLogo />
            </motion.div>
            <div className="min-w-0 leading-tight">
              <p className="font-display font-bold text-[15px] text-foreground tracking-tight group-hover:text-primary transition-colors">
                Clinical Decision Support
              </p>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium">
                3D symptom analysis
              </p>
            </div>
          </div>

          <nav
            aria-label="Consultation stages"
            className="hidden md:flex items-center p-1 rounded-full bg-slate-100/80 border border-border"
          >
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const active = appState === stage.id;
              const reached =
                (appState === 'analyzing' && index <= 1) ||
                appState === 'results' ||
                stage.id === 'input';
              return (
                <div key={stage.id} className="flex items-center">
                  {index > 0 && <span className="w-4 h-px bg-border mx-0.5" aria-hidden="true" />}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-display transition-all ${
                      active
                        ? 'bg-white text-foreground shadow-sm border border-border'
                        : reached
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-primary' : ''}`} />
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-accent/70 px-2.5 py-1.5 rounded-full border border-primary/15 font-display">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Evidence-based
            </div>

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:brightness-105 px-3.5 py-2 rounded-full shadow-sm shadow-teal-600/20 transition-all cursor-pointer font-display"
                title="Start a new patient intake"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New consultation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
