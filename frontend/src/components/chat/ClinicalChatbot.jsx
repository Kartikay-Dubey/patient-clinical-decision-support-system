import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Sparkles, ArrowRight, Bot, FileText,
  HelpCircle, CheckCircle2, AlertTriangle, Key
} from 'lucide-react';

const QUICK_PROMPTS = [
  {
    label: "Explain my results",
    prompt: "Can you explain the conditions shown in my diagnostic report and why I might be experiencing these symptoms?",
  },
  {
    label: "Describe symptoms better",
    prompt: "How can I accurately describe the location, intensity, and type of pain I am feeling in medical terms?",
  },
  {
    label: "Is this serious?",
    prompt: "How do I know if my symptoms are serious enough to visit a doctor or if I can manage at home?",
  },
  {
    label: "Emergency warning signs",
    prompt: "What symptoms require immediate emergency medical attention?",
  }
];

// Professional offline knowledge base
const CLINICAL_KNOWLEDGE = [
  {
    keywords: ['acid', 'heartburn', 'burn', 'throat', 'stomach', 'dinner', 'reflux'],
    title: "Understanding Acid Reflux",
    content: "What you are describing sounds like it could be gastroesophageal reflux (GERD) or heartburn. This occurs when stomach acid travels back up into the esophagus, causing a burning sensation in the chest or throat.\n\nWhen describing this for the diagnostic system, consider including:\n• Epigastric or retrosternal burning sensation\n• Timing (worse after eating or when lying down)\n• Whether you notice a sour or acidic taste\n• Any difficulty swallowing\n\nThis is a very common condition that is usually manageable. A healthcare provider can guide you on appropriate treatment.",
    suggestedInput: "Epigastric burning sensation after meals, acid regurgitation, discomfort worsens when lying flat."
  },
  {
    keywords: ['headache', 'head', 'throbbing', 'migraine', 'light', 'pounding'],
    title: "Understanding Your Headache",
    content: "Based on what you have described, you may be experiencing a migraine or tension-type headache. A one-sided, throbbing headache with sensitivity to light is a classic migraine presentation.\n\nUseful details to include when entering symptoms:\n• Which side of the head is affected\n• Whether the pain is throbbing or pressure-like\n• Any sensitivity to light or sound\n• Presence of nausea\n\nImportant: If you experience a sudden, extremely severe headache that feels like the worst of your life, please seek emergency care immediately.",
    suggestedInput: "Unilateral throbbing headache, moderate photophobia, exacerbated by routine physical activity."
  },
  {
    keywords: ['chest', 'heart', 'tight', 'flutter', 'breath', 'shortness'],
    title: "Chest Discomfort Assessment",
    content: "Chest discomfort can have many causes, ranging from anxiety and muscle strain to more serious cardiac conditions. It is important to pay attention to the nature and timing of your symptoms.\n\nPlease describe:\n• The exact location and nature of the discomfort (sharp, pressure, tightness)\n• Whether it spreads to your arm, jaw, or back\n• Any accompanying shortness of breath or sweating\n\nImportant: If you experience squeezing chest pressure spreading to your left arm or jaw with cold sweats or difficulty breathing, please seek emergency care immediately.",
    suggestedInput: "Substernal chest tightness on mild exertion, associated with dyspnea and lightheadedness."
  },
  {
    keywords: ['cough', 'fever', 'throat', 'phlegm', 'cold', 'mucus', 'viral', 'flu'],
    title: "Respiratory Symptoms",
    content: "The symptoms you have described are consistent with a common upper respiratory infection, which includes conditions such as the common cold, influenza, or viral fever. These are among the most frequent causes of cough, fever, and throat discomfort.\n\nPlease note the following when entering your symptoms:\n• Whether the cough produces mucus (productive) or is dry\n• The degree of fever if present\n• Any throat pain or difficulty swallowing\n• Duration of symptoms\n\nMild cases typically resolve within 7 to 10 days with rest, hydration, and supportive care.",
    suggestedInput: "Persistent productive cough with low-grade fever, pharyngeal irritation, onset 3 days ago."
  },
  {
    keywords: ['pain', 'describe', 'accurately', 'scale', 'type', 'medical terms'],
    title: "How to Describe Pain Medically",
    content: "Describing your pain accurately helps healthcare providers make better assessments. Doctors use a framework called OPQRST:\n\n1. Onset: Did the pain start suddenly or gradually?\n2. Provocation: What makes it better or worse (e.g., movement, eating, breathing)?\n3. Quality: Is it sharp, dull, burning, cramping, or pressure-like?\n4. Radiation: Does the pain stay in one place or move to other areas?\n5. Severity: Rate it on a scale of 1 to 10, where 10 is the most severe pain imaginable.\n6. Timing: Is it constant or does it come and go?",
    suggestedInput: "Gradual onset of sharp right lower quadrant abdominal pain over 12 hours, worsening with walking."
  },
  {
    keywords: ['emergency', 'red flags', 'er', 'urgent', 'danger', 'serious'],
    title: "Emergency Warning Signs",
    content: "Please seek immediate emergency medical attention if you experience any of the following:\n\n• Sudden facial drooping, arm weakness, or difficulty speaking (signs of stroke)\n• Squeezing or crushing chest pressure, especially spreading to the arm or jaw\n• Coughing up blood\n• Severe headache that comes on suddenly and is the worst of your life\n• Difficulty breathing while at rest\n• Loss of consciousness\n• High fever with neck stiffness and confusion\n\nFor any of these symptoms, please call emergency services or go to the nearest emergency room immediately.",
    suggestedInput: null
  }
];

