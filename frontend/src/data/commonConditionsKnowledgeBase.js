/**
 * CDSS Atlas — Everyday Common Conditions Knowledge Base
 * Clinician-reviewed reference layer for patient-friendly explanations,
 * follow-up questions, and safety guidelines.
 */

export const COMMON_CONDITIONS_KB = {
  schema_version: "1.0.0",
  title: "CDSS Atlas — Everyday Common Conditions Knowledge Base",
  purpose: "A cautious, clinician-reviewable reference layer for patient-friendly explanations and follow-up questions. It is not a diagnostic model and must not force common conditions to the top.",
  intended_mode: "everyday_user",
  locale: "en-IN",
  review_status: "RESEARCH_DRAFT_NOT_CLINICALLY_VALIDATED",
  last_compiled: "2026-10-21",
  important_rules: [
    "Never assign or invent percentages, probabilities, confidence scores, or prevalence-based boosts from this file.",
    "A symptom pattern is not enough to confirm a disease. Present entries as possibilities only when supported by the complete case and validated logic.",
    "Fever alone must never be labelled 'viral fever' as a confirmed cause. Use 'fever — cause not yet clear' when evidence is insufficient.",
    "Do not suppress serious possibilities or warning signs just because a common condition matches.",
    "Run clinically reviewed safety/triage rules before displaying routine self-care guidance.",
    "Treat not-reported, not-asked, denied, and confirmed-absent as different states.",
    "Negation, age, pregnancy, immune suppression, chronic conditions, duration, severity, and worsening symptoms can change the appropriate next step.",
    "Do not recommend prescription drugs, antibiotics, or individualized doses from this knowledge base.",
    "Do not use an entry as a standalone rule-based diagnosis; have qualified clinicians review the dataset and thresholds before patient-facing use."
  ],
  general_safety_signs: [
    "Severe difficulty breathing, blue/grey lips, or inability to speak normally due to breathlessness",
    "New confusion, collapse, seizure, or difficulty waking",
    "Severe or persistent chest pain",
    "Severe dehydration, inability to keep fluids down, or markedly reduced urination",
    "Severe abdominal pain, persistent vomiting, or bleeding",
    "Rapid worsening or a person appearing seriously unwell",
    "Fever in a very young infant, or fever in a person who is pregnant, immunocompromised, elderly, or has significant chronic illness requires appropriate clinical guidance"
  ],
  general_patient_copy: {
    uncertain_result_title: "We can't tell the exact cause from these symptoms alone",
    uncertain_result_body: "Several conditions can cause similar symptoms. We'll help you review important details and decide what to do next, but this tool cannot confirm a diagnosis.",
    score_label_policy: "Do not display numerical disease-match percentages unless they are statistically calibrated, validated for the intended population, and clearly explained. A cosine similarity or model score is not a disease probability.",
    urgent_copy_policy: "Urgency wording must come from a clinically reviewed triage protocol, not from the condition list or model rank."
  },
  conditions: [
    {
      id: "common_cold",
      display_name: "Common cold",
      category: "viral_respiratory",
      plain_language: "A common viral infection affecting the nose and throat. Symptoms are often mild, but other illnesses can look similar.",
      symptoms_that_may_fit: [
        "runny nose",
        "blocked nose",
        "sneezing",
        "sore throat",
        "cough",
        "mild headache",
        "mild body aches",
        "sometimes low fever"
      ],
      useful_follow_up_questions: [
        "When did symptoms start?",
        "Is the main problem a runny/blocked nose or a sudden fever and strong body aches?",
        "Any trouble breathing, dehydration, or symptoms getting worse?",
        "Is the person an infant, older adult, pregnant, immunocompromised, or living with a significant chronic condition?"
      ],
      do_not_assume: [
        "A cold is not confirmed from fever alone.",
        "Flu, COVID-19, RSV, allergies, and other conditions may overlap."
      ],
      routine_guidance_topics_for_review: [
        "Rest and adequate sleep",
        "Maintain good hydration with water, warm broths, or herbal teas",
        "Reduce spread by washing hands and covering sneezes/coughs",
        "Seek professional advice if symptoms are severe, persistent, or worsening"
      ],
      red_flags_or_escalation: [
        "Severe difficulty breathing or chest pain",
        "Dehydration or inability to keep fluids down",
        "Fever lasting more than 3 to 4 days without improvement",
        "Symptoms that improve and then suddenly worsen"
      ],
      references: [
        {
          title: "CDC — About Common Cold",
          url: "https://www.cdc.gov/common-cold/about/index.html"
        },
        {
          title: "CDC — Manage Common Cold",
          url: "https://www.cdc.gov/common-cold/treatment/"
        }
      ]
    },
    {
      id: "influenza_like_illness",
      display_name: "Flu (influenza) — possible",
      category: "viral_respiratory",
      plain_language: "Flu can cause a sudden illness with fever or chills, body aches, cough, headache, and marked tiredness. Symptoms overlap with other infections.",
      symptoms_that_may_fit: [
        "sudden onset",
        "fever or chills",
        "body aches",
        "headache",
        "fatigue",
        "cough",
        "sore throat",
        "runny or blocked nose"
      ],
      useful_follow_up_questions: [
        "Did symptoms begin suddenly?",
        "How long have symptoms been present?",
        "Any breathing difficulty or chest pain?",
        "Any pregnancy, older age, immune suppression, or chronic illness?",
        "Has a flu test or clinician assessment been done?"
      ],
      do_not_assume: [
        "Symptoms alone cannot reliably distinguish flu from COVID-19 or other respiratory infections.",
        "Not everyone with flu has fever."
      ],
      routine_guidance_topics_for_review: [
        "Rest and fluids",
        "Reduce contact with others while ill",
        "Prompt clinical advice for people at higher risk because antiviral treatment can be time-sensitive"
      ],
      red_flags_or_escalation: [
        "Difficulty breathing or shortness of breath",
        "Persistent pain or pressure in the chest",
        "Dizziness, confusion, or inability to wake",
        "Prompt clinical advice if high risk, very unwell, or symptoms not improving"
      ],
      references: [
        {
          title: "CDC — Signs and Symptoms of Flu",
          url: "https://www.cdc.gov/flu/signs-symptoms/index.html"
        },
        {
          title: "NHS — Flu",
          url: "https://www.nhs.uk/conditions/flu/"
        }
      ]
    },
    {
      id: "covid19_possible",
      display_name: "COVID-19 — possible",
      category: "viral_respiratory",
      plain_language: "COVID-19 can cause cold-like symptoms, fever, cough, tiredness, body aches, or stomach symptoms. A test may be needed to distinguish it from other illnesses.",
      symptoms_that_may_fit: [
        "fever or chills",
        "cough",
        "sore throat",
        "runny or blocked nose",
        "fatigue",
        "body aches",
        "headache",
        "change in taste or smell",
        "nausea",
        "vomiting",
        "diarrhoea"
      ],
      useful_follow_up_questions: [
        "When did symptoms begin?",
        "Any known exposure or test result?",
        "Any breathing difficulty or chest pain?",
        "Does the person have risk factors for severe illness?"
      ],
      do_not_assume: [
        "Symptoms vary and overlap with flu and common cold.",
        "A symptom list cannot confirm COVID-19."
      ],
      routine_guidance_topics_for_review: [
        "Follow current local infection-control guidance",
        "Consider testing according to local guidance and risk",
        "Seek prompt clinical advice if at higher risk"
      ],
      red_flags_or_escalation: [
        "Severe breathing difficulty or persistent chest pain",
        "New confusion or inability to stay awake",
        "Pale, gray, or blue-colored skin, lips, or nail beds"
      ],
      references: [
        {
          title: "CDC — Symptoms of COVID-19",
          url: "https://www.cdc.gov/covid/signs-symptoms/index.html"
        }
      ]
    },
    {
      id: "rsv_possible",
      display_name: "RSV or another respiratory virus — possible",
      category: "viral_respiratory",
      plain_language: "RSV can look like a cold. It can be more serious in babies, older adults, and people with certain health conditions.",
      symptoms_that_may_fit: [
        "runny nose",
        "congestion",
        "cough",
        "sneezing",
        "fever",
        "reduced appetite",
        "wheezing"
      ],
      useful_follow_up_questions: [
        "What is the person's age?",
        "Is breathing fast or difficult?",
        "Is feeding or drinking reduced?",
        "Any chronic lung/heart condition or immune suppression?"
      ],
      do_not_assume: [
        "Symptoms cannot confirm RSV without appropriate testing.",
        "Breathing difficulty in infants needs prompt assessment."
      ],
      routine_guidance_topics_for_review: [
        "Fluids and feeding monitoring appropriate to age",
        "Reduce spread and wash hands frequently",
        "Clinical advice for high-risk individuals"
      ],
      red_flags_or_escalation: [
        "Fast or shallow breathing, belly breathing, or grunting",
        "Poor feeding and dehydration in infants",
        "Unusual lethargy or blue lips/fingertips"
      ],
      references: [
        {
          "title": "CDC — Symptoms and Care of RSV",
          "url": "https://www.cdc.gov/rsv/symptoms/"
        }
      ]
    },
    {
      id: "viral_gastroenteritis_possible",
      "display_name": "Viral gastroenteritis — possible",
      category: "viral_gastrointestinal",
      plain_language: "A stomach or intestinal infection can cause diarrhoea, vomiting, nausea, and stomach cramps. Not all gastroenteritis is viral.",
      symptoms_that_may_fit: [
        "watery diarrhoea",
        "vomiting",
        "nausea",
        "stomach cramps",
        "sometimes fever",
        "body aches"
      ],
      useful_follow_up_questions: [
        "How often are vomiting or diarrhoea occurring?",
        "Can the person keep fluids down?",
        "Any blood in stool or vomit?",
        "Any severe abdominal pain or reduced urination?",
        "How old is the person?"
      ],
      do_not_assume: [
        "Do not label every episode of diarrhoea as viral.",
        "Foodborne illness and other causes may need assessment."
      ],
      routine_guidance_topics_for_review: [
        "Prevent dehydration with oral rehydration solutions (ORS) and small sips",
        "Hand hygiene and avoiding food preparation for others while infectious",
        "Eat bland, easy-to-digest foods when appetite returns"
      ],
      red_flags_or_escalation: [
        "Blood in stool or vomit",
        "Inability to keep liquids down for 24 hours",
        "Signs of severe dehydration (dry mouth, no urination for 8+ hours, severe dizziness)",
        "Severe, sharp abdominal pain"
      ],
      references: [
        {
          title: "CDC — About Norovirus",
          url: "https://www.cdc.gov/norovirus/about/index.html"
        }
      ]
    },
    {
      id: "dengue_possible",
      display_name: "Dengue — consider when relevant",
      category: "mosquito_borne_viral",
      plain_language: "Dengue is a mosquito-borne viral infection that may cause fever, strong headache, pain behind the eyes, body or joint pain, nausea, or rash. It can become serious and needs local clinical guidance.",
      symptoms_that_may_fit: [
        "fever",
        "strong headache",
        "pain behind eyes",
        "muscle or joint pain",
        "nausea",
        "vomiting",
        "rash",
        "relevant local outbreak or mosquito exposure"
      ],
      useful_follow_up_questions: [
        "Which day of fever is this?",
        "Any severe abdominal pain, persistent vomiting, bleeding, unusual weakness, or cold/pale skin?",
        "Any known local dengue activity or mosquito exposure?",
        "Has a clinician recommended testing?"
      ],
      do_not_assume: [
        "Do not diagnose dengue from symptoms alone.",
        "Fever may have other causes, including illnesses requiring different treatment.",
        "A drop in fever does not always mean dengue is improving (critical phase)."
      ],
      routine_guidance_topics_for_review: [
        "Seek appropriate medical assessment when dengue is plausible",
        "Avoid unreviewed NSAIDs (ibuprofen, aspirin) which increase bleeding risk",
        "Use mosquito-bite prevention"
      ],
      red_flags_or_escalation: [
        "Severe abdominal pain or persistent vomiting",
        "Bleeding from gums, nose, or blood in stool/vomit",
        "Extreme fatigue, restlessness, or cold, clammy skin",
        "Difficulty breathing"
      ],
      references: [
        {
          title: "WHO — Dengue and severe dengue",
          url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
        }
      ]
    },
    {
      id: "chikungunya_possible",
      display_name: "Chikungunya — consider when relevant",
      category: "mosquito_borne_viral",
      plain_language: "Chikungunya is a mosquito-borne viral infection often associated with fever and prominent joint pain. Symptoms overlap with dengue and other infections.",
      symptoms_that_may_fit: [
        "fever",
        "marked joint pain",
        "joint swelling",
        "muscle pain",
        "headache",
        "rash",
        "relevant local outbreak or mosquito exposure"
      ],
      useful_follow_up_questions: [
        "How severe is the joint pain and does it limit movement?",
        "Any rash, bleeding, severe abdominal pain, or persistent vomiting?",
        "Any local outbreak or mosquito exposure?",
        "Has a clinician assessed the fever?"
      ],
      do_not_assume: [
        "Symptoms alone cannot reliably distinguish chikungunya from dengue.",
        "Do not use a common-condition match to bypass fever assessment."
      ],
      routine_guidance_topics_for_review: [
        "Clinical assessment where suspected",
        "Mosquito-bite prevention",
        "Avoid medication advice unless reviewed for dengue overlap"
      ],
      red_flags_or_escalation: [
        "General safety signs and urgent dengue warning signs (bleeding, severe abdominal pain)"
      ],
      references: [
        {
          title: "WHO — Chikungunya",
          url: "https://www.who.int/news-room/fact-sheets/detail/chikungunya"
        }
      ]
    },
    {
      id: "hand_foot_mouth_possible",
      display_name: "Hand, foot and mouth disease — possible",
      category: "viral_other",
      plain_language: "A contagious viral illness, most common in young children, that may cause fever, painful mouth sores, and a rash on hands and feet.",
      symptoms_that_may_fit: [
        "fever",
        "mouth sores",
        "painful swallowing",
        "rash or small blisters on palms/soles",
        "young child or known contact"
      ],
      useful_follow_up_questions: [
        "What is the person's age?",
        "Can they drink enough fluids?",
        "Are mouth sores preventing drinking?",
        "Is the person unusually sleepy or getting worse?"
      ],
      do_not_assume: [
        "Other illnesses can cause rashes or mouth sores.",
        "A rash pattern should not be treated as confirmation."
      ],
      routine_guidance_topics_for_review: [
        "Encourage cool fluids and soft food to protect mouth sores",
        "Hand hygiene and disinfection of toys/surfaces",
        "Avoid close contact until blisters heal"
      ],
      red_flags_or_escalation: [
        "Unable to drink enough fluids leading to dehydration",
        "Fever lasting more than 3 days",
        "Lethargy or unresponsiveness"
      ],
      references: [
        {
          title: "CDC — Hand, Foot, and Mouth Disease",
          url: "https://www.cdc.gov/hand-foot-mouth/"
        }
      ]
    },
    {
      id: "chickenpox_possible",
      display_name: "Chickenpox — possible",
      category: "viral_skin",
      plain_language: "Chickenpox can cause an itchy blister-like rash and fever. It can be more serious in adults, pregnant people, newborns, and people with weakened immune systems.",
      symptoms_that_may_fit: [
        "itchy blister-like rash",
        "rash appearing in crops",
        "fever",
        "tiredness",
        "known exposure"
      ],
      useful_follow_up_questions: [
        "Is the rash blister-like and spreading?",
        "Is the person pregnant, a newborn, an adult, or immunocompromised?",
        "Any eye involvement, breathing problems, or severe illness?"
      ],
      do_not_assume: [
        "Many rashes look alike; clinical assessment may be needed.",
        "Avoid contact with high-risk people while seeking advice."
      ],
      routine_guidance_topics_for_review: [
        "Contact a clinician for diagnosis and isolation advice",
        "Avoid scratching to prevent secondary skin infection",
        "Early advice for high-risk patients"
      ],
      red_flags_or_escalation: [
        "Rash spreading to the eyes",
        "Skin becomes red, swollen, warm, or tender (secondary bacterial infection)",
        "Shortness of breath or confusion"
      ],
      references: [
        {
          title: "NHS — Chickenpox",
          url: "https://www.nhs.uk/conditions/chickenpox/"
        }
      ]
    },
    {
      id: "shingles_possible",
      display_name: "Shingles — possible",
      category: "viral_skin",
      plain_language: "Shingles can cause pain, tingling, and a blistering rash, often in a band on one side of the body. Early medical advice can matter.",
      symptoms_that_may_fit: [
        "burning or tingling pain in one area",
        "painful blistering rash",
        "rash mainly on one side",
        "headache or feeling unwell"
      ],
      useful_follow_up_questions: [
        "When did pain and rash begin?",
        "Is the rash near an eye or on the face?",
        "Is the person immunocompromised?",
        "Has a clinician assessed it?"
      ],
      do_not_assume: [
        "Other skin conditions can resemble shingles.",
        "Do not delay advice for a rash near the eye."
      ],
      routine_guidance_topics_for_review: [
        "Prompt clinical advice within 72 hours for antiviral evaluation",
        "Keep rash clean and dry to reduce infection risk",
        "Avoid contact with vulnerable people until blisters scab"
      ],
      red_flags_or_escalation: [
        "Rash or pain near the eyes or forehead (risk of vision loss)",
        "Weakened immune system",
        "Severe, unrelenting pain"
      ],
      references: [
        {
          title: "NHS — Shingles",
          url: "https://www.nhs.uk/conditions/shingles/"
        }
      ]
    },
    {
      id: "viral_conjunctivitis_possible",
      display_name: "Viral conjunctivitis — possible",
      category: "viral_eye",
      plain_language: "A viral eye infection can cause a watery, irritated or red eye and may spread easily. Eye pain or changes in vision need prompt assessment.",
      symptoms_that_may_fit: [
        "red eye",
        "watery discharge",
        "gritty or irritated feeling",
        "recent cold symptoms",
        "one or both eyes affected"
      ],
      useful_follow_up_questions: [
        "Is there eye pain, light sensitivity, or blurred/reduced vision?",
        "Any contact-lens use?",
        "Any injury or chemical exposure?",
        "Is discharge thick or symptoms worsening?"
      ],
      do_not_assume: [
        "Not all red eyes are viral.",
        "Eye pain, light sensitivity, or vision changes should not be dismissed."
      ],
      routine_guidance_topics_for_review: [
        "Hand hygiene and avoid rubbing the eyes",
        "Avoid sharing towels or pillowcases",
        "Clean eyelids gently with clean water and cotton pads"
      ],
      red_flags_or_escalation: [
        "Eye pain, intense light sensitivity, or changes in vision",
        "Severe redness in a contact lens wearer",
        "Pupil changes or severe headache"
      ],
      references: [
        {
          title: "NHS — Conjunctivitis",
          url: "https://www.nhs.uk/conditions/conjunctivitis/"
        }
      ]
    },
    {
      id: "viral_sore_throat_possible",
      display_name: "Sore throat — often viral, cause uncertain",
      category: "symptom_pattern",
      plain_language: "A sore throat often occurs with viral respiratory infections, but other causes are possible. The symptom alone does not identify the cause.",
      symptoms_that_may_fit: [
        "throat pain",
        "pain when swallowing",
        "cough",
        "runny nose",
        "hoarse voice",
        "fever"
      ],
      useful_follow_up_questions: [
        "Can the person swallow liquids and saliva?",
        "Any difficulty breathing, drooling, or rapidly worsening swelling?",
        "How long has it lasted?",
        "Any rash or severe illness?"
      ],
      do_not_assume: [
        "Do not automatically label it viral.",
        "Do not recommend antibiotics without appropriate clinical evaluation."
      ],
      routine_guidance_topics_for_review: [
        "Warm salt-water gargles for older children and adults",
        "Hydration with cool or warm liquids",
        "Rest and consult a clinician if symptoms last over 5 days"
      ],
      red_flags_or_escalation: [
        "Difficulty breathing or noisy breathing (stridor)",
        "Difficulty or inability to swallow saliva (drooling)",
        "Severe swelling of the neck or inability to open mouth fully"
      ],
      references: [
        {
          title: "CDC — About Common Cold",
          url: "https://www.cdc.gov/common-cold/about/index.html"
        }
      ]
    },
    {
      id: "fever_unknown_cause",
      display_name: "Fever — cause not yet clear",
      category: "symptom_pattern",
      plain_language: "Fever is a symptom, not a diagnosis. Many infections and some non-infectious conditions can cause it. More information or clinical assessment may be needed.",
      symptoms_that_may_fit: [
        "measured elevated temperature",
        "feeling feverish",
        "chills",
        "sweating",
        "body aches"
      ],
      useful_follow_up_questions: [
        "What is the measured temperature and how was it taken?",
        "How many days has fever lasted?",
        "Any cough, sore throat, rash, severe headache, pain, vomiting, diarrhoea, or urinary symptoms?",
        "Any travel, mosquito exposure, pregnancy, immune suppression, or chronic illness?",
        "Any warning signs or rapid worsening?"
      ],
      do_not_assume: [
        "Never convert fever alone into a confirmed 'viral fever'.",
        "In regions where dengue or malaria occurs, fever may require specific clinical evaluation.",
        "Do not let a common viral label override warning signs."
      ],
      routine_guidance_topics_for_review: [
        "Monitor temperature regularly and note the trend",
        "Maintain adequate fluid intake",
        "Seek clinical assessment based on severity, duration, and personal risk factors"
      ],
      red_flags_or_escalation: [
        "Fever exceeding 103°F (39.4°C) or lasting more than 3 days",
        "Stiff neck, confusion, seizure, or extreme lethargy",
        "Severe shortness of breath or persistent chest pain",
        "Fever in an infant under 3 months of age"
      ],
      references: [
        {
          title: "CDC — Manage Common Cold (when to seek care)",
          url: "https://www.cdc.gov/common-cold/treatment/"
        },
        {
          title: "WHO — Dengue and severe dengue",
          url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
        },
        {
          title: "WHO — Malaria",
          url: "https://www.who.int/health-topics/malaria"
        }
      ]
    },
    {
      id: "allergic_rhinitis_nonviral_mimic",
      display_name: "Allergies — a non-infectious possibility",
      category: "nonviral_mimic",
      plain_language: "Allergies can cause sneezing, itchy eyes/nose, and a runny nose, often without fever. This can resemble a cold.",
      symptoms_that_may_fit: [
        "repeated sneezing",
        "itchy eyes or nose",
        "watery runny nose",
        "symptoms linked to a trigger",
        "no fever reported"
      ],
      useful_follow_up_questions: [
        "Are the eyes or nose itchy?",
        "Do symptoms recur with dust, pollen, pets, or another trigger?",
        "Is fever present?",
        "Any breathing difficulty or swelling of lips/tongue?"
      ],
      do_not_assume: [
        "Absence of reported fever is not proof of allergy.",
        "Severe breathing difficulty or face/tongue swelling is an emergency."
      ],
      routine_guidance_topics_for_review: [
        "Identify and minimize exposure to known triggers (pollen, dust mites, pet dander)",
        "Saline nasal rinses to clear allergens",
        "Consult a pharmacist or physician regarding non-drowsy antihistamines"
      ],
      red_flags_or_escalation: [
        "Wheezing, shortness of breath, or chest tightness",
        "Swelling of the lips, tongue, face, or throat (anaphylaxis emergency)",
        "Dizziness or lightheadedness"
      ],
      references: [
        {
          title: "NHS — Allergic rhinitis",
          url: "https://www.nhs.uk/conditions/allergic-rhinitis/"
        }
      ]
    }
  ]
};

export default COMMON_CONDITIONS_KB;
