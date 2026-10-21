import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ShieldAlert,
  Droplet,
  Moon,
  ChevronDown,
  ChevronUp,
  Activity,
  Stethoscope,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { matchCommonConditions } from '../../services/commonConditionsMatcher';

export default function PatientResultsView({ analysisData, onAskMedAssist, onView3D }) {
  const [showSecondaryConditions, setShowSecondaryConditions] = useState(false);
  const [showFollowUpQuestions, setShowFollowUpQuestions] = useState(false);

  const {
    possibleConditions = [],
    storyline = {},
    bodyLocalization = {},
    rawInput = '',
    extractedSymptoms = [],
  } = analysisData;

  // Run the everyday common conditions layer
  const commonLayerResult = useMemo(() => {
    return matchCommonConditions(rawInput || storyline.patientOverview || '', extractedSymptoms);
  }, [rawInput, storyline.patientOverview, extractedSymptoms]);

  const {
    hasCommonMatch,
    primaryCandidate,
    matchedConditions,
    safetyAlerts,
    isUrgent,
    generalSafetySigns,
  } = commonLayerResult;

  // ML Baseline top condition (secondary/hospital classifier)
  const topMLCondition = possibleConditions[0] || {
    name: 'General Viral Syndrome',
    modelScore: 0.75,
    commonName: 'Viral Syndrome',
    explanation: 'A general viral illness presenting with systemic discomfort. Most improve with rest and fluids.',
  };

  const topMLScore = Math.round((topMLCondition.modelScore || 0.75) * 100);

  // Derive care guidance (prefer knowledge base if matched, fallback to storyline)
  const careGuidance = primaryCandidate?.routine_guidance_topics_for_review?.length
    ? primaryCandidate.routine_guidance_topics_for_review.map((topic, i) => ({
        title: typeof topic === 'string' ? topic : `Care step ${i + 1}`,
        desc: ''
      }))
    : storyline.homeRemedies && storyline.homeRemedies.length > 0
    ? storyline.homeRemedies.slice(0, 4)
    : [
        { title: 'Rest and stay hydrated', desc: 'Drink plenty of water, herbal teas, or warm broths throughout the day.' },
        { title: 'Supportive over-the-counter care', desc: 'Consult a pharmacist or doctor for approved fever or pain relief if needed.' },
        { title: 'Monitor temperature and symptoms', desc: 'Keep track of temperature changes and watch for new symptoms.' },
        { title: 'Seek medical advice if persisting', desc: 'If symptoms do not improve after 3 to 5 days, consult a physician.' },
      ];

  // Red flag warning signs
  const redFlags = primaryCandidate?.red_flags_or_escalation?.length
    ? primaryCandidate.red_flags_or_escalation
    : storyline.redFlags && storyline.redFlags.length > 0
    ? storyline.redFlags
    : [
        'Fever persists higher than 102°F (38.9°C) or lasts over 3 to 4 days',
        'Difficulty breathing, chest tightness, or severe shortness of breath',
        'Severe headache accompanied by neck stiffness or sudden confusion',
        'Inability to keep liquids down for more than 24 hours',
      ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4 bg-white/60">
      
      {/* 1. URGENT SAFETY ALERT (if triggered by safety rules) */}
      {isUrgent && (
        <div className="rounded-2xl p-4 bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-3 shadow-sm">
          <div className="h-8 w-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-bold text-sm text-rose-900">
              Important Safety Notice — Seek Prompt Medical Evaluation
            </h4>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Your reported symptoms include signs that require urgent clinical evaluation by a healthcare provider:
            </p>
            <ul className="mt-2 space-y-1">
              {safetyAlerts.map((alert, idx) => (
                <li key={idx} className="text-xs text-rose-900 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 flex-shrink-0" />
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. Top Completion Banner with Action Buttons */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-emerald-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-blue-600/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Symptom Evaluation Complete
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Everyday User Mode
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Reviewed against verified common everyday conditions with supportive care guidance and clinical safety checks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onAskMedAssist && (
            <button
              type="button"
              onClick={onAskMedAssist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold text-teal-800 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
              <span>Ask MedAssist</span>
            </button>
          )}
          {onView3D && (
            <button
              type="button"
              onClick={onView3D}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span>Explore 3D Body</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Main 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (6 cols): Primary Possibility & Knowledge Base Details */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* PRIMARY COMMON CONDITION CARD */}
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-display">
                  Primary Clinical Consideration
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  <Stethoscope className="h-3 w-3" />
                  Everyday Reference Layer
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
                {primaryCandidate ? primaryCandidate.display_name : topMLCondition.name}
              </h4>
              
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {primaryCandidate
                  ? primaryCandidate.plain_language
                  : (storyline.patientOverview || topMLCondition.explanation || 
                    `${topMLCondition.name} matches your symptom profile. Most common presentations resolve with rest and supportive care.`)}
              </p>

              {/* Matched symptoms tags from Knowledge Base */}
              {primaryCandidate?.matchedSymptoms && primaryCandidate.matchedSymptoms.length > 0 && (
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Matching symptoms identified:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {primaryCandidate.matchedSymptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* What NOT to assume advisory box */}
              {primaryCandidate?.do_not_assume && primaryCandidate.do_not_assume.length > 0 && (
                <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>Important: What not to assume</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-[11px] text-amber-800">
                    {primaryCandidate.do_not_assume.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Useful Follow-Up Questions (Collapsible Accordion) */}
            {primaryCandidate?.useful_follow_up_questions && primaryCandidate.useful_follow_up_questions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowUpQuestions(!showFollowUpQuestions)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer font-display"
                >
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
                    <span>Questions to consider for your doctor ({primaryCandidate.useful_follow_up_questions.length})</span>
                  </div>
                  {showFollowUpQuestions ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showFollowUpQuestions && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-2.5 space-y-1.5"
                    >
                      {primaryCandidate.useful_follow_up_questions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="font-bold text-teal-600 text-[10px] mt-0.5">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Reliable References */}
            {primaryCandidate?.references && primaryCandidate.references.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-600">Clinical References:</span>
                {primaryCandidate.references.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <span>{ref.title}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* SECONDARY & SPECIALIST CONSIDERATIONS (Collapsed so everyday users are not alarmed) */}
          <div className="rounded-2xl p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => setShowSecondaryConditions(!showSecondaryConditions)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 cursor-pointer font-display"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500" />
                <span>Secondary Clinical Considerations & Hospital Model Output ({possibleConditions.length})</span>
              </div>
              {showSecondaryConditions ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {showSecondaryConditions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-3 space-y-2"
                >
                  <p className="text-[11px] text-slate-500 leading-snug">
                    These are conditions assessed by the 49-pathology emergency classifier. They represent less common or specialist-level possibilities and are only relevant if red-flag symptoms develop or laboratory tests indicate:
                  </p>
                  {possibleConditions.slice(0, 4).map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{cond.name}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {cond.confidenceCategory || 'Specialist differential consideration'}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {Math.round((cond.modelScore || 0.3) * 100)}%
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column (6 cols): Routine Guidance + When to Consult Doctor */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* General Care Guidance Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
              <h4 className="font-display font-bold text-sm text-slate-900">
                General Care & Supportive Guidance
              </h4>
            </div>

            <div className="space-y-3">
              {careGuidance.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200/60 font-bold text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    {item.desc && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* When to Consult a Doctor - Prominent Red Callout Box */}
          <div className="rounded-2xl p-4 sm:p-5 bg-rose-50/70 border border-rose-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-rose-800">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <h4 className="font-display font-bold text-sm">
                When to Consult a Healthcare Professional?
              </h4>
            </div>
            <p className="text-xs text-rose-700 mb-3 leading-relaxed">
              Please contact a licensed medical professional or urgent care immediately if you experience:
            </p>

            <ul className="space-y-1.5">
              {redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                  <span>{typeof flag === 'string' ? flag : flag.symptom || flag.name || flag.desc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Gentle Clinical Disclaimer Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <span>
          This clinical decision support layer provides educational guidance and is not a formal medical diagnosis. Always consult a qualified physician for individualized care.
        </span>
      </div>
    </div>
  );
}
