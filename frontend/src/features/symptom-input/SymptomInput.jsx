import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  FlaskConical,
  Loader2,
  Sparkles,
  Clock,
  HelpCircle,
  Stethoscope,
  Layers,
  AlertTriangle,
  Home,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { MOCK_CLINICAL_PRESETS } from '../../mock/clinicalData';
import WaveGraphic from '../../components/WaveGraphic';

const MAX_CHARS = 1000;

export default function SymptomInput({ onAnalyze, isLoading }) {
  const [rawText, setRawText] = useState(MOCK_CLINICAL_PRESETS[0].rawSymptoms);
  const [tags, setTags] = useState(['Persistent Cough', 'Throat Irritation']);
  const [newTagInput, setNewTagInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const charCount = rawText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = !rawText.trim() && tags.length === 0;

  // Auto-expand textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, [rawText]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 w-full max-w-4xl mx-auto"
    >
      {/* ── Master Sculptural Consultation Console ────────────────── */}
      <div className="master-console">
        
        {/* Console Top Hardware Status Bar */}
        <div className="console-topbar px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-foreground font-display">
              Clinical Consultation System
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span className="text-primary font-bold">01 Describe</span>
            <span>·</span>
            <span>02 3D Localize</span>
            <span>·</span>
            <span>03 Care Plan</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Console Body Content */}
        <div className="p-6 sm:p-10 relative z-10">
          
          {/* Header Title */}
          <div className="flex flex-col gap-2 mb-7">
            <div className="inline-flex items-center gap-1.5 self-start px-3.5 py-1 rounded-full bg-accent text-accent-foreground border border-primary/20 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Interactive Patient Intake</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
              What symptoms are you experiencing?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Describe your discomfort in everyday language. The clinical engine will translate your words into 3D anatomical localizations and tailored home care guidance.
            </p>
          </div>

          {/* Quick Scenario Chips (Pebble Pills) */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider font-display">
                Example Clinical Consultations
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {MOCK_CLINICAL_PRESETS.map((preset) => {
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="
                      text-xs px-4 py-2 rounded-full font-semibold border shadow-xs
                      bg-white hover:bg-accent border-border hover:border-primary/40 text-foreground
                      transition-all duration-150 cursor-pointer flex items-center gap-1.5
                    "
                  >
                    <span className="text-[10px] text-primary font-bold">[{preset.category}]</span>
                    {preset.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Symptom Textarea */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="symptom-text"
                className="text-xs font-bold text-foreground flex items-center justify-between"
              >
                <span>Describe your feelings (e.g., "I have a cough from the last few days...")</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Shift + Enter for new line
                </span>
              </label>

              <div
                className={`
                  relative rounded-3xl border transition-all duration-200 bg-white
                  ${isFocused
                    ? 'border-primary ring-4 ring-primary/20 bg-white shadow-sm'
                    : 'border-border hover:border-primary/40'
                  }
                  ${isOverLimit ? 'border-red-400 ring-2 ring-red-100' : ''}
                `}
              >
                <textarea
                  ref={textareaRef}
                  id="symptom-text"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. I have had a cough for the last few days, throat irritation, and a tickle when I breathe..."
                  aria-label="Describe your symptoms"
                  aria-describedby="symptom-char-count"
                  className="
                    w-full bg-transparent rounded-3xl
                    px-5 pt-4 pb-8
                    text-sm sm:text-base text-foreground leading-relaxed font-medium
                    placeholder:text-muted-foreground/60
                    focus:outline-none
                    resize-none overflow-hidden
                    transition-colors duration-150
                    min-h-[135px]
                  "
                  style={{ caretColor: 'var(--primary)' }}
                />

                {/* Character count */}
                <div
                  id="symptom-char-count"
                  aria-live="polite"
                  className={`
                    absolute bottom-3 right-4 text-[11px] font-mono tabular-nums
                    transition-colors duration-150 font-semibold
                    ${isOverLimit
                      ? 'text-red-500 font-bold'
                      : charCount > MAX_CHARS * 0.85
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                    }
                  `}
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

            {/* Detected Symptom Indicators */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider font-display">
                  Extracted Clinical Key Tags
                </p>
                {tags.length > 0 && (
                  <span className="text-xs font-semibold text-primary">
                    {tags.length} detected
                  </span>
                )}
              </div>

              <div
                className={`
                  flex flex-wrap items-center gap-2 p-3.5
                  rounded-2xl border border-border
                  bg-white min-h-[52px]
                  transition-all duration-150
                  ${tags.length === 0 ? 'border-dashed bg-muted/40' : ''}
                `}
              >
                {tags.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Indicators will appear automatically as you type symptoms above.
                  </span>
                )}

                <AnimatePresence>
                  {tags.map((tag) => (
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      key={tag}
                      className="
                        inline-flex items-center gap-1.5
                        px-3.5 py-1.5 rounded-full
                        text-xs font-semibold
                        bg-accent text-accent-foreground
                        border border-border shadow-xs
                        transition-all duration-150
                      "
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"
                        aria-hidden="true"
                      />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove ${tag}`}
                        className="
                          ml-0.5 rounded-full p-0.5
                          text-primary hover:text-destructive
                          hover:bg-destructive/10
                          transition-colors duration-150 cursor-pointer
                        "
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                {/* Inline add input */}
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
                  className="
                    bg-transparent text-xs text-foreground font-medium
                    placeholder:text-muted-foreground/60
                    focus:outline-none
                    min-w-[150px] flex-1 px-1
                  "
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              id="analyze-symptoms-btn"
              type="submit"
              disabled={isLoading || isEmpty || isOverLimit}
              aria-busy={isLoading}
              className="
                relative w-full py-4 px-7
                rounded-full
                font-bold text-sm sm:text-base font-display
                flex items-center justify-center gap-3
                transition-all duration-200
                cursor-pointer
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                disabled:opacity-40 disabled:cursor-not-allowed
                group
                bg-primary
                shadow-lg shadow-primary/25
                hover:shadow-xl hover:shadow-primary/35 hover:brightness-105
                text-primary-foreground
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-primary-foreground/80" />
                  <span>Running Clinical Localization & Evaluation…</span>
                </>
              ) : (
                <>
                  <FlaskConical className="h-5 w-5 text-primary-foreground/80" />
                  <span>Analyze Symptoms, Map 3D Body & Get Care Plan</span>
                  <ArrowRight
                    className="
                      h-5 w-5 ml-auto text-primary-foreground/80
                      group-hover:translate-x-1.5
                      transition-transform duration-200
                    "
                  />
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Evidence-based decision support for patient consultations. Not a formal diagnosis substitute.</span>
            </div>
          </form>
        </div>

        {/* Integrated Flowing Wave Landscape Accent */}
        <WaveGraphic height={90} opacity={0.45} />
      </div>

      {/* ── 3 Organic Pebble Value Cards ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ y: -3 }}
          className="sculptural-card p-5 flex flex-col gap-2.5"
        >
          <div className="pebble-dial h-10 w-10 flex items-center justify-center text-primary bg-accent">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-sm text-foreground font-display">3D Anatomy Auto-Focus</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Smoothly zooms and centers on affected organs (lungs, stomach, brain, heart, joints) during evaluation.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="sculptural-card p-5 flex flex-col gap-2.5"
        >
          <div className="pebble-dial h-10 w-10 flex items-center justify-center text-primary bg-accent">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-sm text-foreground font-display">Why It Happens & Home Care</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Explains underlying root causes, safe home remedies, and what precautions to take.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="sculptural-card p-5 flex flex-col gap-2.5"
        >
          <div className="pebble-dial h-10 w-10 flex items-center justify-center text-destructive bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="font-bold text-sm text-foreground font-display">Warning Red Flags</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Clear triage guidance identifying when self-care is safe vs. when immediate doctor care is required.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}


