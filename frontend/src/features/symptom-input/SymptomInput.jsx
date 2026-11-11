import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  ArrowRight,
  Loader2,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import HealthLibrary from '../../components/HealthLibrary';
import { usePersona } from '../../context/PersonaContext';

const MAX_CHARS = 1000;

const PERSONA_PRESETS = {
  patient: [
    { id: 'p1', label: 'Cough & Chest Soreness', rawSymptoms: 'I have a persistent chest cough with mucus, fever, and chest soreness', category: 'Lungs', tags: ['Persistent cough', 'Fever', 'Chest soreness'] },
    { id: 'p2', label: 'Sinus Pressure & Headache', rawSymptoms: 'I have facial pressure behind my forehead and eyes with a blocked nose and throbbing headache', category: 'Head', tags: ['Headache', 'Facial pressure', 'Congestion'] },
    { id: 'p3', label: 'Stomach Burning & Indigestion', rawSymptoms: 'I have a burning stomach ache and sour indigestion after eating with heartburn', category: 'Stomach', tags: ['Stomach ache', 'Indigestion', 'Heartburn'] },
    { id: 'p4', label: 'Shortness of Breath & Fatigue', rawSymptoms: 'I feel short of breath when walking or climbing stairs and feel very tired and weak', category: 'Breathing', tags: ['Shortness of breath', 'Fatigue', 'Weakness'] },
    { id: 'p5', label: 'Runny Nose & Sore Throat', rawSymptoms: 'I have a runny nose, continuous sneezing, a scratchy sore throat, and nasal congestion', category: 'Throat', tags: ['Runny nose', 'Sneezing', 'Sore throat'] },
    { id: 'p6', label: 'Shoulder Strain & Arm Weakness', rawSymptoms: 'I have severe shoulder pain radiating down my arm with joint stiffness when lifting', category: 'Shoulder', tags: ['Shoulder pain', 'Arm weakness', 'Stiffness'] },
  ],
  student: [
    { id: 's1', label: 'ACS Differential', rawSymptoms: 'Retrosternal crushing chest pain radiating to left jaw, diaphoresis, dyspnea on minimal exertion', category: 'Cardiology', tags: ['Substernal pain', 'Radiation', 'Diaphoresis'] },
    { id: 's2', label: 'Appendicitis Sign', rawSymptoms: 'Periumbilical pain migrating to right lower quadrant with anorexia, low-grade fever, rebound tenderness', category: 'Surgery', tags: ['RLQ pain', 'Rebound tenderness'] },
    { id: 's3', label: 'GERD Reflux Cascade', rawSymptoms: 'Severe epigastric pyrosis, acid regurgitation after meals, non-cardiac chest discomfort', category: 'GI Bed', tags: ['Pyrosis', 'Epigastric pain'] },
    { id: 's4', label: 'Migraine with Aura', rawSymptoms: 'Unilateral pulsatile hemicranial headache preceded by visual aura, photophobia, phonophobia', category: 'Neurology', tags: ['Hemicrania', 'Visual aura'] },
  ],
  technician: [
    { id: 't1', label: 'DDX: Pneumonia Vector', rawSymptoms: 'cough, high fever, dyspnea, pleuritic chest pain, tachypnea, purulent sputum', category: 'Resp Vector', tags: ['cough', 'fever', 'dyspnea', 'pleuritic'] },
    { id: 't2', label: 'DDX: GERD Vector', rawSymptoms: 'pyrosis, epigastric burning, acid regurgitation, dysphagia, postprandial discomfort', category: 'GI Vector', tags: ['pyrosis', 'regurgitation', 'dysphagia'] },
    { id: 't3', label: 'DDX: PE Vector', rawSymptoms: 'sudden onset dyspnea, pleuritic pain, calf swelling, tachycardia, hemoptysis', category: 'Vasc Vector', tags: ['dyspnea', 'pleuritic', 'tachycardia'] },
    { id: 't4', label: 'DDX: Cholecystitis', rawSymptoms: 'RUQ pain, Murphy positive, fever, nausea, pain radiating to right infrascapular', category: 'Biliary Vector', tags: ['RUQ pain', 'Murphy sign', 'fever'] },
  ],
};

