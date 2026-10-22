import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Activity,
  FileText,
  Dna,
  BookOpen,
  Check,
  Copy,
  CheckCircle2,
  MapPin,
  Lightbulb,
  BookmarkCheck,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Info,
  ArrowRight,
} from 'lucide-react';
import { getStudentClinicalDetails } from '../../utils/studentClinicalKnowledge';

/**
 * StudentResultsView — Medical Student Academic Experience
 * Modern Clinical Slate & Sapphire Blue Theme
 * Clear, structured clinical reasoning (UpToDate & Osmosis style)
 */
export default function StudentResultsView({ analysisData, onView3D }) {
  const [activeTab, setActiveTab] = useState('ddx'); // 'ddx' | 'patho' | 'pearls' | 'quiz'
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
    name: 'Acute Condition',
    modelScore: 0.75,
    icd10Code: 'R69',
  };

  const topScore = Math.round((topCondition.modelScore || 0.75) * 100);
  const targetOrganName = bodyLocalization.targetOrgan || bodyLocalization.primaryRegion || 'Target Viscera';

  // Fetch dynamic, organ-specific clinical details (relevant to GERD, Sinus, Chest, etc.)
  const clinical = getStudentClinicalDetails(topCondition.name, bodyLocalization);

  const probableDifferentials = possibleConditions.slice(0, 4);
  const alternativeDifferentials = possibleConditions.slice(4, 7);

  const handleCopyAcademicSummary = () => {
    const summaryText = `MEDICAL STUDENT CLINICAL CASE NOTE (H&P DIFFERENTIAL)
PATIENT ASSESSMENT: ${topCondition.name} (ICD-10: ${topCondition.icd10Code || 'N/A'})
POSTERIOR PROBABILITY: ${topScore}% | ANATOMICAL TARGET: ${targetOrganName} (${bodyLocalization.primaryRegion || 'General'})
SPATIAL VECTOR: [x=${bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y=${bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z=${bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]

1. CRITICAL CONDITIONS EXCLUDED:
${clinical.emergencyRuleOuts.map((r, i) => `  ${i + 1}. ${r.name}: ${r.exclusionCriteria}`).join('\n')}

2. RANKED DIFFERENTIAL DIAGNOSES:
${probableDifferentials.map((c, i) => `  ${i + 1}. ${c.name} (${Math.round((c.modelScore || 0.2) * 100)}%) — ICD-10: ${c.icd10Code || 'N/A'}`).join('\n')}

3. PATHOPHYSIOLOGY MECHANISM:
${clinical.pathophysiologySteps.map((s) => `• ${s.step}: ${s.detail}`).join('\n')}

4. HIGH-YIELD CLINICAL PEARLS:
${clinical.roundsPearls.map((p) => `• ${p.title}: ${p.body}`).join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      
      {/* 1. ACADEMIC HEADER (Clean Slate & Sapphire Blue Theme) */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-white flex-shrink-0 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 font-display">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Medical Student Learning Hub
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Primary Case: <strong className="text-slate-900">{topCondition.name}</strong> ({topScore}% Match)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Evidence-based differential ranking, organ-specific pathophysiology, and high-yield board exam pearls.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyAcademicSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            title="Copy structured ward case note"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copiedSummary ? 'Copied Case' : 'Copy Ward Note'}</span>
          </button>
        </div>

        {/* 3D Anatomical Target Strip */}
        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-slate-700 truncate">
              3D Anatomy Target: <strong className="text-slate-900">{targetOrganName}</strong> ({bodyLocalization.primaryRegion || 'Target'} Region)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
            <span className="text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
              System: {bodyLocalization.bodySystem || 'General'}
            </span>
            <span className="text-slate-700 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
              Coords: [{bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, {bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, {bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]
            </span>
            {onView3D && (
              <button
                type="button"
                onClick={onView3D}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs font-sans shadow-2xs transition-all cursor-pointer"
              >
                <span>3D Atlas</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Clean Navigation Tabs (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ddx', label: 'Differential List (DDx)', icon: FileText, count: possibleConditions.length },
            { id: 'patho', label: 'Disease Mechanism', icon: Dna },
            { id: 'pearls', label: 'High-Yield Pearls', icon: Lightbulb },
            { id: 'quiz', label: 'OSCE Case Question', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${active ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN ACADEMIC WORKSPACE */}
      <div className="p-3.5 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4 bg-slate-50/60">

        {/* TAB 1: DIFFERENTIAL LIST (DDX) */}
        {activeTab === 'ddx' && (
          <div className="space-y-4">
            
            {/* Critical Conditions to Rule Out First */}
            <div className="rounded-2xl bg-white border border-rose-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold font-display uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Critical Conditions to Rule Out First</span>
                </div>
                <span className="text-[10px] font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 font-semibold">
                  Emergency Checklist
                </span>
              </div>

              <div className="divide-y divide-rose-100">
                {clinical.emergencyRuleOuts.map((item, idx) => (
                  <div key={idx} className="p-3.5 space-y-1 bg-white hover:bg-rose-50/30 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-950 text-sm">{item.name}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 leading-relaxed pt-0.5">
                      <strong>How to Rule Out:</strong> {item.exclusionCriteria}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Differential Diagnoses */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider font-display text-[11px]">
                  Primary Differential Diagnoses (Ranked Matches)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Bayesian Clinical Match
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {probableDifferentials.map((cond, idx) => {
                  const prob = Math.round((cond.modelScore || 0.3) * 100);
                  const isTop = idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 space-y-2 transition-colors ${
                        isTop ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            isTop ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{cond.name}</span>
                          {cond.icd10Code && (
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              ICD-10: {cond.icd10Code}
                            </span>
                          )}
                          {isTop && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-display">
                              Leading Differential
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="w-24 bg-slate-100 border border-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTop ? 'bg-blue-600' : 'bg-slate-400'
                              }`}
                              style={{ width: `${prob}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {prob}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cond.explanation || `Clinical presentation consistent with reported ${targetOrganName} symptoms. Review key differentiating features during clinical interview.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alternative Considerations */}
            {alternativeDifferentials.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-3.5 space-y-2">
                <span className="font-bold text-slate-800 text-xs block font-display">
                  Alternative Considerations to Keep on Differential
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {alternativeDifferentials.map((cond, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800 block truncate">{cond.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Score: {Math.round((cond.modelScore || 0.1) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DISEASE MECHANISM (PATHOPHYSIOLOGY) */}
        {activeTab === 'patho' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Dna className="h-4 w-4 text-blue-600" />
                <h4 className="font-display font-bold text-sm">
                  Pathophysiology Mechanism: {topCondition.name}
                </h4>
              </div>

              {/* Step-by-Step Pathophysiological Chain */}
              <div className="space-y-3">
                {clinical.pathophysiologySteps.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-xs text-blue-900 block font-display">{item.step}</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-700 block font-semibold">Anatomical Target</span>
                  <span className="font-semibold text-slate-900">{targetOrganName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-700 block font-semibold">Primary Body System</span>
                  <span className="font-semibold text-slate-900">{bodyLocalization.bodySystem || 'General'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HIGH-YIELD PEARLS & PERTINENT NEGATIVES */}
        {activeTab === 'pearls' && (
          <div className="space-y-4">
            
            {/* Rounds Clinical Pearls */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <h4 className="font-display font-bold text-sm">
                  High-Yield Clinical Pearls for Rounds & Exams
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                {clinical.roundsPearls.map((pearl, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 leading-relaxed text-amber-950">
                    <span className="font-bold text-amber-900 block mb-0.5">{pearl.title}:</span>
                    {pearl.body}
                  </div>
                ))}
              </div>
            </div>

            {/* Pertinent Negatives Matrix */}
            <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="font-display font-bold text-sm">
                  Pertinent Negatives (Ruling Out Complications)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {clinical.pertinentNegatives.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      {item.sign}
                    </span>
                    <p className="text-[11px] text-slate-600">{item.clinicalValue}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: OSCE PRACTICE VIGNETTE */}
        {activeTab === 'quiz' && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h4 className="font-display font-bold text-sm">
                OSCE Clinical Practice Vignette
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              {clinical.vignette.prompt}
            </div>

            <div className="space-y-2">
              {clinical.vignette.options.map((opt) => {
                const isSelected = selectedQuizOption === opt.id;
                let optStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                if (showQuizExplanation) {
                  if (opt.isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
                  } else if (isSelected) {
                    optStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                  }
                } else if (isSelected) {
                  optStyle = 'border-blue-500 bg-blue-50 text-blue-900';
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
                    <span className="font-bold uppercase font-mono text-[11px] mt-0.5 text-slate-500">
                      {opt.id}.
                    </span>
                    <span className="flex-1 leading-snug">{opt.text}</span>
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
                className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800 space-y-1.5"
              >
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <BookmarkCheck className="h-3.5 w-3.5 text-blue-600" />
                  Preceptor Clinical Rationale:
                </div>
                <p className="leading-relaxed text-slate-700">{clinical.vignette.rationale}</p>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
