import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';
import WaveGraphic from '../../components/WaveGraphic';

const ANALYSIS_STEPS = [
  "Understanding your description",
  "Extracting symptom signals",
  "Identifying the primary affected region",
  "Comparing relevant clinical patterns",
  "Preparing possible conditions"
];

const STEP_DURATION_MS = 550; // ~550ms per step = 2.75s sequence
const FINAL_PAUSE_MS = 400;   // 400ms pause when complete before transitioning

export default function AnalysisStatus({ onStepChange, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const stepTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const onStepChangeRef = useRef(onStepChange);
  const onCompleteRef = useRef(onComplete);

  // Keep callback refs updated to prevent stale closures
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
    onCompleteRef.current = onComplete;
  }, [onStepChange, onComplete]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  // Step sequence timer logic
  useEffect(() => {
    setCurrentStep(0);
    setIsFinished(false);

    if (onStepChangeRef.current) {
      onStepChangeRef.current(0);
    }

    let stepIndex = 0;

    stepTimerRef.current = setInterval(() => {
      stepIndex += 1;
      if (stepIndex < ANALYSIS_STEPS.length) {
        setCurrentStep(stepIndex);
        if (onStepChangeRef.current) {
          onStepChangeRef.current(stepIndex);
        }
      } else {
        clearInterval(stepTimerRef.current);
        setIsFinished(true);
        if (onStepChangeRef.current) {
          onStepChangeRef.current(ANALYSIS_STEPS.length);
        }

        finishTimerRef.current = setTimeout(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }, FINAL_PAUSE_MS);
      }
    }, STEP_DURATION_MS);

    // Cleanup timers on unmount or reset
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="master-console p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full"
    >
      {/* Accessibility Status Region */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isFinished
          ? "Analysis complete. Preparing results."
          : `Step ${currentStep + 1} of ${ANALYSIS_STEPS.length}: ${ANALYSIS_STEPS[currentStep]}`}
      </div>

      {/* Header Eyebrow */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E5EFEA] text-[#2C4F43] border border-[#8AAEA1]/40 text-xs font-semibold uppercase tracking-wider mb-4 font-display">
        <Sparkles className="h-3.5 w-3.5 text-[#3F6457]" />
        <span>Clinical Reasoning Engine</span>
      </div>

      {/* Dynamic Headline */}
      <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2D2623] tracking-tight mb-2 min-h-[2.2rem] flex items-center justify-center">
        {isFinished ? (
          <span className="text-[#3F6457] font-bold">Evaluation Complete</span>
        ) : (
          <span>{ANALYSIS_STEPS[currentStep]}</span>
        )}
      </h3>

      <p className="text-xs sm:text-sm text-[#5E524C] mb-8 max-w-xs leading-relaxed font-medium">
        Correlating reported symptom indicators with anatomical localizations.
      </p>

      {/* Step Sequence List */}
      <div className="flex flex-col gap-3.5 w-full max-w-sm text-left bg-[#FCFAF7] rounded-3xl p-5 border border-[#EAE3D9] shadow-subtle mb-4">
        {ANALYSIS_STEPS.map((text, idx) => {
          const isCompleted = idx < currentStep || isFinished;
          const isCurrent = idx === currentStep && !isFinished;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 transition-all duration-300 ${
                isCompleted
                  ? 'opacity-90'
                  : isCurrent
                  ? 'opacity-100 transform translate-x-1 font-bold'
                  : 'opacity-40'
              }`}
            >
              <div className="pebble-dial w-7 h-7 flex items-center justify-center flex-shrink-0 bg-white">
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 text-[#3F6457] stroke-[2.5]" aria-hidden="true" />
                ) : isCurrent ? (
                  prefersReducedMotion ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#D97757]" aria-hidden="true" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 text-[#D97757] animate-spin" aria-hidden="true" />
                  )
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#DDD4C7]" aria-hidden="true" />
                )}
              </div>

              <span
                className={`text-xs sm:text-sm ${
                  isCurrent
                    ? 'text-[#D97757] font-bold font-display'
                    : isCompleted
                    ? 'text-[#2D2623] font-medium'
                    : 'text-[#8E8078]'
                }`}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}


