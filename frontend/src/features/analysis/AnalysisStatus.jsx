import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Activity, Heart, Shield, Stethoscope, Sparkles } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Understanding your description",
  "Identifying key symptom signs",
  "Checking affected body areas",
  "Matching relevant health patterns",
  "Preparing health insights & care tips"
];

const STEP_SUBTITLES = [
  "Reading Description",
  "Checking Symptom Signs",
  "Locating Body Area",
  "Reviewing Health Patterns",
  "Finalizing Care Report"
];

const STEP_EXPLANATIONS = [
  "Interpreting your symptom description and reported health concerns",
  "Checking for related clinical signs, duration, and severity patterns",
  "Pinpointing the primary body system and anatomical focus area",
  "Cross-referencing indicators with trusted medical health references",
  "Assembling your personalized medical summary, home care tips, and doctor advice"
];

const STEP_TIMINGS = [1350, 1350, 1350, 1350, 3200]; // Steps 0-3: 1.35s each (5.4s total); Step 4 (Report video): 3.2s
const FINAL_PAUSE_MS = 500;   // 500ms pause when all complete = 9.1s total duration

export default function AnalysisStatus({ onStepChange, onComplete, isReady = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasReportLoaded, setHasReportLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const stepTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const onStepChangeRef = useRef(onStepChange);
  const onCompleteRef = useRef(onComplete);
  const isReadyRef = useRef(isReady);
  const stepIndexRef = useRef(0);
  const searchVideoRef = useRef(null);
  const reportVideoRef = useRef(null);

  // Play report preparation video as soon as the final phase (last 2-3s) begins
  const isReportPhase = currentStep >= 4 || isFinished;

  // Pre-buffer report video early (from step 2) so it is ready with 0 latency
  useEffect(() => {
    const rVid = reportVideoRef.current;
    if (rVid && currentStep >= 2) {
      rVid.load();
    }
  }, [currentStep]);

  useEffect(() => {
    const rVid = reportVideoRef.current;
    if (!rVid) return;

    if (isReportPhase) {
      rVid.muted = true;
      rVid.currentTime = 0;
      const playPromise = rVid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Report video play error:", err);
        });
      }
    }
  }, [isReportPhase]);

  useEffect(() => {
    const sVid = searchVideoRef.current;
    if (sVid) {
      sVid.muted = true;
      const playPromise = sVid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  // Keep callback refs updated to prevent stale closures
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
    onCompleteRef.current = onComplete;
    isReadyRef.current = isReady;
  }, [onStepChange, onComplete, isReady]);

  function completeSequence() {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
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

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  // Step sequence timer logic: strictly honors full duration for each step
  useEffect(() => {
    setCurrentStep(0);
    setIsFinished(false);
    stepIndexRef.current = 0;

    if (onStepChangeRef.current) {
      onStepChangeRef.current(0);
    }

    let currentIdx = 0;

    function advanceToNextStep() {
      if (currentIdx < ANALYSIS_STEPS.length - 1) {
        stepTimerRef.current = setTimeout(() => {
          currentIdx += 1;
          stepIndexRef.current = currentIdx;
          setCurrentStep(currentIdx);
          if (onStepChangeRef.current) {
            onStepChangeRef.current(currentIdx);
          }
          advanceToNextStep();
        }, STEP_TIMINGS[currentIdx]);
      } else {
        // Final Step 4: Medical report animation phase. Runs for full 2.8s!
        stepTimerRef.current = setTimeout(() => {
          if (isReadyRef.current) {
            completeSequence();
          } else {
            // Wait if API response is still in-flight
            const waitInterval = setInterval(() => {
              if (isReadyRef.current) {
                clearInterval(waitInterval);
                completeSequence();
              }
            }, 100);
          }
        }, STEP_TIMINGS[currentIdx]);
      }
    }

    advanceToNextStep();

    // Cleanup timers on unmount or reset
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const progressPercent = isFinished 
    ? 100 
    : Math.round(((currentStep + 1) / ANALYSIS_STEPS.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="master-console w-full max-w-4xl lg:max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-lg border border-border bg-white flex flex-col"
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

      {/* Top Console Header: Warm, Human, Clear */}
      <div className="console-topbar px-5 py-3 border-b border-border bg-slate-50/90 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider truncate">
            Clinical Health Review
          </span>
          <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            Active Assessment
          </span>
        </div>

        {/* Reassuring Live Step Progress Meter */}
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-medium hidden xs:inline">
            {isFinished ? 'Ready' : `Step ${currentStep + 1} of ${ANALYSIS_STEPS.length}`}
          </span>
          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-200/90 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out rounded-full" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <span className="font-mono text-[11px] font-bold text-teal-700 min-w-[28px] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Main 2-Column Console Body: Balanced Left (Steps) + Right (Biometric Vital Visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-stretch">
        
        {/* Left Column: Health Steps & Calming Guidance */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border bg-white">
          <div>
            {/* Friendly Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 text-[11px] font-bold uppercase tracking-wider mb-3 font-display">
              <Activity className="h-3 w-3 text-teal-600" />
              <span>Symptom Evaluation</span>
            </div>

            {/* Dynamic Step Headline */}
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2 min-h-[2.4rem] flex items-center">
              {isFinished ? (
                <span className="text-teal-700 font-bold">Health Evaluation Ready</span>
              ) : (
                <span>{ANALYSIS_STEPS[currentStep]}</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed font-medium">
              Reviewing your symptoms against evidence-based medical guidelines, common condition patterns, and primary body systems.
            </p>

            {/* Step Sequence Checklist */}
            <div className="flex flex-col gap-2.5 w-full bg-slate-50/70 rounded-2xl p-4 border border-border/80 shadow-2xs">
              {ANALYSIS_STEPS.map((text, idx) => {
                const isCompleted = idx < currentStep || isFinished;
                const isCurrent = idx === currentStep && !isFinished;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-all duration-300 py-1.5 px-2 rounded-xl ${
                      isCompleted
                        ? 'opacity-85'
                        : isCurrent
                        ? 'opacity-100 bg-white shadow-2xs border border-teal-300/60 font-bold'
                        : 'opacity-40'
                    }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full shadow-2xs ${
                      isCompleted ? 'bg-emerald-50 text-emerald-600' : isCurrent ? 'bg-teal-50 text-teal-600' : 'bg-white'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" aria-hidden="true" />
                      ) : isCurrent ? (
                        prefersReducedMotion ? (
                          <div className="h-2 w-2 rounded-full bg-teal-600" aria-hidden="true" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 text-teal-600 animate-spin" aria-hidden="true" />
                        )
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                      )}
                    </div>

                    <span
                      className={`text-xs sm:text-[13px] ${
                        isCurrent
                          ? 'text-teal-800 font-bold font-display'
                          : isCompleted
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calming Trust Footnote */}
          <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              <span>Evidence-Based Medical Reference</span>
            </span>
            <span className="text-teal-700 font-medium">Educational Support</span>
          </div>
        </div>

        {/* Right Column: Clean, Elegant Biometric Health Visualizer */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50/60 via-teal-50/20 to-cyan-50/30">
          
          {/* Subtle Ambient Background Aura (Soft, Natural Gradient — No Harsh Lines) */}
          <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-teal-100/40 via-emerald-100/20 to-cyan-100/30 blur-2xl pointer-events-none" />

          {/* Central Circular Radiant Pod (Eliminates Odd Squircle Box) */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Soft Organic Circular Aperture with Two-Phase Clinical Animation */}
            <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white/95 backdrop-blur-sm border border-teal-100/90 shadow-md overflow-hidden">
              {/* Gentle Respiratory Halo Ring */}
              <div className={`absolute -inset-2 rounded-full border transition-all duration-700 pointer-events-none ${
                isReportPhase 
                  ? 'border-emerald-300/70 ring-4 ring-teal-100/40 animate-pulse' 
                  : 'border-teal-200/40 animate-pulse'
              }`} />
              
              {/* Phase 1: Search & Signal Scanner Animation (0s to ~5.4s) */}
              <video
                ref={searchVideoRef}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 m-auto w-32 h-32 sm:w-38 sm:h-38 object-contain pointer-events-none select-none transition-all duration-700 ease-in-out ${
                  isReportPhase && hasReportLoaded 
                    ? 'opacity-0 scale-90 pointer-events-none z-0' 
                    : 'opacity-100 scale-100 z-10'
                } [image-rendering:-webkit-optimize-contrast] [image-rendering:crisp-edges] contrast-[1.10] saturate-[1.08]`}
              >
                <source src="/assets/search_animation.webm" type="video/webm" />
                <source src="/assets/search%20(1).webm" type="video/webm" />
              </video>

              {/* Phase 2: Clinician Medical Report Preparation Animation (Last ~3s) */}
              <video
                ref={reportVideoRef}
                src="/assets/woman_preparing_medical_report.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => setHasReportLoaded(true)}
                onCanPlay={() => setHasReportLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none select-none transition-all duration-700 ease-in-out ${
                  isReportPhase 
                    ? 'opacity-100 scale-100 z-10' 
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                <source src="/assets/woman_preparing_medical_report.mp4" type="video/mp4" />
                <source src="/assets/Woman%20preparing%20medical%20report.mp4" type="video/mp4" />
                <source src="/assets/Woman preparing medical report.mp4" type="video/mp4" />
              </video>

              {/* Mini Phase Indicator Pill Floating at Base of Lens */}
              <div className="absolute bottom-2.5 z-20 pointer-events-none">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs transition-all duration-500 ${
                  isReportPhase
                    ? 'bg-emerald-600/90 text-white border border-emerald-400/50'
                    : 'bg-slate-900/70 text-teal-200 border border-teal-500/30'
                }`}>
                  {isReportPhase ? 'Preparing Report' : 'Evidence Scan'}
                </span>
              </div>
            </div>

            {/* Focused Clinical Status Badge & Explanation Below */}
            <div className="mt-6 flex flex-col items-center text-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50/90 text-teal-800 border border-teal-200/70 shadow-2xs font-display text-xs font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                <span>{STEP_SUBTITLES[currentStep] || 'Evaluating Symptoms'}</span>
              </div>

              <p className="text-xs sm:text-[13px] text-muted-foreground font-medium max-w-[280px] leading-relaxed">
                {STEP_EXPLANATIONS[currentStep] || 'Carefully organizing insights for your clinical summary'}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Reassuring Clinical Disclaimer Footer */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-muted-foreground font-medium">
        <span>Evidence-based clinical decision support &bull; Not a substitute for emergency medical care</span>
        <span className="font-display font-semibold text-foreground text-[10px]">
          Patient CDSS &copy; 2026
        </span>
      </div>
    </motion.div>
  );
}
