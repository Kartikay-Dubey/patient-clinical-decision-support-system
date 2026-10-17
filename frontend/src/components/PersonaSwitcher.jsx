import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePersona, PERSONAS } from '../context/PersonaContext';

export default function PersonaSwitcher({ className = '', compact = false }) {
  const { persona, setPersona } = usePersona();
  const reduceMotion = useReducedMotion();

  const personaList = Object.values(PERSONAS);

  return (
    <div
      role="radiogroup"
      aria-label="User experience mode"
      className={`inline-flex items-center p-1 rounded-full bg-slate-100/90 border border-border/80 shadow-2xs backdrop-blur-md ${className}`}
    >
      {personaList.map((item) => {
        const Icon = item.icon;
        const isActive = persona === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPersona(item.id)}
            title={`${item.label} (${item.subtitle}): ${item.description}`}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold font-display transition-colors cursor-pointer select-none ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={reduceMotion ? undefined : 'active-persona-pill'}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-white rounded-full shadow-sm border border-border/70 z-0"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${
                  isActive
                    ? item.id === 'patient'
                      ? 'text-emerald-600'
                      : item.id === 'student'
                      ? 'text-teal-600'
                      : 'text-cyan-600'
                    : 'text-muted-foreground'
                }`}
              />
              <span className={compact ? 'hidden md:inline' : 'hidden xs:inline'}>
                {item.label}
              </span>
              {isActive && (
                <span className="hidden lg:inline text-[10px] font-mono font-normal text-muted-foreground">
                  &bull; {item.subtitle}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
