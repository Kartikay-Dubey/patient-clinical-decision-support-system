/**
 * Clinical Decision-Support API Service Layer.
 * Communicates with the real FastAPI + DDXPlus ML Diagnostic backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Analyzes patient symptom text and tags using the real DDXPlus AI model & NLP pipeline.
 * @param {Object} payload - { rawSymptoms: string, structuredSymptoms: string[], patientDemographics?: object }
 * @returns {Promise<Object>} Live API response matching API_CONTRACT.md schema
 */
export async function analyzeSymptoms(payload) {
  const url = `${API_BASE_URL}/api/v1/analyze`;

  const requestBody = {
    rawSymptoms: payload.rawSymptoms || '',
    structuredSymptoms: payload.structuredSymptoms || [],
    patientDemographics: payload.patientDemographics || {
      age: payload.age || 35,
      sex: payload.sex || 'M',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // Non-JSON response
      }

      const errorMessage =
        errorData?.error?.message ||
        errorData?.detail?.error?.message ||
        `Clinical analysis error (HTTP ${response.status})`;

      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // If backend direct URL fallback is needed when running dev server without proxy
    if (err.name === 'TypeError' && !API_BASE_URL) {
      try {
        const fallbackRes = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (fallbackRes.ok) {
          return await fallbackRes.json();
        }
      } catch (fallbackErr) {
        // Fallback also failed
      }
    }

    console.error('[APIService] Diagnosis inference failed:', err);
    throw err;
  }
}
