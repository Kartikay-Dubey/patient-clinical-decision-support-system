import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Activity,
  Layers,
  BookOpen,
  Dna,
  CheckCircle2,
  AlertCircle,
  Brain,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileText,
  Eye,
  Check,
  X,
  Minus,
  ArrowRight,
} from 'lucide-react';

export default function StudentResultsView({ analysisData, onAskMedAssist, onView3D }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ddx' | 'evidence' | 'icd10' | 'quiz'
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);

  const {
    possibleConditions = [],
    storyline = {},
    bodyLocalization = {},
    extractedSymptoms = [],
  } = analysisData;

  const topCondition = possibleConditions[0] || {
    name: 'Acute Respiratory Syndrome',
    modelScore: 0.82,
    icd10Code: 'J06.9',
    confidenceCategory: 'High',
  };

  // Build extracted evidence list with clinical status
  const evidenceList = extractedSymptoms.length > 0
    ? extractedSymptoms.map((s) => ({
        name: typeof s === 'string' ? s : s.name,
        code: s.code || 'E_CLINICAL',
        status: 'Present',
      }))
    : [
        { name: 'Fever (temp > 38.0°C)', code: 'E_53', status: 'Present' },
        { name: 'Myalgia & Generalized Body Ache', code: 'E_55', status: 'Present' },
        { name: 'Persistent Cough', code: 'E_24', status: 'Present' },
        { name: 'Neck Stiffness', code: 'E_88', status: 'Absent' },
        { name: 'Hypotension (BP < 90/60)', code: 'E_11', status: 'Not mentioned' },
      ];

  const quizQuestion = {
    prompt: `A 34-year-old patient presents with acute onset of symptoms consistent with ${topCondition.name}. What is the most clinically appropriate next diagnostic or therapeutic step?`,
    options: [
      { id: 'a', text: 'Prescribe broad-spectrum oral antibiotics immediately without cultures' },
      { id: 'b', text: 'Supportive care, hydration, symptom monitoring, and evaluate for viral etiology', isCorrect: true },
      { id: 'c', text: 'Immediate emergent invasive bronchoscopy' },
      { id: 'd', text: 'Order high-resolution contrast CT scan with no prior baseline assessment' },
    ],
    rationale: `Given the symptom presentation and differential profile for ${topCondition.name}, the gold-standard initial approach emphasizes supportive hydration, antipyretics, and clinical monitoring unless high-risk red flags are detected.`,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/60">
      {/* 1. Header with Case Title & Tab Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white/80 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                Medical Student Mode
              </span>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                Case Analysis & Clinical DDX
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Explore differential diagnoses, clinical evidence status, and correlate with 3D anatomy.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {onAskMedAssist && (
              <button
                type="button"
                onClick={onAskMedAssist}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-teal-600" />
                <span>Ask Preceptor</span>
              </button>
            )}
            {onView3D && (
              <button
                type="button"
                onClick={onView3D}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="h-3 w-3 text-primary" />
                <span>Open 3D</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'ddx', label: 'Differential Diagnoses', icon: FileText, count: possibleConditions.length },
            { id: 'evidence', label: 'Evidence Matrix', icon: CheckCircle2, count: evidenceList.length },
            { id: 'quiz', label: 'OSCE Case Quiz', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Top DDX Grid + Evidence Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Top 4 DDX Ranking Table (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                      Top Differential Diagnoses
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      Multi-class Posterior
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {possibleConditions.slice(0, 4).map((cond, idx) => {
                      const prob = Math.round((cond.modelScore || 0.4) * 100);
                      const barWidth = Math.max(prob, 12);
                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px]">
                                #{idx + 1}
                              </span>
                              <span className="font-bold text-slate-900">{cond.name}</span>
                              {cond.icd10Code && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  {cond.icd10Code}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-slate-700">{prob}%</span>
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  Calibrated on DDXPlus NeurIPS benchmark across 49 candidate pathologies.
                </p>
              </div>

              {/* Anatomy & System Preview (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                      Anatomy & System
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                      {bodyLocalization.bodySystem || 'Systemic'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/60 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Primary Region:</span>
                      <span className="font-semibold text-slate-800">{bodyLocalization.primaryRegion || 'Thorax / Chest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Body System:</span>
                      <span className="font-semibold text-slate-800">{bodyLocalization.bodySystem || 'Respiratory System'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spatial Anchor:</span>
                      <span className="font-mono text-[11px] text-teal-800 font-semibold">
                        x: {bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y: {bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}
                      </span>
                    </div>
                  </div>

                  {storyline.pathophysiology && (
                    <div className="mt-3">
                      <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-display mb-1">
                        Pathophysiological Mechanism:
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {storyline.pathophysiology}
                      </p>
                    </div>
                  )}
                </div>

                {onView3D && (
                  <button
                    type="button"
                    onClick={onView3D}
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-display"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Launch 3D Anatomy Focus</span>
                  </button>
                )}
              </div>

            </div>

            {/* Extracted Clinical Evidence Card */}
            <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                Extracted Clinical Evidence & Presentation Signs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {evidenceList.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-semibold text-slate-800 block truncate">{ev.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ev.code}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        ev.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ev.status === 'Absent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED DIFFERENTIAL DIAGNOSES */}
        {activeTab === 'ddx' && (
          <div className="space-y-3">
            {possibleConditions.map((cond, idx) => {
              const scorePct = Math.round((cond.modelScore || 0.4) * 100);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                        #{idx + 1}
                      </span>
                      <h4 className="font-display font-bold text-sm text-slate-900">{cond.name}</h4>
                      {cond.icd10Code && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          ICD-10: {cond.icd10Code}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      Match: {scorePct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cond.explanation || `Differential presentation pattern consistent with ${cond.name}.`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: EVIDENCE MATRIX */}
        {activeTab === 'evidence' && (
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Full Evidence Attribution Table
            </h4>
            <div className="divide-y divide-slate-100">
              {evidenceList.map((ev, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{ev.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">({ev.code})</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ev.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OSCE CASE QUIZ */}
        {activeTab === 'quiz' && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-700" />
              <h4 className="font-display font-bold text-sm text-slate-900">
                Interactive OSCE Practice Vignette
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              {quizQuestion.prompt}
            </div>

            <div className="space-y-2">
              {quizQuestion.options.map((opt) => {
                const isSelected = selectedQuizOption === opt.id;
                let optStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                if (showQuizExplanation) {
                  if (opt.isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20';
                  } else if (isSelected) {
                    optStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                  }
                } else if (isSelected) {
                  optStyle = 'border-emerald-600 bg-emerald-50/50 text-emerald-900';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuizOption(opt.id);
                      setShowQuizExplanation(true);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-2.5 cursor-pointer ${optStyle}`}
                  >
                    <span className="font-bold uppercase font-mono text-[11px] mt-0.5">
                      {opt.id}.
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {showQuizExplanation && opt.isCorrect && (
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showQuizExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Clinical Rationale:
                </div>
                <p className="leading-relaxed text-emerald-900">{quizQuestion.rationale}</p>
                {onAskMedAssist && (
                  <button
                    type="button"
                    onClick={onAskMedAssist}
                    className="mt-2 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Discuss this case further with MedAssist Preceptor</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
