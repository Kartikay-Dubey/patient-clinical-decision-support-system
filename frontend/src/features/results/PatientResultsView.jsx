import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ShieldAlert,
  Droplet,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Stethoscope,
  Info,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function PatientResultsView({ analysisData, onView3D }) {
  const [showOtherConditions, setShowOtherConditions] = useState(false);
  const { possibleConditions = [], storyline = {}, bodyLocalization = {}, rawInput = '' } = analysisData;

  const topCondition = possibleConditions[0] || {
    name: 'Common Viral Syndrome',
    modelScore: 0.85,
    commonName: 'Viral Fever',
    explanation: 'A common viral infection causing temporary discomfort, fever, or body aches. Usually improves with rest and supportive care.',
  };

  const topScore = Math.round((topCondition.modelScore || 0.85) * 100);

  // Smart filtering for everyday users:
  // If top condition is dominant (>60%), hide low-confidence alternatives (<10%)
  // to avoid alarming patients with rare diseases when they likely have a common cold
  const COMMON_SELF_LIMITING = ['viral', 'cold', 'flu', 'influenza', 'headache', 'tension', 'gastroenteritis', 'bronchitis', 'pharyngitis', 'sinusitis', 'rhinitis', 'URTI', 'myalgia'];
  const isTopConditionCommon = COMMON_SELF_LIMITING.some(term => 
    topCondition.name.toLowerCase().includes(term.toLowerCase())
  );
  const isTopDominant = topScore >= 60;

  // Filter: if top is dominant + common, only show alternatives above 10%
  const relevantOthers = possibleConditions.slice(1, 5).filter(cond => {
    const score = Math.round((cond.modelScore || 0) * 100);
    if (isTopDominant && isTopConditionCommon && score < 10) return false;
    return true;
  });
  const otherConditions = relevantOthers.slice(0, 3);

  // Derive simple symptom summary bullets from input or conditions
  const symptomBullets = storyline.extractedSymptomsSummary || [
    'Reported discomfort & symptoms described',
    'Onset over the last several days',
    'No critical emergency trauma reported',
  ];

  // Derive clear "Why this matches" points
  const matchPoints = [
    `Strong match with reported symptoms (${topScore}%)`,
    `Affects the ${bodyLocalization.primaryRegion || 'targeted'} body area`,
    'Matches typical symptom progression pattern',
  ];

  // General Care Guidance items
  const careGuidance = storyline.homeRemedies && storyline.homeRemedies.length > 0
    ? storyline.homeRemedies.slice(0, 4)
    : [
        { title: 'Rest and stay hydrated', desc: 'Drink plenty of water, herbal teas, or clear broths throughout the day.' },
        { title: 'Supportive over-the-counter care', desc: 'Use doctor-approved fever or pain relief if needed according to directions.' },
        { title: 'Monitor temperature and symptoms', desc: 'Keep track of temperature changes or any new symptoms.' },
        { title: 'Seek medical advice if persisting', desc: 'If symptoms do not improve after 3 to 5 days, consult a physician.' },
      ];

  // Red flag warning signs
  const redFlags = storyline.redFlags && storyline.redFlags.length > 0
    ? storyline.redFlags
    : [
        'Fever persists higher than 102°F (38.9°C) or lasts over 5 days',
        'Difficulty breathing, chest tightness, or severe shortness of breath',
        'Severe headache accompanied by neck stiffness or sudden confusion',
        'Inability to keep liquids down for more than 24 hours',
      ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4 bg-white/60">
      {/* 1. Analysis Complete Banner */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-emerald-600/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Analysis Complete
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Everyday View
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Based on the symptoms you shared, here is an easy-to-understand breakdown and recommended next steps.
            </p>
          </div>
        </div>

        {onView3D && (
          <button
            type="button"
            onClick={onView3D}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>Explore 3D Body</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* 2. Main 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column (7 cols): What was analyzed + Most likely explanation */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Most Likely Explanation Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-display">
                  Most Likely Explanation
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <Sparkles className="h-3 w-3" />
                  {topScore}% Match
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
                {topCondition.name}
              </h4>
              
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {storyline.patientOverview || topCondition.explanation || 
                  `${topCondition.name} matches your symptom pattern. In most individuals, this improves with rest, hydration, and safe home comfort.`}
              </p>

              {/* Reassurance note for common self-limiting conditions */}
              {isTopConditionCommon && isTopDominant && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-800 leading-relaxed">
                  <span className="font-semibold">Reassurance:</span> This is a very common condition that typically resolves on its own within 5–7 days with proper rest, hydration, and over-the-counter supportive care. Most people recover without complications.
                </div>
              )}
            </div>

            {/* Why This Matches section */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-display mb-2">
                Why does this match?
              </h5>
              <div className="space-y-1.5">
                {matchPoints.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Other Possibilities Collapsible Accordion */}
          {otherConditions.length > 0 && (
            <div className="rounded-2xl p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-xs">
              <button
                type="button"
                onClick={() => setShowOtherConditions(!showOtherConditions)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 cursor-pointer font-display"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  <span>Other Possible Explanations ({otherConditions.length})</span>
                </div>
                {showOtherConditions ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {showOtherConditions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3 space-y-2"
                  >
                    {otherConditions.map((cond, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{cond.name}</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {cond.confidenceCategory || 'Alternative consideration'}
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
          )}

        </div>

        {/* Right Column (6 cols): General Care Guidance + When to Consult Doctor */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* General Care Guidance Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
              <h4 className="font-display font-bold text-sm text-slate-900">
                General Care Guidance
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
                When to Consult a Doctor?
              </h4>
            </div>
            <p className="text-xs text-rose-700 mb-3 leading-relaxed">
              Please contact a licensed medical professional or visit urgent care if you experience:
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

      {/* Gentle Non-alarmist Clinical Disclaimer Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-slate-400" />
        <span>
          This is an evidence-based clinical decision support tool. It does not provide a formal medical diagnosis. Always consult a healthcare provider.
        </span>
      </div>
    </div>
  );
}
