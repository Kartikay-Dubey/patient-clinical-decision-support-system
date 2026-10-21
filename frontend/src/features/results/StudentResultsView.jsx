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
  ExternalLink,
  HelpCircle,
  FileText,
  Eye,
  Check,
  X,
  Minus,
  ArrowRight,
  Copy,
  Lightbulb,
  MessageSquare,
  BookmarkCheck,
} from 'lucide-react';

export default function StudentResultsView({ analysisData, onAskMedAssist, onView3D }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ddx' | 'patho' | 'evidence' | 'quiz'
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const {
    possibleConditions = [],
    storyline = {},
    bodyLocalization = {},
    extractedSymptoms = [],
  } = analysisData;

  const topCondition = possibleConditions[0] || {
    name: 'Acute Respiratory Condition',
    modelScore: 0.82,
    icd10Code: 'J06.9',
    confidenceCategory: 'High',
  };

  // Build extracted evidence list with clinical status
  const evidenceList = extractedSymptoms.length > 0
    ? extractedSymptoms.map((s) => ({
        name: typeof s === 'string' ? s : (s.name || s.label),
        code: s.code || 'E_CLINICAL',
        status: 'Present',
      }))
    : [
        { name: 'Fever (temp > 38.0°C)', code: 'E_53', status: 'Present' },
        { name: 'Generalized Myalgia & Body Ache', code: 'E_55', status: 'Present' },
        { name: 'Productive Cough', code: 'E_24', status: 'Present' },
        { name: 'Nuchal Rigidity (Neck Stiffness)', code: 'E_88', status: 'Absent (Pertinent Negative)' },
        { name: 'Hypotension (SBP < 90 mmHg)', code: 'E_11', status: 'Absent (Pertinent Negative)' },
      ];

  // Clinical pearls curated for medical students
  const clinicalPearls = [
    {
      title: 'Pertinent Negatives in DDX',
      text: 'Always document the absence of red flags (e.g., absence of neck stiffness in headache, absence of radiating pain in chest discomfort) to rule out high-acuity surgical or neurological emergencies.'
    },
    {
      title: 'Gold Standard Workup Rule',
      text: `For ${topCondition.name}, confirm baseline vitals, complete blood count (CBC), and targeted imaging before initiating empiric pharmacotherapy.`
    },
    {
      title: 'Anatomical Correlation Principle',
      text: `Correlate visual findings on the 3D atlas with the ${bodyLocalization.bodySystem || 'target system'} to verify local vs referred symptom radiation pathways.`
    }
  ];

  const quizQuestion = {
    prompt: `A patient presents with acute symptom progression consistent with ${topCondition.name} (${topCondition.icd10Code || 'Primary differential'}). Which of the following is the most clinically appropriate next diagnostic or initial management step?`,
    options: [
      { id: 'a', text: 'Prescribe empiric broad-spectrum oral antibiotics immediately without obtaining cultures or confirming bacterial etiology' },
      { id: 'b', text: 'Initiate supportive hydration, symptomatic antipyresis, close clinical monitoring, and targeted etiologic workup', isCorrect: true },
      { id: 'c', text: 'Perform immediate emergent diagnostic exploratory laparotomy' },
      { id: 'd', text: 'Order high-resolution contrast CT scan with no prior baseline assessment or renal function evaluation' },
    ],
    rationale: `Given the symptom presentation and clinical differential for ${topCondition.name}, the recommended evidence-based standard of care emphasizes supportive hydration, hemodynamic stability assessment, and symptom control while awaiting targeted microbiological or laboratory confirmation.`,
  };

  const handleCopyAcademicSummary = () => {
    const summaryText = `ACADEMIC CLINICAL CASE SUMMARY (MEDICAL STUDENT DDX)
Condition: ${topCondition.name} (ICD-10: ${topCondition.icd10Code || 'N/A'})
Confidence: ${(topCondition.modelScore * 100).toFixed(1)}%
Primary Region: ${bodyLocalization.primaryRegion || 'General'}
System: ${bodyLocalization.bodySystem || 'Systemic'}
Spatial Anchor: [x=${bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y=${bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z=${bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]

DIFFERENTIAL DIAGNOSES:
${possibleConditions.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} (${(c.modelScore * 100).toFixed(1)}%) — ICD-10: ${c.icd10Code || 'N/A'}`).join('\n')}

