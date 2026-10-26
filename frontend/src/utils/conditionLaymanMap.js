/**
 * Layman clinical dictionary for DDXPlus conditions and everyday viral infections.
 * Translates clinical diagnostic terms into clear everyday names (e.g. Common Cold,
 * Viral Fever, The Flu, Chest Cold, Sinus Infection, Stomach Bug) for patient-friendly comprehension.
 * 
 * Sourced from CDC, NHS, and Mayo Clinic patient health standards.
 */

export const CONDITION_LAYMAN_MAP = {
  // --- EVERYDAY VIRAL ILLNESSES & RESPIRATORY INFECTIONS ---
  "URTI": {
    laymanTitle: "Common Cold (Upper Respiratory Infection)",
    plainName: "Common Cold / Head Cold",
    category: "Viral Infection",
    aliases: ["Cold", "Head Cold", "Viral Cold", "Rhinopharyngitis", "Upper Respiratory Infection"],
    bodyConnection: "Nose, Throat & Upper Airways (Head & Neck)",
    anatomyExplanation: "A mild viral infection irritating the mucous membranes of your nasal passages, throat, and upper airways.",
    explanation: "A common, self-limiting viral illness (frequently rhinovirus) causing runny or stuffy nose, sneezing, scratchy throat, mild cough, and low-grade fatigue. Typically resolves on its own within 7 to 10 days.",
    homeCare: [
      "Prioritize restful sleep to help your immune system fight off the virus",
      "Drink warm fluids like lemon water, honey tea, and clear broths to soothe throat and thin mucus",
      "Use sterile saline nasal spray or rinses to clear nasal passages gently",
      "Wash hands frequently and use a room humidifier to ease congestion"
    ],
    redFlags: [
      "Shortness of breath, audible wheezing, or chest tightness",
      "High fever exceeding 102°F (38.9°C) or fever lasting more than 3 to 4 days",
      "Symptoms that improve but then suddenly worsen with severe cough and chills"
    ]
  },

  "Influenza": {
    laymanTitle: "Seasonal Flu / Viral Fever (Influenza)",
    plainName: "The Flu / Viral Fever",
    category: "Viral Infection",
    aliases: ["Flu", "The Flu", "Seasonal Flu", "Viral Fever", "Influenza Virus"],
    bodyConnection: "Respiratory Tract & Systemic Circulation (Thorax & Head)",
    anatomyExplanation: "A contagious respiratory virus that travels into the airways and triggers a body-wide inflammatory immune response.",
    explanation: "A sudden, highly contagious respiratory infection caused by influenza viruses. Unlike a mild cold, the flu brings abrupt high fever, severe body aches, chills, headache, dry cough, and marked exhaustion.",
    homeCare: [
      "Stay home and get plenty of bed rest; avoid physical exertion while feverish",
      "Drink plenty of water, clear soups, and oral rehydration/electrolyte fluids to prevent dehydration",
      "Take pharmacist-advised fever reducers (such as paracetamol/acetaminophen) to relieve body aches",
      "Use steam inhalation or a cool-mist humidifier to ease breathing"
    ],
    redFlags: [
      "Difficulty breathing, shortness of breath, or chest pressure",
      "Confusion, persistent dizziness, or inability to stay awake",
      "Persistent vomiting or inability to keep any fluids down for 24 hours",
      "People at high risk (infants, elderly, pregnant, asthma) should contact a doctor promptly"
    ]
  },

  "Viral pharyngitis": {
    laymanTitle: "Viral Sore Throat (Pharyngitis)",
    plainName: "Viral Sore Throat",
    category: "Viral Infection",
    aliases: ["Sore Throat", "Throat Infection", "Pharyngitis", "Throat Bug"],
    bodyConnection: "Pharynx & Tonsils (Throat / Head-Neck Region)",
    anatomyExplanation: "A viral bug inflaming and reddening the back of your throat (pharynx) and tonsil tissue.",
    explanation: "A viral infection causing scratchy, burning throat discomfort, pain when swallowing, mild fever, and swollen neck glands. Antibiotics are not effective because it is caused by a virus, not bacteria.",
    homeCare: [
      "Gargle with warm salt water (1/2 teaspoon salt in 1 cup warm water) 3–4 times daily",
      "Sip warm teas with honey or cool soothing liquids to calm throat lining",
      "Suck on throat lozenges or fruit ice pops to numb soreness",
      "Rest your voice and avoid cigarette smoke or dry air"
    ],
    redFlags: [
      "Difficulty breathing, noisy breathing (stridor), or difficulty opening your mouth (trismus)",
      "Inability to swallow your own saliva or fluids",
      "Fever lasting longer than 4 days without signs of improvement"
    ]
  },

  "Acute bronchitis": {
    laymanTitle: "Chest Cold (Acute Bronchitis)",
    plainName: "Chest Cold / Bronchitis",
    category: "Viral Infection",
    aliases: ["Chest Cold", "Bronchitis", "Deep Cough", "Bronchial Infection"],
    bodyConnection: "Bronchial Airway Tubes (Thorax / Chest)",
    anatomyExplanation: "Inflammation and mucus buildup inside the large airway branching tubes (bronchi) carrying air into your lungs.",
    explanation: "Commonly known as a 'chest cold', this is inflammation of the main airways following a common cold or flu. It causes a lingering chesty cough that may produce clear, yellow, or greenish phlegm, along with chest soreness.",
    homeCare: [
      "Drink plenty of warm liquids to thin thick mucus and soothe irritated airways",
      "Run a cool-mist humidifier in your bedroom to keep airways moist",
      "Take honey (for adults and children over 1 year) before bed to quiet nighttime coughing",
      "Avoid secondhand smoke, aerosol sprays, and cold night air"
    ],
    redFlags: [
      "Shortness of breath at rest or when speaking short sentences",
      "Coughing up rust-colored phlegm or streaks of blood",
      "Fever above 101°F (38.3°C) or cough lasting longer than 3 to 4 weeks"
    ]
  },

  "Bronchitis": {
    laymanTitle: "Chest Cold (Acute Bronchitis)",
    plainName: "Chest Cold / Bronchitis",
    category: "Viral Infection",
    aliases: ["Chest Cold", "Bronchitis", "Deep Cough", "Bronchial Infection"],
    bodyConnection: "Bronchial Airway Tubes (Thorax / Chest)",
    anatomyExplanation: "Inflammation of the airway tubes delivering air to your lungs, usually triggered by a viral infection.",
    explanation: "Often referred to as a chest cold, this is swelling of the bronchial tubes following a viral illness. It produces a stubborn cough, mild chest soreness, and fatigue.",
    homeCare: [
      "Drink warm broths, herbal teas, and plenty of water",
      "Use steam inhalation to loosen chest phlegm",
      "Rest and avoid lung irritants such as cigarette smoke and chemical fumes"
    ],
    redFlags: [
      "Difficulty breathing or wheezing",
      "Coughing up blood",
      "Fever over 101°F (38.3°C) or cough lasting over 3 weeks"
    ]
  },

  "Bronchiolitis": {
    laymanTitle: "Viral Chest Infection (Bronchiolitis / RSV)",
    plainName: "Viral Chest Infection",
    category: "Viral Infection",
    aliases: ["RSV", "Bronchiolitis", "Small Airway Viral Bug"],
    bodyConnection: "Small Airway Bronchioles (Lower Respiratory Tract)",
    anatomyExplanation: "A viral bug (frequently RSV) causing swelling and mucus plugs in the smallest airways (bronchioles) deep in the lungs.",
    explanation: "A common viral lung infection predominantly affecting young children and infants, starting like a normal cold before progressing to rapid breathing, wheezing, and a tight chesty cough.",
    homeCare: [
      "Offer small, frequent sips of breast milk, formula, or electrolyte fluids to maintain hydration",
      "Use saline nasal drops and a gentle bulb suction to clear baby's nostrils before feedings",
      "Keep the child in an upright posture to assist effortless breathing",
      "Maintain a smoke-free home and use a cool-mist vaporizer"
    ],
    redFlags: [
      "Belly breathing, flared nostrils, or ribs pulling in with each breath (retractions)",
      "Grunting noises with breathing or pauses in breathing (apnea)",
      "Bluish or pale tint around the lips or fingernails",
      "Extreme lethargy, floppiness, or refusal to drink liquids"
    ]
  },

  "Croup": {
    laymanTitle: "Croup (Viral Barking Cough)",
    plainName: "Croup / Viral Cough",
    category: "Viral Infection",
    aliases: ["Croup", "Barking Cough", "Laryngotracheobronchitis"],
    bodyConnection: "Voice Box (Larynx) & Windpipe (Trachea)",
    anatomyExplanation: "A viral infection causing swelling in the upper airway, narrowing the space just below the vocal cords.",
    explanation: "A contagious viral illness causing swelling around the vocal cords and windpipe. It is famous for a distinctive harsh 'seal-like' barking cough, hoarseness, and a high-pitched squeak when inhaling (stridor), especially at night.",
    homeCare: [
      "Keep the child calm, as crying narrows the airway further and makes breathing harder",
      "Sit with the child in a steamy bathroom filled with shower steam for 10–15 minutes",
      "Take the child outside into cool night air for a few minutes; cold air often shrinks airway swelling",
      "Offer cool, clear fluids in small sips"
    ],
    redFlags: [
      "Stridor (high-pitched squeaking noise) when resting quietly",
      "Struggling to breathe, chest sucking in, or bluish color around mouth",
      "Inability to swallow or drooling with difficulty opening mouth"
    ]
  },

  "Acute rhinosinusitis": {
    laymanTitle: "Acute Sinus Infection (Sinusitis)",
    plainName: "Sinus Infection",
    category: "Respiratory Infection",
    aliases: ["Sinusitis", "Sinus Infection", "Sinus Congestion", "Head Cold Congestion"],
    bodyConnection: "Paranasal Sinuses (Behind Forehead, Cheeks, and Nose)",
    anatomyExplanation: "Inflammation of the air pockets behind your face bones, often triggered after a cold virus blocks normal mucus drainage.",
    explanation: "Swelling and mucus trapping inside the facial sinus cavities. Commonly starts after an everyday cold and causes throbbing facial pressure behind the cheeks or eyes, thick nasal discharge, and dull headache.",
    homeCare: [
      "Breathe in warm steam from a hot shower or hot water bowl twice daily",
      "Place a warm, moist towel across your nose, cheeks, and forehead to relieve sinus ache",
      "Use sterile saline nasal rinses to flush out thick trapped mucus",
      "Sleep with your head propped up on extra pillows to promote drainage"
    ],
    redFlags: [
      "Severe redness, swelling, or pain around one or both eyes",
      "High fever lasting more than 3 consecutive days",
      "Stiff neck, confusion, or sudden excruciating headache",
      "Symptoms that worsen sharply after starting to get better ('double sickening')"
    ]
  },

  "Chronic rhinosinusitis": {
    laymanTitle: "Chronic Sinus Infection & Swelling",
    plainName: "Chronic Sinus Infection",
    category: "Respiratory Infection",
    aliases: ["Chronic Sinusitis", "Long-term Sinus Infection"],
    bodyConnection: "Paranasal Sinuses & Nasal Lining (Head Region)",
    anatomyExplanation: "Long-standing swelling of the sinus passages lasting over 12 weeks.",
    explanation: "Persistent inflammation of the sinus passages leading to ongoing stuffy nose, facial fullness, post-nasal drip, and reduced sense of smell.",
    homeCare: [
      "Perform daily saline nasal rinses with sterile or distilled water",
      "Use a room humidifier to prevent dry mucosal membranes",
      "Avoid smoke, dust, and sudden drastic temperature shifts"
    ],
    redFlags: [
      "Vision changes, double vision, or swelling around the eyes",
      "High fever or marked facial swelling on one side"
    ]
  },

  "Allergic sinusitis": {
    laymanTitle: "Nasal Allergies & Sinus Congestion (Hay Fever)",
    plainName: "Nasal Allergies / Hay Fever",
    category: "Allergic Condition",
    aliases: ["Hay Fever", "Allergic Rhinitis", "Pollen Allergy"],
    bodyConnection: "Nasal Lining & Sinuses (Head Region)",
    anatomyExplanation: "Your immune system reacting to airborne pollen, dust mites, or pet dander, swelling the nasal passages.",
    explanation: "An allergic response causing bouts of sneezing, itchy and watery eyes, clear runny nose, and sinus congestion without a viral or bacterial infection.",
    homeCare: [
      "Rinse nasal passages with saline spray to wash out allergen particles",
      "Keep windows closed during high pollen counts and wash face after coming indoors",
      "Consult a pharmacist regarding non-drowsy antihistamines or allergy nasal sprays"
    ],
    redFlags: [
      "Wheezing, chest tightness, or breathing difficulties",
      "Swelling of the lips, tongue, or throat (seek emergency care immediately)"
    ]
  },

  "Acute otitis media": {
    laymanTitle: "Middle Ear Infection (Otitis Media)",
    plainName: "Middle Ear Infection",
    category: "Infection",
    aliases: ["Ear Infection", "Middle Ear Infection", "Earache", "Otitis Media"],
    bodyConnection: "Middle Ear & Eustachian Tube (Head / Ear Region)",
    anatomyExplanation: "Infection and fluid buildup behind the eardrum, usually occurring when a cold blocks the Eustachian drainage tube.",
    explanation: "An infection of the space behind the eardrum, very common after colds. Causes sharp or throbbing ear pain, muffled hearing, feeling of fullness in the ear, and fever.",
    homeCare: [
      "Apply a warm, damp compress against the affected ear to soothe throbbing pain",
      "Keep your head elevated during rest to help fluid drain",
      "Consult a doctor for clinical otoscopic examination of the eardrum"
    ],
    redFlags: [
      "Fluid, pus, or blood draining from the ear canal",
      "Swelling, tenderness, or redness behind the ear over the bone (mastoid)",
      "High fever, stiff neck, severe dizziness, or loss of balance"
    ]
  },

  "Acute laryngitis": {
    laymanTitle: "Laryngitis (Lost Voice / Vocal Cord Swelling)",
    plainName: "Laryngitis (Lost Voice)",
    category: "Viral Infection",
    aliases: ["Laryngitis", "Lost Voice", "Hoarse Voice", "Voice Box Bug"],
    bodyConnection: "Vocal Cords & Voice Box (Larynx / Neck Region)",
    anatomyExplanation: "Temporary swelling of the vocal cords inside your voice box, altering how they vibrate and make sound.",
    explanation: "Inflammation of the larynx, almost always caused by an everyday cold virus or vocal straining. Causes hoarseness, raspiness, or complete temporary loss of voice, with a tickly throat.",
    homeCare: [
      "Rest your voice completely — do NOT speak or whisper (whispering strains vocal cords more)",
      "Inhale warm steam and drink plenty of warm decaffeinated fluids",
      "Avoid caffeine, alcohol, menthol lozenges, and cigarette smoke"
    ],
    redFlags: [
      "Difficulty breathing or swallowing saliva",
      "Coughing up blood or hoarseness persisting for more than 2 weeks",
      "Severe throat or neck pain with high fever"
    ]
  },

  "Whooping cough": {
    laymanTitle: "Whooping Cough (Pertussis Infection)",
    plainName: "Whooping Cough",
    category: "Respiratory Infection",
    aliases: ["Whooping Cough", "Pertussis", "100-Day Cough"],
    bodyConnection: "Windpipe & Bronchial Airways (Thorax / Chest)",
    anatomyExplanation: "A bacterial infection attaching to the tiny hair-like cilia lining the upper respiratory airways, causing severe coughing spasms.",
    explanation: "A contagious respiratory infection causing uncontrollable coughing fits followed by a high-pitched 'whoop' sound when gasping for air. Can cause vomiting after coughing.",
    homeCare: [
      "Seek medical evaluation promptly for diagnostic testing and targeted antibiotic treatment",
      "Drink lots of fluids to avoid dehydration from coughing spells",
      "Use a cool-mist humidifier and keep home clear of smoke and irritants"
    ],
    redFlags: [
      "Pauses in breathing (apnea) or turning red/blue during coughing fits",
      "Struggling to breathe between coughing fits",
      "Signs of dehydration like dry mouth, crying without tears, or extreme weakness"
    ]
  },

  "Gastroenteritis": {
    laymanTitle: "Stomach Flu / Stomach Bug (Viral Gastroenteritis)",
    plainName: "Stomach Flu / Stomach Bug",
    category: "Viral Infection",
    aliases: ["Stomach Flu", "Stomach Bug", "Tummy Bug", "Gastroenteritis", "Norovirus"],
    bodyConnection: "Stomach & Intestines (Abdomen Region)",
    anatomyExplanation: "A viral bug (such as norovirus or rotavirus) causing irritation and inflammation of the stomach and intestinal lining.",
    explanation: "Commonly known as the 'stomach flu' or 'stomach bug' (not related to influenza). Causes sudden watery diarrhea, stomach cramps, nausea, vomiting, low-grade fever, and mild chills.",
    homeCare: [
      "Sip small amounts of oral rehydration solution (ORS) or electrolyte water every 10–15 minutes",
      "When nausea eases, eat bland foods (bananas, rice, applesauce, toast - BRAT diet)",
      "Avoid dairy, greasy foods, caffeine, and fruit juices until your stomach settles",
      "Wash hands thoroughly with soap and water to prevent spreading the bug"
    ],
    redFlags: [
      "Signs of dehydration: extreme thirst, dry mouth, little to no urine, dizziness upon standing",
      "Inability to keep liquids down for more than 24 hours",
      "Blood in vomit or stools, or black tarry stools",
      "Severe, sharp abdominal pain that does not ease after bowel movements"
    ]
  },

  "Viral fever": {
    laymanTitle: "Viral Fever (Acute Viral Syndrome)",
    plainName: "Viral Fever",
    category: "Viral Infection",
    aliases: ["Viral Fever", "Viral Infection", "Viral Bug", "Acute Viral Syndrome"],
    bodyConnection: "Immune & Circulatory System (Systemic)",
    anatomyExplanation: "A temporary elevation of your body's temperature setpoint triggered by your immune system to destroy an invading viral bug.",
    explanation: "A broad term for fever caused by any common viral infection. Usually accompanied by generalized muscle aches, feeling warm and flushed, fatigue, headache, and mild chills.",
    homeCare: [
      "Get plenty of rest in a well-ventilated, comfortably cool room",
      "Drink plenty of fluids: clean water, coconut water, warm broths, and ORS",
      "Use a lukewarm damp sponge on your forehead and neck if feeling overheated",
      "Take approved fever medicine (paracetamol) under guidance if fever causes discomfort"
    ],
    redFlags: [
      "Fever exceeding 102.5°F (39.2°C) or fever not coming down with medication",
      "Fever lasting more than 3 to 4 days without a clear diagnosis",
      "Stiff neck, confusion, seizure, or tiny red/purple pinprick rash on skin",
      "Difficulty breathing or chest pain"
    ]
  },

  // --- OTHER COMMON DDXPLUS CONDITIONS ---
  "Pneumonia": {
    laymanTitle: "Pneumonia (Chest / Deep Lung Infection)",
    plainName: "Pneumonia (Lung Infection)",
    category: "Respiratory Infection",
    aliases: ["Pneumonia", "Lung Infection", "Chest Infection"],
    bodyConnection: "Lung Parenchyma & Air Sacs (Thorax / Chest)",
    anatomyExplanation: "An infection causing the microscopic air sacs (alveoli) inside one or both lungs to fill with inflammatory fluid.",
    explanation: "A serious infection of the lung tissue causing cough with phlegm, high fever, shaking chills, and chest pain when breathing deeply. Requires timely medical evaluation and stethoscope examination.",
    homeCare: [
      "Rest completely and maintain adequate fluid intake",
      "Seek medical consultation promptly for chest listening, oxygen check, and possible chest X-ray",
      "Take all prescribed treatments exactly as directed by your clinician"
    ],
    redFlags: [
      "Severe shortness of breath, rapid shallow breathing, or bluish lips/fingernails",
      "Sharp, stabbing chest pain worsened by deep breathing or coughing",
      "Confusion, especially in older adults"
    ]
  },

  "GERD": {
    laymanTitle: "Acid Reflux / Heartburn (GERD)",
    plainName: "Acid Reflux / Heartburn",
    category: "Digestive Condition",
    aliases: ["Acid Reflux", "Heartburn", "GERD", "Gastric Reflux", "Indigestion"],
    bodyConnection: "Food Pipe (Esophagus) & Stomach (Abdomen / Lower Chest)",
    anatomyExplanation: "Stomach digestive acid splashing backward up into the food pipe (esophagus), irritating its sensitive lining.",
    explanation: "A digestive condition where stomach acid flows back upward into your esophagus, causing a burning chest feeling (heartburn), sour/bitter taste in the mouth, and meal-time discomfort.",
    homeCare: [
      "Eat smaller, balanced meals; avoid lying flat for at least 2 to 3 hours after eating",
      "Elevate the head of your bed 6 inches using bed risers or an angled pillow",
      "Avoid known trigger foods: greasy foods, spicy dishes, citrus, coffee, and peppermint"
    ],
    redFlags: [
      "Difficulty or pain when swallowing food or drinks",
      "Crushing chest pressure radiating to the shoulder, arm, neck, or jaw (rule out heart issues)",
      "Vomiting blood or dark coffee-ground material, or passing black stools"
    ]
  },

  "Cluster headache": {
    laymanTitle: "Cluster Headache (Severe One-Sided Head Pain)",
    plainName: "Cluster Headache",
    category: "Neurological Condition",
    aliases: ["Cluster Headache", "One-Sided Headache", "Piercing Eye Headache"],
    bodyConnection: "Trigeminal Nerve & Eye Orbit (Head Region)",
    anatomyExplanation: "Intense irritation along the trigeminal nerve pathway centered behind one eye and temple.",
    explanation: "Extremely painful, piercing headaches that strike in cyclical patterns or 'clusters' on one side of the head, often accompanied by eye watering, redness, and nasal congestion on the same side.",
    homeCare: [
      "Sit upright in a cool, quiet, darkened room during attacks",
      "Maintain strict regular sleep hours and avoid alcohol triggers during cluster cycles",
      "Seek medical care for prescription therapies (such as high-flow oxygen or triptans)"
    ],
    redFlags: [
      "Sudden 'thunderclap' headache reaching peak agony within seconds",
      "Headache paired with stiff neck, fever, confusion, or weakness on one side of the body",
      "First severe headache occurring after age 50"
    ]
  },

  "Panic attack": {
    laymanTitle: "Panic Attack (Acute Anxiety Episode)",
    plainName: "Panic Attack",
    category: "Stress / Autonomic Condition",
    aliases: ["Panic Attack", "Anxiety Attack", "Hyperventilation"],
    bodyConnection: "Autonomic Nervous System & Heart (Systemic / Chest)",
    anatomyExplanation: "A sudden, intense surge of the body's natural fight-or-flight adrenal response triggering rapid heartbeat and breathing.",
    explanation: "A sudden surge of overwhelming fear or physical discomfort that peaks within 10 minutes, causing a racing heart, breathlessness, trembling, sweating, and feeling faint.",
    homeCare: [
      "Practice slow box breathing: inhale for 4 seconds, hold 4 seconds, exhale 4 seconds",
      "Use grounding: name 5 things you see, 4 you feel, 3 you hear, 2 you smell",
      "Remind yourself that panic attacks are temporary and will safely pass"
    ],
    redFlags: [
      "Crushing chest pain radiating to left arm, neck, or jaw (rule out cardiac causes with ECG)",
      "Fainting or severe sustained breathlessness"
    ]
  },

  "Bronchospasm / acute asthma exacerbation": {
    laymanTitle: "Asthma Flare-Up / Wheezing Episode",
    plainName: "Asthma Flare-Up",
    category: "Respiratory Condition",
    aliases: ["Asthma Attack", "Wheezing Flare-up", "Bronchospasm"],
    bodyConnection: "Bronchial Airway Muscles (Thorax / Chest)",
    anatomyExplanation: "Muscles surrounding the bronchial airway tubes suddenly tighten and spasm, narrowing the breathing passages.",
    explanation: "A sudden flare-up causing airway constriction, wheezing, breathlessness, and tight chest feeling. Often triggered by cold air, viral infections, exercise, or allergens.",
    homeCare: [
      "Sit upright; do not lie down, as sitting upright expands lung capacity",
      "Use prescribed quick-relief rescue inhaler (such as albuterol) as outlined in your asthma action plan",
      "Stay calm and breathe slowly through pursed lips"
    ],
    redFlags: [
      "Rescue inhaler is not providing relief after 15 minutes",
      "Unable to speak more than a couple of words without pausing for breath",
      "Lips or nails turning grey or blue, or ribs pulling in deeply with each breath"
    ]
  },

  "Acute COPD exacerbation / infection": {
    laymanTitle: "COPD Flare-Up (Lung Disease Flare-Up)",
    plainName: "COPD Flare-Up",
    category: "Respiratory Condition",
    aliases: ["COPD Flare-Up", "COPD Exacerbation", "Chronic Bronchitis Flare"],
    bodyConnection: "Lungs & Bronchial Airways (Thorax / Chest)",
    anatomyExplanation: "Acute worsening of chronic inflammation in the airways, frequently triggered by an everyday respiratory viral bug.",
    explanation: "A sudden worsening of everyday breathing symptoms in people with chronic lung disease (COPD), with increased breathlessness, coughing, and change in mucus color.",
    homeCare: [
      "Use prescribed rescue bronchodilators as directed in your COPD action plan",
      "Practice pursed-lip breathing to slow down breathing rate",
      "Contact your pulmonologist or clinic early when a flare begins"
    ],
    redFlags: [
      "Severe breathlessness even when resting quietly",
      "Chest pain, new confusion, or extreme drowsiness",
      "Oxygen saturation dropping significantly below your personal baseline"
    ]
  },

  "Spontaneous pneumothorax": {
    laymanTitle: "Collapsed Lung (Pneumothorax)",
    plainName: "Collapsed Lung",
    category: "Urgent Chest Condition",
    aliases: ["Collapsed Lung", "Pneumothorax"],
    bodyConnection: "Pleura & Lung Cavity (Thorax / Chest)",
    anatomyExplanation: "Air leaking into the space between the outer surface of your lung and your chest wall, causing the lung to partially collapse.",
    explanation: "A condition where air collects in the chest cavity outside the lung, pressing on the lung and preventing it from expanding normally. Causes sudden sharp chest pain and breathlessness.",
    homeCare: [
      "Requires immediate emergency hospital assessment; do not attempt self-care",
      "Sit upright and avoid all physical exertion while awaiting emergency medical care"
    ],
    redFlags: [
      "Sudden, sharp, one-sided chest pain accompanied by breathlessness",
      "Rapid heart rate, dizziness, or blue tint to skin"
    ]
  },

  "Pulmonary embolism": {
    laymanTitle: "Blood Clot in Lung (Pulmonary Embolism)",
    plainName: "Blood Clot in Lung",
    category: "Emergency Condition",
    aliases: ["Blood Clot in Lung", "PE", "Pulmonary Embolism"],
    bodyConnection: "Pulmonary Arteries (Thorax / Heart-Lung Circulation)",
    anatomyExplanation: "A blood clot (often from the deep veins in the leg) traveling through the bloodstream and blocking an artery in the lungs.",
    explanation: "A medical emergency where a blood clot blocks blood flow to lung tissue. Causes sudden shortness of breath, sharp chest pain when breathing in, rapid heart rate, and coughing up blood.",
    homeCare: [
      "Emergency medical emergency: Call emergency services immediately (911/112/999)"
    ],
    redFlags: [
      "Sudden unexplained shortness of breath",
      "Sharp chest pain when inhaling, coughing, or bending over",
      "Coughing up blood or pink frothy mucus",
      "Pain, swelling, or redness in one calf or leg"
    ]
  },

  "Anaphylaxis": {
    laymanTitle: "Severe Allergic Reaction (Anaphylaxis)",
    plainName: "Severe Allergic Reaction",
    category: "Emergency Condition",
    aliases: ["Anaphylaxis", "Severe Allergic Reaction"],
    bodyConnection: "Systemic Immune & Respiratory Pathways",
    anatomyExplanation: "A massive, whole-body immune reaction releasing chemicals that cause blood pressure to plummet and airways to constrict.",
    explanation: "A life-threatening allergic reaction that develops rapidly within minutes of exposure to an allergen (such as foods, insect stings, or medicines).",
    homeCare: [
      "Use epinephrine auto-injector (EpiPen) immediately into outer thigh and call emergency services right away"
    ],
    redFlags: [
      "Swelling of the tongue, throat, or difficulty swallowing/breathing",
      "Widespread hives, dizziness, fainting, or sudden weak rapid pulse"
    ]
  },

  "Anemia": {
    laymanTitle: "Low Red Blood Cell Count (Anemia)",
    plainName: "Anemia / Low Iron",
    category: "Hematological Condition",
    aliases: ["Anemia", "Iron Deficiency", "Low Hemoglobin"],
    bodyConnection: "Blood Circulation & Bone Marrow (Systemic)",
    anatomyExplanation: "Insufficient healthy red blood cells or hemoglobin to carry adequate oxygen to your body tissues.",
    explanation: "A condition where your body lacks enough oxygen-carrying red blood cells, causing pale skin, fatigue, cold hands and feet, dizziness, and shortness of breath with mild activity.",
    homeCare: [
      "Eat iron-rich foods: leafy green vegetables, lentils, beans, lean meats, and iron-fortified grains",
      "Pair plant iron sources with vitamin C (citrus fruits) to enhance iron absorption",
      "Consult a doctor for a complete blood count (CBC) and ferritin test before taking iron supplements"
    ],
    redFlags: [
      "Chest pain, rapid irregular heartbeat, or fainting",
      "Severe shortness of breath with minimal movement"
    ]
  },

  "Possible NSTEMI / STEMI": {
    laymanTitle: "Heart Attack (Acute Coronary Syndrome)",
    plainName: "Heart Attack",
    category: "Cardiac Emergency",
    aliases: ["Heart Attack", "Myocardial Infarction", "Coronary Syndrome"],
    bodyConnection: "Coronary Arteries & Heart Muscle (Thorax / Heart)",
    anatomyExplanation: "A blockage in a coronary artery cutting off oxygen-rich blood supply to a portion of the heart muscle.",
    explanation: "A medical emergency caused by reduced or blocked blood flow to the heart muscle, leading to chest pressure, pain radiating to the jaw/left arm, sweating, nausea, and shortness of breath.",
    homeCare: [
      "Call emergency services immediately. Chew an aspirin (if advised by dispatcher and not allergic) while awaiting paramedics"
    ],
    redFlags: [
      "Crushing, squeezing chest pressure or pain",
      "Pain spreading to jaw, neck, back, stomach, or one/both arms",
      "Cold sweats, dizziness, vomiting, and shortness of breath"
    ]
  },

  "Stable angina": {
    laymanTitle: "Angina (Heart Chest Discomfort with Exertion)",
    plainName: "Angina (Heart Chest Pain)",
    category: "Cardiovascular Condition",
    aliases: ["Angina", "Heart Chest Pain", "Stable Angina"],
    bodyConnection: "Coronary Arteries & Heart Muscle (Thorax / Chest)",
    anatomyExplanation: "Temporary reduced blood flow to heart muscle during physical exertion or stress when the heart works harder.",
    explanation: "Chest discomfort or heaviness that happens predictably during exertion or emotional stress and goes away within minutes of resting or taking prescribed nitroglycerin.",
    homeCare: [
      "Stop physical activity and sit quietly to rest immediately when discomfort begins",
      "Take doctor-prescribed medication (such as nitroglycerin) as instructed",
      "Consult your cardiologist for comprehensive cardiovascular risk management"
    ],
    redFlags: [
      "Chest pain that occurs at rest or does not ease after 5 minutes of rest",
      "Pain that is more severe, lasts longer, or feels different than usual"
    ]
  },

  "Unstable angina": {
    laymanTitle: "Unstable Angina (Urgent Heart Chest Pain)",
    plainName: "Unstable Angina",
    category: "Cardiac Emergency",
    aliases: ["Unstable Angina", "Worsening Heart Pain"],
    bodyConnection: "Coronary Arteries (Thorax / Chest)",
    anatomyExplanation: "Severe narrowing or partial blood clot in coronary arteries reducing oxygen to heart muscle even at rest.",
    explanation: "A serious warning condition where chest pain happens unexpectedly at rest, is more severe, or does not respond to rest. It indicates a high risk of an impending heart attack.",
    homeCare: [
      "Seek emergency medical evaluation immediately. Do not drive yourself to the emergency department"
    ],
    redFlags: [
      "Chest discomfort occurring while resting quietly or waking you from sleep",
      "Discomfort lasting more than 15 minutes or accompanied by sweating and nausea"
    ]
  },

  "Atrial fibrillation": {
    laymanTitle: "Irregular Heartbeat (Atrial Fibrillation / A-Fib)",
    plainName: "Irregular Heartbeat (A-Fib)",
    category: "Cardiovascular Condition",
    aliases: ["A-Fib", "Atrial Fibrillation", "Heart Flutter"],
    bodyConnection: "Upper Heart Chambers (Atria / Thorax)",
    anatomyExplanation: "Chaotic electrical signals in the upper chambers of the heart causing an irregular, often very rapid heart rate.",
    explanation: "A common heart rhythm disorder causing fluttering heart sensations, fatigue, lightheadedness, and shortness of breath.",
    homeCare: [
      "Sit quietly and take slow breaths if heart feels like it is fluttering",
      "Limit caffeine, energy drinks, and alcohol triggers",
      "Follow up with a cardiologist for ECG confirmation and stroke-risk evaluation"
    ],
    redFlags: [
      "Chest pain, fainting, or severe shortness of breath",
      "Sudden weakness, facial drooping, or speech difficulty (signs of stroke)"
    ]
  },

  "Pericarditis": {
    laymanTitle: "Heart Lining Inflammation (Pericarditis)",
    plainName: "Heart Lining Inflammation",
    category: "Cardiovascular Condition",
    aliases: ["Pericarditis", "Heart Sac Inflammation"],
    bodyConnection: "Pericardium (Sac Surrounding the Heart / Thorax)",
    anatomyExplanation: "Inflammation of the thin two-layered sac (pericardium) enclosing and cushioning your heart, often following a viral infection.",
    explanation: "Swelling of the heart's protective sac. Causes sharp, piercing chest pain that typically worsens when lying flat or coughing, and eases when sitting up and leaning forward.",
    homeCare: [
      "Rest and avoid strenuous exercise until fully medically evaluated",
      "Consult a doctor for ECG, echocardiogram, and anti-inflammatory treatment"
    ],
    redFlags: [
      "Severe shortness of breath, dizziness, or fainting",
      "Rapid swelling in legs or abdomen (signs of fluid buildup around the heart)"
    ]
  },

  "Myocarditis": {
    laymanTitle: "Heart Muscle Inflammation (Myocarditis)",
    plainName: "Heart Muscle Inflammation",
    category: "Cardiovascular Condition",
    aliases: ["Myocarditis", "Viral Heart Inflammation"],
    bodyConnection: "Myocardium (Heart Muscle Tissue / Thorax)",
    anatomyExplanation: "Inflammation of the heart muscle itself, often triggered after a viral infection.",
    explanation: "An inflammation of the heart muscle that reduces the heart's ability to pump blood effectively, causing chest discomfort, rapid heartbeat, fatigue, and breathlessness.",
    homeCare: [
      "Strict physical rest; avoid all sports and high exertion until cleared by a physician",
      "Seek formal medical evaluation for cardiac enzymes and echocardiogram"
    ],
    redFlags: [
      "Fainting, severe dizziness, or rapid irregular heart rhythm",
      "Sudden severe shortness of breath or swelling in ankles"
    ]
  },

  "Tuberculosis": {
    laymanTitle: "Tuberculosis (TB Infection)",
    plainName: "Tuberculosis (TB)",
    category: "Infectious Disease",
    aliases: ["TB", "Tuberculosis", "Mycobacterium"],
    bodyConnection: "Lungs & Pulmonary Lymphatics (Thorax)",
    anatomyExplanation: "A bacterial infection primarily targeting lung tissue and forming nodules, capable of remaining dormant or becoming active.",
    explanation: "A persistent infectious disease causing prolonged cough (over 3 weeks), coughing up blood, night sweats, unexplained weight loss, and low-grade evening fever.",
    homeCare: [
      "Prompt medical testing (sputum examination, Mantoux/IGRA, chest X-ray)",
      "Adhere strictly to complete multi-month antibiotic regimen if diagnosed"
    ],
    redFlags: [
      "Coughing up significant amounts of blood",
      "Severe weight loss, persistent high fever, or severe breathlessness"
    ]
  },

  "Inguinal hernia": {
    laymanTitle: "Groin Hernia (Inguinal Hernia)",
    plainName: "Groin Hernia",
    category: "Surgical / Abdominal Condition",
    aliases: ["Hernia", "Groin Hernia", "Inguinal Hernia"],
    bodyConnection: "Inguinal Canal & Abdominal Wall (Pelvis / Lower Abdomen)",
    anatomyExplanation: "A gap or weakness in the lower abdominal wall muscles allowing a small loop of intestine or fat to bulge through into the groin.",
    explanation: "A bulge in the groin area that becomes more noticeable when standing up, coughing, or straining, often causing a dragging ache in the groin.",
    homeCare: [
      "Avoid heavy lifting and straining during bowel movements",
      "Eat high-fiber foods and drink plenty of water to prevent constipation",
      "Consult a surgeon for physical examination and elective repair evaluation"
    ],
    redFlags: [
      "Bulge suddenly becomes firm, extremely painful, red, or cannot be gently pushed back in",
      "Nausea, vomiting, fever, or inability to pass gas or bowel movements (strangulation emergency)"
    ]
  }
};

