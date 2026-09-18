"""
Clinical Adapter & Orchestrator
Bridges the NLP Evidence Matcher and ML Diagnostic Engine to the API Response Contract.
Handles anatomical localization, supporting symptom attribution, clinical descriptions,
patient storylines (precautions, red flags, home remedies), and confidence assessment.
"""

import time
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from fastapi import HTTPException

from backend.models.pipeline.clinical_service import ClinicalDiagnosisService
from backend.models.pipeline.nlp_matcher import EvidenceMatch, NLPParseResult
from backend.models.pipeline.anatomy_mapper import ConditionAnatomyMapper
from backend.app.schemas.clinical import (
    AnalyzeRequest,
    AnalyzeResponse,
    PossibleCondition,
    ExtractedSymptom,
    BodyLocalization,
    SpatialCoordinates,
    ModelMetaData,
    Storyline,
    HomeRemedy
)

# ---------------------------------------------------------------------------
# Medical Descriptions for the 49 DDXPlus Pathologies
# ---------------------------------------------------------------------------
CONDITION_DESCRIPTIONS: Dict[str, str] = {
    "Spontaneous pneumothorax": "Abnormal accumulation of air in the pleural space causing partial or total lung collapse, often presenting with sudden sharp pleuritic chest pain and dyspnea.",
    "Cluster headache": "Severe, strictly unilateral headache syndrome localized around the orbit or temple, accompanied by autonomic signs such as tearing, nasal congestion, and restlessness.",
    "Boerhaave": "Transmural perforation of the esophagus caused by high intraesophageal pressure (e.g., severe retching or vomiting), a medical emergency requiring rapid intervention.",
    "Spontaneous rib fracture": "A traumatic or nontraumatic rib disruption often associated with strenuous coughing, bone fragility, or regional stress, causing localized, movement-aggravated chest wall tenderness.",
    "GERD": "Gastroesophageal reflux disease characterized by abnormal retrograde flow of gastric acid into the esophagus, producing retrosternal heartburn, acid regurgitation, and postprandial discomfort.",
    "HIV (initial infection)": "Acute retroviral syndrome occurring 2 to 4 weeks following exposure, commonly featuring fever, generalized lymphadenopathy, pharyngitis, fatigue, and cutaneous rash.",
    "Anemia": "Deficiency in red blood cells or hemoglobin concentration impairing systemic oxygen transport, commonly resulting in fatigue, exertional breathlessness, pallor, and lightheadedness.",
    "Viral pharyngitis": "Inflammatory response of the pharyngeal mucosa caused by a respiratory viral pathogen, presenting with sore throat, odynophagia, mild fever, and nasal symptoms.",
    "Inguinal hernia": "Protrusion of intra-abdominal contents through a defect or weakness in the inguinal canal, appearing as a reducible or tender groin bulge exacerbated by straining.",
    "Myasthenia gravis": "Autoimmune neuromuscular junction disorder characterized by fluctuating, exercise-induced skeletal muscle weakness that improves with rest, frequently involving ocular and bulbar musculature.",
    "Whooping cough": "Bordetella pertussis bacterial respiratory infection distinguished by severe paroxysmal coughing fits, inspiratory whooping sounds, and post-tussive vomiting or exhaustion.",
    "Anaphylaxis": "Rapid-onset, life-threatening systemic hypersensitivity reaction affecting the airway, breathing, circulation, and/or integumentary system requiring immediate epinephrine administration.",
    "Epiglottitis": "Rapidly progressive bacterial inflammation of the epiglottis and supraglottic structures that can precipitate fatal acute airway obstruction.",
    "Guillain-Barré syndrome": "Post-infectious autoimmune polyradiculoneuropathy featuring symmetrical ascending flaccid weakness, diminished tendon reflexes, and potential respiratory compromise.",
    "Acute laryngitis": "Acute inflammation of the vocal folds typically of viral origin, producing sudden dysphonia or aphonia, dry cough, and mild anterior neck discomfort.",
    "Croup": "Laryngotracheobronchitis most common in young children, presenting with inspiratory stridor, a distinctive barking cough, and variable respiratory distress.",
    "PSVT": "Paroxysmal supraventricular tachycardia characterized by sudden-onset, rapid, regular tachycardia originating above the bundle of His, often accompanied by palpitations, presyncope, and chest tightness.",
    "Atrial fibrillation": "Supraventricular tachyarrhythmia with uncoordinated atrial electrical activation, resulting in an irregularly irregular pulse, palpitations, fatigue, and stroke risk.",
    "Bronchiectasis": "Chronic permanent dilation and wall destruction of the bronchial tree associated with impaired clearance, recurrent infections, and copious purulent sputum production.",
    "Allergic sinusitis": "IgE-mediated inflammatory reaction of the nasal and paranasal mucosa to airborne allergens, causing rhinorrhea, nasal congestion, sneezing, and pruritus.",
    "Chagas": "Infection caused by the parasite Trypanosoma cruzi, progressing from an acute febrile stage to chronic irreversible cardiac and gastrointestinal organ involvement.",
    "Scombroid food poisoning": "Histamine toxicity caused by ingesting improperly preserved dark-meat fish, characterized by facial flushing, throbbing headache, palpitations, diarrhea, and nausea.",
    "Myocarditis": "Inflammation of the myocardium typically triggered by viral infection or immune reaction, causing chest discomfort, dyspnea, arrhythmias, and elevated cardiac enzymes.",
    "Larygospasm": "Involuntary spasmodic contraction of the laryngeal vocal cords triggering transient partial or complete upper airway obstruction and stridor.",
    "Acute dystonic reactions": "Sustained or intermittent abnormal muscle contractions and posturing, frequently triggered as an adverse reaction to dopamine receptor antagonist medications.",
    "Localized edema": "Focal fluid accumulation in the interstitial tissue space secondary to altered capillary hydrostatic pressure, venous stasis, lymphatic obstruction, or local inflammation.",
    "SLE": "Systemic Lupus Erythematosus: a multisystem chronic autoimmune disease presenting with widespread immune-complex deposition, joint inflammation, cutaneous rashes, fatigue, and serositis.",
    "Tuberculosis": "Infection by Mycobacterium tuberculosis primarily involving the pulmonary parenchyma, characterized by persistent chronic cough, hemoptysis, night sweats, fever, and weight loss.",
    "Unstable angina": "Form of acute coronary syndrome caused by transient or subocclusive thrombus on an atheromatous plaque, causing rest or crescendo chest pain without established necrosis.",
    "Stable angina": "Predictable, transient retrosternal chest tightness or pressure provoked by physical exertion or emotional stress and relieved by rest or nitroglycerin within minutes.",
    "Ebola": "Severe, often fatal hemorrhagic fever virus infection marked by rapid onset of high fever, myalgias, profound fatigue, vomiting, diarrhea, and coagulopathic bleeding.",
    "Acute otitis media": "Acute suppurative bacterial or viral infection of the middle ear space, resulting in rapid otalgia, fever, tympanic erythema, and temporary hearing diminution.",
    "Panic attack": "Acute episode of intense autonomic arousal and overwhelming fear reaching a peak within minutes, marked by palpitations, hyperventilation, chest pressure, tremor, and paresthesias.",
    "Bronchospasm / acute asthma exacerbation": "Acute reversible constriction of bronchial smooth muscle with airway hyperresponsiveness, producing wheezing, chest tightness, cough, and expiratory dyspnea.",
    "Bronchitis": "Acute inflammation of the tracheobronchial tree typically triggered by seasonal viral pathogens, presenting with prominent cough, wheezing, and chest wall soreness.",
    "Acute COPD exacerbation / infection": "Sustained worsening of baseline respiratory symptoms (dyspnea, cough, sputum volume/purulence) in patients with chronic obstructive pulmonary disease.",
    "Pulmonary embolism": "Occlusion of one or more pulmonary arterial vessels by a detached thrombus (usually from deep vein thrombosis), presenting with acute pleuritic pain, tachypnea, and hypoxia.",
    "URTI": "Upper respiratory tract infection comprising mild viral acute rhinosinusitis and pharyngitis with rhinorrhea, sneezing, low-grade pyrexia, and malaise.",
    "Influenza": "Acute respiratory infection caused by influenza viruses, featuring abrupt onset of high fever, rigors, diffuse myalgias, arthralgias, profound prostration, and dry cough.",
    "Pneumonia": "Infection of the pulmonary parenchyma resulting in alveolar consolidation and inflammatory exudate, marked by fever, productive cough, pleurisy, and focal auscultatory crackles.",
    "Acute rhinosinusitis": "Acute viral or secondary bacterial mucosal inflammation of the nasal cavity and paranasal sinuses lasting under 4 weeks, with facial pressure and purulent discharge.",
    "Chronic rhinosinusitis": "Persistent inflammation of the nasal and sinonasal mucosa exceeding 12 consecutive weeks, manifesting as ongoing congestion, facial fullness, hyposmia, and discharge.",
    "Bronchiolitis": "Lower respiratory tract viral illness predominant in infants and toddlers, leading to bronchiolar edema, mucus plugging, tachypnea, intercostal retractions, and wheezing.",
    "Pulmonary neoplasm": "Malignant cellular proliferation originating in lung or bronchial epithelial tissues, presenting with refractory cough, hemoptysis, unexplained weight loss, and dyspnea.",
    "Possible NSTEMI / STEMI": "Acute myocardial infarction with myocardial necrosis secondary to coronary thrombosis, manifesting as severe oppressive substernal chest pressure radiating to the arm, jaw, or back.",
    "Sarcoidosis": "Systemic granulomatous disorder characterized by noncaseating granulomas in multiple organs, especially bilateral hilar lymphadenopathy and pulmonary infiltrates.",
    "Pancreatic neoplasm": "Malignant tumor of the pancreas, frequently presenting insidiously with epigastric or back pain, jaundice, anorexia, steatorrhea, and marked weight loss.",
    "Acute pulmonary edema": "Rapid fluid extravasation into alveolar and interstitial spaces, commonly from elevated left ventricular filling pressure, presenting with extreme air hunger and orthopnea.",
    "Pericarditis": "Inflammation of the pericardial sac, presenting with sharp retrosternal pleuritic chest pain that is characteristically aggravated when supine and relieved by leaning forward."
}

