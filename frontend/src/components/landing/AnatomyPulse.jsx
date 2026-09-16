import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Brain, Wind, Bone } from 'lucide-react';

const ORBITS = [
  { Icon: Heart, start: 0, color: 'text-rose-500' },
  { Icon: Brain, start: 90, color: 'text-violet-500' },
  { Icon: Wind, start: 180, color: 'text-sky-500' },
  { Icon: Bone, start: 270, color: 'text-teal-600' },
];

export default function AnatomyPulse() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-white/80 px-4 pt-4 pb-3 min-h-[176px]">
      <div className="relative z-10 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-display">
          Live anatomical mapping
        </p>
        <p className="text-sm font-semibold text-foreground font-display">
          Regions highlight as symptoms are localized
        </p>
      </div>

      <div className="relative mx-auto h-[168px] w-[220px]">
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-200/80" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sky-200/90" />

        {!reduceMotion && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-400/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.05, 0.4] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <div className="absolute left-1/2 top-1/2 h-[70px] w-[40px] -translate-x-1/2 -translate-y-1/2 rounded-[36px] bg-gradient-to-b from-teal-100 via-white to-sky-100 border border-teal-200 shadow-sm" />
        <div className="absolute left-1/2 top-[34%] h-[18px] w-[30px] -translate-x-1/2 rounded-full bg-teal-200/90" />

        {ORBITS.map(({ Icon, start, color }) => (
          <motion.div
            key={start}
            className="absolute inset-0"
            initial={{ rotate: start }}
            animate={reduceMotion ? { rotate: start } : { rotate: start + 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`absolute left-1/2 top-1 h-8 w-8 -translate-x-1/2 rounded-full bg-white border border-border shadow-subtle flex items-center justify-center ${color}`}>
              <motion.div
                initial={{ rotate: -start }}
                animate={reduceMotion ? { rotate: -start } : { rotate: -start - 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