/**
 * Returns formatted layman details for any condition, with universal fallback
 * and smart alias matching for everyday viral infections and diseases.
 */
export function getConditionLaymanDetails(conditionName = '', bodyLocalization = {}) {
  const normalized = conditionName ? conditionName.trim() : '';
  if (!normalized) {
    return getFallbackLayman('Clinical Evaluation', bodyLocalization);
  }

  // 1. Direct exact match
  if (CONDITION_LAYMAN_MAP[normalized]) {
    return CONDITION_LAYMAN_MAP[normalized];
  }

  const queryLower = normalized.toLowerCase();

  // 2. Case-insensitive exact match
  for (const [key, val] of Object.entries(CONDITION_LAYMAN_MAP)) {
    if (key.toLowerCase() === queryLower) {
      return val;
    }
  }

  // 3. Match against everyday aliases
  for (const [key, val] of Object.entries(CONDITION_LAYMAN_MAP)) {
    if (val.aliases && Array.isArray(val.aliases)) {
      if (val.aliases.some(alias => alias.toLowerCase() === queryLower || queryLower.includes(alias.toLowerCase()))) {
        return val;
      }
    }
  }

  // 4. Substring / partial key match
  for (const [key, val] of Object.entries(CONDITION_LAYMAN_MAP)) {
    const keyLower = key.toLowerCase();
    if (queryLower.includes(keyLower) || keyLower.includes(queryLower)) {
      return val;
    }
  }

  // 5. Special keyword heuristics for everyday terms
  if (queryLower.includes('cold') || queryLower.includes('rhinitis') || queryLower.includes('nasopharyngitis')) {
    return CONDITION_LAYMAN_MAP['URTI'];
  }
  if (queryLower.includes('flu') || queryLower.includes('influenza')) {
    return CONDITION_LAYMAN_MAP['Influenza'];
  }
  if (queryLower.includes('viral fever') || queryLower.includes('viral infection')) {
    return CONDITION_LAYMAN_MAP['Viral fever'] || CONDITION_LAYMAN_MAP['Influenza'];
  }
  if (queryLower.includes('bronchitis') || queryLower.includes('chest cold')) {
    return CONDITION_LAYMAN_MAP['Acute bronchitis'] || CONDITION_LAYMAN_MAP['Bronchitis'];
  }
  if (queryLower.includes('sinus')) {
    return CONDITION_LAYMAN_MAP['Acute rhinosinusitis'];
  }
  if (queryLower.includes('ear infection') || queryLower.includes('otitis')) {
    return CONDITION_LAYMAN_MAP['Acute otitis media'];
  }
  if (queryLower.includes('stomach') && (queryLower.includes('flu') || queryLower.includes('bug') || queryLower.includes('gastro'))) {
    return CONDITION_LAYMAN_MAP['Gastroenteritis'];
  }
  if (queryLower.includes('throat') || queryLower.includes('pharyngitis')) {
    return CONDITION_LAYMAN_MAP['Viral pharyngitis'];
  }

  // 6. Universal fallback for unmapped conditions
  return getFallbackLayman(normalized, bodyLocalization);
}

function getFallbackLayman(normalized, bodyLocalization = {}) {
  const region = bodyLocalization.primaryRegion || 'Targeted';
  const system = bodyLocalization.bodySystem || 'General';

  return {
    laymanTitle: normalized || "Clinical Consideration",
    plainName: normalized,
    category: "Clinical Evaluation",
    aliases: [normalized],
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
