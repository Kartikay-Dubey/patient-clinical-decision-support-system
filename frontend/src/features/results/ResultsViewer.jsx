import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
  Home,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Coffee,
  CloudRain,
  Droplet,
  Moon,
  Pill,
  CheckCircle2,
} from 'lucide-react';

export default function ResultsViewer({ analysisData, isLoading }) {
  const [activeTab, setActiveTab] = useState('remedies'); // 'remedies' | 'why' | 'precautions' | 'conditions'
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading || !analysisData || !analysisData.possibleConditions) {
    return null;
  }

  const { possibleConditions, storyline } = analysisData;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Helper icon renderer for home remedies
  const renderRemedyIcon = (iconType) => {
    switch (iconType) {
      case 'tea':
        return <Coffee className="h-4 w-4 text-[#D97757]" />;
      case 'cloud':
        return <CloudRain className="h-4 w-4 text-[#8AAEA1]" />;
      case 'droplet':
        return <Droplet className="h-4 w-4 text-[#9BB2D4]" />;
      case 'moon':
        return <Moon className="h-4 w-4 text-[#D6B87E]" />;
      case 'pill':
        return <Pill className="h-4 w-4 text-[#D97757]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#D97757]" />;
    }
  };

  return (
    <div className="master-console flex flex-col">
      
      {/* ── Navigation Tabs Topbar ─────────────────────────────────── */}
      <div className="console-topbar p-2.5 sm:p-3 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap font-display ${
            activeTab === 'remedies'
              ? 'bg-[#D97757] text-white shadow-pill font-bold'
              : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home Remedies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('why')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap font-display ${
            activeTab === 'why'
              ? 'bg-[#D97757] text-white shadow-pill font-bold'
              : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Why It Happens</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('precautions')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap font-display ${
            activeTab === 'precautions'
              ? 'bg-[#D97757] text-white shadow-pill font-bold'
              : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Precautions & Red Flags</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conditions')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap font-display ${
            activeTab === 'conditions'
              ? 'bg-[#D97757] text-white shadow-pill font-bold'
              : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Possible ({possibleConditions.length})</span>
        </button>
      </div>

      {/* ── Tab Content Body ───────────────────────────────────── */}
      <div className="p-4 sm:p-5">
        
        {/* TAB 1: HOME REMEDIES & SELF-CARE */}
        {activeTab === 'remedies' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-2.5">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2D2623] font-display flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#D97757]" />
                  <span>Recommended Safe Home Remedies</span>
                </h4>
                <p className="text-[11px] text-[#5E524C] font-medium mt-0.5">
                  Evidence-based self-care steps for symptom relief while monitoring recovery
                </p>
              </div>
            </div>

            {storyline?.homeRemedies && storyline.homeRemedies.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {storyline.homeRemedies.map((remedy, idx) => (
                  <motion.div
                    whileHover={{ y: -1 }}
                    key={idx}
                    className="sculptural-card p-3.5 flex items-start gap-3.5"
                  >
                    <div className="pebble-dial h-9 w-9 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                      {renderRemedyIcon(remedy.icon)}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-[#2D2623] font-display mb-0.5">
                        {remedy.title}
                      </h5>
                      <p className="text-xs text-[#5E524C] leading-relaxed font-medium">
                        {remedy.instructions}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5E524C]">
                Rest in a comfortable position, stay hydrated, and consult a doctor if symptoms worsen.
              </p>
            )}
          </motion.div>
        )}

        {/* TAB 2: WHY IT HAPPENS */}
        {activeTab === 'why' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <div className="border-b border-[#EAE3D9] pb-2.5">
              <h4 className="text-sm sm:text-base font-bold text-[#2D2623] font-display flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#D97757]" />
                <span>Why This Happens (Underlying Mechanisms)</span>
              </h4>
              <p className="text-[11px] text-[#5E524C] font-medium mt-0.5">
                Simplified clinical explanation of physiological triggers in your body
              </p>
            </div>

            {storyline?.whyItHappens && storyline.whyItHappens.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {storyline.whyItHappens.map((cause, idx) => (
                  <div
                    key={idx}
                    className="sculptural-card p-3.5 flex items-start gap-3"
                  >
                    <div className="h-5 w-5 rounded-full bg-[#D97757] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-pill font-display">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-[#2D2623] leading-relaxed font-medium">
                      {cause}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5E524C]">
                Symptom triggers are linked to localized tissue irritation or inflammation.
              </p>
            )}
          </motion.div>
        )}

        {/* TAB 3: PRECAUTIONS & RED FLAGS */}
        {activeTab === 'precautions' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Precautions to take */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2D2623] font-display mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#3F6457]" />
                <span>Precautions To Take Right Now</span>
              </h4>
              <div className="flex flex-col gap-2">
                {storyline?.precautions?.map((prec, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FCFAF7] rounded-xl p-3 border border-[#EAE3D9] text-xs text-[#2D2623] font-medium flex items-start gap-2.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8AAEA1] flex-shrink-0 mt-1.5" />
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Red Flags */}
            {storyline?.redFlags && storyline.redFlags.length > 0 && (
              <div className="bg-[#FCEAE4] border border-[#F7D6CC] rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#8B2E1E] font-bold text-xs font-display">
                  <ShieldAlert className="h-4 w-4 text-[#D97757] flex-shrink-0" />
                  <span>Urgent Red Flags (Seek Immediate Medical Care If Experienced):</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-[#8B2E1E] font-medium pl-1">
                  {storyline.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#D97757] font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: POSSIBLE CONDITIONS */}
        {activeTab === 'conditions' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <div className="flex items-end justify-between border-b border-[#EAE3D9] pb-2.5">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2D2623] font-display flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#D97757]" />
                  <span>Ranked Differential Conditions</span>
                </h4>
                <p className="text-[11px] text-[#5E524C] font-medium mt-0.5">
                  Ordered by probability based on clinical pattern matching
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#5E524C] bg-[#FCFAF7] px-2.5 py-0.5 rounded-full border border-[#EAE3D9]">
                {possibleConditions.length} Candidates
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {possibleConditions.map((item, index) => {
                const scorePercent = Math.round(item.modelScore * 100);
                const isExpanded = expandedId === item.id || (expandedId === null && index === 0);

                return (
                  <div
                    key={item.id}
                    className={`
                      rounded-2xl transition-all duration-200 border
                      ${isExpanded
                        ? 'bg-white border-[#D97757]/60 shadow-subtle p-3.5'
                        : 'bg-[#FCFAF7] border-[#EAE3D9] hover:bg-white p-3'
                      }
                    `}
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <div className="text-xs font-bold text-[#D97757] pt-0.5 w-5 font-display">
                        #{String(index + 1).padStart(2, '0')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-[#2D2623] truncate font-display">
                            {item.name}
                          </h5>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F7D6CC] text-[#8B2E1E] font-mono">
                              {scorePercent}%
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#D97757]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#8E8078]" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            item.confidenceCategory === 'High'
                              ? 'bg-[#E5EFEA] text-[#2C4F43] border border-[#8AAEA1]/50'
                              : item.confidenceCategory === 'Moderate'
                              ? 'bg-[#F8F3E5] text-[#6E5421] border border-[#D6B87E]/50'
                              : 'bg-[#F5F1EB] text-[#5E524C] border border-[#EAE3D9]'
                          }`}>
                            {item.confidenceCategory} Match
                          </span>
                          <span className="text-[#DDD4C7]">·</span>
                          <span className="text-[10px] font-mono text-[#5E524C] font-semibold">
                            ICD-10: {item.icd10Code}
                          </span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-8 mt-2.5 pt-2.5 border-t border-[#EAE3D9] flex flex-col gap-2"
                        >
                          <p className="text-xs text-[#5E524C] leading-relaxed font-normal">
                            {item.description}
                          </p>

                          {item.supportingSymptoms && item.supportingSymptoms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[10px] uppercase tracking-wider text-[#D97757] font-bold mr-1 font-display">
                                Matching Symptoms:
                              </span>
                              {item.supportingSymptoms.map((sym) => (
                                <span
                                  key={sym}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5EFEA] text-[#2C4F43] border border-[#8AAEA1]/40"
                                >
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}



