/**
 * studentClinicalKnowledge.js
 * Provides organ-specific, medically coherent reasoning for Medical Students.
 * Dynamically resolves life threats, pathophysiology mechanisms, high-yield pearls,
 * and shelf-exam OSCE vignettes based on the active pathology and anatomical region.
 */

export function getStudentClinicalDetails(conditionName = '', bodyLocalization = {}) {
  const norm = (conditionName || '').toLowerCase().trim();
  const region = (bodyLocalization.primaryRegion || '').toLowerCase().trim();
  const system = (bodyLocalization.bodySystem || '').toLowerCase().trim();

  // 1. GASTROINTESTINAL & ABDOMINAL (GERD, Gastritis, Cholecystitis, Pancreatitis, Peptic Ulcer, etc.)
  if (
    norm.includes('gerd') ||
    norm.includes('reflux') ||
    norm.includes('gastritis') ||
    norm.includes('ulcer') ||
    norm.includes('cholecyst') ||
    norm.includes('pancreat') ||
    norm.includes('appendic') ||
    norm.includes('hernia') ||
    region.includes('abdomen') ||
    system.includes('gastro') ||
    system.includes('digestive')
  ) {
    return {
      emergencyRuleOuts: [
        {
          name: 'Acute Coronary Syndrome (Atypical MI)',
          exclusionCriteria: 'Rule out with 12-lead ECG and serial cardiac troponins. Epigastric/retrosternal burning can mimic acute inferior wall myocardial ischemia.',
          status: 'Must Exclude First',
        },
        {
          name: 'Perforated Peptic Ulcer / Boerhaave Syndrome',
          exclusionCriteria: 'Examine for sudden peritoneal signs (involuntary guarding, rebound rigidity, absence of bowel sounds) and free air under diaphragm on erect chest radiograph.',
          status: 'Acute Abdomen Check',
        },
        {
          name: 'Acute Pancreatitis / Cholecystitis',
          exclusionCriteria: 'Serum lipase elevation >3x upper limit of normal; ultrasound for biliary ductal dilation and Murphy sign.',
          status: 'Enzymatic & Sonographic Triage',
        },
      ],
      pathophysiologySteps: [
        {
          step: '1. Lower Esophageal Sphincter (LES) Incompetence',
          detail: 'Transient LES relaxations (TLESRs) or low basal sphincter pressure permit retrograde leakage of gastric contents into the lower esophagus.',
        },
        {
          step: '2. Chemical Mucosal Injury',
          detail: 'Hydrochloric acid, pepsin, and conjugated bile salts erode the non-keratinized stratified squamous epithelium, activating mucosal chemo-nociceptors.',
        },
        {
          step: '3. Impaired Esophageal Clearance',
          detail: 'Decreased salivary bicarbonate neutralization and defective secondary peristalsis prolong luminal acid exposure time, generating persistent retrosternal burning.',
        },
        {
          step: '4. Metaplastic Risk (Barrett Esophagus)',
          detail: 'Repetitive acid-peptic exposure stimulates glandular columnar metaplasia with goblet cells (Barrett esophagus), increasing long-term adenocarcinoma risk.',
        },
      ],
      roundsPearls: [
        {
          title: 'Alarm Symptoms Mandating Urgent Endoscopy',
          body: 'Patients presenting with "ABCDEFG" alarm signs — Anemia, Bleeding, Continuous vomiting, Dysphagia, Early satiety, Family history of GI cancer, or Weight loss — require diagnostic upper endoscopy (EGD) before empiric medical management.',
        },
        {
          title: 'Empiric PPI Diagnostic-Therapeutic Trial',
          body: 'In patients under age 60 with classic retrosternal burning and regurgitation without alarm signs, an 8-week empiric trial of once-daily proton pump inhibitors (e.g. Omeprazole 20mg) is both diagnostic and therapeutic.',
        },
        {
          title: 'Nighttime Reflux & Lifestyle Management',
          body: 'Elevation of the head of the bed by 6 inches and avoidance of food within 3 hours of recumbency significantly decrease nocturnal acid contact time compared to dietary restriction alone.',
        },
      ],
      pertinentNegatives: [
        { sign: 'No Dysphagia or Odynophagia', clinicalValue: 'Rules out high-grade peptic stricture, ring formation, or esophageal malignancy' },
        { sign: 'No Unintentional Weight Loss', clinicalValue: 'Decreases likelihood of gastric or esophageal neoplastic processes' },
        { sign: 'No Hematemesis or Melena', clinicalValue: 'Confirms absence of active upper gastrointestinal ulcer hemorrhage' },
        { sign: 'No Peritoneal Guarding or Rebound', clinicalValue: 'Excludes visceral perforation or secondary acute peritonitis' },
      ],
      vignette: {
        prompt: `A 46-year-old male presents with a 4-month history of burning retrosternal chest discomfort occurring 30–45 minutes after meals, exacerbated when lying down in bed. He reports occasional sour water brash in his mouth. He denies difficulty swallowing, unintentional weight loss, black stools, or exertional chest tightness. Vitals: BP 124/80 mmHg, HR 72 bpm, T 36.9°C. Physical examination of the abdomen and heart is completely normal. 12-lead ECG is unremarkable. What is the most appropriate next step in clinical management?`,
        options: [
          { id: 'a', text: 'Order emergent barium esophagram and contrast abdominal CT' },
          { id: 'b', text: 'Initiate an 8-week trial of once-daily oral proton pump inhibitor (PPI) therapy alongside lifestyle modifications', isCorrect: true },
          { id: 'c', text: 'Schedule immediate surgical laparoscopic Nissen fundoplication' },
          { id: 'd', text: 'Prescribe empiric broad-spectrum oral amoxicillin and clarithromycin' },
        ],
        rationale: `In patients presenting with typical GERD symptoms (heartburn, acid regurgitation) without alarm features (dysphagia, weight loss, bleeding, anemia), American College of Gastroenterology (ACG) guidelines recommend an empiric 8-week trial of once-daily PPI therapy. Diagnostic upper endoscopy (EGD) is reserved for patients who fail empiric PPI therapy or present with alarm symptoms. Surgical fundoplication is an elective consideration only for medically refractory or intolerant patients.`,
      },
    };
  }

  // 2. CARDIOPULMONARY & CHEST (Angina, MI, Pericarditis, Asthma, COPD, Pneumonia, Bronchitis, etc.)
  if (
    norm.includes('pericard') ||
    norm.includes('angina') ||
    norm.includes('infarct') ||
    norm.includes('pneumon') ||
    norm.includes('bronch') ||
    norm.includes('asthma') ||
    norm.includes('copd') ||
    norm.includes('pleur') ||
    region.includes('thorax') ||
    region.includes('chest') ||
    system.includes('cardio') ||
    system.includes('respiratory')
  ) {
    return {
      emergencyRuleOuts: [
        {
          name: 'Acute Coronary Syndrome (STEMI / NSTEMI)',
          exclusionCriteria: 'Serial cardiac troponins and baseline 12-lead ECG assessing for dynamic ST elevations, ST depressions, or T-wave inversions.',
          status: 'STAT Priority',
        },
        {
          name: 'Pulmonary Embolism (PE)',
          exclusionCriteria: 'Assess Wells score for PE. Check D-dimer in low-risk; CT Pulmonary Angiography (CTPA) or V/Q scan if intermediate-to-high risk.',
          status: 'Critical Triage',
        },
        {
          name: 'Acute Aortic Dissection',
          exclusionCriteria: 'Check for sudden tearing pain radiating to the back, upper-extremity blood pressure asymmetry (>20 mmHg), or new aortic regurgitation murmur.',
          status: 'Immediate Rule-Out',
        },
      ],
      pathophysiologySteps: [
        {
          step: '1. Triggering Insult & Inflammation',
          detail: 'Infectious microbial invasion, autoimmune pericardial irritation, or allergen-mediated bronchoconstriction initiates localized inflammatory response.',
        },
        {
          step: '2. Capillary Transudation & Tissue Permeability',
          detail: 'Vascular endothelial gaps allow leukocyte extravasation and fluid accumulation across interstitial and alveolar/pericardial spaces.',
        },
        {
          step: '3. Ventilation-Perfusion (V/Q) Mismatch & Pain Cascade',
          detail: 'Alveolar consolidation or chest wall motion limitation induces hypoxemia, tachypnea, and somatic/phrenic nerve nociceptive firing.',
        },
        {
          step: '4. Systemic Manifestations',
          detail: 'Pyrogenic cytokines (IL-1, TNF-alpha) activate hypothalamic thermoregulation, causing fever, tachycardia, and constitutional malaise.',
        },
      ],
      roundsPearls: [
        {
          title: 'Pericarditis vs Ischemic ECG Differentiation',
          body: 'Acute pericarditis demonstrates diffuse concave ST-segment elevation across multiple vascular territories with reciprocal PR-segment depression in lead II/V5/V6, and PR elevation in aVR (pathognomonic).',
        },
        {
          title: 'CURB-65 Triage in Pneumonia',
          body: 'Score 1 point each for Confusion, Urea >7 mmol/L, Respiratory rate ≥30/min, Blood pressure <90 systolic or ≤60 diastolic, and Age ≥65. Score 0-1 = outpatient; score ≥2 = consider inpatient admission; score ≥3 = intensive monitoring.',
        },
        {
          title: 'Pleuritic Chest Pain Relief',
          body: 'Pain exacerbated by deep inspiration and recumbency that improves with sitting up and leaning forward strongly points toward acute pericardial or pleuritic etiology rather than myocardial ischemia.',
        },
      ],
      pertinentNegatives: [
        { sign: 'No Hemoptysis or Unilateral Leg Edema', clinicalValue: 'Significantly reduces pre-test probability of acute pulmonary thromboembolism' },
        { sign: 'No Asymmetric Arm Blood Pressures', clinicalValue: 'Substantially lowers clinical suspicion for ascending aortic dissection' },
        { sign: 'No Central Cyanosis or Hypoxemia', clinicalValue: 'Confirms adequate gas exchange and absence of acute respiratory failure' },
        { sign: 'No JVD or Pulsus Paradoxus', clinicalValue: 'Excludes pericardial tamponade or acute right ventricular outflow obstruction' },
      ],
      vignette: {
        prompt: `A 32-year-old female presents with sharp anterior chest pain that began yesterday following a mild viral illness. The pain is exacerbated by deep inspiration and coughing, and improves notably when she sits upright and leans forward. On physical exam, BP is 120/78 mmHg, HR 82 bpm, RR 16/min, T 37.6°C. Auscultation reveals a high-pitched scratchy friction sound over the left sternal border. 12-lead ECG shows widespread concave-upward ST elevations in leads I, II, V2-V6 with PR-segment depression in lead II and PR elevation in aVR. What is the first-line pharmacotherapy?`,
        options: [
          { id: 'a', text: 'Immediate emergent cardiac catheterization for primary percutaneous coronary intervention' },
          { id: 'b', text: 'High-dose oral NSAIDs (e.g., Ibuprofen 600–800 mg TID) combined with oral Colchicine (0.5 mg daily)', isCorrect: true },
          { id: 'c', text: 'Intravenous broad-spectrum Vancomycin and Piperacillin-Tazobactam' },
          { id: 'd', text: 'High-dose systemic Corticosteroid pulse therapy alone' },
        ],
        rationale: `This presentation is classic for acute viral pericarditis (pleuritic chest pain relieved by leaning forward, pericardial friction rub, diffuse ST elevation with PR depression). First-line therapy for acute idiopathic or viral pericarditis consists of high-dose NSAIDs (Ibuprofen or Aspirin) plus Colchicine for 3 months, which accelerates symptom resolution and halves the rate of recurrence. Corticosteroids are reserved for refractory cases or specific rheumatologic indications, as they increase the risk of recurrence.`,
      },
    };
  }

  // 3. HEAD, NEUROLOGICAL & ENT (Sinusitis, Pharyngitis, Migraine, Tension headache, etc.)
  if (
    norm.includes('sinus') ||
    norm.includes('pharyng') ||
    norm.includes('laryng') ||
    norm.includes('headache') ||
    norm.includes('migraine') ||
    norm.includes('cluster') ||
    region.includes('head') ||
    region.includes('neck') ||
    system.includes('nervous')
  ) {
    return {
      emergencyRuleOuts: [
        {
          name: 'Bacterial Meningitis / Encephalitis',
          exclusionCriteria: 'Examine for nuchal rigidity, Kernig/Brudzinski signs, fever, photophobia, and altered level of consciousness (GCS 15 documented).',
          status: 'STAT Neurological Check',
        },
        {
          name: 'Orbital Cellulitis / Cavernous Sinus Thrombosis',
          exclusionCriteria: 'Assess for proptosis, ophthalmoplegia (cranial nerves III, IV, VI), severe chemosis, and periorbital erythema/edema.',
          status: 'Ophthalmic Emergency Check',
        },
        {
          name: 'Subarachnoid Hemorrhage (Thunderclap)',
          exclusionCriteria: 'Inquire regarding sudden-onset headache reaching maximal peak within seconds ("worst headache of life"); non-contrast head CT within 6h if suspected.',
          status: 'Vascular Rule-Out',
        },
      ],
      pathophysiologySteps: [
        {
          step: '1. Viral Inoculation & Mucosal Colonization',
          detail: 'Rhinovirus, influenza, or coronavirus adheres to the ciliated respiratory pseudostratified epithelium of the nasopharynx and paranasal sinuses.',
        },
        {
          step: '2. Microvascular Hyperemia & Ostial Occlusion',
          detail: 'Release of bradykinin, prostaglandins, and histamine induces mucosal swelling, obstructing narrow sinus ostiomeatal complexes.',
        },
        {
          step: '3. Stasis & Mucociliary Clearance Impairment',
          detail: 'Impaired ciliary motility and hypoxic luminal environment trap viscous secretions, producing intense sinus pressure and referred facial headache.',
        },
        {
          step: '4. Bacterial Superinfection Threshold',
          detail: 'Secondary bacterial proliferation (S. pneumoniae, H. influenzae, M. catarrhalis) occurs in ~0.5–2% of viral cases lasting beyond 10 days.',
        },
      ],
      roundsPearls: [
        {
          title: 'The 10-Day Antibiotic Stewardship Rule',
          body: '>90% of acute rhinosinusitis cases are viral. Antibacterial therapy should be withheld unless symptoms persist ≥10 days without clinical improvement, or the patient exhibits "double sickening" (acute worsening after initial improvement).',
        },
        {
          title: 'Centor Criteria for Streptococcal Pharyngitis',
          body: 'Assign 1 point each for Absence of cough, Swollen anterior cervical nodes, Temperature >38.0°C (100.4°F), and Tonsillar exudate. Score 0-1: no test/antibiotic; score 2-3: rapid antigen test (RADT); score 4: empiric treatment or RADT.',
        },
        {
          title: 'Sinus Imaging Stewardship',
          body: 'Plain sinus radiographs and contrast CT are NOT recommended for uncomplicated acute rhinosinusitis due to high false-positive rates of mucosal thickening in healthy individuals.',
        },
      ],
      pertinentNegatives: [
        { sign: 'No Nuchal Rigidity or Photophobia', clinicalValue: 'Effectively excludes acute bacterial meningeal inflammation' },
        { sign: 'Intact Extraocular Movements (EOM)', clinicalValue: 'Rules out orbital subperiosteal abscess and cavernous sinus extension' },
        { sign: 'No Facial Asymmetry or Trismus', clinicalValue: 'Excludes peritonsillar space abscess and cranial nerve paresis' },
        { sign: 'No Stridor or Drooling', clinicalValue: 'Confirms unobstructed upper airway and excludes acute supraglottitis/epiglottitis' },
      ],
      vignette: {
        prompt: `A 24-year-old medical student presents with 6 days of facial pressure over the maxillary sinuses, bilateral nasal congestion, and clear-to-yellowish nasal discharge following a cold. Temperature is 37.4°C, HR 76 bpm, BP 116/72 mmHg. Anterior rhinoscopy demonstrates mucosal erythema and mild turbinate edema without purulence. Neurological examination reveals full extraocular motility, no periorbital edema, and no meningeal signs. What is the recommended management plan?`,
        options: [
          { id: 'a', text: 'Prescribe high-dose oral Amoxicillin-Clavulanate for 7 days' },
          { id: 'b', text: 'Recommend symptomatic relief (saline irrigation, analgesics/antipyretics) and advise follow-up if symptoms persist beyond 10 days', isCorrect: true },
          { id: 'c', text: 'Order emergent high-resolution contrast CT of the paranasal sinuses' },
          { id: 'd', text: 'Perform immediate bilateral endoscopic maxillary antrostomy' },
        ],
        rationale: `According to clinical guidelines (AAO-HNS & IDSA), acute rhinosinusitis of <10 days duration is overwhelmingly viral in etiology. Symptomatic supportive care (intranasal saline, analgesics, rest) is recommended. Antibiotics are reserved for symptoms lasting ≥10 days without improvement, severe onset (fever >39°C with purulent discharge for ≥3 consecutive days), or 'double sickening'. Sinus imaging is not indicated for uncomplicated acute presentations.`,
      },
    };
  }

  // 4. GENERAL CLINICAL FALLBACK (Gracefully adapts to any other condition)
  return {
    emergencyRuleOuts: [
      {
        name: 'Acute Sepsis / Systemic Inflammatory Response (SIRS)',
        exclusionCriteria: 'Check vital signs for tachycardia (HR >90), tachypnea (RR >20), fever or hypothermia (<36°C or >38°C), and altered mental status.',
        status: 'Systemic Hemodynamic Check',
      },
      {
        name: 'Acute Thromboembolic Event',
        exclusionCriteria: 'Assess for unilateral focal weakness, acute sensory deficits, acute dyspnea, or limb edema.',
        status: 'Vascular Triage Check',
      },
      {
        name: 'Severe Organ Failure / Perforation',
        exclusionCriteria: 'Confirm stable cardiopulmonary vitals and absence of acute peritoneal or focal neurological localization.',
        status: 'Standard Triage Rule-Out',
      },
    ],
    pathophysiologySteps: [
      {
        step: '1. Primary Etiological Trigger',
        detail: `Underlying pathophysiology involving the ${bodyLocalization.primaryRegion || 'targeted'} region and ${bodyLocalization.bodySystem || 'affected'} system.`,
      },
      {
        step: '2. Local Tissue Reaction',
        detail: 'Cellular stress and mediator release induce localized vascular permeability and functional parenchymal alterations.',
      },
      {
        step: '3. Clinical Presentation',
        detail: 'End-organ stimulation generates patient-reported symptom constellation and physical examination findings.',
      },
      {
        step: '4. Resolution vs Progression',
        detail: 'Appropriate clinical staging and targeted therapeutic intervention guide tissue recovery and prevent secondary complications.',
      },
    ],
    roundsPearls: [
      {
        title: 'Diagnostic Pre-Test Probability',
        body: 'Always correlate machine learning posterior scores with clinical pre-test probability derived from patient age, risk factors, and physical examination findings.',
      },
      {
        title: 'Watchful Waiting vs Escalation',
        body: 'Establish clear temporal thresholds for symptom improvement before ordering high-cost diagnostic imaging or initiating empiric second-line medications.',
      },
      {
        title: 'Safety Netting Instructions',
        body: 'Provide patients with explicit red-flag criteria (fever, dyspnea, focal pain) that require immediate urgent care evaluation.',
      },
    ],
    pertinentNegatives: [
      { sign: 'Hemodynamically Stable', clinicalValue: 'Normal blood pressure and heart rate exclude acute cardiovascular decompensation' },
      { sign: 'No Acute Altered Mental Status', clinicalValue: 'Intact cognition excludes severe cerebral hypoperfusion or toxic-metabolic encephalopathy' },
      { sign: 'No Severe Respiratory Distress', clinicalValue: 'Normal respiratory rate and effort exclude impending respiratory compromise' },
      { sign: 'No Severe Focal Deficits', clinicalValue: 'Absence of neurological localization lowers suspicion of acute ischemic/hemorrhagic stroke' },
    ],
    vignette: {
      prompt: `A patient presents for clinical evaluation with a primary consideration of ${conditionName || 'the diagnosed pathology'}. All vital signs are within normal limits. Which principle of clinical reasoning is most critical in finalizing the differential diagnosis?`,
      options: [
        { id: 'a', text: 'Accept the top algorithmic match without physical exam correlation or patient history verification' },
        { id: 'b', text: 'Correlate patient history, perform targeted physical exam, and systematically exclude life-threatening red flags before confirming diagnosis', isCorrect: true },
        { id: 'c', text: 'Immediately order comprehensive whole-body CT and MRI imaging' },
        { id: 'd', text: 'Prescribe empiric broad-spectrum antimicrobial and steroid therapy simultaneously' },
      ],
      rationale: `Evidence-based clinical decision support emphasizes integrating clinical history, physical examination, and Bayesian probability while actively ruling out life-threatening differential diagnoses. Algorithmic outputs support but do not replace physician judgment.`,
    },
  };
}