# ---------------------------------------------------------------------------
# Singleton Anatomy Mapper (loaded once at module init)
# ---------------------------------------------------------------------------
_anatomy_mapper_instance: Optional[ConditionAnatomyMapper] = None


def get_anatomy_mapper() -> ConditionAnatomyMapper:
    """Returns the lazy-loaded singleton ConditionAnatomyMapper."""
    global _anatomy_mapper_instance
    if _anatomy_mapper_instance is None:
        _anatomy_mapper_instance = ConditionAnatomyMapper()
    return _anatomy_mapper_instance

# (CONDITION_REGION_MAP removed — now sourced from ConditionAnatomyMapper + body_mapping.json)


# ---------------------------------------------------------------------------
# Storyline & Clinical Guidance Generator
# ---------------------------------------------------------------------------
def generate_storyline_for_condition(
    condition_name: str,
    matched_symptoms: List[str],
    severity_level: int
) -> Storyline:
    """Generates empathetic clinical storyline with why-it-happens, red flags, and safe home remedies."""
    cond_lower = condition_name.lower()
    
    # 1. Cardiovascular Scenarios (Angina, NSTEMI, Myocarditis, Pericarditis)
    if any(k in cond_lower for k in ["angina", "nstemi", "stemi", "myocard", "pericard", "edema"]):
        return Storyline(
            patientOverview="Your reported symptoms involve cardiac and thoracic discomfort. Immediate clinical evaluation is essential to confirm myocardial perfusion.",
            whyItHappens=[
                "Myocardial oxygen supply-demand mismatch: When coronary blood vessels experience transient constriction or partial plaque obstruction, cardiac muscle cells undergo ischemic distress.",
                "Pericardial or pleural nerve irritation: Inflammation of tissues surrounding the heart can refer sharp discomfort to the chest wall, neck, or shoulder.",
                "Autonomic response: Cardiovascular stress often stimulates vagal or sympathetic pathways, inducing secondary sweating, nausea, or shortness of breath."
            ],
            precautions=[
                "Discontinue all physical exertion immediately and rest in a comfortable seated position.",
                "Do NOT drive yourself to the emergency department if experiencing crushing chest pressure or diaphoresis; call emergency services.",
                "Avoid heavy meals, extreme thermal shifts, and emotional stressors until clinically cleared."
            ],
            redFlags=[
                "Crushing retrosternal pressure radiating to the left arm, jaw, throat, or back",
                "Severe sudden shortness of breath, profound cold sweating, or syncope (passing out)",
                "Irregular, fluttering heartbeat accompanied by acute dizziness or confusion"
            ],
            homeRemedies=[
                HomeRemedy(title="Absolute Rest & Posture", instructions="Sit upright or semi-reclined with loosened tight clothing to minimize venous return workload on the heart.", icon="moon"),
                HomeRemedy(title="Calm Diaphragmatic Breathing", instructions="Perform slow, shallow nasal breathing to reduce acute sympathetic tachycardia.", icon="cloud"),
                HomeRemedy(title="Hydration with Room-Temp Water", instructions="Sip small amounts of plain room-temperature water; avoid ice-cold fluids which can trigger vagal reflexes.", icon="droplet")
            ],
            careTimeline="Cardiovascular symptoms warrant urgent medical appraisal. If symptoms persist beyond 10 minutes or intensify at rest, seek immediate emergency care."
        )

    # 2. Respiratory Scenarios (Bronchitis, Pneumonia, Asthma, COPD, URTI)
    if any(k in cond_lower for k in ["bronch", "pneumon", "asthma", "copd", "urti", "influenza", "croup"]):
        return Storyline(
            patientOverview="Your clinical presentation indicates inflammation or hyperresponsiveness within the bronchial tree and respiratory airway passages.",
            whyItHappens=[
                "Airway mucosal irritation: Pathogen exposure or environmental irritants trigger inflammatory cascades, causing epithelial swelling and mucus secretion.",
                "Hypersensitive cough reflex: Airway sensory C-fibers become sensitized, producing repeated coughing fits even after minimal stimulus.",
                "Intercostal muscle fatigue: Frequent forceful coughing strains the thoracic rib musculature, generating temporary musculoskeletal soreness."
            ],
            precautions=[
                "Avoid exposure to tobacco smoke, vaping, harsh household chemical aerosols, and cold dry air.",
                "Do NOT use leftover unprescribed antibiotics; acute bronchitis and URTIs are predominantly viral.",
                "Keep hydrated to prevent thick airway secretions from consolidating."
            ],
            redFlags=[
                "Coughing up frank blood or rust-colored sputum",
                "High persistent fever (> 102°F / 38.9°C) lasting longer than 48 hours",
                "Inability to speak in full sentences due to air hunger or audible inspiratory wheezing",
                "Bluish discoloration of the lips or fingernail beds (cyanosis)"
            ],
            homeRemedies=[
                HomeRemedy(title="Warm Honey & Citrus Drink", instructions="Consume 1-2 teaspoons of natural honey in warm water or herbal infusion to soothe irritated mucosal receptors.", icon="tea"),
                HomeRemedy(title="Steam Inhalation / Humidifier", instructions="Inhale warm gentle steam for 10-15 minutes twice daily to moisten bronchial mucous membranes.", icon="cloud"),
                HomeRemedy(title="Warm Salt Water Gargle", instructions="Dissolve 1/2 teaspoon of salt in warm water. Gargle for 30 seconds 3 times daily to alleviate pharyngeal edema.", icon="droplet"),
                HomeRemedy(title="Sleeping Head Elevation", instructions="Elevate the upper torso with an additional pillow to prevent nocturnal post-nasal drip pooling.", icon="moon")
            ],
            careTimeline="Most uncomplicated viral respiratory illnesses improve steadily over 7 to 14 days. If fever persists or breathlessness develops, consult a healthcare provider."
        )

    # 3. Gastrointestinal Scenarios (GERD, Pancreatic, Boerhaave, Hernia)
    if any(k in cond_lower for k in ["gerd", "reflux", "pancrea", "hernia", "boerhaave", "scombroid"]):
        return Storyline(
            patientOverview="Your symptom pattern points toward gastrointestinal irritation or esophageal reflux dynamics.",
            whyItHappens=[
                "Lower esophageal sphincter relaxation: Transient laxity allows hydrochloric acid and bile salts to backflow into the vulnerable esophageal lining.",
                "Gastric mucosal distention: Food triggers, delayed gastric emptying, or elevated intra-abdominal pressure push gastric contents upward.",
                "Visceral nerve hyperalgesia: Esophageal nerve endings transmit burning retrosternal signals that can mimic musculoskeletal or chest tightness."
            ],
            precautions=[
                "Remain upright for at least 2 to 3 hours following food or fluid consumption; do NOT lie flat.",
                "Avoid known dietary triggers including heavy fats, chocolate, citrus, caffeine, and spicy seasonings.",
                "Refrain from tight abdominal belts, corsets, or heavy bending immediately after eating."
            ],
            redFlags=[
                "Difficulty or pain while swallowing solids or liquids (dysphagia/odynophagia)",
                "Vomiting coffee-ground material or dark red blood",
                "Black, tarry bowel movements (melena)",
                "Unintended, rapid weight loss"
            ],
            homeRemedies=[
                HomeRemedy(title="Chamomile or Licorice Tea", instructions="Sip warm non-caffeinated herbal tea between meals to support mucous membrane integrity.", icon="tea"),
                HomeRemedy(title="Small, Frequent Meals", instructions="Divide nutrition into 4-5 moderate portions rather than 2-3 large heavy meals to reduce stomach pressure.", icon="droplet"),
                HomeRemedy(title="Elevate Bed Head by 6 Inches", instructions="Raise the head of your bed using risers or a wedge pillow so gravity prevents nocturnal acid regurgitation.", icon="moon")
            ],
            careTimeline="Gastroesophageal reflux often responds rapidly to dietary and posture adjustments within 1-2 weeks. Chronic or worsening reflux requires primary care assessment."
        )

    # 4. Neurological & Cranial (Cluster headache, Sinusitis, Otitis, Migraine)
    if any(k in cond_lower for k in ["headache", "sinus", "otitis", "rhinitis", "dyston", "myasthenia"]):
        return Storyline(
            patientOverview="Your reported symptoms reflect cranial, sinonasal, or regional cephalic discomfort requiring careful symptom tracking.",
            whyItHappens=[
                "Trigeminovascular activation: Sensory fibers along the trigeminal pathways release inflammatory neuropeptides, sensitizing cranial pain receptors.",
                "Sinonasal ostial blockage: Mucosal swelling traps secretions inside facial sinuses, creating localized pressure and aching sensations.",
                "Cervical muscle tension: Prolonged posture strain or stress induces sustained pericranial myofascial contraction."
            ],
            precautions=[
                "Rest in a quiet, darkened room free from bright digital screens or auditory stimulation.",
                "Avoid sudden head movements, extreme temperature changes, and alcohol or nitrate-rich foods.",
                "Avoid overuse of over-the-counter analgesics to prevent rebound medication-overuse headaches."
            ],
            redFlags=[
                "Sudden explosive onset 'thunderclap' headache reaching peak intensity within seconds",
                "Headache accompanied by stiff neck, confusion, high fever, or focal weakness",
                "Sudden changes in visual fields, speech clarity, or pupillary symmetry"
            ],
            homeRemedies=[
                HomeRemedy(title="Cold or Warm Forehead Compress", instructions="Apply a cool gel pack to the forehead or warm cloth over sinonasal areas for 15 minutes.", icon="cloud"),
                HomeRemedy(title="Adequate Hydration & Electrolytes", instructions="Drink 2 to 2.5 liters of clean water daily to avoid dehydration-induced cephalic pain.", icon="droplet"),
                HomeRemedy(title="Dark Room Rest & Acupressure", instructions="Apply gentle circular pressure to the temple and base of skull while resting in low ambient lighting.", icon="moon")
            ],
            careTimeline="Sinus and tension headaches typically abate within 3 to 7 days. Neurological symptoms with red flag indicators require urgent emergency evaluation."
        )

    # 5. General Fallback Storyline
    return Storyline(
        patientOverview=f"Your symptoms align most closely with candidate patterns including {condition_name}. A structured clinical evaluation is advised.",
        whyItHappens=[
            "Localized inflammatory response: Cellular defense mechanisms respond to environmental, mechanical, or microbial factors, releasing pro-inflammatory cytokines.",
            "Somatosensory signal amplification: Peripheral nociceptive nerves transmit warning signals to central pathways, manifesting as discomfort or fatigue.",
            "Systemic physiological adaptation: The body redirects metabolic energy to facilitate tissue repair and homeostasis."
        ],
        precautions=[
            "Monitor symptom progression closely over the next 24 to 48 hours.",
            "Avoid strenuous physical exertion or heavy lifting until symptoms stabilize.",
            "Maintain balanced nutrition and adequate systemic hydration."
        ],
        redFlags=[
            "Acute worsening of pain or breathlessness",
            "High unremitting fever accompanied by severe chills or rigors",
            "Confusion, extreme weakness, or loss of consciousness"
        ],
        homeRemedies=[
            HomeRemedy(title="Scheduled Rest Periods", instructions="Allow adequate sleep and avoid physical strain to facilitate the body's natural recuperative mechanisms.", icon="moon"),
            HomeRemedy(title="Hydration & Warm Fluids", instructions="Drink adequate warm water and broths to maintain electrolyte and fluid balance.", icon="droplet"),
            HomeRemedy(title="Symptom Diary", instructions="Note the timing, triggers, and severity of symptoms to assist your healthcare provider during consultation.", icon="sparkles")
        ],
        careTimeline="Should symptoms not improve within 3 to 5 days, or should any red flag symptoms emerge, seek in-person clinical consultation."
    )