export default function SymptomInput({ onAnalyze, isLoading, errorMessage = null, onClearError = () => { }, externalText = '' }) {
  const { persona, personaConfig } = usePersona();
  const currentPresets = PERSONA_PRESETS[persona] || PERSONA_PRESETS.patient;

  const [rawText, setRawText] = useState('');
  const [tags, setTags] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [typedExample, setTypedExample] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [typePhase, setTypePhase] = useState('typing');
  const textareaRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const charCount = rawText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = !rawText.trim() && tags.length === 0;
  const showTypewriter = !userTouched && !rawText && !isFocused;

  const typingExamples = currentPresets.map((p) => p.rawSymptoms);

  useEffect(() => {
    if (externalText) {
      setRawText(externalText);
      setUserTouched(true);
    }
  }, [externalText]);

  useEffect(() => {
    if (!showTypewriter || reduceMotion) return undefined;
    const full = typingExamples[exampleIndex % typingExamples.length] || '';
    let timer;

    if (typePhase === 'typing') {
      if (typedExample.length < full.length) {
        timer = setTimeout(() => {
          setTypedExample(full.slice(0, typedExample.length + 1));
        }, 22);
      } else {
        timer = setTimeout(() => setTypePhase('pause'), 1600);
      }
    } else if (typePhase === 'pause') {
      timer = setTimeout(() => setTypePhase('deleting'), 200);
    } else if (typedExample.length > 0) {
      timer = setTimeout(() => {
        setTypedExample(typedExample.slice(0, -2));
      }, 12);
    } else {
      timer = setTimeout(() => {
        setExampleIndex((i) => (i + 1) % typingExamples.length);
        setTypePhase('typing');
      }, 280);
    }

    return () => clearTimeout(timer);
  }, [showTypewriter, reduceMotion, typePhase, typedExample, exampleIndex, typingExamples]);

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSelectPreset = (preset) => {
    setUserTouched(true);
    setRawText(preset.rawSymptoms);
    setTags(preset.tags);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || isEmpty || isOverLimit) return;
    onAnalyze({
      rawSymptoms: rawText.trim(),
      structuredSymptoms: tags,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1 } }
      : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] },
      };

  const personaHeadlines = {
    patient: {
      heroTitle: "Describe how you're feeling.",
      heroSubtitle: "Tell us your symptoms in everyday words. We'll map them to 3D anatomy and suggest safe next steps.",
      inputPlaceholder: "e.g. I have a persistent cough for the past few days with throat irritation and chest tightness...",
      btnLabel: "Check My Symptoms",
      loadingLabel: "Checking symptoms…",
    },
    student: {
      heroTitle: "Clinical Vignette Simulator",
      heroSubtitle: "Enter patient anamnesis and presentation to evaluate differentials, ICD-10 coding, and 3D anatomy.",
      inputPlaceholder: "e.g. 45yo male presents with acute substernal chest discomfort radiating to left jaw, diaphoresis...",
      btnLabel: "Analyze Case",
      loadingLabel: "Evaluating case…",
    },
    technician: {
      heroTitle: "Telemetry & Vector Intake",
      heroSubtitle: "Multi-label symptom tokenization, 3D anatomical localization, and SOAP triage matrix.",
      inputPlaceholder: "e.g. cough, fever >38.5C, purulent sputum, pleuritic chest pain, tachypnea, crackles RLL...",
      btnLabel: "Run Triage Analysis",
      loadingLabel: "Computing telemetry…",
    },
  };

  const currentPersonaInfo = personaHeadlines[persona] || personaHeadlines.patient;

  return (
    <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center min-h-0 py-2 sm:py-4 px-2 sm:px-0">
      <motion.div className="flex flex-col w-full" {...fadeUp(0.02)}>
        {/* Warm, clean hero block */}
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
            {currentPersonaInfo.heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto leading-relaxed">
            {currentPersonaInfo.heroSubtitle}
          </p>
        </div>

        {/* Quick Scenario Pills Strip */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap pl-0.5">
            Try an example:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {currentPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs hover:border-teal-500/40 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Input Notice:</span> {errorMessage}
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-destructive/70 hover:text-destructive text-sm font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Input Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Textarea container */}
          <div className="relative rounded-xl border transition-all duration-200 bg-white min-h-[110px] sm:min-h-[125px]">
            {showTypewriter && (
              <div
                className="absolute inset-0 px-3.5 pt-3 pb-6 pointer-events-none text-xs sm:text-sm leading-relaxed font-medium text-muted-foreground/80"
                aria-hidden="true"
              >
                <p>
                  {reduceMotion ? typingExamples[0] : typedExample}
                  {!reduceMotion && <span className="typing-caret" />}
                </p>
              </div>
            )}
            <textarea
              ref={textareaRef}
              id="symptom-text"
              value={rawText}
              onChange={(e) => {
                setUserTouched(true);
                setRawText(e.target.value);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={showTypewriter ? '' : currentPersonaInfo.inputPlaceholder}
              aria-label="Describe your symptoms"
              aria-describedby="symptom-char-count"
              className="w-full h-full min-h-[110px] sm:min-h-[125px] bg-transparent rounded-xl px-3.5 pt-3 pb-6 text-xs sm:text-sm text-foreground leading-relaxed font-medium placeholder:text-muted-foreground/50 focus:outline-none resize-none"
              style={{ caretColor: 'var(--primary)' }}
            />

            {charCount > 0 && (
              <div
                id="symptom-char-count"
                aria-live="polite"
                className={`absolute bottom-2 right-3 text-[10px] font-mono tabular-nums font-semibold ${
                  isOverLimit
                    ? 'text-red-500 font-bold'
                    : charCount > MAX_CHARS * 0.85
                    ? 'text-amber-600'
                    : 'text-muted-foreground/70'
                }`}
              >
                {charCount} / {MAX_CHARS}
              </div>
            )}
          </div>

          {isOverLimit && (
            <p className="text-xs text-red-500 font-medium" role="alert">
              Description exceeds the limit. Please shorten it before analyzing.
            </p>
          )}

          {/* Auto-detected tags pill list */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Auto-detected:
              </span>
              <AnimatePresence>
                {tags.map((tag) => (
                  <motion.span
                    key={tag}
                    initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/60"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col gap-2 pt-1">
            <motion.button
              whileHover={reduceMotion ? undefined : { scale: 1.005 }}
              whileTap={reduceMotion ? undefined : { scale: 0.995 }}
              id="analyze-symptoms-btn"
              type="submit"
              disabled={isLoading || isEmpty || isOverLimit}
              aria-busy={isLoading}
              className="relative w-full py-3 px-5 rounded-xl font-bold text-sm font-display flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed group bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-cyan-600/25 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white/90 flex-shrink-0" />
                  <span>{currentPersonaInfo.loadingLabel}</span>
                </>
              ) : (
                <>
                  <span>{currentPersonaInfo.btnLabel}</span>
                  <ArrowRight className="h-4 w-4 text-white/90 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80 mt-0.5">
              <HelpCircle className="h-3 w-3 text-teal-600 flex-shrink-0" />
              <span>Evidence-based clinical decision support. Not a substitute for medical advice.</span>
            </div>
          </div>
        </form>

        {/* Collapsible Health Library reference */}
        <details className="mt-4 sm:mt-5 text-center group">
          <summary className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors py-1 px-3 rounded-lg hover:bg-slate-100 select-none">
            <span>Explore Health Library & Common Symptoms</span>
          </summary>
          <div className="mt-3 text-left">
            <HealthLibrary
              onSelectPrompt={(text) => {
                setUserTouched(true);
                setRawText(text);
              }}
            />
          </div>
        </details>
      </motion.div>
    </div>
  );
}
