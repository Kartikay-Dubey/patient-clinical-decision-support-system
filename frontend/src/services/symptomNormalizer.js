/**
 * AI Symptom Normalizer Service
 * 
 * Pre-processes raw colloquial symptom text through Groq/Gemini LLM
 * to convert natural language into structured medical terminology
 * before sending to the DDXPlus NLP backend.
 * 
 * Flow: User input → AI normalizer → normalized medical text → backend /api/v1/analyze
 */

const NORMALIZER_PROMPT = `You are a clinical symptom normalizer. Your task is to convert a patient's natural language description of their symptoms into precise medical terminology that a clinical NLP system can process.

Rules:
1. Convert colloquial descriptions to standard clinical terms (e.g., "stomach pain" → "epigastric pain", "can't breathe" → "dyspnea")
2. Preserve the patient's reported duration, severity, and timing
3. Add clinical modifiers where applicable (acute, chronic, intermittent, bilateral)
4. Output ONLY the normalized clinical description — no explanations, headers, or commentary
5. Keep it concise (1-3 sentences max)
6. Do NOT add symptoms the patient didn't mention
7. Do NOT diagnose — only normalize the language

Examples:
Input: "I have a bad headache on one side and I can't look at lights"
Output: "Unilateral cephalgia with photophobia"

Input: "My stomach burns after eating and I feel acid coming up"
Output: "Postprandial epigastric pyrosis with acid regurgitation"

Input: "I've had a cough and fever for 3 days with some chest tightness"
Output: "Productive cough with febrile illness for 3 days, associated mild chest tightness"

Input: "I feel dizzy when I stand up and my heart races"
Output: "Orthostatic dizziness with positional tachycardia"`;

/**
 * Normalize raw symptom text using Groq API
 */
async function normalizeViaGroq(rawText, groqKey) {
  if (!groqKey || groqKey.trim() === '' || groqKey === 'YOUR_GROQ_KEY_HERE') return null;

  const MODELS = ['qwen/qwen3.8-27b', 'llama-3.3-70b-versatile', 'llama3-8b-8192'];

  for (const model of MODELS) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: NORMALIZER_PROMPT },
            { role: 'user', content: rawText }
          ],
          temperature: 0.1,
          max_tokens: 200,
          stream: false
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text && text.length > 5 && text.length < 500) {
        // Strip any thinking tags that some models output
        const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        if (cleaned.length > 5) {
          console.log(`[AI Normalizer] Groq ${model} → "${cleaned}"`);
          return cleaned;
        }
      }
    } catch (err) {
      console.warn(`[AI Normalizer] Groq ${model} failed:`, err.message);
    }
  }
  return null;
}

/**
 * Normalize raw symptom text using Gemini API
 */
async function normalizeViaGemini(rawText, geminiKey) {
  if (!geminiKey || geminiKey.trim() === '' || geminiKey === 'YOUR_GEMINI_KEY_HERE') return null;

  const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: `${NORMALIZER_PROMPT}\n\nInput: "${rawText}"\nOutput:` }]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
          })
        }
      );

      const data = await response.json();
      if (!response.ok) continue;

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 5 && text.length < 500) {
        console.log(`[AI Normalizer] Gemini ${model} → "${text}"`);
        return text;
      }
    } catch (err) {
      console.warn(`[AI Normalizer] Gemini ${model} failed:`, err.message);
    }
  }
  return null;
}

/**
 * Main normalizer function — tries Groq first, then Gemini.
 * Returns { normalized: string, wasNormalized: boolean }
 * Falls back to original text if both fail.
 */
export async function normalizeSymptomText(rawText) {
  // Skip normalization for very short or already-clinical input
  if (!rawText || rawText.trim().length < 10) {
    return { normalized: rawText, wasNormalized: false };
  }

  // Skip if text already looks clinical (contains multiple medical terms)
  const clinicalTerms = ['dyspnea', 'pyrosis', 'cephalgia', 'tachycardia', 'epigastric', 'substernal', 'bilateral', 'unilateral', 'pleuritic', 'hemoptysis'];
  const clinicalCount = clinicalTerms.filter(t => rawText.toLowerCase().includes(t)).length;
  if (clinicalCount >= 2) {
    return { normalized: rawText, wasNormalized: false };
  }

  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return { normalized: rawText, wasNormalized: false };
  }

  try {
    // Try Groq first
    let result = await normalizeViaGroq(rawText, groqKey);
    if (result) return { normalized: result, wasNormalized: true };

    // Fallback to Gemini
    result = await normalizeViaGemini(rawText, geminiKey);
    if (result) return { normalized: result, wasNormalized: true };
  } catch (err) {
    console.warn('[AI Normalizer] All providers failed:', err.message);
  }

  return { normalized: rawText, wasNormalized: false };
}