// Detect mild/common symptom patterns that warrant reassurance
function detectMildSymptomPattern(text) {
  const t = text.toLowerCase();
  const mildDurationPatterns = [
    /(\d+)\s*(day|days|hour|hours)\s*(of|with|ago)/i,
    /from (last|past)\s*(few)?\s*(\d+)?\s*(day|days|hour|hours)/i,
    /since\s*(\d+)?\s*(day|days)/i
  ];
  const hasDuration = mildDurationPatterns.some(re => re.test(t));
  const mildKeywords = ['headache', 'mild fever', 'low grade fever', 'runny nose', 'body ache', 'fatigue', 'sore throat', 'sneezing', 'fever'];
  const severityWords = ['severe', 'crushing', 'worst', 'unbearable', "can't breathe", 'chest pain', 'unconscious', 'paralysis', 'blood'];
  const hasMild = mildKeywords.some(k => t.includes(k));
  const hasSevere = severityWords.some(k => t.includes(k));
  return hasMild && hasDuration && !hasSevere;
}

function buildReassuranceMessage(analysisData) {
  const topCondition = analysisData?.possibleConditions?.[0];
  const conditionName = topCondition?.name || 'the predicted condition';
  const score = topCondition ? Math.round(topCondition.modelScore * 100) : null;
  let msg = `Thank you for sharing your symptoms. Based on what you have described, the diagnostic system has identified ${conditionName} as the most probable match`;
  if (score) msg += ` with a ${score}% correlation`;
  msg += `.\n\nIt is important to understand that these results are statistical predictions based on the symptom patterns you provided — they are not a confirmed medical diagnosis. The system is designed to support clinical decision-making, not replace it.\n\nThe symptoms you have described — mild fever and headache lasting a few days — are very commonly associated with viral infections such as viral fever or the common cold. In most cases, these resolve on their own within 5 to 7 days with adequate rest, hydration, and over-the-counter supportive care.\n\nHowever, please consult a healthcare professional if:\n• Your fever exceeds 103°F (39.4°C)\n• Symptoms worsen significantly after the third day\n• You develop difficulty breathing or chest pain\n\nTry not to worry. Most likely, your body is simply fighting a common infection, and you should begin to feel better soon.`;
  return msg;
}

function buildReassuranceMessageNoReport() {
  return `Thank you for sharing how you are feeling. Mild symptoms such as a headache or low-grade fever lasting a few days are very commonly caused by viral infections — such as viral fever, the common cold, or influenza.\n\nPlease keep in mind that any conditions shown in this system are statistical predictions based on your symptom input, not a confirmed diagnosis. The most probable explanation for the symptoms you have described is a self-limiting viral infection.\n\nGeneral recommendations for this type of illness include:\n• Adequate rest\n• Staying well-hydrated\n• Over-the-counter fever and pain relief if needed\n• Monitoring symptoms for any worsening\n\nYou should feel better within 5 to 7 days in most cases. If your fever is high, symptoms worsen, or you have any difficulty breathing, please consult a healthcare professional promptly.`;
}

/**
 * Formats markdown-like text into clean React JSX without raw symbols like ** or ###
 */
