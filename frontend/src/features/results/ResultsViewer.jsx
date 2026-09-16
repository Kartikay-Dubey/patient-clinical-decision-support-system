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
import ResultsPanelFill from '../../components/landing/ResultsPanelFill';

export default function ResultsViewer({ analysisData, isLoading, className = '' }) {
  const [activeTab, setActiveTab] = useState('conditions'); // 'conditions' | 'remedies' | 'why' | 'precautions'
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
        return <Coffee className="h-4 w-4 text-primary" />;
      case 'cloud':
        return <CloudRain className="h-4 w-4 text-primary" />;
      case 'droplet':
        return <Droplet className="h-4 w-4 text-primary" />;
      case 'moon':
        return <Moon className="h-4 w-4 text-primary" />;
      case 'pill':
        return <Pill className="h-4 w-4 text-primary" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className={`master-console flex flex-col h-full overflow-hidden ${className}`}>
      
      {/* ── Navigation Tabs Topbar (Possibilities First) ─────────────────── */}
      <div className="console-topbar p-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-shrink-0">
        {[
          { id: 'conditions', label: 'Conditions', count: possibleConditions.length, icon: Activity },
          { id: 'remedies', label: 'Remedies', icon: Home },
          { id: 'why', label: 'Why it happens', icon: HelpCircle },
          { id: 'precautions', label: 'Red flags', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-2 rounded-xl transition-all cursor-pointer font-display ${
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
              }`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {tab.label}
                {tab.count != null ? ` (${tab.count})` : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ResultsPanelFill />
        <div className="relative z-10 p-4 sm:p-5 h-full overflow-y-auto">
        
        {/* TAB 1: HOME REMEDIES & SELF-CARE */}
        {activeTab === 'remedies' && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground font-display flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span>Recommended Safe Home Remedies</span>
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
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
                    className="sculptural-card p-3.5 flex items-start gap-3.5 bg-white/90"
                  >
                    <div className="pebble-dial h-9 w-9 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                      {renderRemedyIcon(remedy.icon)}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-foreground font-display mb-0.5">
                        {remedy.title}
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {remedy.instructions}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
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
            <div className="border-b border-border pb-2.5">
              <h4 className="text-sm sm:text-base font-bold text-foreground font-display flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span>Why This Happens (Underlying Mechanisms)</span>
              </h4>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Simplified clinical explanation of physiological triggers in your body
              </p>
            </div>

            {storyline?.whyItHappens && storyline.whyItHappens.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {storyline.whyItHappens.map((cause, idx) => (
                  <div
                    key={idx}
                    className="sculptural-card p-3.5 flex items-start gap-3 bg-white/90"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-display">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                      {cause}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
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
              <h4 className="text-xs sm:text-sm font-bold text-foreground font-display mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Precautions To Take Right Now</span>
              </h4>
              <div className="flex flex-col gap-2">
                {storyline?.precautions?.map((prec, idx) => (
                  <div
                    key={idx}
                    className="bg-accent/40 rounded-xl p-3 border border-border text-xs text-foreground font-medium flex items-start gap-2.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <span>{prec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Red Flags */}
            {storyline?.redFlags && storyline.redFlags.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-destructive font-bold text-xs font-display">
                  <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span>Urgent Red Flags (Seek Immediate Medical Care If Experienced):</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-destructive font-medium pl-1">
                  {storyline.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
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
            <div className="flex items-end justify-between gap-2 pb-2">
              <div>
                <h4 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Ranked possible conditions</span>
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Ordered by clinical pattern match
                </p>
              </div>
              <span className="text-[11px] font-semibold text-foreground bg-white/80 px-2.5 py-0.5 rounded-full border border-border">
                {possibleConditions.length} candidates
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
                        ? 'bg-white/95 border-primary/60 shadow-md ring-2 ring-primary/20 p-3.5'
                        : 'bg-white/90 border-border hover:border-primary/40 p-3'
                      }
                    `}
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <div className="text-xs font-bold text-primary pt-0.5 w-5 font-display">
                        #{String(index + 1).padStart(2, '0')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-foreground truncate font-display">
                            {item.name}
                          </h5>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-mono border border-border">
                              {scorePercent}%
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            item.confidenceCategory === 'High'
                              ? 'bg-accent text-accent-foreground border border-primary/30'
                              : item.confidenceCategory === 'Moderate'
                              ? 'bg-muted text-foreground border border-border'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {item.confidenceCategory} Match
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
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
                          className="pl-8 mt-2.5 pt-2.5 border-t border-border flex flex-col gap-2"
                        >
                          <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                            {item.description}
                          </p>

                          {item.supportingSymptoms && item.supportingSymptoms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[10px] uppercase tracking-wider text-primary font-bold mr-1 font-display">
                                Matching Symptoms:
                              </span>
                              {item.supportingSymptoms.map((sym) => (
                                <span
                                  key={sym}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-accent-foreground border border-border"
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
    </div>
  );
}
