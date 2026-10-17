import React from 'react';
import { usePersona } from '../../context/PersonaContext';
import ResultsPanelFill from '../../components/landing/ResultsPanelFill';
import PatientResultsView from './PatientResultsView';
import StudentResultsView from './StudentResultsView';
import TechnicianResultsView from './TechnicianResultsView';

export default function ResultsViewer({ analysisData, isLoading, className = '', onAskMedAssist, onView3D }) {
  const { persona } = usePersona();

  if (isLoading || !analysisData || !analysisData.possibleConditions) {
    return null;
  }

  return (
    <div className={`master-console flex flex-col h-full overflow-hidden ${className}`}>
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ResultsPanelFill />
        <div className="relative z-10 h-full flex flex-col min-h-0">
          {persona === 'patient' && (
            <PatientResultsView analysisData={analysisData} onView3D={onView3D} />
          )}
          {persona === 'student' && (
            <StudentResultsView analysisData={analysisData} onAskMedAssist={onAskMedAssist} onView3D={onView3D} />
          )}
          {persona === 'technician' && (
            <TechnicianResultsView analysisData={analysisData} onView3D={onView3D} />
          )}
        </div>
      </div>
    </div>
  );
}
