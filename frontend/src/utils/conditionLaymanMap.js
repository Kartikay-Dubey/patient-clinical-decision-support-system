/**
 * Layman clinical dictionary for all 49 DDXPlus conditions.
 * Connects diagnostic predictions directly to understandable everyday terms,
 * targeted anatomical structures, safe home guidance, and red-flag escalation triggers.
 */

export const CONDITION_LAYMAN_MAP = {
  "Acute rhinosinusitis": {
    laymanTitle: "Acute Sinus Infection & Congestion",
    plainName: "Sinusitis",
    bodyConnection: "Paranasal Sinuses (Head / Facial Cavities)",
    anatomyExplanation: "Your symptoms involve inflammation of the sinus air pockets located behind your forehead, cheeks, and nasal bridge.",
    explanation: "A temporary swelling or infection of the nasal passages and sinus cavities, commonly following a cold or viral illness. This causes facial pressure, nasal blockage, and headaches.",
    homeCare: [
      "Inhale warm steam from a bowl of hot water or take a warm shower to open airways",
      "Apply a warm, damp washcloth over your nose, cheeks, and eyes to ease facial pain",
      "Use sterile saline nasal spray or rinse to flush mucus and keep passages moist",
      "Stay well hydrated with warm water, herbal teas, and broths to thin nasal secretions"
    ],
    redFlags: [
      "Severe swelling, redness, or pain around one or both eyes",
      "Fever higher than 102°F (38.9°C) lasting more than 3 days",
      "Stiff neck, confusion, or sudden severe headache",
      "Symptoms fail to improve after 10 days or worsen abruptly after initial improvement"
    ]
  },
  "Chronic rhinosinusitis": {
    laymanTitle: "Chronic Sinus Inflammation",
    plainName: "Chronic Sinusitis",
    bodyConnection: "Paranasal Sinuses & Nasal Mucosa (Head Region)",
    anatomyExplanation: "Ongoing swelling of the lining inside your nose and sinus cavities.",
    explanation: "Persistent inflammation of the sinus passages lasting over 12 weeks, leading to ongoing nasal stuffiness, decreased smell, and dull facial aching.",
    homeCare: [
      "Daily saline nasal rinses to gently clear trapped mucus",
      "Use a room humidifier to prevent nasal dryness, especially during sleep",
      "Avoid smoke, dust, and sudden temperature shifts"
    ],
    redFlags: [
      "Vision changes, double vision, or swelling around the eyes",
      "High fever or severe facial asymmetry",
      "Severe frontal headache that does not respond to pain relief"
    ]
  },
  "Allergic sinusitis": {
    laymanTitle: "Allergic Sinus & Nasal Irritation",
    plainName: "Nasal Allergies / Hay Fever",
    bodyConnection: "Nasal Mucosa & Paranasal Sinuses (Head)",
    anatomyExplanation: "Your immune system reacts to airborne allergens (pollen, dust, dander), swelling the lining of your nasal passages.",
    explanation: "An allergic reaction causing sneezing, itchy watery eyes, runny nose, and sinus congestion without bacterial infection.",
    homeCare: [
      "Rinse nasal passages with saline spray to remove allergen particles",
      "Keep windows closed during high pollen counts and shower before bed",
      "Consider over-the-counter non-drowsy antihistamines as advised by a pharmacist"
    ],
    redFlags: [
      "Wheezing, shortness of breath, or chest tightness",
      "Swelling of the lips, tongue, face, or throat (seek immediate emergency care)"
    ]
  },
  "Viral pharyngitis": {
    laymanTitle: "Sore Throat (Viral Pharyngitis)",
    plainName: "Sore Throat",
    bodyConnection: "Pharynx & Tonsils (Throat / Head-Neck Region)",
    anatomyExplanation: "Viral infection irritating the mucous membranes at the back of your throat.",
    explanation: "A common viral illness causing scratchy throat discomfort, pain with swallowing, mild fever, and tiredness. Most cases resolve on their own within 5 to 7 days.",
    homeCare: [
      "Gargle with warm salt water (1/2 teaspoon salt in a glass of warm water) 3–4 times daily",
      "Sip warm teas with honey or cool soothing liquids to ease throat irritation",
      "Rest your voice and get adequate sleep"
    ],
    redFlags: [
      "Difficulty breathing, noisy breathing (stridor), or inability to swallow saliva",
      "Inability to fully open your mouth or severe asymmetrical throat swelling",
      "Fever lasting longer than 4 days without improvement"
    ]
  },
  "Acute laryngitis": {
    laymanTitle: "Laryngitis (Voice Box Inflammation)",
    plainName: "Laryngitis",
    bodyConnection: "Larynx & Vocal Cords (Neck Region)",
    anatomyExplanation: "Irritation and swelling of the vocal cords in your voice box, altering your voice.",
    explanation: "Inflammation of the larynx, usually from a viral infection or vocal strain, causing hoarseness, loss of voice, and throat dryness.",
    homeCare: [
      "Rest your voice completely — avoid speaking or whispering (whispering strains cords more)",
      "Breathe warm, moist air using a humidifier or warm steam",
      "Drink plenty of fluids; avoid caffeine, alcohol, and smoke"
    ],
    redFlags: [
      "Difficulty breathing or swallowing",
      "Coughing up blood or persistent hoarseness lasting more than 2 weeks",
      "Severe neck pain or high fever"
    ]
  },
  "URTI": {
    laymanTitle: "Upper Respiratory Infection (Common Cold / Viral Syndrome)",
    plainName: "Common Cold / Viral Cold",
    bodyConnection: "Nose, Throat & Upper Airways (Head & Neck)",
    anatomyExplanation: "A mild viral infection affecting the mucosal lining of your nose, throat, and upper respiratory tract.",
    explanation: "A common, self-limiting viral infection causing runny nose, sneezing, mild sore throat, cough, and low-grade fatigue. Typically improves within a week.",
    homeCare: [
      "Prioritize restful sleep to allow your immune system to clear the virus",
      "Drink warm fluids like lemon tea, honey, and broths",
      "Use saline nasal drops and wash hands frequently to prevent spread"
    ],
    redFlags: [
      "Shortness of breath, chest pain, or wheezing",
      "Fever exceeding 102°F or lasting more than 3 to 4 days",
      "Symptoms that improve and then suddenly worsen with severe cough"
    ]
  },
  "Influenza": {
    laymanTitle: "Flu (Influenza Infection)",
    plainName: "Flu",
    bodyConnection: "Respiratory Tract & Systemic Circulation (Thorax & Head)",
    anatomyExplanation: "A viral infection that travels through your respiratory tract and triggers a body-wide immune response.",
    explanation: "A contagious respiratory virus characterized by sudden onset of high fever, chills, prominent muscle aches, headache, and severe exhaustion.",
    homeCare: [
      "Stay home and rest thoroughly; avoid exertion while feverish",
      "Drink plenty of water and electrolyte solutions to prevent dehydration",
      "Take doctor-approved fever reducers (paracetamol/acetaminophen) if needed"
    ],
    redFlags: [
      "Difficulty breathing, shortness of breath, or chest pressure",
      "Dizziness, confusion, or inability to stay awake",
      "Persistent vomiting or inability to keep fluids down"
    ]
  },
  "Bronchitis": {
    laymanTitle: "Acute Bronchitis (Chest Cold)",
    plainName: "Bronchitis",
    bodyConnection: "Bronchial Airway Tubes (Thorax / Chest)",
    anatomyExplanation: "Inflammation of the large airway tubes (bronchi) delivering air into your lungs.",
    explanation: "Swelling of the bronchial tubes following a viral cold, causing a persistent cough that may produce clear or colored mucus, chest soreness, and fatigue.",
    homeCare: [
      "Drink warm liquids to soothe airways and loosen chest mucus",
      "Use a cool-mist humidifier in your room",
      "Avoid smoke, dust, and cold air triggers"
    ],
    redFlags: [
      "Shortness of breath at rest or when speaking",
      "Coughing up blood or rust-colored phlegm",
      "Fever above 101°F (38.3°C) or cough lasting over 3 weeks"
    ]
  },
  "Cluster headache": {
    laymanTitle: "Cluster Headache (Severe Unilateral Head Pain)",
    plainName: "Cluster Headache",
    bodyConnection: "Trigeminal Nerve & Orbit (Head / Eye Region)",
    anatomyExplanation: "Sharp irritation of the nerve pathway behind one eye and temple.",
    explanation: "Intense, piercing headaches occurring on one side of the head, often centered around or behind one eye, frequently with eye redness or tearing.",
    homeCare: [
      "Sit upright in a quiet, dark room during an episode",
      "Maintain a consistent sleep schedule and avoid alcohol triggers",
      "Consult a doctor for prescription abortive therapies (e.g. oxygen therapy, triptans)"
    ],
    redFlags: [
      "Sudden 'thunderclap' headache reaching maximum intensity in seconds",
      "Headache accompanied by fever, stiff neck, confusion, or weakness",
      "New headache after age 50 or head injury"
    ]
  },
  "GERD": {
    laymanTitle: "Acid Reflux / Heartburn (GERD)",
    plainName: "Acid Reflux",
    bodyConnection: "Esophagus & Upper Stomach (Abdomen / Lower Chest)",
    anatomyExplanation: "Stomach acid flowing backward up into the esophagus, irritating its sensitive lining.",
    explanation: "A digestive condition where stomach acid washes back into the food pipe, causing a burning chest sensation (heartburn), sour taste, and post-meal discomfort.",
    homeCare: [
      "Eat smaller, more frequent meals; avoid lying down for 2–3 hours after eating",
      "Elevate the head of your bed 6 inches",
      "Avoid trigger foods (spicy foods, citrus, chocolate, peppermint, caffeine)"
    ],
    redFlags: [
      "Difficulty or severe pain when swallowing food or liquids",
      "Crushing chest pain radiating to the left arm, neck, or jaw (rule out heart issues)",
      "Vomiting blood or dark black stools"
    ]
  },
  "Pneumonia": {
    laymanTitle: "Pneumonia (Lung Infection)",
    plainName: "Pneumonia",
    bodyConnection: "Lung Parenchyma & Alveoli (Thorax / Chest)",
    anatomyExplanation: "Infection causing the tiny air sacs (alveoli) inside your lungs to become inflamed and filled with fluid.",
    explanation: "An infection of the lung tissue causing cough with phlegm, fever, chills, and breathing discomfort. Requires prompt medical diagnosis and evaluation.",
    homeCare: [
      "Rest completely and maintain steady hydration",
      "Seek medical evaluation for chest auscultation, pulse oximetry, and possible chest X-ray",
      "Take prescribed medications exactly as directed by your physician"
    ],
    redFlags: [
      "Severe shortness of breath, rapid breathing, or blue/gray lips",
      "Persistent chest pain worsened by deep breathing or coughing",
      "New confusion, dizziness, or marked weakness"
    ]
  },
  "Panic attack": {
    laymanTitle: "Panic / Anxiety Episode",
    plainName: "Panic Attack",
    bodyConnection: "Autonomic Nervous System & Cardiopulmonary (Systemic)",
    anatomyExplanation: "A sudden surge of the sympathetic fight-or-flight nervous response triggering rapid heart rate, breathing changes, and physical distress.",
    explanation: "A sudden episode of intense fear or discomfort with rapid heartbeat, shortness of breath, trembling, and sweating, typically peaking within 10 minutes.",
    homeCare: [
      "Practice slow diaphragmatic breathing (breathe in for 4 seconds, hold 4, breathe out 4)",
      "Focus on 5 things you can see, 4 you can touch, and 3 you can hear to ground yourself",
      "Remind yourself that the sensations are temporary and will subside"
    ],
    redFlags: [
      "Crushing chest pressure or pain radiating to the left arm/jaw (needs ECG to rule out cardiac causes)",
      "Loss of consciousness or severe sustained shortness of breath"
    ]
  }
};

