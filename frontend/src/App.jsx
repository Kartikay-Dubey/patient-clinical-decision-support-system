import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SymptomInput from './features/symptom-input/SymptomInput';
import AnalysisStatus from './features/analysis/AnalysisStatus';
import BodyViewer from './features/body-viewer/BodyViewer';
import ResultsViewer from './features/results/ResultsViewer';
import ScoreGauge from './components/ScoreGauge';
import { analyzeSymptoms } from './services/apiService';
import { RotateCcw, Activity, Sparkles, Clock } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('input'); // 'input' | 'analyzing' | 'results'
  const [analysisData, setAnalysisData] = useState(null);
  const [activeRegion, setActiveRegion] = useState('All');
  const pendingResultRef = useRef(null);

  const handleAnalyze = async (payload) => {
    setAppState('analyzing');
    setAnalysisData(null);
    setActiveRegion(null); // Neutral presentation until region step completes
    pendingResultRef.current = null;

    try {
      const result = await analyzeSymptoms(payload);
      pendingResultRef.current = result;
    } catch (err) {
      console.error('Model analysis failure:', err);
      // Fallback to input on error
      setAppState('input');
    }
  };

  const handleStepChange = (stepIndex) => {
    // Step 2 = "Identifying the primary affected region" (0-indexed: step 2 is 3rd step)
    if (stepIndex >= 2 && pendingResultRef.current?.bodyLocalization?.primaryRegion) {
      setActiveRegion(pendingResultRef.current.bodyLocalization.primaryRegion);
    }
  };

  const handleAnalysisComplete = () => {
    if (pendingResultRef.current) {
      setAnalysisData(pendingResultRef.current);
      if (pendingResultRef.current.bodyLocalization?.primaryRegion) {
        setActiveRegion(pendingResultRef.current.bodyLocalization.primaryRegion);
      }
      setAppState('results');
    } else {
      // Safety fallback if mock request failed or timed out
      setAppState('input');
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
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#F7D6CC] selection:text-[#2D2623]">
      {/* Editorial Clinical Header */}
      <Header onReset={handleReset} />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full mx-auto p-3 sm:p-5 lg:p-6 max-w-[1520px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STATE 1: INPUT / LANDING PAGE */}
          {appState === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center min-h-[75vh] py-4"
            >
              <SymptomInput onAnalyze={handleAnalyze} isLoading={false} />
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[70vh] py-4"
            >
              <div className="lg:col-span-6 lg:col-start-2">
                <AnalysisStatus
                  onStepChange={handleStepChange}
                  onComplete={handleAnalysisComplete}
                />
              </div>
              <div className="lg:col-span-4 h-[460px] master-console p-3 overflow-hidden">
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
            >
              {/* Left Column: Unified 3D Anatomy + Primary Assessment Master Console */}
              <div className="lg:col-span-7 flex flex-col master-console h-full justify-between overflow-hidden">
                
                {/* Console Topbar: Region & System Info + Start Over */}
                <div className="console-topbar px-5 py-3 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-accent text-primary flex items-center justify-center border border-primary/20">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm sm:text-base font-bold text-foreground tracking-tight">
                          {analysisData.bodyLocalization?.primaryRegion || 'Anatomical'} Region
                        </h3>
                        <span className="text-[11px] font-semibold text-muted-foreground bg-accent px-2.5 py-0.5 rounded-full border border-border">
                          {analysisData.bodyLocalization?.bodySystem || 'General System'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-foreground hover:text-primary bg-white hover:bg-accent px-3.5 py-1.5 rounded-full border border-border shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-display"
                  >
                    <RotateCcw className="h-3 w-3 text-primary" /> Start Over
                  </button>
                </div>

                {/* 3D Anatomy Viewer Canvas */}
                <div
                  className="relative p-2 flex-1"
                  style={{ minHeight: '340px' }}
                >
                  <BodyViewer
                    activeRegion={activeRegion}
                    onSelectRegion={handleSelectRegion}
                  />
                </div>

                {/* Integrated Primary Clinical Assessment Footer */}
                <div className="border-t border-border bg-white p-4 sm:p-5 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    
                    {/* Assessment Details */}
                    <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px] font-semibold font-display border border-primary/20">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span>Primary Clinical Assessment</span>
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                          ICD-10: {topCondition?.icd10Code || 'N/A'}
                        </span>
                      </div>

                      <h4 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
                        {topCondition?.name || 'Clinical Finding'}
                      </h4>

                      <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                        {analysisData.storyline?.patientOverview || topCondition?.description}
                      </p>

                      {analysisData.storyline?.careTimeline && (
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="font-medium">{analysisData.storyline.careTimeline}</span>
                        </div>
                      )}
                    </div>

                    {/* Compact Confidence Dial */}
                    <div className="pebble-dial p-2.5 bg-white flex-shrink-0">
                      <ScoreGauge 
                        value={topScore} 
                        size={84}
                        strokeWidth={8}
                        label="Match"
                        confidence={topCondition?.confidenceCategory || 'High'}
                      />
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column: Guidance Tabs & Clinical Content */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <ResultsViewer analysisData={analysisData} isLoading={false} className="h-full" />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Editorial Minimal Footer */}
      <footer className="py-2.5 px-6 text-center text-xs text-[#5E524C] font-medium flex flex-col items-center justify-center gap-0.5 flex-shrink-0">
        <span className="font-display font-semibold text-[#2D2623] text-[11px]">Patient Clinical Decision Support System &copy; 2026</span>
        <span className="text-[10px] text-[#8E8078]">Designed for calm, human-centered evidence-based medical engagement</span>
      </footer>
    </div>
  );
}