EXTRACTED CLINICAL EVIDENCE:
${evidenceList.map(e => `• [${e.status}] ${e.name} (${e.code})`).join('\n')}

PATHOPHYSIOLOGY NOTE:
${storyline.pathophysiology || 'Inflammatory / Infectious cascade impacting target organ microvasculature and regional tissues.'}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/60">
      {/* 1. Header with Title & Action Buttons */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white/80 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                Medical Student Mode
              </span>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                Clinical DDX & Pathophysiology Analysis
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Differential diagnosis rankings, ICD-10 codings, pathophysiology mechanisms, and OSCE vignettes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleCopyAcademicSummary}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy Case Summary"
            >
              {copiedSummary ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSummary ? 'Copied' : 'Copy Case'}</span>
            </button>

            {onAskMedAssist && (
              <button
                type="button"
                onClick={onAskMedAssist}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 text-teal-600" />
                <span>Ask Preceptor</span>
              </button>
            )}

            {onView3D && (
              <button
                type="button"
                onClick={onView3D}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Eye className="h-3 w-3" />
                <span>3D Anatomy</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'ddx', label: 'Differential Diagnoses', icon: FileText, count: possibleConditions.length },
            { id: 'patho', label: 'Pathophysiology & Pearls', icon: Dna },
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
                      Ranked Differential Diagnoses
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      Multi-class Calibrated DDX
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
                                <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
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
                  Calibrated on DDXPlus benchmark across 49 candidate pathologies.
                </p>
              </div>

              {/* Anatomy & System Preview (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                      Anatomy & Spatial System
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
                      <span className="text-slate-500">3D Reticle Anchor:</span>
                      <span className="font-mono text-[11px] text-teal-800 font-semibold">
                        x: {bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y: {bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z: {bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}
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
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-display"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Focus Organ in 3D Anatomy Atlas</span>
                  </button>
                )}
              </div>

            </div>

            {/* Extracted Clinical Evidence Card */}
            <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
                Extracted Clinical Evidence & Pertinent Findings
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
                        ev.status.includes('Present')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ev.status.includes('Absent')
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
                      Posterior: {scorePct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cond.explanation || `Differential presentation pattern consistent with ${cond.name}. Consider risk factor exposure and clinical duration.`}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Clinical Acuity: <strong className="text-slate-700">{cond.confidenceCategory || 'Standard'}</strong></span>
                    {onAskMedAssist && (
                      <button
                        type="button"
                        onClick={onAskMedAssist}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Analyze this condition with Preceptor</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PATHOPHYSIOLOGY & HIGH-YIELD CLINICAL PEARLS */}
        {activeTab === 'patho' && (
          <div className="space-y-4">
            {/* Pathophysiology Deep Dive */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Dna className="h-4 w-4 text-emerald-700" />
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Mechanisms of Disease: {topCondition.name}
                </h4>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  {storyline.pathophysiology || 
                    `The clinical manifestation of ${topCondition.name} involves immune-mediated or infectious cellular response causing local hyperemia, microvascular permeability, and cytokine release, triggering classic constitutional and organ-specific signs.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Affected Organ System</span>
                    <span className="font-semibold text-slate-800">{bodyLocalization.bodySystem || 'Systemic Circulation'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Target Anatomical Region</span>
                    <span className="font-semibold text-slate-800">{bodyLocalization.primaryRegion || 'Thoracic Viscera'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Yield Clinical Pearls */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <h4 className="font-display font-bold text-sm text-slate-900">
                  High-Yield Clinical Pearls (OSCE & Rounds)
                </h4>
              </div>

              <div className="space-y-2.5">
                {clinicalPearls.map((pearl, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">{pearl.title}</span>
                    <p className="text-amber-800 leading-relaxed">{pearl.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE MATRIX */}
        {activeTab === 'evidence' && (
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Complete Clinical Evidence & Pertinent Negatives Table
            </h4>
            <div className="divide-y divide-slate-100">
              {evidenceList.map((ev, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{ev.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">({ev.code})</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ev.status.includes('Present') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: OSCE CASE QUIZ */}
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
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Clinical Preceptor Rationale:
                </div>
                <p className="leading-relaxed text-emerald-900">{quizQuestion.rationale}</p>
                {onAskMedAssist && (
                  <button
                    type="button"
                    onClick={onAskMedAssist}
                    className="mt-2 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Discuss this case further with MedAssist Academic Preceptor</span>
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
