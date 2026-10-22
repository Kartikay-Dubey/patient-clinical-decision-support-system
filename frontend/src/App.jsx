import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import LandingBackdrop from './components/landing/LandingBackdrop';
import SymptomInput from './features/symptom-input/SymptomInput';
import AnalysisStatus from './features/analysis/AnalysisStatus';
import BodyViewer from './features/body-viewer/BodyViewer';
import ResultsViewer from './features/results/ResultsViewer';
import ScoreGauge from './components/ScoreGauge';
import { analyzeSymptoms } from './services/apiService';
import { normalizeSymptomText } from './services/symptomNormalizer';
import { Activity, Stethoscope, Clock, FileText } from 'lucide-react';
import { Show } from '@clerk/react';
import AuthPage from './features/auth/AuthPage';
import ClinicalChatbot from './components/chat/ClinicalChatbot';
import ChatbotFab from './components/chat/ChatbotFab';
import ExperienceSelector from './components/ExperienceSelector';
import { usePersona } from './context/PersonaContext';

export default function App() {
  const { persona, hasChosenPersona, showExperiencePicker, setShowExperiencePicker } = usePersona();
  const [appState, setAppState] = useState('input'); // 'input' | 'analyzing' | 'results'
  const [mobileTab, setMobileTab] = useState('report'); // 'report' | 'anatomy'
  const [analysisData, setAnalysisData] = useState(null);
  const [activeRegion, setActiveRegion] = useState('All');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInputSuggestion, setAssistantInputSuggestion] = useState('');
  const [pendingResult, setPendingResult] = useState(null);
  const pendingResultRef = useRef(null);

  const handleAnalyze = async (payload) => {
    setAppState('analyzing');
    setAnalysisData(null);
    setActiveRegion(null); // Neutral presentation until region step completes
    setErrorMessage(null);
    setPendingResult(null);
    pendingResultRef.current = null;

    try {
      // AI pre-processing: normalize colloquial text → medical terminology
      const { normalized, wasNormalized } = await normalizeSymptomText(payload.rawSymptoms);
      if (wasNormalized) {
        console.log('[CDSS] AI normalized input:', normalized);
      }
      const enrichedPayload = {
        ...payload,
        rawSymptoms: wasNormalized ? `${normalized}\n\n[Original: ${payload.rawSymptoms}]` : payload.rawSymptoms,
      };

      const result = await analyzeSymptoms(enrichedPayload);
      pendingResultRef.current = result;
      setPendingResult(result);
      if (result.bodyLocalization?.primaryRegion) {
        setActiveRegion(result.bodyLocalization.primaryRegion);
      }
    } catch (err) {
      console.error('Model analysis failure:', err);
      setErrorMessage(
        err.message || 'Unable to identify recognized clinical evidence from your input. Please try describing specific symptoms (e.g. chest pain, cough, fever, nausea).'
      );
      setAppState('input');
    }
  };

  const handleStepChange = (stepIndex) => {
    // Step 2 = "Identifying the primary affected region" (0-indexed: step 2 is 3rd step)
    const current = pendingResultRef.current || pendingResult;
    if (stepIndex >= 2 && current?.bodyLocalization?.primaryRegion) {
      setActiveRegion(current.bodyLocalization.primaryRegion);
    }
  };

  const handleAnalysisComplete = () => {
    const resultToUse = pendingResultRef.current || pendingResult;
    if (resultToUse) {
      setAnalysisData(resultToUse);
      if (resultToUse.bodyLocalization?.primaryRegion) {
        setActiveRegion(resultToUse.bodyLocalization.primaryRegion);
      }
      setMobileTab('report');
      setAppState('results');
    }
  };

  const handleReset = () => {
    pendingResultRef.current = null;
    setAnalysisData(null);
    setActiveRegion('All');
    setMobileTab('report');
    setAppState('input');
  };

  const handleSelectRegion = (regionName) => {
    setActiveRegion(regionName);
  };

  const topCondition = analysisData?.possibleConditions?.[0] || null;
  const topScore = topCondition ? Math.round(topCondition.modelScore * 100) : 85;

  return (
    <>
      <Show when="signed-out">
        <AuthPage isConfigured={true} />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col font-sans relative overflow-x-hidden lg:overflow-hidden">
      {appState === 'input' && <LandingBackdrop />}

      <Header 
        onReset={handleReset} 
        appState={appState} 
      />

      <main className="relative z-10 flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 max-w-[1520px] flex flex-col min-h-0 justify-center">
        <AnimatePresence mode="wait">
          {/* POST-LOGIN EXPERIENCE SELECTOR: Displayed if user hasn't chosen a mode yet */}
          {!hasChosenPersona ? (
            <motion.div
              key="choose-experience"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col w-full flex-1 min-h-0 justify-center items-center"
            >
              <ExperienceSelector />
            </motion.div>
          ) : (
            <>
              {/* STATE 1: INPUT / LANDING PAGE */}
              {appState === 'input' && (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col w-full flex-1 min-h-0 justify-center"
                >
                  <SymptomInput
                    onAnalyze={handleAnalyze}
                    isLoading={false}
                    errorMessage={errorMessage}
                    onClearError={() => setErrorMessage(null)}
                    externalText={assistantInputSuggestion}
                  />
                </motion.div>
              )}

          {/* STATE 2: ANALYZING */}
          {appState === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center min-h-[70vh] py-3 sm:py-4"
            >
              <div className="lg:col-span-6 lg:col-start-2">
                <AnalysisStatus
                  onStepChange={handleStepChange}
                  onComplete={handleAnalysisComplete}
                  isReady={Boolean(pendingResult)}
                />
              </div>
              <div className="lg:col-span-4 h-[280px] sm:h-[360px] lg:h-[460px] master-console p-2 sm:p-3 overflow-hidden">
                <BodyViewer
                  activeRegion={activeRegion}
                  onSelectRegion={() => {}}
                  showControls={false}
                  isScanning={true}
                />
              </div>
            </motion.div>
          )}

          {/* STATE 3: RESULTS (Merged Anatomy + Assessment on Left, Tabbed Guidance on Right) */}
          {appState === 'results' && analysisData && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 lg:min-h-[calc(100dvh-10.5rem)]"
            >
              {/* Mobile View Mode Segmented Tab Bar (lg:hidden) */}
              <div className="lg:hidden col-span-1 sticky top-[56px] z-30 bg-white/95 backdrop-blur-md border border-border/80 rounded-2xl p-1 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMobileTab('report')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-display ${
                      mobileTab === 'report'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Clinical Assessment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('anatomy')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-display ${
                      mobileTab === 'anatomy'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>3D Anatomical Atlas</span>
                  </button>
                </div>
              </div>

              {/* Left Column: Unified 3D Anatomy + Primary Assessment Master Console */}
              <div
                className={`lg:col-span-6 flex flex-col master-console h-auto lg:h-full justify-between overflow-hidden ${
                  mobileTab === 'anatomy' ? 'flex flex-1 min-h-[calc(100dvh-13.5rem)]' : 'hidden lg:flex'
                }`}
              >
                {/* Console Topbar: Region & System Info + Start Over */}
                <div className="console-topbar px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-accent text-primary flex items-center justify-center border border-primary/20 flex-shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                        {analysisData.bodyLocalization?.primaryRegion || 'Anatomical'} Region
                      </h3>
                      <p className="text-[11px] font-medium text-muted-foreground truncate">
                        {analysisData.bodyLocalization?.bodySystem || 'General System'}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Back to Report Button */}
                  <button
                    type="button"
                    onClick={() => setMobileTab('report')}
                    className="lg:hidden inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-accent px-2.5 py-1 rounded-full border border-primary/20 hover:bg-accent/80 active:scale-95 transition-all cursor-pointer font-display"
                  >
                    <span>&larr; View Report</span>
                  </button>

                  <span className="text-[11px] font-semibold text-primary bg-accent px-2.5 py-1 rounded-full border border-primary/15 hidden lg:inline font-display">
                    Interactive 3D
                  </span>
                </div>

                <div className="relative p-1.5 sm:p-2 flex-1 h-[440px] sm:h-[480px] lg:h-full min-h-[400px] sm:min-h-[460px] lg:min-h-[380px]">
                  <BodyViewer
                    activeRegion={activeRegion}
                    onSelectRegion={handleSelectRegion}
                    bodyLocalization={analysisData.bodyLocalization}
                    conditionName={topCondition?.name}
                    icd10Code={analysisData.icd10Code}
                    modelScore={topScore}
                    confidenceCategory={topCondition?.confidenceCategory}
                  />
                </div>

                {/* Clean Anatomical Telemetry Footer for 3D Atlas */}
                <div className="border-t border-border bg-white/95 px-4 py-2.5 sm:px-5 flex-shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-slate-500 font-medium">3D Reticle Target:</span>
                      <span className="font-semibold text-slate-800">
                        {analysisData.bodyLocalization?.targetOrgan || analysisData.bodyLocalization?.primaryRegion || 'Anatomical Anchor'}
                      </span>
                    </div>
                    {persona !== 'patient' ? (
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                        <span>Coords: [{analysisData.bodyLocalization?.coordinates?.x?.toFixed(2) || '0.00'}, {analysisData.bodyLocalization?.coordinates?.y?.toFixed(2) || '1.10'}, {analysisData.bodyLocalization?.coordinates?.z?.toFixed(2) || '0.00'}]</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">Calibrated</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                          Active Focus
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Guidance Tabs & Clinical Content */}
              <div
                className={`lg:col-span-6 flex flex-col min-h-[460px] lg:min-h-0 lg:h-full ${
                  mobileTab === 'report' ? 'flex flex-1' : 'hidden lg:flex'
                }`}
              >
                <ResultsViewer
                  analysisData={analysisData}
                  isLoading={false}
                  className="h-full"
                  onAskMedAssist={() => setIsAssistantOpen(true)}
                  onView3D={() => setMobileTab('anatomy')}
                />
              </div>

            </motion.div>
          )}
            </>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-1.5 px-4 text-center text-xs text-muted-foreground font-medium flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 flex-shrink-0 border-t border-border/60 bg-white/40 backdrop-blur-md">
        <span className="font-display font-semibold text-foreground text-[10px]">Patient Clinical Decision Support System &copy; 2026</span>
        <span className="text-[10px] hidden sm:inline">&bull;</span>
        <span className="text-[10px]">Evidence-based clinical assistance platform</span>
      </footer>

      {/* Clinical Layman Copilot Drawer */}
      <ClinicalChatbot
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        analysisData={analysisData}
        onUseSuggestion={(text) => {
          setAssistantInputSuggestion(text);
          setAppState('input');
        }}
      />

      {/* Dynamic Floating Action Button */}
      <ChatbotFab 
        onClick={() => setIsAssistantOpen(true)} 
        isOpen={isAssistantOpen} 
      />

      {/* Experience Selector Modal (can be triggered anytime from Switch Mode) */}
      {showExperiencePicker && (
        <ExperienceSelector isModal onClose={() => setShowExperiencePicker(false)} />
      )}
        </div>
      </Show>
    </>
  );
}



