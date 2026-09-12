/**
 * Clinical Decision-Support API Service Layer
 * Abstracts backend network communication with intelligent mock adapter.
 */

import { MOCK_CLINICAL_PRESETS } from '../mock/clinicalData';

/**
 * Simulates symptom analysis model inference matching natural language patient symptoms.
 * @param {Object} payload - { rawSymptoms: string, structuredSymptoms: string[] }
 * @returns {Promise<Object>} API_CONTRACT compliant response object with full patient storyline
 */
export async function analyzeSymptoms(payload) {
  // Simulate network latent processing delay (~600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  const inputLower = (payload.rawSymptoms || '').toLowerCase();
  const tagsStr = (payload.structuredSymptoms || []).join(' ').toLowerCase();
  const text = `${inputLower} ${tagsStr}`;

  // 1. Cough / Cold / Throat / Airway / Bronchial
  if (text.includes('cough') || text.includes('cuff') || text.includes('throat') || text.includes('cold') || text.includes('bronch')) {
    return MOCK_CLINICAL_PRESETS[0].response; // preset_cough
  }
  
  // 2. Acid reflux / Heartburn / GERD / Stomach burning
  if (text.includes('reflux') || text.includes('heartburn') || text.includes('acidity') || text.includes('gerd') || text.includes('burn after')) {
    return MOCK_CLINICAL_PRESETS[1].response; // preset_acid_reflux
  }

  // 3. Chest discomfort / Heart pressure / Shortness of breath
  if (text.includes('chest') || text.includes('heart') || text.includes('angina') || text.includes('breath') || text.includes('dyspnea')) {
    return MOCK_CLINICAL_PRESETS[2].response; // preset_chest_pain
  }

  // 4. Headache / Migraine / Light sensitivity
  if (text.includes('head') || text.includes('headache') || text.includes('migraine') || text.includes('light') || text.includes('photo')) {
    return MOCK_CLINICAL_PRESETS[3].response; // preset_headache
  }

  // 5. Back pain / Spine / Lifting injury / Lumbar strain
  if (text.includes('back') || text.includes('spine') || text.includes('lumbar') || text.includes('lift') || text.includes('stiff')) {
    return MOCK_CLINICAL_PRESETS[4].response; // preset_back_pain
  }

  // 6. Right lower abdominal pain / Stomach ache / Appendix
  if (text.includes('abdom') || text.includes('stomach') || text.includes('append') || text.includes('belly') || text.includes('cramp')) {
    return MOCK_CLINICAL_PRESETS[5].response; // preset_abdominal
  }

  // Default fallback: Cough & airway irritation scenario
  return MOCK_CLINICAL_PRESETS[0].response;
}