# ---------------------------------------------------------------------------
# Singleton Clinical Service Manager
# ---------------------------------------------------------------------------
_clinical_service_instance: Optional[ClinicalDiagnosisService] = None


def get_clinical_service() -> ClinicalDiagnosisService:
    """Returns the lazy-loaded singleton instance of ClinicalDiagnosisService."""
    global _clinical_service_instance
    if _clinical_service_instance is None:
        _clinical_service_instance = ClinicalDiagnosisService()
    return _clinical_service_instance


def _clean_symptom_display_name(ev: Dict[str, Any]) -> str:
    """Extracts a clear, human-friendly clinical symptom name."""
    data_type = ev.get("data_type")
    finding = (ev.get("finding_en") or "").strip()
    question = (ev.get("question_en") or "").strip()
    matched_phrase = (ev.get("matched_phrase") or "").strip()

    # If categorical / multi-choice with a specific anatomical or descriptive value
    if data_type != "B" and "(" in finding and not finding.startswith("Present"):
        val = finding.split("(")[0].strip()
        if val:
            return val.capitalize()

    # If clean matched phrase exists
    if matched_phrase and 3 <= len(matched_phrase) <= 40:
        lower_p = matched_phrase.lower()
        if not any(lower_p.startswith(w) for w in ["i have", "patient", "there is", "feeling like"]):
            return matched_phrase.capitalize()

    # Otherwise, clean the question_en
    q = question.strip()
    if q.endswith("?"):
        q = q[:-1].strip()
    for prefix in [
        "Do you have pain somewhere, related to your reason for consulting",
        "Do you have ", "Have you had ", "Have you ", "Do you feel ",
        "Are you experiencing ", "Are you having ", "Do you notice ", "Do you "
    ]:
        if q.lower().startswith(prefix.lower()):
            q = q[len(prefix):].strip()
            break

    # Clean leading articles or common fillers
    for art in ["a ", "an ", "any ", "some "]:
        if q.lower().startswith(art):
            q = q[len(art):].strip()
            break

    if " in a significant way" in q.lower():
        q = q.replace(" in a significant way", "").strip()

    return q.capitalize() if q else "Clinical finding"


