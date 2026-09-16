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
  Home,
  CheckCircle2,
  Scan,
  Lock,
  FileSearch,
} from 'lucide-react';
import { MOCK_CLINICAL_PRESETS } from '../../mock/clinicalData';
import WaveGraphic from '../../components/WaveGraphic';
import AnatomyPulse from '../../components/landing/AnatomyPulse';

const MAX_CHARS = 1000;
const TYPING_EXAMPLES = MOCK_CLINICAL_PRESETS.map((preset) => preset.rawSymptoms);

const PROCESS_STEPS = [
  { n: '01', label: 'Describe', hint: 'Everyday language' },
  { n: '02', label: 'Localize', hint: '3D anatomy focus' },
  { n: '03', label: 'Guide', hint: 'Care + red flags' },
];

const VALUE_ROWS = [
  {
    icon: Scan,
    title: '3D anatomy auto-focus',
    body: 'Zooms to lungs, heart, brain, joints, and more.',
    tone: 'primary',
  },
  {
    icon: Home,
    title: 'Why it happens & home care',
    body: 'Root-cause context and safe self-care steps.',
    tone: 'primary',
  },
  {
    icon: AlertTriangle,
    title: 'Warning red flags',
    body: 'When self-care is enough vs. when to seek care.',
    tone: 'alert',
  },
];

