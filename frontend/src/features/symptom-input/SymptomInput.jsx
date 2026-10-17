import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  ArrowRight,
  FlaskConical,
  Loader2,
  Sparkles,
  Clock,
  HelpCircle,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Scan,
} from 'lucide-react';
import { MOCK_CLINICAL_PRESETS } from '../../mock/clinicalData';
import WaveGraphic from '../../components/WaveGraphic';
import AnatomyPulse from '../../components/landing/AnatomyPulse';
import HealthLibrary from '../../components/HealthLibrary';
import { usePersona } from '../../context/PersonaContext';

const MAX_CHARS = 1000;

const PERSONA_PROCESS_STEPS = {
  patient: [
    { n: '01', label: 'Describe', hint: 'Everyday words' },
    { n: '02', label: 'Localize', hint: '3D anatomy focus' },
    { n: '03', label: 'Guide', hint: 'Safe care & next steps' },
  ],
  student: [
    { n: '01', label: 'Vignette', hint: 'History & clinical signs' },
    { n: '02', label: 'Patho-Anatomy', hint: '3D organ correlation' },
    { n: '03', label: 'OSCE Drill', hint: 'DDX & practice quiz' },
  ],
  technician: [
    { n: '01', label: 'Telemetry', hint: 'Tokenized symptom vectors' },
    { n: '02', label: 'Spatial Matrix', hint: '3D coordinate mapping' },
    { n: '03', label: 'SOAP Triage', hint: 'ESI & posterior export' },
  ],
};