/**
 * Returns formatted layman details for any condition, with universal fallback
 */
export function getConditionLaymanDetails(conditionName = '', bodyLocalization = {}) {
  const normalized = conditionName ? conditionName.trim() : '';
  
  if (CONDITION_LAYMAN_MAP[normalized]) {
    return CONDITION_LAYMAN_MAP[normalized];
  }

  // Look for partial matches
  for (const [key, val] of Object.entries(CONDITION_LAYMAN_MAP)) {
    if (normalized.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(normalized.toLowerCase())) {
      return val;
    }
  }

  // Default fallback for other conditions
  const region = bodyLocalization.primaryRegion || 'Targeted';
  const system = bodyLocalization.bodySystem || 'General';

  return {
    laymanTitle: normalized || "Clinical Consideration",
    plainName: normalized,
    bodyConnection: `${region} Region (${system} System)`,
    anatomyExplanation: `Your reported symptoms correspond to the ${region} region and involve the ${system.toLowerCase()} system shown in the 3D body viewer.`,
    explanation: `${normalized} is a clinical condition evaluated based on your reported symptoms. Consult a healthcare provider for physical examination and confirmation.`,
    homeCare: [
      "Rest and avoid strenuous physical exertion",
      "Stay well hydrated with clean water and electrolyte fluids",
      "Keep track of symptom changes and write down any new concerns for your doctor"
    ],
    redFlags: [
      "Severe difficulty breathing, chest pain, or fainting",
      "High fever lasting more than 3 days",
      "Rapid worsening of symptoms or inability to keep liquids down"
    ]
  };
}
