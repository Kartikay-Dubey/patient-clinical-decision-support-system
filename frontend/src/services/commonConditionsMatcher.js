import { COMMON_CONDITIONS_KB } from '../data/commonConditionsKnowledgeBase';

/**
 * Matcher utility evaluating patient input against the Everyday Common Conditions Knowledge Base.
 * 
 * Strict clinical principles:
 * 1. Never invent or display numerical probabilities from this layer.
 * 2. Fever alone is labeled 'Fever — cause not yet clear' (never confirmed 'viral fever').
 * 3. General safety signs override routine self-care.
 */
export function matchCommonConditions(rawText = '', extractedSymptoms = []) {
  if (!rawText && (!extractedSymptoms || extractedSymptoms.length === 0)) {
    return {
      hasCommonMatch: false,
      primaryCandidate: null,
      matchedConditions: [],
      safetyAlerts: [],
      isUrgent: false,
    };
  }

  const textLower = (rawText || '').toLowerCase();
  
  // Normalize symptoms list
  const symptomStrings = extractedSymptoms.map(s => 
    (typeof s === 'string' ? s : (s.name || s.label || '')).toLowerCase()
  );

  // 1. Safety Triage Check: General Safety Signs
  const safetyAlerts = [];
  const EMERGENCY_TRIGGERS = [
    { pattern: /(trouble|difficulty|shortness of|hard to|struggling to)\s+breath/i, warning: 'Severe difficulty breathing or breathlessness reported.' },
    { pattern: /(chest pain|pressure in chest|tightness in chest)/i, warning: 'Chest pain or chest pressure reported.' },
    { pattern: /(confusion|unconscious|fainted|collapse|seizure|can't wake|difficulty waking)/i, warning: 'Altered awareness, seizure, or collapse reported.' },
    { pattern: /(blood in vomit|vomiting blood|black stool|blood in stool|coughing blood)/i, warning: 'Bleeding signs reported.' },
    { pattern: /(blue lips|grey lips|cyanosis)/i, warning: 'Signs of severe oxygen depletion (blue/grey lips).' },
    { pattern: /(severe abdominal pain|unbearable stomach pain)/i, warning: 'Severe abdominal pain reported.' }
  ];

  for (const trigger of EMERGENCY_TRIGGERS) {
    if (trigger.pattern.test(textLower)) {
      safetyAlerts.push(trigger.warning);
    }
  }

  // 2. Score candidate common conditions based on symptom keyword overlap
  const candidates = [];

  for (const condition of COMMON_CONDITIONS_KB.conditions) {
    const matchedSymptoms = [];

    for (const symptomPhrase of condition.symptoms_that_may_fit) {
      const phraseLower = symptomPhrase.toLowerCase();
      // Check in raw text or extracted symptoms
      const inText = textLower.includes(phraseLower);
      const inExtracted = symptomStrings.some(s => s.includes(phraseLower) || phraseLower.includes(s));

      if (inText || inExtracted) {
        matchedSymptoms.push(symptomPhrase);
      }
    }

    if (matchedSymptoms.length > 0) {
      candidates.push({
        condition,
        matchedSymptoms,
        matchCount: matchedSymptoms.length,
      });
    }
  }

  // Sort by number of matched symptom phrases
  candidates.sort((a, b) => b.matchCount - a.matchCount);

  // 3. Rule: Fever alone with no other respiratory/specific symptoms must be "Fever — cause not yet clear"
  const hasFeverOnly = (textLower.includes('fever') || textLower.includes('temperature') || textLower.includes('chills')) &&
    !textLower.includes('cough') &&
    !textLower.includes('runny nose') &&
    !textLower.includes('sore throat') &&
    !textLower.includes('diarrh') &&
    !textLower.includes('vomit') &&
    !textLower.includes('rash');

  let primaryCandidate = null;
  let matchedConditions = [];

  if (hasFeverOnly) {
    const feverCond = COMMON_CONDITIONS_KB.conditions.find(c => c.id === 'fever_unknown_cause');
    if (feverCond) {
      primaryCandidate = {
        ...feverCond,
        matchedSymptoms: ['fever or chills'],
      };
      matchedConditions = [primaryCandidate];
    }
  } else if (candidates.length > 0) {
    primaryCandidate = {
      ...candidates[0].condition,
      matchedSymptoms: candidates[0].matchedSymptoms,
    };
    matchedConditions = candidates.map(c => ({
      ...c.condition,
      matchedSymptoms: c.matchedSymptoms,
    }));
  }

  return {
    hasCommonMatch: candidates.length > 0 || hasFeverOnly,
    primaryCandidate,
    matchedConditions,
    safetyAlerts,
    isUrgent: safetyAlerts.length > 0,
    generalSafetySigns: COMMON_CONDITIONS_KB.general_safety_signs,
    patientCopy: COMMON_CONDITIONS_KB.general_patient_copy,
  };
}
