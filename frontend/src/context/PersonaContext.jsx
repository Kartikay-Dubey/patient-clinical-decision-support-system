import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GraduationCap, Stethoscope, ArrowRight, Check } from 'lucide-react';

export const PERSONAS = {
  patient: {
    id: 'patient',
    label: 'Everyday User',
    heading: "I'm an Everyday User",
    subtitle: 'Simple & Reassuring',
    tagline: 'Understand my symptoms in simple language and get clear guidance.',
    bullets: [
      'Conversational input in your own words',
      'Simple explanations without medical jargon',
      'Safe home care & next-step guidance',
      'Clear red-flag emergency warnings'
    ],
    buttonText: 'Continue as Everyday User',
    icon: User,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
    accentColor: 'blue',
    cardBorder: 'hover:border-blue-500/60 hover:shadow-blue-500/10',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Plain-English symptom explanations, safe home remedies, and next-step advice.',
  },
  student: {
    id: 'student',
    label: 'Student',
    heading: "I'm a Student",
    subtitle: 'Academic Learning',
    tagline: 'Explore differential diagnoses, clinical evidence, and 3D anatomy.',
    bullets: [
      'Differential diagnosis (DDX) ranking',
      'ICD-10-CM diagnostic codes',
      'Pathophysiology & clinical reasoning',
      'Interactive 3D anatomy explorer'
    ],
    buttonText: 'Continue as Student',
    icon: GraduationCap,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    accentColor: 'emerald',
    cardBorder: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    description: 'Differential diagnosis rankings, ICD-10 coding, pathophysiology, and 3D anatomy.',
  },
  technician: {
    id: 'technician',
    label: 'Clinical Technician',
    heading: "I'm a Clinical Technician",
    subtitle: 'Data Reviewer',
    tagline: 'Advanced clinical insights, evidence mapping, and research tools.',
    bullets: [
      'Complete evidence token mapping',
      'Model probabilities & metadata',
      'Export SOAP notes & EHR payloads',
      'High-density triage telemetry'
    ],
    buttonText: 'Continue as Clinical Technician',
    icon: Stethoscope,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
    accentColor: 'amber',
    cardBorder: 'hover:border-amber-500/60 hover:shadow-amber-500/10',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    description: 'Complete evidence mapping, posterior probabilities, and one-click SOAP export.',
  },
};

const PersonaContext = createContext({
  persona: 'patient',
  setPersona: () => {},
  personaConfig: PERSONAS.patient,
  hasChosenPersona: false,
  setHasChosenPersona: () => {},
  showExperiencePicker: false,
  setShowExperiencePicker: () => {},
  selectPersonaAndProceed: () => {},
});

export function PersonaProvider({ children }) {
  const [persona, setPersonaState] = useState(() => {
    try {
      const saved = localStorage.getItem('cdss_user_persona');
      return saved && PERSONAS[saved] ? saved : 'patient';
    } catch {
      return 'patient';
    }
  });

  const [hasChosenPersona, setHasChosenPersonaState] = useState(() => {
    try {
      return localStorage.getItem('cdss_has_chosen_persona') === 'true';
    } catch {
      return false;
    }
  });

  const [showExperiencePicker, setShowExperiencePicker] = useState(false);

  const setPersona = (newPersona) => {
    if (PERSONAS[newPersona]) {
      setPersonaState(newPersona);
      try {
        localStorage.setItem('cdss_user_persona', newPersona);
      } catch (e) {
        // LocalStorage disabled or quota
      }
    }
  };

  const selectPersonaAndProceed = (newPersona) => {
    setPersona(newPersona);
    setHasChosenPersonaState(true);
    setShowExperiencePicker(false);
    try {
      localStorage.setItem('cdss_has_chosen_persona', 'true');
    } catch (e) {
      // ignore
    }
  };

  const personaConfig = PERSONAS[persona] || PERSONAS.patient;

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        personaConfig,
        hasChosenPersona,
        setHasChosenPersona: (val) => {
          setHasChosenPersonaState(val);
          try {
            localStorage.setItem('cdss_has_chosen_persona', String(val));
          } catch (e) {}
        },
        showExperiencePicker,
        setShowExperiencePicker,
        selectPersonaAndProceed,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}