def _resolve_anatomical_localization(
    top_condition_name: str,
    raw_symptoms: str,
    extracted_symptoms: List[ExtractedSymptom],
    matched_evidences: List[Dict[str, Any]],
    anatomy_mapper: ConditionAnatomyMapper
) -> BodyLocalization:
    """
    Deterministically computes anatomical localization and 3D camera targeting.
    Prioritizes patient-reported localized joint/limb symptom sites (e.g. shoulder, knee, arm)
    so the 3D atlas focuses directly on the patient's presenting anatomical complaint,
    while linking systemic/visceral condition anatomy as secondary regions.
    """
    anatomy = anatomy_mapper.get_mapping(top_condition_name)
    raw_lower = (raw_symptoms or "").lower()

    # Aggregate text tokens across raw input, extracted symptom names, and evidence findings
    evidence_tokens = [
        (ev.get("finding_en") or "").lower()
        for ev in matched_evidences
    ]
    symptom_tokens = [s.name.lower() for s in extracted_symptoms]
    all_tokens = " ".join([raw_lower] + symptom_tokens + evidence_tokens)

    # ──────────────────────────────────────────────────────────────────────────
    # PRIORITY OVERRIDES — Patient symptom site & chief complaint analysis
    # Order of evaluation:
    # 1. Back / Spine / Spinal Cord
    # 2. Primary Chest / Cardiac / Pulmonary
    # 3. Gastrointestinal / Stomach / Reflux / Abdomen
    # 4. Extremity Joints & Limbs (Shoulder, Knee, Ankle, Elbow, Wrist, Hip)
    # 5. ENT / Throat / Neck
    # 6. Head / Cranial / Neurological
    # 7. Standard DDXPlus Condition Anatomical Mapping
    # ──────────────────────────────────────────────────────────────────────────

    # 1. BACK / SPINE / SPINAL CORD — back pain, spine, spinal, cord, vertebra, lumbar
    has_back_kw = bool(
        re.search(r'\b(back|spine|spinal|cord|vertebra|vertebrae|vertebral|dorsal|lumbar|sacral|sacroiliac|coccyx|sciatica)\b', raw_lower)
        or any(k in raw_lower for k in [
            "back pain", "backache", "back ache", "spinal cord", "spine pain", "spinal pain",
            "thoracic spine", "lumbar spine", "cervical spine", "lower back", "upper back",
            "mid back", "paraspinal", "disc"
        ])
        or any("back" in t or "spine" in t or "spinal" in t for t in all_tokens)
    )
    if raw_lower.strip() in ["come back", "call back", "came back", "look back", "brought back"]:
        has_back_kw = False

    # 2. CHEST (explicit text) — chest pain, pressure, tightness, retrosternal, angina
    has_explicit_chest_text = any(k in raw_lower for k in [
        "chest pain", "chest pressure", "chest tightness", "chest discomfort",
        "substernal", "retrosternal", "heart pain", "palpitation"
    ])

    # 3. GASTROINTESTINAL / STOMACH / REFLUX / ABDOMEN
    GI_STOMACH_KWS = [
        "stomach", "stomach pain", "stomach ache", "belly", "belly pain", "acid reflux",
        "reflux", "heartburn", "epigastric", "indigestion", "gastric", "esophag", "esophagus",
        "nausea", "vomiting", "abdominal", "abdomen", "gut", "pancreas", "pancreatic", "bloating",
        "cramps", "cramping", "bowel", "diarrhea"
    ]
    has_gi_stomach = any(k in raw_lower for k in GI_STOMACH_KWS) or "gerd" in raw_lower or top_condition_name in [
        "GERD", "Boerhaave", "Pancreatic neoplasm", "Inguinal hernia"
    ]

    # 4. HEAD / CRANIAL — headache, migraine, dizziness, scalp, eye pain, vertigo
    HEAD_KWS = [
        "headache", "head ache", "head pain", "migraine", "dizziness", "dizzy",
        "vertigo", "lightheaded", "light-headed", "temple pain", "forehead pain",
        "scalp", "skull", "cranial", "eye pain", "eye ache", "vision", "blurred vision",
        "tinnitus", "ringing in ear", "jaw pain", "facial pain", "face pain",
        "pressure in head", "throbbing head", "pounding head", "head pressure",
        "forehead", "cephalic"
    ]
    has_head_kw = any(k in raw_lower for k in HEAD_KWS) or bool(re.search(r'\bhead\b', raw_lower))

    # 5. NECK — neck pain, stiff neck, cervical
    NECK_KWS = ["neck pain", "stiff neck", "neck stiffness", "cervical pain", "neck ache",
                "nape", "nuchal"]
    has_neck_kw = any(k in raw_lower for k in NECK_KWS) or bool(re.search(r'\bneck\b', raw_lower))

    # 6. HIP — hip pain, groin
    HIP_KWS = ["hip pain", "hip ache", "hip stiffness", "groin pain", "groin ache",
               "buttock pain", "gluteal pain", "trochanteric"]
    has_hip_kw = any(k in raw_lower for k in HIP_KWS)

    # ─── Priority 1: Back & Spinal Cord ──────────────────────────────────────
    if has_back_kw and not has_explicit_chest_text:
        is_lower_back = any(k in raw_lower for k in ["lower back", "lumbar", "sciatica", "sacral", "sacroiliac", "coccyx", "l1", "l2", "l3", "l4", "l5", "s1"])
        is_cervical = any(k in raw_lower for k in ["cervical", "neck"])
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions:
            sec_regions.insert(0, anatomy.primaryRegion)

        if is_cervical:
            return BodyLocalization(
                primaryRegion="Head",
                secondaryRegions=sec_regions,
                bodySystem="Nervous System / Cervical Spine",
                targetOrgan="Cervical Spine & Spinal Cord",
                spatialCoordinates=SpatialCoordinates(x=0.0, y=1.45, z=-0.09)
            )
        if is_cervical:
            return BodyLocalization(
                primaryRegion="Head",
                secondaryRegions=sec_regions,
                bodySystem="Nervous System / Cervical Spine",
                targetOrgan="Cervical Spine & Spinal Cord",
                spatialCoordinates=SpatialCoordinates(x=0.0, y=1.45, z=-0.06)
            )
        elif is_lower_back:
            return BodyLocalization(
                primaryRegion="Pelvis",
                secondaryRegions=sec_regions,
                bodySystem="Nervous System / Lumbar Spine",
                targetOrgan="Lumbar Spine & Spinal Cord",
                spatialCoordinates=SpatialCoordinates(x=0.0, y=0.92, z=-0.06)
            )
        else:
            return BodyLocalization(
                primaryRegion="Thorax",
                secondaryRegions=sec_regions,
                bodySystem="Nervous System / Spinal Cord",
                targetOrgan="Thoracic Spine & Spinal Cord",
                spatialCoordinates=SpatialCoordinates(x=0.0, y=1.20, z=-0.06)
            )

    # ─── Priority 2: Gastrointestinal / Stomach / Esophagus / Reflux ──────────
    if has_gi_stomach and not has_explicit_chest_text and not has_back_kw:
        sec_regions = list(anatomy.secondaryRegions)
        if has_head_kw and "Head" not in sec_regions:
            sec_regions.append("Head")
        if "Thorax" not in sec_regions and (top_condition_name in ["GERD", "Boerhaave"] or "reflux" in raw_lower or "esophag" in raw_lower):
            sec_regions.insert(0, "Thorax")

        # Inguinal Hernia -> Pelvis/Groin
        if top_condition_name == "Inguinal hernia" or "groin" in raw_lower:
            return BodyLocalization(
                primaryRegion="Pelvis",
                secondaryRegions=sec_regions,
                bodySystem="Digestive / Inguinal",
                targetOrgan="Inguinal Canal & Groin Structures",
                spatialCoordinates=SpatialCoordinates(x=0.06, y=0.78, z=0.01)
            )

        # Pancreatic Neoplasm -> Abdomen / Pancreas
        if top_condition_name == "Pancreatic neoplasm" or "pancrea" in raw_lower:
            return BodyLocalization(
                primaryRegion="Abdomen",
                secondaryRegions=sec_regions,
                bodySystem="Digestive / Endocrine",
                targetOrgan="Pancreas & Retroperitoneal Cavity",
                spatialCoordinates=SpatialCoordinates(x=0.02, y=1.08, z=0.01)
            )

        # GERD / Esophagus / Acid Reflux / Gastric Pain
        if top_condition_name == "Boerhaave":
            return BodyLocalization(
                primaryRegion="Thorax",
                secondaryRegions=sec_regions,
                bodySystem="Digestive",
                targetOrgan="Mid & Lower Esophagus",
                spatialCoordinates=SpatialCoordinates(x=0.0, y=1.22, z=0.01)
            )

        return BodyLocalization(
            primaryRegion="Abdomen",
            secondaryRegions=sec_regions,
            bodySystem="Gastrointestinal / Digestive",
            targetOrgan="Stomach & Gastroesophageal Junction",
            spatialCoordinates=SpatialCoordinates(x=0.0, y=1.05, z=0.01)
        )

    # ─── Priority 3: Hip & Pelvic Articulations ──────────────────────────────
    if has_hip_kw and not has_explicit_chest_text:
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Pelvis":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Pelvis",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Pelvic",
            targetOrgan="Hip Joint & Femoral Head",
            spatialCoordinates=SpatialCoordinates(x=0.09, y=0.82, z=0.01)
        )

    # ─── Priority 4: Head & Cranial (when not overshadowed by acute GI/Chest) ─
    if has_head_kw and not has_explicit_chest_text and not has_back_kw and not has_gi_stomach:
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Head":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Head",
            secondaryRegions=sec_regions,
            bodySystem=anatomy.bodySystem if "neuro" in anatomy.bodySystem.lower() else "Neurological / Cranial",
            targetOrgan="Cranial Region & Cephalic Structures",
            spatialCoordinates=SpatialCoordinates(x=0.0, y=1.62, z=0.02)
        )

    # ─── Priority 5: Neck & Cervical Musculature ─────────────────────────────
    if has_neck_kw and not has_explicit_chest_text and not any(k in raw_lower for k in ["lumbar", "lower back", "thoracic"]):
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Head":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Head",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Cervical",
            targetOrgan="Cervical Spine & Neck Musculature",
            spatialCoordinates=SpatialCoordinates(x=0.0, y=1.45, z=-0.06)
        )

    # 1. Shoulder & Upper Extremity Joint Localization
    is_shoulder = (
        "shoulder" in raw_lower or
        "shoulder" in all_tokens or
        "épaule" in all_tokens or
        any(k in raw_lower for k in ["deltoid", "rotator cuff", "scapula", "acromion", "collarbone"]) or
        any("shoulder" in tok for tok in evidence_tokens)
    )

    if is_shoulder and not has_explicit_chest_text:
        has_left_kw = "left" in raw_lower or "gauche" in raw_lower
        has_right_kw = "right" in raw_lower or "droite" in raw_lower

        if has_left_kw and not has_right_kw:
            shoulder_x = 0.19
            organ_name = "Left Shoulder Joint & Deltoid Musculature"
        elif has_right_kw and not has_left_kw:
            shoulder_x = -0.19
            organ_name = "Right Shoulder Joint & Deltoid Musculature"
        else:
            if any(k in all_tokens for k in ["shoulder(l)", "épaule(g)"]) and not any(k in all_tokens for k in ["shoulder(r)", "épaule(d)"]):
                shoulder_x = 0.19
                organ_name = "Left Shoulder Joint & Deltoid Musculature"
            else:
                shoulder_x = -0.19
                organ_name = "Shoulder Joint & Deltoid Musculature"

        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Upper Limb":
            sec_regions.insert(0, anatomy.primaryRegion)

        return BodyLocalization(
            primaryRegion="Upper Limb",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Upper Extremity",
            targetOrgan=organ_name,
            spatialCoordinates=SpatialCoordinates(x=shoulder_x, y=1.35, z=0.00)
        )

    # 2. Elbow & Forearm
    if any(k in raw_lower for k in ["elbow", "forearm", "biceps", "triceps"]) and not has_explicit_chest_text:
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Upper Limb":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Upper Limb",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Upper Extremity",
            targetOrgan="Elbow Joint & Forearm Complex",
            spatialCoordinates=SpatialCoordinates(x=0.25, y=1.10, z=0.00)
        )

    # 3. Wrist & Hand
    if any(k in raw_lower for k in ["wrist", "hand", "finger", "thumb", "carpal", "palm"]):
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Upper Limb":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Upper Limb",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Upper Extremity",
            targetOrgan="Wrist & Carpal Articulations",
            spatialCoordinates=SpatialCoordinates(x=0.28, y=0.85, z=0.00)
        )

    # 4. Knee & Lower Extremity Joint Localization
    if any(k in raw_lower for k in ["knee", "patella", "genu"]):
        has_left_kw = "left" in raw_lower or "gauche" in raw_lower
        has_right_kw = "right" in raw_lower or "droite" in raw_lower
        if has_left_kw and not has_right_kw:
            knee_x = 0.08
            knee_label = "Left Knee Joint & Patellar Complex"
        elif has_right_kw and not has_left_kw:
            knee_x = -0.08
            knee_label = "Right Knee Joint & Patellar Complex"
        else:
            knee_x = 0.08
            knee_label = "Knee Joint & Patellar Complex"

        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Lower Limb":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Lower Limb",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Lower Extremity",
            targetOrgan=knee_label,
            spatialCoordinates=SpatialCoordinates(x=knee_x, y=0.45, z=0.02)
        )

    # 5. Ankle & Foot
    if any(k in raw_lower for k in ["ankle", "foot", "feet", "heel", "tarsal", "malleol"]):
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Lower Limb":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Lower Limb",
            secondaryRegions=sec_regions,
            bodySystem="Musculoskeletal / Lower Extremity",
            targetOrgan="Ankle Joint & Tarsal Articulations",
            spatialCoordinates=SpatialCoordinates(x=0.09, y=0.08, z=0.02)
        )

    # 6. Throat / Neck / Cervical Pharynx
    if any(k in raw_lower for k in ["throat", "swallow", "pharynx", "larynx", "tonsil", "neck pain"]):
        sec_regions = list(anatomy.secondaryRegions)
        if anatomy.primaryRegion not in sec_regions and anatomy.primaryRegion != "Head":
            sec_regions.insert(0, anatomy.primaryRegion)
        return BodyLocalization(
            primaryRegion="Head",
            secondaryRegions=sec_regions,
            bodySystem="ENT / Respiratory",
            targetOrgan="Pharynx, Larynx & Cervical Region",
            spatialCoordinates=SpatialCoordinates(x=0.0, y=1.42, z=0.01)
        )

    # 7. Esophagus & Gastroesophageal Junction (Boerhaave / GERD / heartburn)
    if any(k in raw_lower for k in ["esophag", "acid reflux", "heartburn", "retrosternal burning"]) or top_condition_name == "Boerhaave":
        return BodyLocalization(
            primaryRegion="Thorax" if top_condition_name == "Boerhaave" else anatomy.primaryRegion,
            secondaryRegions=anatomy.secondaryRegions,
            bodySystem="Digestive",
            targetOrgan="Esophagus & Gastroesophageal Junction",
            spatialCoordinates=SpatialCoordinates(x=0.0, y=1.20, z=0.01)
        )

    # 8. Standard / Default DDXPlus Condition Anatomical Mapping
    return BodyLocalization(
        primaryRegion=anatomy.primaryRegion,
        secondaryRegions=anatomy.secondaryRegions,
        bodySystem=anatomy.bodySystem,
        targetOrgan=anatomy.targetOrgan,
        spatialCoordinates=SpatialCoordinates(**anatomy.spatialCoordinates)
    )


