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
import { Activity, Sparkles, Clock } from 'lucide-react';
import { Show } from '@clerk/react';
import AuthPage from './features/auth/AuthPage';
import ClinicalChatbot from './components/chat/ClinicalChatbot';
import ChatbotFab from './components/chat/ChatbotFab';

export default function App() {
  const [appState, setAppState] = useState('input'); // 'input' | 'analyzing' | 'results'
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
      const result = await analyzeSymptoms(payload);
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
      setAppState('results');
    }
  };

  const handleReset = () => {
    pendingResultRef.current = null;
    setAnalysisData(null);
    setActiveRegion('All');
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
              {/* Left Column: Unified 3D Anatomy + Primary Assessment Master Console */}
              <div className="lg:col-span-7 flex flex-col master-console h-auto lg:h-full justify-between overflow-hidden">
                
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
                  <span className="text-[11px] font-semibold text-primary bg-accent px-2.5 py-1 rounded-full border border-primary/15 hidden sm:inline font-display">
                    Interactive 3D
                  </span>
                </div>

                <div className="relative p-1.5 sm:p-2 flex-1 min-h-[300px] sm:min-h-[350px] lg:min-h-[380px]">
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

                {/* Integrated Primary Clinical Assessment Footer */}
                <div className="border-t border-border bg-white/90 p-3.5 sm:px-5 sm:py-4 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 text-center sm:text-left min-w-0">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold font-display border border-primary/20">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Primary assessment
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                          ICD-10: {topCondition?.icd10Code || 'N/A'}
                        </span>
                      </div>
                      <h4 className="font-display text-base sm:text-xl font-bold text-foreground tracking-tight">
                        {topCondition?.name || 'Clinical Finding'}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xl">
                        {analysisData.storyline?.patientOverview || topCondition?.description}
                      </p>
                      {analysisData.storyline?.careTimeline && (
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="font-medium">{analysisData.storyline.careTimeline}</span>
                        </div>
                      )}
                    </div>
                    <div className="pebble-dial p-1.5 sm:p-2 bg-white flex-shrink-0">
                      <ScoreGauge
                        value={topScore}
                        size={84}
                        strokeWidth={7}
                        label="Match"
                        confidence={topCondition?.confidenceCategory || 'High'}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Guidance Tabs & Clinical Content */}
              <div className="lg:col-span-5 flex flex-col min-h-[460px] lg:min-h-0 lg:h-full">
                <ResultsViewer analysisData={analysisData} isLoading={false} className="h-full" />
              </div>

            </motion.div>
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
        </div>
      </Show>
    </>
  );
}