const PERSONA_PRESETS = {
  patient: [
    { id: 'p1', label: 'Fever & Body Pain', rawSymptoms: 'I have mild fever from last 3 days and body pain, feeling warm and tired', category: 'Fever', tags: ['Fever', 'Body pain', 'Fatigue'] },
    { id: 'p2', label: 'Stomach Pain After Eating', rawSymptoms: 'I have stomach pain and burning after eating meals with acid reflux', category: 'Stomach', tags: ['Stomach pain', 'Acid reflux'] },
    { id: 'p3', label: 'Breathless on Stairs', rawSymptoms: 'I feel breathless while climbing stairs and have a mild dry cough', category: 'Breathing', tags: ['Breathlessness', 'Cough'] },
    { id: 'p4', label: 'Frequent Headaches', rawSymptoms: 'I get headache frequently behind my forehead and eyes with sensitivity to light', category: 'Headache', tags: ['Headache', 'Photophobia'] },
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

export default function SymptomInput({ onAnalyze, isLoading, errorMessage = null, onClearError = () => {}, externalText = '' }) {
  const { persona, personaConfig } = usePersona();
  const currentPresets = PERSONA_PRESETS[persona] || PERSONA_PRESETS.patient;
  const processSteps = PERSONA_PROCESS_STEPS[persona] || PERSONA_PROCESS_STEPS.patient;

  const [rawText, setRawText] = useState('');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
    if (reduceMotion) return undefined;
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length);
    }, 2600);
    return () => clearInterval(id);
  }, [reduceMotion, processSteps.length]);

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

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSelectPreset = (preset) => {
    setUserTouched(true);
    setRawText(preset.rawSymptoms);
    if (preset.tags && preset.tags.length > 0) {
      setTags(preset.tags);
    } else if (preset.response?.extractedSymptoms) {
      setTags(preset.response.extractedSymptoms.map((s) => s.name));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isLoading) return;
    onAnalyze({
      rawSymptoms: rawText,
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
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
        };

  const personaHeadlines = {
    patient: {
      tag: 'Clinical intake · Everyday User',
      h1: 'Describe symptoms.',
      h1Grad: 'See the body, get a care path.',
      desc: 'Everyday language is enough. We map your words to 3D anatomy, ranked possible conditions, and home-care guidance.',
      consoleTitle: 'Patient intake console',
      consoleBadge: 'Guided consultation',
      queryTitle: 'What symptoms are you experiencing?',
      queryDesc: 'Include onset, location, and how it feels — that helps the model.',
      inputPlaceholder: 'e.g. I have had a cough for the last few days, throat irritation, and a tickle when I breathe...',
      btnLabel: 'Analyze Symptoms & Map 3D Body',
    },
    student: {
      tag: 'Academic OSCE · Medical Student',
      h1: 'Clinical vignettes & cases.',
      h1Grad: 'Connect pathology to 3D anatomy.',
      desc: 'Input patient anamnesis, practice your differential diagnosis (DDX), study ICD-10 codings, and solve clinical quiz vignettes.',
      consoleTitle: 'Academic medical simulator',
      consoleBadge: 'Interactive OSCE training',
      queryTitle: 'Enter clinical presentation or chief complaint',
      queryDesc: 'Include vital signs, duration, radiation, and pertinent physical examination findings.',
      inputPlaceholder: 'e.g. 45yo male presents with acute substernal chest discomfort radiating to left jaw, diaphoresis, dyspnea on exertion...',
      btnLabel: 'Evaluate Differential & 3D Anatomy',
    },
    technician: {
      tag: 'High-Density Review · Clinical Reviewer',
      h1: 'Telemetry & vector intake.',
      h1Grad: 'Calibrate confidence & SOAP audit.',
      desc: 'Multi-label symptom tokenization, 3D anatomical coordinate anchors, ESI triage grading, and one-click structured SOAP export.',
      consoleTitle: 'Clinical data reviewer console',
      consoleBadge: 'High-density telemetry',
      queryTitle: 'Input unstructured tokens or clinical narrative',
      queryDesc: 'System tokenizes clinical indicators, computes logit distribution, and pins anatomical coordinates.',
      inputPlaceholder: 'e.g. cough, fever >38.5C, purulent sputum, pleuritic chest pain, tachypnea, crackles right lower lobe...',
      btnLabel: 'Execute Spatial Telemetry & Triage Matrix',
    },
  };

  const currentPersonaInfo = personaHeadlines[persona] || personaHeadlines.patient;

  return (
    <div className="w-full max-w-[1480px] mx-auto flex-1 flex flex-col justify-center min-h-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch min-h-0">
        <motion.aside className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3 justify-between min-h-0" {...fadeUp(0.04)}>
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-white/85 border border-primary/15 shadow-subtle text-[11px] font-semibold text-foreground">
            <Stethoscope className="h-3 w-3 text-primary" />
            {currentPersonaInfo.tag}
            <span className="h-1 w-1 rounded-full bg-primary/40" />
            <span className="text-muted-foreground font-medium">Non-diagnostic</span>
          </div>

          <div>
            <h2 className="font-display text-[1.35rem] sm:text-[1.65rem] font-semibold text-foreground tracking-tight leading-[1.18]">
              {currentPersonaInfo.h1}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600">
                {currentPersonaInfo.h1Grad}
              </span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {currentPersonaInfo.desc}
            </p>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <span className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-teal-400 via-cyan-300 to-sky-200" />
            {processSteps.map((step, i) => (
              <motion.button
                type="button"
                key={step.n}
                onClick={() => setActiveStep(i)}
                className={`relative pl-8 pr-2.5 py-1.5 rounded-xl text-left border transition-colors ${
                  activeStep === i
                    ? 'bg-white border-primary/25 shadow-subtle'
                    : 'bg-white/50 border-transparent hover:bg-white/80'
                }`}
                animate={activeStep === i && !reduceMotion ? { x: [0, 2, 0] } : undefined}
                transition={{ duration: 0.45 }}
              >
                <span
                  className={`absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 ${
                    activeStep === i ? 'border-teal-500 bg-teal-400' : 'border-teal-300 bg-white'
                  }`}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold font-display text-foreground">
                    {step.n} · {step.label}
                  </span>
                  {activeStep === i && <CheckCircle2 className="h-3 w-3 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{step.hint}</p>
              </motion.button>
            ))}
          </div>

          <div className="flex-1 flex min-h-0">
            <AnatomyPulse />
          </div>
        </motion.aside>

        <motion.section className="lg:col-span-7 flex min-h-0" {...fadeUp(0.1)}>
          <div className="master-console overflow-hidden flex flex-col w-full h-full justify-between">
            <div className="console-topbar px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <span className="text-xs font-semibold text-foreground font-display">
                  {currentPersonaInfo.consoleTitle}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                {currentPersonaInfo.consoleBadge}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 relative z-10 flex-1 flex flex-col justify-between min-h-0">
              <div className="mb-2">
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground tracking-tight">
                  {currentPersonaInfo.queryTitle}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  {currentPersonaInfo.queryDesc}
                </p>
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-wider font-display">
                    {persona === 'patient' ? 'Try everyday scenarios' : persona === 'student' ? 'OSCE Clinical Vignettes' : 'Clinical Telemetry Vectors'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentPresets.map((preset) => (
                    <motion.button
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium border bg-white hover:bg-accent border-border hover:border-primary/35 text-foreground transition-colors duration-150 cursor-pointer flex items-center gap-1"
                    >
                      <span className="text-[9px] text-primary font-bold">[{preset.category}]</span>
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold">Input Notice:</span> {errorMessage}
                  </div>
                  <button
                    type="button"
                    onClick={onClearError}
                    className="text-destructive/70 hover:text-destructive text-xs font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 flex-1 justify-between min-h-0">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="symptom-text"
                    className="text-[11px] font-bold text-foreground flex items-center justify-between gap-2"
                  >
                    <span>{persona === 'patient' ? 'Describe how you feel' : persona === 'student' ? 'Clinical Presentation / Anamnesis' : 'Telemetry Input / Symptom Tokens'}</span>
                    <span className="text-[10px] font-normal text-muted-foreground hidden sm:inline">
                      Shift + Enter for a new line
                    </span>
                  </label>

                  <div
                    className={`
                      relative rounded-xl border transition-all duration-200 bg-white min-h-[96px] h-[96px]
                      ${isFocused
                        ? 'border-primary ring-3 ring-primary/15 bg-white shadow-xs'
                        : 'border-border hover:border-primary/40'
                      }
                      ${isOverLimit ? 'border-red-400 ring-2 ring-red-100' : ''}
                    `}
                  >
                    {showTypewriter && (
                      <div
                        className="absolute inset-0 px-3.5 pt-2.5 pb-6 pointer-events-none text-xs sm:text-sm leading-relaxed font-medium text-muted-foreground/85"
                        aria-hidden="true"
                      >
                        <span className="inline-flex mb-1 rounded-full bg-accent text-primary text-[9px] font-bold px-1.5 py-0.5 font-display">
                          {currentPresets[exampleIndex % currentPresets.length]?.category} example
                        </span>
                        <p className="mt-1">
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
                      className="absolute inset-0 w-full h-full bg-transparent rounded-xl px-3.5 pt-2.5 pb-6 text-xs sm:text-sm text-foreground leading-relaxed font-medium placeholder:text-muted-foreground/60 focus:outline-none resize-none overflow-y-auto"
                      style={{ caretColor: 'var(--primary)' }}
                    />

                    <div
                      id="symptom-char-count"
                      aria-live="polite"
                      className={`absolute bottom-1.5 right-2.5 text-[10px] font-mono tabular-nums font-semibold z-10 ${
                        isOverLimit
                          ? 'text-red-500 font-bold'
                          : charCount > MAX_CHARS * 0.85
                          ? 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {charCount} / {MAX_CHARS}
                    </div>
                  </div>

                  {isOverLimit && (
                    <p className="text-xs text-red-500 font-medium" role="alert">
                      Description exceeds the limit. Please shorten it before analyzing.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wider font-display">
                      Clinical key tags
                    </p>
                    {tags.length > 0 && (
                      <span className="text-[10px] font-semibold text-primary">{tags.length} detected</span>
                    )}
                  </div>

                  <div
                    className={`flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border bg-white min-h-[36px] ${
                      tags.length === 0 ? 'border-dashed bg-muted/40' : ''
                    }`}
                  >
                    {tags.length === 0 && (
                      <span className="text-[11px] text-muted-foreground italic">
                        Indicators will appear automatically as you type symptoms above.
                      </span>
                    )}

                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.span
                          initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={reduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent text-accent-foreground border border-border shadow-xs"
                        >
                          <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove ${tag}`}
                            className="ml-0.5 rounded-full p-0.5 text-primary hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>

                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder={tags.length === 0 ? 'Type an indicator & press Enter' : 'Add custom indicator…'}
                      aria-label="Add symptom indicator"
                      className="bg-transparent text-[11px] text-foreground font-medium placeholder:text-muted-foreground/60 focus:outline-none min-w-[130px] flex-1 px-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 pt-0.5">
                  <motion.button
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    id="analyze-symptoms-btn"
                    type="submit"
                    disabled={isLoading || isEmpty || isOverLimit}
                    aria-busy={isLoading}
                    className="relative w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-bold text-xs sm:text-sm font-display flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed group bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-cyan-600/25 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white/80 flex-shrink-0" />
                        <span className="truncate">Running Clinical Localization…</span>
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-4 w-4 text-white/90 flex-shrink-0" />
                        <span className="truncate">{currentPersonaInfo.btnLabel}</span>
                        <ArrowRight className="h-4 w-4 ml-auto text-white/90 group-hover:translate-x-1.5 transition-transform duration-200 flex-shrink-0" />
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <HelpCircle className="h-3 w-3 text-primary flex-shrink-0" />
                    <span>Evidence-based support. Not a formal diagnosis substitute.</span>
                  </div>
                </div>
              </form>
            </div>

            <WaveGraphic height={24} opacity={0.35} />
          </div>
        </motion.section>
      </div>

      <HealthLibrary
        onSelectPrompt={(text) => {
          setUserTouched(true);
          setRawText(text);
        }}
      />
    </div>
  );
}