def process_clinical_analysis(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Main orchestration function:
    1. Validates input (empty / whitespace checks)
    2. Runs ClinicalDiagnosisService (NLP extraction + ML inference)
    3. Handles no-match and low-confidence scenarios
    4. Formats and returns AnalyzeResponse strictly matching API contract
    """
    start_time = time.perf_counter()

    # Step 1: Validate input
    raw_text = (request.rawSymptoms or "").strip()
    tags = [t.strip() for t in (request.structuredSymptoms or []) if t and t.strip()]
    combined_text = f"{raw_text} {' '.join(tags)}".strip()

    if not combined_text:
        raise HTTPException(
            status_code=400,
            detail={
                "error": {
                    "code": "INVALID_INPUT",
                    "message": "At least one valid symptom string or tag must be provided.",
                    "details": [
                        {
                            "field": "rawSymptoms",
                            "issue": "Field cannot be empty or contain whitespace only."
                        }
                    ]
                }
            }
        )

    # Step 2: Model Inference via ClinicalDiagnosisService
    try:
        service = get_clinical_service()
        result = service.diagnose_free_text(
            text=combined_text,
            age=request.age or 45,
            sex=(request.sex or "M").upper(),
            top_k=request.topK or 5
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "MODEL_INFERENCE_FAILURE",
                    "message": f"Unable to complete symptom classification: {str(exc)}"
                }
            }
        )

    nlp_extraction = result.get("nlp_extraction", {})
    matched_evidences: List[Dict[str, Any]] = nlp_extraction.get("matched_evidences", [])
    differential_candidates: List[Dict[str, Any]] = result.get("differential_diagnosis", [])

    # Step 3: Handle No Matches
    if not matched_evidences:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "NO_EVIDENCE_MATCHED",
                    "message": "No recognized clinical symptoms or risk factors could be identified from the input.",
                    "details": [
                        {
                            "field": "rawSymptoms",
                            "issue": "Please describe specific symptoms such as chest pain, fever, cough, nausea, headache, or breathlessness."
                        }
                    ]
                }
            }
        )

    # Step 4: Map Extracted Symptoms
    extracted_symptoms: List[ExtractedSymptom] = []
    patient_symptom_names: List[str] = []
    
    for i, ev in enumerate(matched_evidences):
        clean_name = _clean_symptom_display_name(ev)
        patient_symptom_names.append(clean_name)
        
        # Determine severity descriptor
        score = float(ev.get("score", 0.5))
        severity_label = "severe" if "severe" in combined_text.lower() or score > 0.85 else ("moderate" if score > 0.6 else "mild")
        
        # Categorize
        category = "symptom" if ev.get("category") == "Symptom / Sign" else "antecedent"
        
        extracted_symptoms.append(
            ExtractedSymptom(
                id=f"sym_{i+1:03d}",
                name=clean_name,
                severity=severity_label,
                category=category,
                matched_phrase=ev.get("matched_phrase"),
                confidence_score=round(score, 3)
            )
        )

    # Step 5: Rank Conditions and Format PossibleConditions
    possible_conditions: List[PossibleCondition] = []
    top_score = 0.0
    top_icd10 = "Unknown"
    top_confidence = "Low"
    top_supporting_symptoms: List[str] = []
    top_condition_name = "Condition"

    for i, cand in enumerate(differential_candidates):
        cond_name = str(cand.get("condition_name", "Unknown"))
        prob = float(cand.get("probability", 0.0))
        icd10 = str(cand.get("icd10_id", "Unknown"))
        severity = cand.get("severity")

        # Confidence categorization
        if prob >= 0.60:
            conf_cat = "High"
        elif prob >= 0.25:
            conf_cat = "Moderate"
        else:
            conf_cat = "Low"

        # Lookup description
        desc = CONDITION_DESCRIPTIONS.get(
            cond_name,
            f"Clinical condition characterized by {', '.join(patient_symptom_names[:3])}."
        )

        # Supporting symptoms: patient symptoms that align with this condition
        cond_info = service.predictor.conditions_meta.get(cond_name, {})
        cond_symptom_codes = set(cond_info.get("symptoms", {}).keys())
        
        supporting = []
        for ev in matched_evidences:
            code = ev.get("code")
            if code in cond_symptom_codes or not cond_symptom_codes:
                clean = _clean_symptom_display_name(ev)
                if clean not in supporting:
                    supporting.append(clean)

        if not supporting:
            # Fallback to general matched symptoms
            supporting = [s.name for s in extracted_symptoms[:2]]

        if i == 0:
            top_score = round(prob, 2)
            top_icd10 = icd10
            top_confidence = conf_cat
            top_supporting_symptoms = supporting
            top_condition_name = cond_name

        possible_conditions.append(
            PossibleCondition(
                id=f"cond_{i+1:03d}",
                name=cond_name,
                icd10Code=icd10,
                modelScore=round(prob, 2),
                confidenceCategory=conf_cat,
                description=desc,
                supportingSymptoms=supporting,
                severity=int(severity) if severity is not None else None
            )
        )

    # Step 6: Anatomical Localization — resolved from ConditionAnatomyMapper and patient symptoms
    anatomy_mapper = get_anatomy_mapper()
    body_localization = _resolve_anatomical_localization(
        top_condition_name=top_condition_name,
        raw_symptoms=request.rawSymptoms,
        extracted_symptoms=extracted_symptoms,
        matched_evidences=matched_evidences,
        anatomy_mapper=anatomy_mapper
    )

    # Step 7: Storyline & Narrative Breakdown
    storyline = generate_storyline_for_condition(
        condition_name=top_condition_name,
        matched_symptoms=patient_symptom_names,
        severity_level=possible_conditions[0].severity or 3
    )

    # Step 8: Metadata & Provenance
    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    is_low_conf = (top_score < 0.25)

    model_metadata = ModelMetaData(
        version="1.0.0",
        inferenceTimeMs=elapsed_ms,
        disclaimer=(
            "This analysis provides probabilistic clinical decision support only "
            "and does not constitute a confirmed diagnosis."
        ),
        modelType="LogisticRegressionBaseline",
        totalFeatures=1213,
        totalClasses=49,
        lowConfidenceWarning=is_low_conf
    )

    # Step 9: Assemble Final Response
    now_iso = datetime.now(timezone.utc).isoformat()
    return AnalyzeResponse(
        status="completed",
        timestamp=now_iso,
        extractedSymptoms=extracted_symptoms,
        bodyLocalization=body_localization,
        possibleConditions=possible_conditions,
        icd10Code=top_icd10,
        modelScore=top_score,
        confidenceCategory=top_confidence,
        supportingSymptoms=top_supporting_symptoms,
        modelMetaData=model_metadata,
        storyline=storyline
    )
