/**
 * Comprehensive Clinical Storytelling Dataset for Patient Clinical Decision-Support System
 * Includes rich narrative breakdowns, underlying causes (why it happens),
 * precautions & red flags, practical safe home remedies, and 3D anatomical mappings.
 */

export const MOCK_CLINICAL_PRESETS = [
  {
    id: "preset_cough",
    label: "Persistent Cough & Throat Irritation",
    category: "Respiratory",
    rawSymptoms: "I have had a dry cough for the last few days, with throat irritation and mild chest soreness when coughing.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_c01", name: "Persistent Cough", severity: "moderate", category: "respiratory" },
        { id: "sym_c02", name: "Throat Irritation", severity: "mild", category: "upper_respiratory" },
        { id: "sym_c03", name: "Chest Wall Soreness", severity: "mild", category: "musculoskeletal" }
      ],
      bodyLocalization: {
        primaryRegion: "Thorax",
        secondaryRegions: ["Head"],
        bodySystem: "Respiratory / Bronchial Airways",
        targetOrgan: "Lungs & Bronchial Tree",
        spatialCoordinates: { x: 0.0, y: 0.8, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms indicate acute irritation and mild inflammation along the upper respiratory tract and bronchial airways.",
        whyItHappens: [
          "Post-viral airway hypersensitivity: Following a cold or mild viral exposure, sensitive airway nerves remain reactive, triggering frequent cough reflexes.",
          "Mucosal dryness & irritation: Dry indoor air, post-nasal drip, or seasonal irritants cause scratchiness in the throat lining.",
          "Cough muscle strain: Repeated coughing exerts physical stress on intercostal (rib) muscles, causing mild temporary chest soreness."
        ],
        precautions: [
          "Avoid cold, dry air and sudden temperature changes; use a scarf or mask outdoors.",
          "Do NOT take unprescribed antibiotics (antibiotics do not treat viral airway irritation).",
          "Avoid active or passive tobacco smoke, vaping, and harsh household aerosol cleaning sprays.",
          "Avoid lying completely flat on your back if post-nasal drip triggers nighttime coughing."
        ],
        redFlags: [
          "Coughing up blood or rust-colored phlegm",
          "High fever exceeding 102°F (38.9°C) lasting more than 48 hours",
          "Noticeable shortness of breath, wheezing, or difficulty speaking full sentences",
          "Sharp, stabbing chest pain that worsens deeply on inspiration"
        ],
        homeRemedies: [
          {
            title: "Warm Honey & Lemon Water",
            instructions: "Take 1–2 teaspoons of natural honey in warm water or herbal tea. Honey acts as a natural demulcent coating the irritated throat lining.",
            icon: "tea"
          },
          {
            title: "Steam Inhalation / Humidifier",
            instructions: "Inhale gentle steam for 10 minutes twice daily or keep a cool-mist room humidifier on at night to keep bronchial mucus membranes moist.",
            icon: "cloud"
          },
          {
            title: "Warm Salt Water Gargle",
            instructions: "Dissolve 1/2 teaspoon of salt in a glass of warm water. Gargle for 30 seconds 3 times daily to reduce pharyngeal swelling.",
            icon: "droplet"
          },
          {
            title: "Hydration & Sleep Elevation",
            instructions: "Drink at least 2–2.5 liters of warm fluids daily. Elevate your head with an extra pillow to prevent mucus pooling during sleep.",
            icon: "moon"
          }
        ],
        careTimeline: "Most acute viral coughs gradually resolve within 7–14 days. If the cough persists beyond 3 weeks or you experience any red flags, schedule an in-person primary care consultation."
      },
      possibleConditions: [
        {
          id: "cond_c01",
          name: "Acute Viral Bronchitis / Tracheitis",
          icd10Code: "J20.9",
          modelScore: 0.86,
          confidenceCategory: "High",
          description: "Temporary inflammation of the bronchial mucous membranes following a respiratory virus, causing dry or productive cough.",
          supportingSymptoms: ["Persistent Cough", "Throat Irritation", "Chest Wall Soreness"]
        },
        {
          id: "cond_c02",
          name: "Post-Infectious Upper Airway Irritation",
          icd10Code: "J06.9",
          modelScore: 0.68,
          confidenceCategory: "Moderate",
          description: "Lingering throat and airway tickle caused by hypersensitive cough receptors after mild viral infection.",
          supportingSymptoms: ["Persistent Cough", "Throat Irritation"]
        },
        {
          id: "cond_c03",
          name: "Post-Nasal Drip Syndrome (UACS)",
          icd10Code: "J34.89",
          modelScore: 0.45,
          confidenceCategory: "Low",
          description: "Excess nasal secretions dripping down the back of the throat, triggering frequent throat clearing and coughing.",
          supportingSymptoms: ["Throat Irritation"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 180,
        disclaimer: "This clinical narrative is designed for patient education and decision support. Always consult a healthcare professional for clinical evaluation."
      }
    }
  },
  {
    id: "preset_acid_reflux",
    label: "Heartburn & Acid Reflux",
    category: "Digestive",
    rawSymptoms: "Burning pain in the center of my chest and upper stomach after meals, sour acid taste in mouth, worse when lying down.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_a01", name: "Retrosternal Heartburn", severity: "moderate", category: "gastrointestinal" },
        { id: "sym_a02", name: "Acid Regurgitation", severity: "mild", category: "gastrointestinal" },
        { id: "sym_a03", name: "Postprandial Epigastric Burning", severity: "moderate", category: "gastrointestinal" }
      ],
      bodyLocalization: {
        primaryRegion: "Abdomen",
        secondaryRegions: ["Thorax"],
        bodySystem: "Gastrointestinal / Upper Digestive",
        targetOrgan: "Stomach & Lower Esophagus",
        spatialCoordinates: { x: 0.0, y: 0.64, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms indicate gastric acid backflowing into the lower esophagus, irritating the sensitive esophageal lining.",
        whyItHappens: [
          "Lower esophageal sphincter (LES) relaxation: The muscular valve between the stomach and esophagus relaxes abnormally, allowing acidic gastric juices to rise.",
          "Delayed stomach emptying: Heavy, fatty, or late-night meals keep food in the stomach longer, increasing upward pressure on the valve.",
          "Positioning: Gravity normally keeps acid in the stomach; lying down flat after eating allows acid to pool in the chest area."
        ],
        precautions: [
          "Do not lie down within 2 to 3 hours after eating a meal.",
          "Avoid trigger foods: deep-fried dishes, spicy peppers, chocolate, peppermint, citrus, and carbonated beverages.",
          "Eat smaller, more frequent meals rather than large heavy dinners.",
          "Avoid tight-fitting waistbands or belts that press directly on your abdomen."
        ],
        redFlags: [
          "Difficulty swallowing or feeling like food is stuck in your throat (dysphagia)",
          "Black tarry stools or vomiting material resembling dark coffee grounds",
          "Unexplained significant weight loss",
          "Severe crushing chest pain radiating to the left arm, neck, or jaw"
        ],
        homeRemedies: [
          {
            title: "Elevate Bed Head by 6 Inches",
            instructions: "Use bed risers or a firm wedge pillow so gravity naturally prevents acid from traveling up your esophagus during sleep.",
            icon: "moon"
          },
          {
            title: "Chamomile or Ginger Tea",
            instructions: "Sip warm chamomile or mild ginger tea 30 minutes after meals to soothe the digestive tract and reduce acidity.",
            icon: "tea"
          },
          {
            title: "Chew Sugar-Free Gum After Meals",
            instructions: "Chewing gum stimulates saliva production, which contains natural bicarbonate that neutralizes residual esophageal acid.",
            icon: "droplet"
          },
          {
            title: "Over-the-Counter Antacid Support",
            instructions: "Short-term use of calcium carbonate or magnesium antacids can provide fast temporary buffering when heartburn flares up.",
            icon: "pill"
          }
        ],
        careTimeline: "Mild reflux improves within days of dietary changes. If heartburn occurs more than twice a week for over 2 weeks, consult a gastroenterologist."
      },
      possibleConditions: [
        {
          id: "cond_a01",
          name: "Gastroesophageal Reflux Disease (GERD)",
          icd10Code: "K21.9",
          modelScore: 0.89,
          confidenceCategory: "High",
          description: "Chronic reflux of stomach acid into the esophagus causing characteristic retrosternal burning and acid regurgitation.",
          supportingSymptoms: ["Retrosternal Heartburn", "Acid Regurgitation", "Postprandial Epigastric Burning"]
        },
        {
          id: "cond_a02",
          name: "Functional Dyspepsia / Gastritis",
          icd10Code: "K29.70",
          modelScore: 0.62,
          confidenceCategory: "Moderate",
          description: "Superficial irritation of the gastric mucosa producing upper stomach burning and meal-related discomfort.",
          supportingSymptoms: ["Postprandial Epigastric Burning"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 195,
        disclaimer: "This clinical narrative is designed for patient education and decision support. Always consult a healthcare professional for clinical evaluation."
      }
    }
  },
  {
    id: "preset_chest_pain",
    label: "Acute Chest Discomfort",
    category: "Cardiovascular",
    rawSymptoms: "Patient reports acute chest discomfort, shortness of breath on exertion, and mild dizziness.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_001", name: "Chest Discomfort", severity: "moderate", category: "cardiovascular" },
        { id: "sym_002", name: "Dyspnea on Exertion", severity: "moderate", category: "respiratory" },
        { id: "sym_003", name: "Mild Dizziness", severity: "mild", category: "neurological" }
      ],
      bodyLocalization: {
        primaryRegion: "Thorax",
        secondaryRegions: ["Abdomen"],
        bodySystem: "Cardiovascular / Respiratory",
        targetOrgan: "Heart & Pulmonary Arteries",
        spatialCoordinates: { x: 0.0, y: 0.79, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms center on the thoracic cavity, requiring careful evaluation of both cardiovascular and pulmonary blood flow dynamics.",
        whyItHappens: [
          "Myocardial oxygen demand imbalance: Physical exertion increases heart rate; if coronary blood flow is temporarily restricted, heart tissue signals discomfort.",
          "Exercise-induced pulmonary congestion: Reduced cardiac output can cause temporary fluid backpressure in the lungs, triggering breathlessness.",
          "Transient cerebral perfusion changes: Fluctuations in blood pressure during exertion can manifest as brief lightheadedness."
        ],
        precautions: [
          "Cease all strenuous physical activity and sit in a comfortable upright position immediately.",
          "Do not drive yourself to a medical facility if experiencing active chest pressure with shortness of breath.",
          "Avoid caffeine, stimulants, smoking, or heavy meals while resting.",
          "Keep calm and breathe slowly to minimize cardiac workload."
        ],
        redFlags: [
          "Crushing, squeezing, or heavy chest pressure lasting longer than 5 minutes",
          "Pain radiating into the left shoulder, arm, back, neck, or jaw",
          "Cold diaphoresis (clammy profuse sweating) accompanied by nausea",
          "Sudden severe shortness of breath at rest or feeling faint/fainting (syncope)"
        ],
        homeRemedies: [
          {
            title: "Immediate Rest & Seated Position",
            instructions: "Stop all physical exertion immediately. Sit upright in a comfortable chair with back support to reduce venous return pressure.",
            icon: "heart"
          },
          {
            title: "Slow Rhythmic Diaphragmatic Breathing",
            instructions: "Breathe in slowly through your nose for 4 seconds and exhale gently for 6 seconds to calm the autonomic nervous system.",
            icon: "wind"
          },
          {
            title: "Emergency Medical Triage",
            instructions: "Because acute chest discomfort on exertion can indicate cardiac ischemia, immediate clinical evaluation (ECG & cardiac enzymes) is strongly advised.",
            icon: "shield"
          }
        ],
        careTimeline: "Acute chest discomfort with exertion is a potential medical emergency. Seek urgent evaluation at the nearest emergency department or call emergency services."
      },
      possibleConditions: [
        {
          id: "cond_001",
          name: "Angina Pectoris / Myocardial Ischemia",
          icd10Code: "I20.9",
          modelScore: 0.84,
          confidenceCategory: "High",
          description: "Chest discomfort or pressure resulting from temporary ischemia to the myocardium during exertion.",
          supportingSymptoms: ["Chest Discomfort", "Dyspnea on Exertion", "Mild Dizziness"]
        },
        {
          id: "cond_002",
          name: "Gastroesophageal Reflux Disease",
          icd10Code: "K21.9",
          modelScore: 0.61,
          confidenceCategory: "Moderate",
          description: "Mucosal damage produced by abnormal reflux of gastric contents into the esophagus mimicking chest tightness.",
          supportingSymptoms: ["Chest Discomfort"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 240,
        disclaimer: "This analysis provides probabilistic clinical decision support only and does not constitute a confirmed diagnosis."
      }
    }
  },
  {
    id: "preset_headache",
    label: "Throbbing Headache & Photophobia",
    category: "Neurological",
    rawSymptoms: "Throbbing frontal headache on one side, extreme sensitivity to bright light, and mild nausea.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_004", name: "Throbbing Unilateral Headache", severity: "severe", category: "neurological" },
        { id: "sym_005", name: "Photophobia", severity: "moderate", category: "neurological" },
        { id: "sym_006", name: "Nausea", severity: "mild", category: "gastrointestinal" }
      ],
      bodyLocalization: {
        primaryRegion: "Head",
        secondaryRegions: ["Upper Limb"],
        bodySystem: "Central Nervous System / Cranial Nerves",
        targetOrgan: "Trigeminovascular System & Meninges",
        spatialCoordinates: { x: 0.0, y: 1.07, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms align with a neurovascular headache pattern involving temporary sensitization of cranial nerve pathways and blood vessel dilation.",
        whyItHappens: [
          "Trigeminovascular activation: The trigeminal nerve releases neuropeptides that cause localized sterile neurogenic inflammation around meningeal vessels.",
          "Cortical sensory hypersensitivity: Brainstem sensory filtering becomes hypersensitive, causing normal room light and ambient sounds to feel painful.",
          "Autonomic gastrointestinal slowing: Migraine attacks temporarily slow stomach motility, triggering nausea."
        ],
        precautions: [
          "Avoid bright screens (phones, computers, television) and fluorescent lighting during acute episodes.",
          "Avoid common dietary triggers: aged cheeses, cured meats (nitrates), artificial sweeteners, and alcohol.",
          "Maintain a consistent sleep and meal schedule; skipping meals is a major headache trigger.",
          "Stay well hydrated with electrolyte-balanced water."
        ],
        redFlags: [
          "Sudden explosive 'thunderclap' headache reaching maximum intensity within seconds",
          "Headache accompanied by fever, neck stiffness, and confusion",
          "New neurological deficits: facial drooping, weakness on one side of body, speech slurring",
          "Headache following a recent traumatic head injury"
        ],
        homeRemedies: [
          {
            title: "Dark, Quiet Room Rest",
            instructions: "Lie down in a completely dark, silent, and cool room for 45–60 minutes to reduce sensory stimulation on overactive cranial nerves.",
            icon: "moon"
          },
          {
            title: "Cold Compress on Forehead & Temples",
            instructions: "Apply an ice pack wrapped in a cloth to your forehead or back of the neck for 15 minutes to gently constrict dilated blood vessels.",
            icon: "droplet"
          },
          {
            title: "Hydration & Peppermint/Ginger",
            instructions: "Drink a large glass of cool water. A small cup of ginger tea can help settle nausea and reduce neurogenic inflammation.",
            icon: "tea"
          }
        ],
        careTimeline: "Most migraine episodes resolve within 4 to 24 hours with rest and hydration. If episodes recur more than 3 times a month, consult a neurologist for preventive therapy."
      },
      possibleConditions: [
        {
          id: "cond_004",
          name: "Migraine Without Aura",
          icd10Code: "G43.009",
          modelScore: 0.88,
          confidenceCategory: "High",
          description: "Recurrent neurovascular headache disorder characterized by throbbing pain, photophobia, and nausea.",
          supportingSymptoms: ["Throbbing Unilateral Headache", "Photophobia", "Nausea"]
        },
        {
          id: "cond_005",
          name: "Tension-Type Headache",
          icd10Code: "G44.209",
          modelScore: 0.53,
          confidenceCategory: "Moderate",
          description: "Bilateral mild to moderate pressure or tightening headache originating from pericranial muscle tension.",
          supportingSymptoms: ["Throbbing Unilateral Headache"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 190,
        disclaimer: "This clinical narrative is designed for patient education and decision support. Always consult a healthcare professional for clinical evaluation."
      }
    }
  },
  {
    id: "preset_back_pain",
    label: "Lower Back Muscle Strain",
    category: "Musculoskeletal",
    rawSymptoms: "Dull ache in lower back after lifting heavy objects, stiffness when bending, no radiating leg pain or numbness.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_b01", name: "Lumbar Back Pain", severity: "moderate", category: "musculoskeletal" },
        { id: "sym_b02", name: "Lumbar Stiffness", severity: "moderate", category: "musculoskeletal" },
        { id: "sym_b03", name: "Absence of Radiculopathy", severity: "mild", category: "neurological" }
      ],
      bodyLocalization: {
        primaryRegion: "Pelvis",
        secondaryRegions: ["Lower Limb"],
        bodySystem: "Musculoskeletal / Lumbar Spine",
        targetOrgan: "Erector Spinae & Lumbar Vertebrae",
        spatialCoordinates: { x: 0.0, y: 0.40, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms indicate acute lumbar myofascial muscle strain or ligamentous sprain localized to the lower back without nerve compression.",
        whyItHappens: [
          "Micro-tears in paraspinal muscle fibers: Heavy or improper lifting causes mechanical overstretching of the lumbar erector spinae muscles.",
          "Protective muscle spasm: Surrounding muscles contract tightly to splint and protect the lumbar spinal segment, creating stiffness.",
          "Localized inflammatory response: Cellular repair triggers mild swelling and tenderness around the lower lumbar connective tissue."
        ],
        precautions: [
          "Avoid prolonged complete bed rest; light gentle walking promotes blood flow and faster tissue healing.",
          "Do not perform heavy lifting, sudden twisting, or high-impact jumping during the acute phase.",
          "Maintain good seated posture with a small rolled towel supporting the lower back curve.",
          "Avoid bending forward at the waist; bend at the knees and hips when picking up objects."
        ],
        redFlags: [
          "Loss of bowel or bladder control (saddle anesthesia / Cauda Equina warning)",
          "Numbness, tingling, or weakness radiating down past the knee into the foot",
          "Back pain accompanied by unexplained fever or chills",
          "Severe progressive weakness in ankle or leg movement"
        ],
        homeRemedies: [
          {
            title: "Cold Pack (First 48 Hours) followed by Gentle Heat",
            instructions: "Apply ice wrapped in a towel for 15 minutes every 3 hours for the first 2 days to reduce acute swelling, then switch to gentle heat to relax tight spasms.",
            icon: "droplet"
          },
          {
            title: "Gentle Knee-to-Chest & Pelvic Tilts",
            instructions: "Lie on your back on a firm mat and gently pull one knee at a time toward your chest for 20 seconds to decompress the lumbar spine.",
            icon: "body"
          },
          {
            title: "Ergonomic Sleeping Posture",
            instructions: "Sleep on your side with a pillow between your knees, or on your back with a pillow beneath your knees to relieve lumbar disc pressure.",
            icon: "moon"
          }
        ],
        careTimeline: "Simple mechanical back strain typically improves substantially within 1 to 2 weeks with active gentle movement. If pain persists beyond 4 weeks or radiates down the leg, consult an orthopedic specialist."
      },
      possibleConditions: [
        {
          id: "cond_b01",
          name: "Acute Lumbar Muscular Strain",
          icd10Code: "S39.012A",
          modelScore: 0.91,
          confidenceCategory: "High",
          description: "Overstretching or microscopic tearing of the paraspinal muscles and tendons of the lower back.",
          supportingSymptoms: ["Lumbar Back Pain", "Lumbar Stiffness", "Absence of Radiculopathy"]
        },
        {
          id: "cond_b02",
          name: "Lumbar Facet Joint Irritation",
          icd10Code: "M54.5",
          modelScore: 0.58,
          confidenceCategory: "Moderate",
          description: "Mild mechanical inflammation of the posterior lumbar articulating joints causing localized stiffness.",
          supportingSymptoms: ["Lumbar Back Pain", "Lumbar Stiffness"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 175,
        disclaimer: "This clinical narrative is designed for patient education and decision support. Always consult a healthcare professional for clinical evaluation."
      }
    }
  },
  {
    id: "preset_abdominal",
    label: "Right Lower Quadrant Abdominal Pain",
    category: "Digestive",
    rawSymptoms: "Sharply localized pain in the right lower abdomen accompanied by low fever and loss of appetite.",
    response: {
      status: "completed",
      timestamp: new Date().toISOString(),
      extractedSymptoms: [
        { id: "sym_007", name: "RLQ Abdominal Pain", severity: "severe", category: "gastrointestinal" },
        { id: "sym_008", name: "Low-grade Fever", severity: "mild", category: "systemic" },
        { id: "sym_009", name: "Anorexia / Loss of Appetite", severity: "mild", category: "gastrointestinal" }
      ],
      bodyLocalization: {
        primaryRegion: "Abdomen",
        secondaryRegions: ["Pelvis"],
        bodySystem: "Gastrointestinal",
        targetOrgan: "Appendix & Cecum",
        spatialCoordinates: { x: -0.2, y: 0.45, z: 0.0 }
      },
      storyline: {
        patientOverview: "Your symptoms indicate acute localized inflammation in the right lower quadrant of the abdomen, which requires urgent surgical clinical evaluation.",
        whyItHappens: [
          "Appendiceal lumen obstruction: A small blockage leads to bacterial proliferation and intraluminal pressure elevation inside the appendix.",
          "Parietal peritoneal irritation: As the inflammation extends through the appendiceal wall, it contacts the abdominal lining, making pain sharp and pinpointed in the right lower quadrant.",
          "Systemic inflammatory signaling: Cytokine release induces loss of appetite and low-grade pyrexia (fever)."
        ],
        precautions: [
          "Do NOT take laxatives, enemas, or heating pads on the abdomen (heat can increase the risk of appendiceal rupture).",
          "Avoid eating solid foods or heavy meals while waiting for clinical evaluation.",
          "Do not take heavy painkillers that could mask worsening abdominal symptoms before a physician examines you.",
          "Seek professional clinical assessment promptly."
        ],
        redFlags: [
          "Severe sudden worsening of pain or rebound tenderness (pain when releasing pressure)",
          "Persistent vomiting or inability to keep liquids down",
          "High spiking fever with shaking chills",
          "Abdomen becoming rigid, hard, or distended like a board"
        ],
        homeRemedies: [
          {
            title: "Immediate Clinical Triage (Do Not Self-Treat)",
            instructions: "Suspected acute appendicitis is a surgical emergency. Rest calmly while arranging prompt transport to an urgent care or emergency medical center.",
            icon: "shield"
          },
          {
            title: "Sip Small Amounts of Water Only",
            instructions: "Remain fasting (NPO) or take only tiny sips of water in case diagnostic ultrasound/CT imaging or prompt surgery is indicated.",
            icon: "droplet"
          }
        ],
        careTimeline: "Right lower quadrant abdominal pain with fever requires immediate emergency or urgent clinical assessment within hours."
      },
      possibleConditions: [
        {
          id: "cond_006",
          name: "Acute Appendicitis",
          icd10Code: "K35.80",
          modelScore: 0.92,
          confidenceCategory: "High",
          description: "Acute inflammation of the vermiform appendix requiring urgent surgical evaluation.",
          supportingSymptoms: ["RLQ Abdominal Pain", "Low-grade Fever", "Anorexia / Loss of Appetite"]
        },
        {
          id: "cond_007",
          name: "Mesenteric Adenitis / Gastroenteritis",
          icd10Code: "I88.0",
          modelScore: 0.42,
          confidenceCategory: "Low",
          description: "Inflammation of the abdominal mesenteric lymph nodes or bowel wall often following a viral infection.",
          supportingSymptoms: ["RLQ Abdominal Pain", "Low-grade Fever"]
        }
      ],
      modelMetaData: {
        version: "2.1.0",
        inferenceTimeMs: 210,
        disclaimer: "This analysis provides probabilistic clinical decision support only and does not constitute a confirmed diagnosis."
      }
    }
  }
];
