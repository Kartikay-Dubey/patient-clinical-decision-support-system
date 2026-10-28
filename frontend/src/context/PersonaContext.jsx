import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GraduationCap, Stethoscope, ArrowRight, Check } from 'lucide-react';

export const PERSONAS = {
  patient: {
    id: 'patient',
    label: 'Everyday User',
    heading: "I'm an Everyday User",
    subtitle: 'Healing Emerald & Plain Language',
    tagline: 'Understand symptoms in simple terms with actionable, non-alarmist relief guidance.',
    bullets: [
      'Plain-English symptom explanations without medical jargon',
      'Non-pharmacological comfort steps & home relief',
      'Objective red flags for when to visit urgent care',
      'Copyable clinical discussion questions for your physician'
    ],
    buttonText: 'Continue as Everyday User',
    icon: User,
    palette: {
      darkest: '#064E3B',
      dark: '#065F46',
      primary: '#10B981',
      accent: '#059669',
      muted: '#6EE7B7',
      light: '#ECFDF5',
    },
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentColor: 'emerald',
    cardBorder: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    description: 'Plain-English symptom explanations, safe home remedies, and next-step advice.',
  },
  student: {
    id: 'student',
    label: 'Medical Student',
    heading: "I'm a Medical Student",
    subtitle: 'Academic Clinical Training',
    tagline: 'Differential diagnoses, ICD-10 codings, pathophysiology cascades, and OSCE vignettes.',
    bullets: [
      'Evidence-based differential ranking and emergency rule-outs',
      'Organ-specific pathophysiology disease cascades',
      'High-yield clinical pearls, pertinent positives & negatives',
      'Interactive shelf-exam vignette with preceptor clinical rationales'
    ],
    buttonText: 'Continue as Medical Student',
    icon: GraduationCap,
    palette: {
      darkest: '#0F172A',
      dark: '#1E3A8A',
      primary: '#2563EB',
      accent: '#3B82F6',
      muted: '#94A3B8',
      light: '#EFF6FF',
    },
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: 'blue',
    cardBorder: 'hover:border-blue-500/60 hover:shadow-blue-500/10',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Differential diagnosis rankings, ICD-10 coding, pathophysiology cascades, high-yield pearls, and 3D anatomy.',
  },
  technician: {
    id: 'technician',
    label: 'Clinical Technician',
    heading: "I'm a Clinical Technician",
    subtitle: 'Clinical Lab & EHR Telemetry',
    tagline: 'Diagnostic telemetry, multi-class posteriors, and audit EHR export.',
    bullets: [
      'Real-time analyzer health, delta check margin & evidence tokens',
      'High-density 49-pathology posterior matrix with acuity striping',
      'Spatial coordinate verification (z in [-0.02, 0.02])',
      'Audit-grade SOAP documentation and JSON telemetry payload export'
    ],
    buttonText: 'Continue as Clinical Technician',
    icon: Stethoscope,
    palette: {
      darkest: '#431407',
      dark: '#7C2D12',
      primary: '#EA580C',
      accent: '#F97316',
      muted: '#FDBA74',
      light: '#FFF7ED',
    },
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accentColor: 'orange',
    cardBorder: 'hover:border-orange-500/60 hover:shadow-orange-500/10',
    buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    description: 'Complete evidence mapping, posterior probabilities, and one-click SOAP export.',
  },
};

const PersonaContext = createContext({
  persona: 'patient',
  setPersona: () => { },
  personaConfig: PERSONAS.patient,
  hasChosenPersona: false,
  setHasChosenPersona: () => { },
  showExperiencePicker: false,
  setShowExperiencePicker: () => { },
  selectPersonaAndProceed: () => { },
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
          } catch (e) { }
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