export default function SymptomInput({ onAnalyze, isLoading }) {
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

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PROCESS_STEPS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (!showTypewriter || reduceMotion) return undefined;
    const full = TYPING_EXAMPLES[exampleIndex] || '';
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
        setExampleIndex((i) => (i + 1) % TYPING_EXAMPLES.length);
        setTypePhase('typing');
      }, 280);
    }

    return () => clearTimeout(timer);
  }, [showTypewriter, reduceMotion, typePhase, typedExample, exampleIndex]);

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
    setTags(preset.response.extractedSymptoms.map((s) => s.name));
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

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1240px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <motion.aside className="lg:col-span-5 flex flex-col gap-4" {...fadeUp(0.04)}>
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/85 border border-primary/15 shadow-subtle text-xs font-semibold text-foreground">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            Clinical intake
            <span className="h-1 w-1 rounded-full bg-primary/40" />
            <span className="text-muted-foreground font-medium">Non-diagnostic</span>
          </div>

          <div>
            <h2 className="font-display text-[1.7rem] sm:text-[2.05rem] font-semibold text-foreground tracking-tight leading-[1.18]">
              Describe symptoms.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600">
                See the body, get a care path.
              </span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Everyday language is enough. We map your words to 3D anatomy, ranked possible conditions, and home-care guidance.
            </p>
          </div>

          <div className="relative flex flex-col gap-2">
            <span className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-teal-400 via-cyan-300 to-sky-200" />
            {PROCESS_STEPS.map((step, i) => (
              <motion.button
                type="button"
                key={step.n}
                onClick={() => setActiveStep(i)}
                className={`relative pl-9 pr-3 py-2 rounded-2xl text-left border transition-colors ${
                  activeStep === i
                    ? 'bg-white border-primary/25 shadow-subtle'
                    : 'bg-white/50 border-transparent hover:bg-white/80'
                }`}
                animate={activeStep === i && !reduceMotion ? { x: [0, 2, 0] } : undefined}
                transition={{ duration: 0.45 }}
              >
                <span
                  className={`absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 ${
                    activeStep === i ? 'border-teal-500 bg-teal-400' : 'border-teal-300 bg-white'
                  }`}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold font-display text-foreground">
                    {step.n} · {step.label}
                  </span>
                  {activeStep === i && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{step.hint}</p>
              </motion.button>
            ))}
          </div>

          <AnatomyPulse />
        </motion.aside>

        <motion.section className="lg:col-span-7 flex" {...fadeUp(0.1)}>
          <div className="master-console overflow-hidden flex flex-col w-full h-full">
            <div className="console-topbar px-5 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                </span>
                <span className="text-xs font-semibold text-foreground font-display">
                  Patient intake console
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Guided consultation
              </div>
            </div>

            <div className="p-5 sm:p-6 relative z-10 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="font-display text-xl sm:text-[1.45rem] font-semibold text-foreground tracking-tight">
                  What symptoms are you experiencing?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  Include onset, location, and how it feels — that helps the model.
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider font-display">
                    Try an example
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_CLINICAL_PRESETS.map((preset) => (
                    <motion.button
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold border bg-white hover:bg-accent border-border hover:border-primary/35 text-foreground transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="text-[10px] text-primary font-bold">[{preset.category}]</span>
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="symptom-text"
                    className="text-xs font-bold text-foreground flex items-center justify-between gap-2"
                  >
                    <span>Describe how you feel</span>
                    <span className="text-[11px] font-normal text-muted-foreground hidden sm:inline">
                      Shift + Enter for a new line
                    </span>
                  </label>

                  <div
                    className={`
                      relative rounded-2xl border transition-all duration-200 bg-white min-h-[150px] h-[150px]
                      ${isFocused
                        ? 'border-primary ring-4 ring-primary/15 bg-white shadow-sm'
                        : 'border-border hover:border-primary/40'
                      }
                      ${isOverLimit ? 'border-red-400 ring-2 ring-red-100' : ''}
                    `}
                  >
                    {showTypewriter && (
                      <div
                        className="absolute inset-0 px-4 pt-3.5 pb-8 pointer-events-none text-sm leading-relaxed font-medium text-muted-foreground/85"
                        aria-hidden="true"
                      >
                        <span className="inline-flex mb-2 rounded-full bg-accent text-primary text-[10px] font-bold px-2 py-0.5 font-display">
                          {MOCK_CLINICAL_PRESETS[exampleIndex]?.category} example
                        </span>
                        <p className="mt-2">
                          {reduceMotion ? TYPING_EXAMPLES[0] : typedExample}
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
                      placeholder={showTypewriter ? '' : 'e.g. I have had a cough for the last few days, throat irritation, and a tickle when I breathe...'}
                      aria-label="Describe your symptoms"
                      aria-describedby="symptom-char-count"
                      className="absolute inset-0 w-full h-full bg-transparent rounded-2xl px-4 pt-3.5 pb-8 text-sm text-foreground leading-relaxed font-medium placeholder:text-muted-foreground/60 focus:outline-none resize-none overflow-y-auto"
                      style={{ caretColor: 'var(--primary)' }}
                    />

                    <div
                      id="symptom-char-count"
                      aria-live="polite"
                      className={`absolute bottom-2.5 right-3.5 text-[11px] font-mono tabular-nums font-semibold z-10 ${
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

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider font-display">
                      Clinical key tags
                    </p>
                    {tags.length > 0 && (
                      <span className="text-xs font-semibold text-primary">{tags.length} detected</span>
                    )}
                  </div>

                  <div
                    className={`flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-border bg-white min-h-[48px] ${
                      tags.length === 0 ? 'border-dashed bg-muted/40' : ''
                    }`}
                  >
                    {tags.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-border shadow-xs"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            aria-label={`Remove ${tag}`}
                            className="ml-0.5 rounded-full p-0.5 text-primary hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
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
                      className="bg-transparent text-xs text-foreground font-medium placeholder:text-muted-foreground/60 focus:outline-none min-w-[150px] flex-1 px-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-shrink-0">
                  <motion.button
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    id="analyze-symptoms-btn"
                    type="submit"
                    disabled={isLoading || isEmpty || isOverLimit}
                    aria-busy={isLoading}
                    className="relative w-full py-3.5 px-6 rounded-full font-bold text-sm font-display flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed group bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-cyan-600/30 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                        <span>Running Clinical Localization & Evaluation…</span>
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-5 w-5 text-white/90" />
                        <span>Analyze Symptoms, Map 3D Body & Get Care Plan</span>
                        <ArrowRight className="h-5 w-5 ml-auto text-white/90 group-hover:translate-x-1.5 transition-transform duration-200" />
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <HelpCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span>Evidence-based support. Not a formal diagnosis substitute.</span>
                  </div>
                </div>
              </form>
            </div>

            <WaveGraphic height={64} opacity={0.5} />
          </div>
        </motion.section>
      </div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
        {...fadeUp(0.16)}
      >
        {[
          { icon: Lock, label: 'Private session', detail: 'No account required' },
          { icon: FileSearch, label: 'ICD-aligned', detail: 'Coded possible findings' },
          { icon: Scan, label: '3D localization', detail: 'Interactive body map' },
          { icon: AlertTriangle, label: 'Triage flags', detail: 'Know when to seek care' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-white/80 px-3 py-2.5"
            >
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold font-display text-foreground leading-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