function FormattedMessageText({ text }) {
  if (!text) return null;

  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800">
      {blocks.map((block, bIdx) => {
        // Heading block (### or ##)
        if (block.startsWith('#')) {
          const cleanHeading = block.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          return (
            <h4 key={bIdx} className="font-display font-bold text-sm text-teal-950 tracking-tight pt-0.5">
              {cleanHeading}
            </h4>
          );
        }

        // Bullet lists
        if (block.includes('•') || block.match(/^\s*[-*]\s+/m)) {
          const lines = block.split('\n');
          return (
            <ul key={bIdx} className="space-y-1 my-1 pl-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^\s*[•\-*]\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-1.5 text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <span>{parseInlineFormatting(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered list
        if (block.match(/^\s*\d+\.\s+/m)) {
          const lines = block.split('\n');
          return (
            <ol key={bIdx} className="space-y-1 my-1 pl-1">
              {lines.map((line, lIdx) => {
                const match = line.match(/^\s*(\d+)\.\s+(.*)/);
                if (match) {
                  return (
                    <li key={lIdx} className="flex items-start gap-1.5 text-slate-700">
                      <span className="font-bold text-teal-700 font-mono text-[11px] min-w-[16px]">{match[1]}.</span>
                      <span>{parseInlineFormatting(match[2])}</span>
                    </li>
                  );
                }
                return <p key={lIdx}>{parseInlineFormatting(line)}</p>;
              })}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p key={bIdx} className="leading-relaxed">
            {parseInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
}

function parseInlineFormatting(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-teal-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ClinicalChatbot({ isOpen, onClose, onUseSuggestion, analysisData }) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isAIConnected = Boolean(
    (groqKey && groqKey.trim() !== '' && groqKey !== 'YOUR_GROQ_KEY_HERE') ||
    (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'YOUR_GEMINI_KEY_HERE')
  );
  const hasReport = Boolean(analysisData?.possibleConditions?.length);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello. I am MedAssist, your Clinical Support Assistant. I am here to help you understand your symptoms and guide you through the diagnostic process.\n\nIf you are unsure how to describe what you are feeling, or would like to understand any medical terms, I am here to assist you. Please feel free to describe your symptoms or ask any questions.",
      suggestedInput: null,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // When report data becomes available, update welcome message
  useEffect(() => {
    if (analysisData?.possibleConditions?.length) {
      setMessages([{
        id: 'welcome-report',
        role: 'assistant',
        text: `Hello. I can see that your symptom analysis has been completed. I have access to your diagnostic report and I am here to help you understand the findings.\n\nFeel free to ask me to explain the predicted conditions, clarify what the results mean, or discuss what you should do next.`,
        suggestedInput: null,
        timestamp: 'Just now'
      }]);
    }
  }, [analysisData?.possibleConditions?.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  function buildReportContext() {
    if (!analysisData) return '';
    const conditions = analysisData.possibleConditions?.slice(0, 3).map(c =>
      `- ${c.name} (ICD-10: ${c.icd10Code || 'N/A'}, Match: ${Math.round(c.modelScore * 100)}%, Confidence: ${c.confidenceCategory})`
    ).join('\n') || 'None';
    const region = analysisData.bodyLocalization?.primaryRegion || 'Unknown';
    const system = analysisData.bodyLocalization?.bodySystem || 'Unknown';
    const overview = analysisData.storyline?.patientOverview || '';
    const timeline = analysisData.storyline?.careTimeline || '';
    return `\n\n[PATIENT DIAGNOSTIC CONTEXT]\nAffected Region: ${region}\nBody System: ${system}\nTop Predicted Conditions:\n${conditions}\nClinical Overview: ${overview}\nCare Timeline: ${timeline}\n[END CONTEXT]`;
  }

  const SYSTEM_PROMPT = `You are MedAssist, a Clinical Support Assistant integrated into a Patient Clinical Decision Support System. Your role is to help patients who may not have a medical background understand their symptoms, diagnostic results, and medical terminology.

Tone and Style:
- Speak in a professional, warm, clear, and reassuring manner
- Use simple, accessible language and avoid unnecessary jargon
- When medical terms are necessary, always explain them in plain English
- Never provide a definitive diagnosis — always use probabilistic language such as "the system has identified a possible match for..."
- For mild, common symptoms like headache or mild fever lasting a few days, reassure the patient that this is most likely a viral infection and they should not worry excessively
- Always encourage the patient to consult a licensed healthcare provider for a proper medical evaluation
- If the patient describes emergency warning signs (chest pain radiating to arm/jaw, sudden severe headache, stroke symptoms, difficulty breathing at rest), immediately advise them to call emergency services

Formatting:
- Write in clear paragraphs
- Use numbered or bulleted lists when listing multiple items
- Do not use markdown symbols like ** or ### in your response — write in plain, well-structured text
- At the end of your response, if applicable, provide a clean one-sentence clinical description inside double quotes like "Patient presents with..." that can be entered into the clinical intake form`;

  // Build conversation history for multi-turn context
  function buildConversationMessages(userPrompt) {
    const reportContext = buildReportContext();
    const sysContent = SYSTEM_PROMPT + (reportContext ? `\n${reportContext}` : '');

    // Convert chat history to API messages format (last 6 messages for context window)
    const historySlice = messages.slice(-6);
    const apiMessages = [
      { role: 'system', content: sysContent }
    ];
    for (const msg of historySlice) {
      apiMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text
      });
    }
    apiMessages.push({ role: 'user', content: userPrompt });
    return apiMessages;
  }

  // Try Groq API with multi-model fallback — primary
  async function tryGroq(userPrompt) {
    if (!groqKey || groqKey.trim() === '' || groqKey === 'YOUR_GROQ_KEY_HERE') return null;

    const apiMessages = buildConversationMessages(userPrompt);
    const GROQ_MODELS = [
      'qwen/qwen3.8-27b',
      'llama-3.3-70b-versatile',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'openai/gpt-oss-20b'
    ];

    let lastErr = null;
    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey.trim()}`
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            temperature: 0.3,
            max_tokens: 800,
            stream: false
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          lastErr = new Error(errData.error?.message || `Groq ${model} HTTP ${response.status}`);
          console.warn(`Groq ${model} not available:`, lastErr.message);
          continue;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) return text;
      } catch (err) {
        lastErr = err;
      }
    }

    if (lastErr) throw lastErr;
    return null;
  }

  // Try Gemini API — fallback
  async function tryGemini(userPrompt) {
    if (!geminiKey || geminiKey.trim() === '' || geminiKey === 'YOUR_GEMINI_KEY_HERE') return null;

    const reportContext = buildReportContext();
    const fullPrompt = SYSTEM_PROMPT + (reportContext ? `\n${reportContext}` : '') + `\n\nPatient message: "${userPrompt}"`;

    const MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    for (const model of MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
            })
          }
        );
        const data = await response.json();
        if (!response.ok) {
          console.warn(`Gemini ${model} failed:`, data.error?.message);
          continue;
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (e) {
        console.warn(`Gemini ${model} error:`, e.message);
      }
    }
    return null;
  }

  // Main AI response handler
  const fetchAIResponse = async (userPrompt) => {
    // Mild symptom reassurance check first
    if (detectMildSymptomPattern(userPrompt)) {
      return {
        text: hasReport ? buildReassuranceMessage(analysisData) : buildReassuranceMessageNoReport(),
        suggestedInput: null
      };
    }

    if (!isAIConnected) {
      const qLower = userPrompt.toLowerCase();
      const matched = CLINICAL_KNOWLEDGE.find(item =>
        item.keywords.some(kw => qLower.includes(kw))
      );
      if (matched) {
        return { text: `${matched.title}\n\n${matched.content}`, suggestedInput: matched.suggestedInput };
      }
      return {
        text: `Thank you for your question. To provide you with a more accurate response, please describe your symptoms in detail, including:\n\n• The specific area of your body affected\n• How long you have been experiencing these symptoms\n• Whether anything makes the symptoms better or worse\n\nThis will help the diagnostic system analyse your condition more effectively.`,
        suggestedInput: userPrompt.length > 15 ? userPrompt : null
      };
    }

    try {
      // Try Groq first (primary), then Gemini (fallback)
      let generatedText = null;

      try {
        generatedText = await tryGroq(userPrompt);
        if (generatedText) console.log('MedAssist: Response from Groq (Llama 3.3 70B)');
      } catch (groqErr) {
        console.warn('Groq failed, trying Gemini fallback:', groqErr.message);
      }

      if (!generatedText) {
        try {
          generatedText = await tryGemini(userPrompt);
          if (generatedText) console.log('MedAssist: Response from Gemini fallback');
        } catch (geminiErr) {
          console.warn('Gemini fallback also failed:', geminiErr.message);
        }
      }

      if (!generatedText) {
        throw new Error('All AI services unavailable');
      }

      const quoteMatch = generatedText.match(/"([^"]{15,180})"/);
      const suggestedInput = quoteMatch ? quoteMatch[1] : null;
      return { text: generatedText, suggestedInput };
    } catch (err) {
      console.warn('All AI calls failed:', err);
      // Fall through to local knowledge
      const qLower = userPrompt.toLowerCase();
      const matched = CLINICAL_KNOWLEDGE.find(item =>
        item.keywords.some(kw => qLower.includes(kw))
      );
      if (matched) {
        return { text: `${matched.title}\n\n${matched.content}`, suggestedInput: matched.suggestedInput };
      }
      return {
        text: `I apologise — the AI service is temporarily unavailable (${err.message || 'connection error'}). Please try again in a moment.\n\nIn the meantime, please ensure your symptoms are described with specific details such as the affected area, duration, and severity so the diagnostic engine can provide an accurate analysis.`,
        suggestedInput: userPrompt
      };
    }
  };

  const handleSend = async (textToSend = inputText) => {
    const query = (textToSend || '').trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const response = await fetchAIResponse(query);

    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: response.text,
      suggestedInput: response.suggestedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Sheet */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full sm:max-w-lg bg-white h-[100dvh] sm:h-full shadow-2xl flex flex-col border-l border-border/80 overscroll-contain"
        >
          {/* Header featuring Medical Robot Checking Patient Report Video */}
          <div className="px-4 sm:px-5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 sm:py-3.5 border-b border-border/70 bg-gradient-to-r from-teal-50/95 via-cyan-50/80 to-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* 3D Floating Medical Robot Video Avatar */}
              <div
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 6px 24px 0 rgba(20,184,166,0.35), 0 2px 6px 0 rgba(0,0,0,0.25)' }}
              >
                <video
                  src="/assets/medical_robot.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-110 pointer-events-none select-none"
                >
                  <source src="/assets/medical_robot.mp4" type="video/mp4" />
                </video>
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                    MedAssist
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                  Clinical Support Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-slate-200/60 active:bg-slate-300 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 sm:px-4 py-2 border-b border-border/50 bg-slate-50/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none flex-shrink-0 touch-pan-x">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.prompt)}
                className="whitespace-nowrap px-3 py-1.5 sm:py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-teal-50 active:bg-teal-100 text-slate-700 hover:text-teal-900 border border-border shadow-2xs transition-colors flex-shrink-0 cursor-pointer min-h-[30px]"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 min-h-0 bg-slate-50/30 overscroll-contain">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Video Avatar in Message Feed */}
                {msg.role === 'assistant' && (
                  <div
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 sticky top-0"
                    style={{ boxShadow: '0 4px 16px 0 rgba(20,184,166,0.30), 0 2px 4px 0 rgba(0,0,0,0.20)' }}
                  >
                    <video
                      src="/assets/medical_robot.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover scale-110 pointer-events-none select-none"
                    >
                      <source src="/assets/medical_robot.mp4" type="video/mp4" />
                    </video>
                  </div>
                )}

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[85%]`}>
                  <div
                    className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs break-words overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-border/90 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {/* Render Clean Formatted Message Without Raw ** */}
                    {msg.role === 'assistant' ? (
                      <FormattedMessageText text={msg.text} />
                    ) : (
                      <p className="leading-relaxed">{msg.text}</p>
                    )}

                    {/* Suggestion CTA button if clinical input was formulated */}
                    {msg.suggestedInput && onUseSuggestion && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-teal-800 font-display">
                          Clinical Description Format:
                        </p>
                        <p className="text-[11px] font-mono text-slate-700 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/60 leading-snug break-words">
                          "{msg.suggestedInput}"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onUseSuggestion(msg.suggestedInput);
                            onClose();
                          }}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-colors shadow-xs cursor-pointer mt-1"
                        >
                          <span>Paste into Consultation</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-1 mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2.5 pl-1">
                <div
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0"
                  style={{ boxShadow: '0 4px 16px 0 rgba(20,184,166,0.30), 0 2px 4px 0 rgba(0,0,0,0.20)' }}
                >
                  <video
                    src="/assets/medical_robot.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-110 pointer-events-none select-none"
                  >
                    <source src="/assets/medical_robot.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-border text-slate-500 text-xs shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 ml-1 font-medium">MedAssist is analysing…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 sm:p-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border/80 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe symptoms or ask a question…"
                className="flex-1 px-3.5 sm:px-4 py-2.5 text-base sm:text-xs text-foreground bg-slate-50 rounded-xl border border-border focus:border-teal-500 focus:bg-white focus:outline-none transition-all placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="h-10 w-10 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
              MedAssist provides clinical guidance only &bull; Always consult a healthcare professional for medical decisions
            </p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
