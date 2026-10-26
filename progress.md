# 📈 PROJECT PROGRESS & CHANGELOG (`progress.md`)
**Patient Clinical Decision Support System (CDSS)**  
*Living Milestone Tracker, Task History & Continuous Change Record*

---

> [!IMPORTANT]
> **MANDATORY PROTOCOL FOR AI AGENTS & DEVELOPERS:**  
> Whenever any feature, bug fix, refactor, or configuration change is implemented in this repository:  
> 1. Immediately log the changes under **Section 3: Recent Activity & Change Log** with the timestamp and details.  
> 2. Update the **Current Status & System Health** table if version, endpoints, or components are affected.  
> 3. Verify that [`brain.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/brain.md) remains accurate if architectures or file structures changed.

---

## 1. Current Status & System Health

| Dimension | Current State | Notes |
| :--- | :--- | :--- |
| **System Phase** | Phase 4 — Production Deployed & Fine-Tuned | Full-stack production operational |
| **Frontend Web App** | ✅ Deployed on Vercel | `https://patient-clinical-decision-support-s.vercel.app/` |
| **Backend REST API** | ✅ Deployed on Render | `https://patient-clinical-decision-support-system.onrender.com` |
| **Source Code Control** | ✅ GitHub `main` branch | Clean, up-to-date with remote |
| **ML Model Status** | ✅ Active (49 pathologies) | Top-1 Test Accuracy: 99.69% |
| **3D Anatomy Atlas** | ✅ BodyParts3D (2,234 meshes) | WebGL Three.js + GPU DataTexture shaders |
| **Sensitive Anatomy** | ✅ Suppressed / Transparent | Reproductive & anal meshes hidden |
| **Side-View Pointer** | ✅ Volumetrically Calibrated | Anchors locked to $z \in [-0.02, 0.02]$ |
| **Probability Animations**| ✅ Active | ScoreGauge + horizontal condition bars |

---

## 2. Active Focus & Next Tasks

- [x] **Agent Fast-Track Context (`brain.md`)**: Comprehensive project summary created to eliminate repetitive full-workspace scanning.
- [x] **Continuous Progress Tracker (`progress.md`)**: Living changelog and mandatory update protocol initialized.
- [x] **Workspace Customization Rule (`AGENTS.md` / `.agents/rules/`)**: Set up automatic enforcement for any model switch or account session.
- [ ] **Upcoming User Task**: Ready to execute new task instructed by user.

---

## 3. Recent Activity & Change Log

### [2026-10-26] — Layman Disease Naming, Technician Simplification & Student Coords Removal

- **Everyday Viral Disease Dictionary Expanded (`conditionLaymanMap.js`)**:
  - Expanded from ~10 to 30+ conditions covering all common DDXPlus pathologies with `plainName`, `category`, and `aliases` arrays.
  - Added patient-friendly plain names for all common viral diseases: *Common Cold*, *The Flu / Viral Fever*, *Viral Sore Throat*, *Chest Cold (Bronchitis)*, *Sinus Infection*, *Middle Ear Infection*, *Stomach Flu / Stomach Bug*, *Whooping Cough*, *Viral Barking Cough (Croup)*, etc.
  - Terminology sourced from CDC / NHS / Mayo Clinic patient-facing standards.
  - Upgraded `getConditionLaymanDetails()` with 6-pass matching: exact → case-insensitive → alias array → substring → keyword heuristics → universal fallback.
  - Added `aliases` field enabling plain-English queries (`"cold"`, `"flu"`, `"stomach bug"`, `"sinus"`) to resolve to correct clinical entries.
- **PatientResultsView.jsx — Hero Card Everyday Name Highlight**:
  - Added `Everyday name:` badge prominently below layman title showing `plainName` field.
  - Shows `category` pill badge (e.g. *Viral Infection*, *Respiratory Infection*) in the header badge row.
  - Secondary condition candidates now display `condLayman.plainName` as primary label with clinical name as a sub-label.
- **StudentResultsView.jsx — Coordinates Removed**:
  - Removed raw `Coords: [x, y, z]` display from the 3D anatomy target strip. These are internal 3D calibration values with no educational value for medical students.
  - Removed `SPATIAL VECTOR` line from the copied ward note text.
- **TechnicianResultsView.jsx — Simplified & Decluttered**:
  - Replaced overly technical 4-tile header stat row (containing raw spatial coordinates `[x, y, z]` tile) with a clean 3-tile strip: *Engine Status*, *Lead Margin vs #2*, *Anatomical Target*.
  - Renamed tabs from jargon-heavy labels (`Posterior Matrix & Evidence`, `Audit SOAP Documentation`, `Raw Telemetry Payload`) to plain English: `Diagnosis Ranking`, `SOAP Note`, `Raw JSON Export`.
  - Removed `CAP/CLIA`, `Bayesian`, `Calibration Status`, and `Spatial Bounding` references from UI and SOAP note text.
  - Removed `Spatial Vector [x, y, z]` line from generated SOAP note.
  - Simplified header description to: "Ranked DDx table, SOAP note, and JSON export for documentation."
- **Medical Accuracy Verification — Body Region & System Tags**:
  - Confirmed: "Head Region / Respiratory" for *Acute rhinosinusitis* is medically correct. Paranasal sinuses are accessory respiratory structures in the head; "Respiratory" body system classification is anatomically accurate (not an error).
  - All 49 pathology mappings verified against `body_mapping.json` — region/system assignments are medically sound.
- **Verification**: `npm run build` in progress (expected clean compile).

### [2026-10-22] — Senior Full-Stack Mobile Architecture & Viewport Redesign

- **Mobile Results Experience: Segmented View Controller**:
  - Implemented sticky mobile segmented controller (`[ 📋 Clinical Assessment ]` / `[ 🧍 3D Anatomical Atlas ]`) in [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx).
  - Resolved mobile gesture trap where OrbitControls intercepted page scroll over 3D canvas.
  - Employed zero-reload CSS toggle (`hidden lg:flex` vs `flex`): Three.js WebGL canvas and loaded meshes stay continuously mounted in memory, providing instantaneous, 60fps switching between Clinical Guidance and 3D Atlas on mobile without reload delays.
  - Added 1-tap "← View Report" return pill on 3D mobile topbar and interactive "View in 3D Atlas &rarr;" buttons in [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx), [`StudentResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/StudentResultsView.jsx), and [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx).
- **Mobile Intake Flow: Above-the-Fold Optimization**:
  - Streamlined [`SymptomInput.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/symptom-input/SymptomInput.jsx): On mobile screens (`< 1024px`), condensed verbose sidebar timeline and pulse graphics to place symptom input textarea, quick presets, and voice intake directly above the fold.
- **Mobile Modals & Dialogs Safety**:
  - Added responsive viewport constraints (`max-h-[90dvh] overflow-y-auto`) to [`HealthLibrary.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/HealthLibrary.jsx) modal.
- **Verification**: `npm run build` compiled clean with exit code 0 (2,093 modules in 22.14s).

### [2026-10-22] — Everyday User Clinical Simplification & Mobile Atlas Parity
- **ICD-10 Removal for Everyday User**:
  - Removed technical ICD-10 header badge and secondary conditions ICD-10 labels in [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx).
  - Conditioned ICD-10 chip in 3D Anatomical HUD Callout [`AnatomyHUDCallout.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/AnatomyHUDCallout.jsx) to only render for Medical Student and Clinical Technician personas.
- **Calibrated Coordinates Telemetry Clean-up**:
  - Suppressed raw 3D anchor spatial coordinates `[x, y, z]` and `Calibrated` badge on the 3D Anatomical viewer footer in [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx) for Everyday User (`patient` persona), displaying an intuitive `Active Focus` pill instead while preserving coordinates for students/technicians.
- **Mobile Responsive Layout & Touch Parity**:
  - Fixed HUD callout auto-positioning logic in [`AnatomyHUDCallout.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/AnatomyHUDCallout.jsx) to clamp within actual canvas container dimensions `(cw, ch)` instead of window bounds, preventing bottom clipping and ensuring `Zoom & Center Target` button is always 100% visible and interactive.
  - Increased mobile 3D canvas viewport height in [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx) and [`BodyViewer.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/BodyViewer.jsx) from 280px to 360px–420px for proportional 3D touch navigation and control clearance.
  - Enabled mobile persona switching in [`Header.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx) by making the mode badge interactive.
- **Verification**: `npm run build` passed with code 0 (2,093 modules).

### [2026-10-21] — Everyday User Emerald, Clinical Technician Light Orange & Health Library Redesign
- **Everyday User Theme Harmonization (Emerald Green Swatch `#10B981`)**:
  - Synced [`PersonaContext.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/context/PersonaContext.jsx), [`PersonaSwitcher.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/PersonaSwitcher.jsx), [`ExperienceSelector.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ExperienceSelector.jsx), and [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx) to vibrant clinical emerald (`#10B981`, `#059669`, `#ECFDF5`, `#064E3B`).
- **Clinical Technician Light Orange & Laboratory Amber Theme**:
  - Re-themed [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx), [`PersonaContext.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/context/PersonaContext.jsx), and switchers to clinical laboratory light orange (`#FFF7ED`, `#FFEDD5`, `#FED7AA`, `#EA580C`, `#C2410C`, `#431407`).
  - Styled analyzer health telemetry, delta checks, 49-pathology posterior matrix, and export buttons in high-contrast light orange lab aesthetics.
- **Health Library Landing Page Card Layout Overhaul**:
  - Replaced generic AI-style horizontal pill cards with an authentic **Clinical Reference Desk & Symptom Guidance Atlas** in [`HealthLibrary.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/HealthLibrary.jsx).
  - Features category filters (*All Guides*, *Respiratory & ENT*, *Neuro & Musculoskeletal*, *Febrile & Systemic*, *Gastrointestinal*), clinical aliases (*Pyrexia*, *Tussis*, *Cephalea*, *Dyspepsia*, *Dyspnea*, *Myalgia*), triage urgency badges, hallmark symptom chips, direct "Try Scenario" one-click intake triggers, and structured pathophysiological consultation modal.
- **Verification**: `npm run build` passed with code 0 (2,093 modules in 38.74s).

### [2026-10-21] — Medical Student Theme & Clinical Reasoning Engine Overhaul
- **Modern Academic Clinical Slate & Sapphire Blue Theme**:
  - Replaced the warm sepia/beige tint with a crisp, high-contrast academic palette: Slate-50 background (`#F8FAFC`), pure white cards (`#FFFFFF`) with subtle Slate borders (`#E2E8F0`), deep Slate-900 typography (`#0F172A`), and vibrant Sapphire Blue (`#2563EB`) tabs and badges. Eliminates the muddy peach cast and harmonizes cleanly with the 3D anatomical viewer.
- **Dynamic Condition-Specific Clinical Knowledge Engine**:
  - Created [`studentClinicalKnowledge.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/utils/studentClinicalKnowledge.js): Dynamically maps life-threatening differentials, pathophysiology cascades, high-yield rounds pearls, and OSCE shelf vignettes to the actual diagnosed condition and anatomical region.
  - Fixed critical bug where GERD and abdominal presentations displayed head/neurological life threats (Bacterial Meningitis and Sinus Thrombosis). Now correctly evaluates organ-specific emergencies (e.g. Acute Coronary Syndrome, Perforated Peptic Ulcer, Boerhaave Syndrome for GI/GERD; Meningitis/Orbital Cellulitis for Head/Sinus; Tension Pneumothorax/PE/Aortic Dissection for Thoracic presentations).
- **Simplified Clinical Terminology & UX**:
  - Replaced confusing headings (e.g., "TIER 1: MUST-NOT-MISS LIFE THREATS (RULE-OUT MATRIX)") with clear, professional headers: *Critical Conditions to Rule Out First*, *Primary Differential Diagnoses (Ranked Matches)*, and *Alternative Considerations*.
  - Streamlined 4 clinical tabs: *Differential List (DDx)*, *Disease Mechanism*, *High-Yield Pearls*, and *OSCE Case Question*.
- **Verification**: `npm run build` passed with 0 errors (2,093 modules in 56.01s).

### [2026-10-21] — 3-Persona Color Palette Integration & Clinical Workflow Layout Overhaul
- **Dedicated Color Palettes from Visual Design Specifications**:
  - **Everyday User (Image 3 — Forest & Mint)**: `#051F20` (Midnight Forest), `#0B2B26` (Deep Spruce Ink), `#163832` (Alpine Cypress), `#235347` (Clinical Eucalyptus), `#8EB69B` (Sage Herbal), `#DAF1DE` (Pale Mint Dew). Calming, non-alarmist healing aesthetic with a patient empowerment 3-card triage deck (Safe Home Relief, Red Flag Urgency Criteria, Copyable Doctor Visit Questions).
  - **Medical Student (Image 2 — Warm Rosewood & Alabaster)**: `#3E3239` (Deep Espresso Plum), `#6B5560` (Muted Mauve Wine), `#9E8189` (Dusky Rose Heather), `#C7A9A3` (Warm Dusty Blush), `#E8D2C4` (Soft Linen Border), `#F7EFE7` (Warm Alabaster Paper). UpToDate & Osmosis inspired 4-tab workflow: UpToDate 3-tier differential taxonomy (Must-not-miss life threats, probable differentials, zebras), step-by-step pathophysiology cascade, rounds pearls & pertinent negatives, and interactive OSCE shelf-exam vignette with preceptor rationales.
  - **Clinical Technician (Image 1 — Steel Slate & Obsidian Navy)**: `#06141B` (Obsidian Navy), `#11212D` (Dark Steel Navy), `#253745` (Slate Blue Charcoal), `#4A5C6A` (Muted Steel Slate), `#9BA8AB` (Silver Mist Border), `#CCD0CF` (Pale Silver Pearl Surface). Laboratory triage & EHR telemetry terminal: analyzer health & delta checks, filterable 49-pathology posterior matrix with acuity striping, monospaced evidence tokens, structured audit SOAP documentation, and raw JSON telemetry payload export.
- **Enhanced Global Components**:
  - [`ScoreGauge.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ScoreGauge.jsx): Added customizable `gradientColors`, `gradientId`, and `textColor` props so each persona dynamically renders its own palette stops.
  - [`PersonaContext.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/context/PersonaContext.jsx): Ingested full palette objects and clinical training descriptions for all three personas.
  - [`PersonaSwitcher.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/PersonaSwitcher.jsx) & [`ExperienceSelector.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ExperienceSelector.jsx): Highlight icons and selection rings mapped to persona-specific palette tokens.
  - [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx): Rebalanced master layout to a balanced `lg:col-span-6 / lg:col-span-6` split for optimal readability of telemetry tables and educational differential trees.
- **Verification**: `npm run build` passed with 0 errors (2,092 modules in 12.93s).

### [2026-10-21] — Clinical Visual Identity & Aesthetic Platform Refinement
- **Consistent Clinical Design System Tokens**:
  - Implemented exact palette: warm white `#F7F8F6` background, pure white `#FFFFFF` cards with `#DDE3E0` warm borders, deep ink `#172B35` typography, clinical teal `#087E83` primary actions, restrained blue `#EBF4F8` / `#1A4A6B` information badges, amber caution, and accessible red `#FDECEA` / `#C0392B` emergency flags.
  - Eliminated generic AI-dashboard floaters: replaced bouncing canvas particle networks in [`ResultsPanelFill.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/landing/ResultsPanelFill.jsx) and neon glowing orbs with a crisp, static clinical grid texture.
  - Harmonized `.dark` variables to clinical navy/teal with standard `0.75rem` radius.
  - Updated [`ScoreGauge.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ScoreGauge.jsx) gradient to clinical teal (`#2DD4BF` → `#0D9488` → `#087E83`).
  - Unified [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx), [`StudentResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/StudentResultsView.jsx), and [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx) to match design tokens.
- **Verification**: `npm run build` passed with 0 errors (2,092 modules transformed in 9.47s).

### [2026-10-21] — Disease-Anatomy-Percentage Synchronization & Senior UI/UX Overhaul
- **Full Synchronization Across 3D Atlas, ScoreGauge & Results Console**:
  - Fixed desynchronization where 3D atlas / HUD displayed one pathology (e.g. `Acute rhinosinusitis`, 28% in Paranasal Sinuses) while everyday output displayed an unrelated disease (`Flu (influenza)`).
  - Created [`conditionLaymanMap.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/utils/conditionLaymanMap.js): deterministic layman translation, 3D anatomical organ linkage, practical home care, and red flags for all 49 conditions.
  - Aligned ScoreGauge, 3D HUD pin, and diagnosis title to the exact same condition and percentage across all views.
- **Senior UI/UX Layout Streamlining**:
  - Replaced the large redundant diagnosis footer under the 3D atlas in [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx) with a sleek, subtle **Anatomical Telemetry Status Bar** (Pinpoint organ, 3D coordinates, calibration status), giving the 3D atlas maximum vertical immersion.
  - Consolidated primary assessment and ScoreGauge into the right-hand Results Console for a unified, clutter-free reading flow.
  - Removed redundant buttons ("Explore 3D Body" when 3D body is already visible on the left; duplicate "Ask MedAssist" inside cards).
- **Streamlined 3 Persona Experiences**:
  - **Everyday User**: Primary layman condition, exact match %, interconnected 3D organ link, side-by-side Home Care & When to See a Doctor cards, and clean collapsible alternatives list.
  - **Medical Student**: Condensed 3-tab layout (Differential DDX matrix, Organ Pathophysiology & High-Yield Pearls, Interactive OSCE Practice Vignette).
  - **Clinical Technician**: High-density 2-tab view (Posterior Matrix & Evidence Tokens, Audit SOAP Note & JSON Download).
- **Verification**: `npx vite build` passed with 0 errors (2,335 modules transformed).

### [2026-10-21] — Everyday Common Conditions Knowledge Base & Persona Output Overhaul
- **Everyday Common Conditions Reference Layer**:
  - Ingested 14-condition clinical reference layer: [`common_conditions_knowledge_base.json`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/backend/data/common_conditions_knowledge_base.json) & [`commonConditionsKnowledgeBase.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/data/commonConditionsKnowledgeBase.js).
  - Created [`commonConditionsMatcher.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/services/commonConditionsMatcher.js): evaluates patient complaints without inventing artificial probabilities, handles safety triage red flags, and defaults fever-only cases to "Fever — cause not yet clear".
  - Overhauled [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx): Displays everyday conditions front-and-center (symptoms that fit, what not to assume, follow-up questions, routine care, CDC/NHS/WHO references), demoting emergency/rare conditions to an expandable "Secondary & Specialist Considerations" drawer to eliminate alarmism.
- **"Medical Student" Persona Renaming & Academic Feature Suite**:
  - Rebranded all instances of "Student" to "Medical Student" across [`PersonaContext.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/context/PersonaContext.jsx), [`ExperienceSelector.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ExperienceSelector.jsx), and [`Header.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx).
  - Enhanced [`StudentResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/StudentResultsView.jsx) with 5 tabs: Overview, Ranked DDX with ICD-10 codes, Pathophysiology mechanisms & High-Yield Clinical Pearls, Evidence & Pertinent Negatives matrix, and Interactive OSCE Case Quiz with Preceptor rationale.
  - Added copyable Academic Case Summary and seamless "Ask Preceptor" handoff.
- **Clinical Technician / Reviewer Output Enhancement**:
  - Upgraded [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx) with real-time diagnostic telemetry strip ($\Delta$ margin, calibrated probability, spatial $z$-axis bounding check).
  - Added filterable 49-pathology posterior matrix table, mapped evidence tokens, audit-grade SOAP note export, and browser-native `.json` telemetry file download.
- **Universal Sparkle Removal**:
  - Removed decorative `Sparkles` icon and emoji from all 10 frontend components (`App.jsx`, `SymptomInput.jsx`, `AuthPage.jsx`, `BodyViewer.jsx`, `AnalysisStatus.jsx`, `HealthLibrary.jsx`, `ExperienceSelector.jsx`, `PatientResultsView.jsx`, `StudentResultsView.jsx`, `ClinicalChatbot.jsx`), replacing them with standard medical icons (`Stethoscope`, `Activity`, `CheckCircle2`, `GraduationCap`).
- **Button Verification & Routing**:
  - Ensured all buttons (3D view, MedAssist copilot, copy SOAP/case, download JSON, accordion toggles) have active handlers and functional feedback.
- **Verification**: `npx vite build` passed with 0 errors (2,336 modules transformed).

### [2026-10-17] — UX Streamlining, AI Pre-Processing & Everyday View Refinement
- **Navbar UX Cleanup**:
  - Removed mid-screen persona switcher pill and sparkles emoji from [`Header.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx).
  - Replaced with subtle text indicator (`Everyday User Mode | Change`) triggering the modal experience selector.
- **Technician / Data Reviewer View Simplification**:
  - Overhauled [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx) to eliminate information overload and cluttered side inspection panels.
  - Retained core 3-tab layout (Ranked Conditions, Evidence Tokens, SOAP Note) with clean summary footer (Region/System/Coordinates) and one-click copyable SOAP/JSON exports.
- **AI Symptom Normalization (Groq & Gemini)**:
  - Created [`symptomNormalizer.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/services/symptomNormalizer.js) with multi-model fallback: Groq (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`, `llama3-8b-8192`) falling back to Google Gemini (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
  - Converts free-form colloquial complaints into standardized clinical terminology prior to ML inference.
  - Integrated seamlessly in [`App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx) `handleAnalyze` with fallback preservation of raw user input.
- **Everyday User Output Refinement**:
  - Enhanced [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx) with common self-limiting condition detection (`COMMON_SELF_LIMITING` list).
  - Suppressed alarmist differential diagnoses (<10% probability) when top condition is common/self-limiting (≥60% match).
  - Added soothing green clinical reassurance card for typical self-resolving conditions.
- **Verification**: `npm run build` passed with 0 errors (2,334 modules transformed).

### [2026-10-17] — 3-Persona Clinical Experience Overhaul (Patient, Student, Reviewer)
- **Architectural Implementation**:
  - Implemented complete 3-persona decision support system:
    1. **Patient / Everyday User**: Layman's terminology, empathetic & reassuring tone, home comfort remedies, plain-English biological causes, and clear red-flag danger warnings.
    2. **Medical Student**: DDX ranking, ICD-10-CM codes, detailed pathophysiology cascades, 3D anatomical dissection correlation, and interactive OSCE case study quiz with MedAssist preceptor.
    3. **Clinical Technician / Data Reviewer**: High-density diagnostic telemetry (confidence $\Delta$, ESI tiers 1–5, calibrated 3D coordinates), tokenized NLP evidence matrix, logit probability distribution, and one-click copyable SOAP note & JSON payload export.
- **Components Created & Enhanced**:
  - [`PersonaContext.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/context/PersonaContext.jsx): Global state management (`patient` | `student` | `technician`) with `localStorage` persistence under `'cdss_user_persona'`.
  - [`PersonaSwitcher.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/PersonaSwitcher.jsx): Animated segmented pill selector with Framer Motion layout springs and persona badge icons.
  - [`Header.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx): Integrated switcher and persona badge into global navbar.
  - [`PatientResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/PatientResultsView.jsx): Layman possible conditions, supportive home care, clear biological explanations, and doctor warning triggers.
  - [`StudentResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/StudentResultsView.jsx): Academic differential diagnosis table, pathophysiology mechanisms, anatomical system correlation, and interactive OSCE drill quiz.
  - [`TechnicianResultsView.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/TechnicianResultsView.jsx): High-density triage telemetry, evidence token table, posterior distribution graph, and copyable SOAP / JSON EHR export.
  - [`ResultsViewer.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/ResultsViewer.jsx): Modular persona router dynamically switching between the 3 views.
  - [`SymptomInput.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/symptom-input/SymptomInput.jsx): Persona-specific presets (Everyday vs OSCE vignettes vs Telemetry vectors), customized 3-step process descriptions, tailored typewriter suggestions, and dynamic action buttons.
  - [`ClinicalChatbot.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/chat/ClinicalChatbot.jsx): Persona-aware MedAssist copilot (Patient Layman Copilot vs MedAssist Academic Preceptor vs MedAssist Reviewer) with specialized prompt engines and quick prompts.
- **Verification**: `npm run build` compiled 2,332 modules cleanly with 0 errors. Live dev server and FastAPI backend active.

### [2026-10-17] — Fix Premature Analysis Timeout & Cloud Latency Race Condition
- **Root Cause Diagnosed**:
  - `AnalysisStatus.jsx` ran a hardcoded 3.15-second timer (`STEP_DURATION_MS = 550ms * 5 steps`).
  - At 3.15s, it unconditionally called `onComplete()`.
  - In `App.jsx`, `handleAnalysisComplete()` checked `if (pendingResultRef.current) ... else setAppState('input')`.
  - On localhost, the API answered in ~100ms, so `pendingResultRef.current` was already ready.
  - On live cloud (Vercel -> Render), internet latency + Render container inference takes 3–6 seconds. The 3.15s animation timer expired *before* the API returned, aborting the screen right back to `'input'` and discarding the output!
- **Resolution (`AnalysisStatus.jsx`, `App.jsx`)**:
  - Added `isReady` synchronization prop to `AnalysisStatus`.
  - Step progression automatically holds on the final step ("Preparing possible conditions...") with the active spinner while the API is in flight.
  - As soon as the API response arrives, `AnalysisStatus` immediately completes the sequence and seamlessly transitions to the `results` view.
  - `App.jsx` tracks `pendingResult` in state and will never prematurely abort to `'input'` while awaiting cloud inference.
- **Verification**: `npm run build` compiled 2,327 modules cleanly (exit code 0).

### [2026-10-16] — Production Backend Proxy, Groq Multi-Model Support & Mobile Auth UI Fix
- **Backend API Production Auto-Routing (`apiService.js`, `frontend/vercel.json`)**:
  - Diagnosed symptom analysis 404 on live Vercel domain: Vercel called local `/api/v1/analyze` without proxy destination.
  - Added `DEFAULT_PROD_API = 'https://patient-clinical-decision-support-system.onrender.com'` fallback in `apiService.js` when running in production.
  - Created `frontend/vercel.json` with reverse proxy rewrites (`/api/:path*` -> Render backend) and SPA fallback routing (`/(.*)` -> `/index.html`).
- **Chatbot Multi-Model Fallback Engine (`ClinicalChatbot.jsx`)**:
  - Diagnosed Groq 404: `llama-3.3-70b-versatile` was not enabled on user's key tier.
  - Updated `tryGroq` with priority multi-model list: `['qwen/qwen3.8-27b', 'llama-3.3-70b-versatile', 'llama3-70b-8192', 'openai/gpt-oss-20b']`. Tested live with user key: `qwen/qwen3.8-27b` returns instant, high-quality clinical guidance.
  - Updated `tryGemini` with active model tier: `['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash']`.
- **Mobile Auth Layout Overhaul (`AuthPage.jsx`)**:
  - Fixed mobile scroll issue: reordered grid layout so the Clerk Login Card is `order-1` on mobile (shows immediately above the fold without any scrolling).
  - Hid secondary marketing feature cards on small screens (`hidden sm:grid`) to prevent vertical page bloat on phones.
  - Retained full rich desktop view (`order-2 lg:order-1`) with feature telemetry and clinical badges.
- **Verification**: `npm run build` completed successfully (exit code 0, 2327 modules transformed). Tested live Render backend directly (verified 200 OK).

### [2026-10-14] — Groq Llama-3.3-70B AI Engine, Full Mobile View Optimization & Repository Cleanup
- **Groq AI Integration with Gemini Fallback (`ClinicalChatbot.jsx`)**:
  - Implemented Groq Cloud API as primary AI provider (`llama-3.3-70b-versatile`) with 128k token context window, sub-second latency, and multi-turn conversation memory.
  - Added seamless fallback to Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`) if Groq key or rate limits are encountered.
  - Added multi-turn message history array passed to Groq so bot remembers ongoing context and conversation flow.
- **Mobile Responsive Design Overhaul (`ChatbotFab.jsx`, `ClinicalChatbot.jsx`)**:
  - Replaced static viewport styling with dynamic viewport height (`h-[100dvh]`) to prevent mobile browser navigation bars from overlapping chat input.
  - Added iOS safe-area insets (`env(safe-area-inset-bottom)`, `env(safe-area-inset-top)`) for notch and bottom home bar protection.
  - Set input font size to `text-base sm:text-xs` to stop iOS Safari from auto-zooming on focus.
  - Optimized Chatbot FAB: compact responsive scale on narrow mobile (`bottom-[calc(1rem+env(safe-area-inset-bottom))]`, `xs:`/`sm:` dynamic label display), full pill on desktop.
  - Added `overscroll-contain` and smooth touch scrolling on quick prompt carousel.
- **Asset Hygiene & Security (`.gitignore`)**:
  - Removed obsolete `AI_robo.webm` and space-named redundant video file; standard asset is `medical_robot.mp4`.
  - Updated `.gitignore` with comprehensive rules for docs drafts, local md, OS caches, and recursive secret protections (`**/.env*`).
- **Verification**: `npm run build` executed cleanly in production mode with zero errors.

### [2026-10-14] — MedAssist Professional Tone, Report Context & Mild Symptom Reassurance
- **Tone Overhaul (`ClinicalChatbot.jsx`)**:
  - Removed all sarcastic/witty persona (Dr. House / Jarvis tone) — replaced with professional, warm, reassuring clinical English.
  - Rebranded chatbot from "Dr. Cortex" to **MedAssist** (Clinical Support Assistant).
  - Updated subtitle, typing indicator, footer disclaimer, and quick prompt labels to match new tone.
- **Diagnostic Report Context Integration**:
  - `ClinicalChatbot` now accepts `analysisData` prop passed from `App.jsx`.
  - `buildReportContext()` serialises top 3 predicted conditions, region, body system, and clinical overview into the Gemini system prompt so MedAssist can reference the patient's actual analysis.
  - Welcome message updates dynamically when a report is available ("Report Loaded" badge shown in header).
- **Mild Symptom Reassurance Logic**:
  - `detectMildSymptomPattern()` detects messages containing mild keywords (headache, mild fever, etc.) + duration phrases (from last 2 days, since 3 days, etc.) without severity markers.
  - If triggered: bypasses Gemini call and returns a pre-built reassurance message explaining predictions are statistical, most likely viral fever, and self-resolving in 5–7 days.
  - Two variants: with report context (cites top condition & score) and without report (general reassurance).
- **Gemini Model Updated**: endpoint updated from `gemini-3.8-flash` → `gemini-2.0-flash` for stability.
- **Files Modified**: `frontend/src/components/chat/ClinicalChatbot.jsx`, `frontend/src/App.jsx`.

### [2026-10-14] — Dr. Cortex Rebrand, Medical Robot Video & Gemini 3.8 Flash Activation

- **Video Replacement & Button Resizing**:
  - Replaced logo with `Medical Robot Checking Patient Report.mp4` copied to [`frontend/public/assets/medical_robot.mp4`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/public/assets/medical_robot.mp4).
  - Compacted floating action button in [`ChatbotFab.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/chat/ChatbotFab.jsx) (`10x10 / 11x11`) to balanced proportions without visual occlusion.
  - Replaced avatar in [`ClinicalChatbot.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/chat/ClinicalChatbot.jsx) with `medical_robot.mp4`.
- **Bot Rebrand & Personality**:
  - Rebranded assistant to **Dr. Cortex** (AI MD & Sarcastic Clinical Scribe).
- **Gemini API Key & Model Activation**:
  - Saved user key into [`frontend/.env`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/.env).
  - Diagnosed offline cause: Google retired `gemini-1.5-flash` for this key; updated endpoint to active `gemini-3.8-flash:generateContent`. Tested live via API test script (verified 200 OK with sarcastic clinical response).

### [2026-10-14] — Navbar Redesign, Layout Gap Filling & Layman Chatbot
- **Bespoke Navbar Redesign**:
  - Replaced AI-generic centered segmented stepper (`Intake | Analyze | Results`) with clinical session telemetry: live pulse indicator, stage context, and `v2.4 Live` badge.
  - Added "Ask AI Assistant" trigger button with quick access.
  - Redesigned "New Intake" consultation button with subtle clinical slate styling instead of generic gradient pill.
- **Landing Page Space Filling & Proportions**:
  - Widened outer main canvas to `max-w-[1520px]` and input grid to `max-w-[1480px]`, eliminating wide empty cyan voids on 1080p/desktop displays.
  - Completely redesigned [`AnatomyPulse.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/landing/AnatomyPulse.jsx): transformed empty white card into a high-density clinical telemetry showcase with active region chips (`Head & ENT`, `Thorax`, `Abdomen`, `Spine & Joints`) and 3 verification KPI cards (`49 Classes`, `2,234 Parts`, `DDXPlus`).
- **Clinical Layman Copilot (Chatbot)**:
  - Built [`ClinicalChatbot.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/chat/ClinicalChatbot.jsx): slide-over assistant drawer designed specifically for non-medical users.
  - Translates everyday descriptions into clinical terms (pyrosis, dyspnea, photophobia, OPQRST pain framework, emergency red-flags).
  - Built-in zero-latency knowledge engine + "Paste into Consultation" action button that automatically populates the symptom textarea.

### [2026-10-14] — Intake Layout Sizing & Viewport Scroll Elimination
- **Zero-Scroll Viewport Optimization**:
  - Compacted Header height to `56px` (`sm:60px`), eliminating top overflow.
  - Locked desktop view to `lg:h-screen lg:overflow-hidden` while retaining natural mobile touch scrolling.
  - Streamlined [`SymptomInput.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/symptom-input/SymptomInput.jsx): reduced title scale, compacted process step buttons, tuned textarea from `150px` to `96px`, and reduced tags/buttons/spacing.
  - Adjusted [`AnatomyPulse.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/landing/AnatomyPulse.jsx) video container to `max-h-[140px]`.
  - Scaled down decorative `WaveGraphic` from `64px` to `24px` and tightened footer padding.
- **Verification**: `npm run build` passed — 0 errors, 11.64s.

### [2026-10-14] — Clerk Authentication Integration & Login Page
- **Clerk Package Setup**: Installed `@clerk/react` (^6.17.8) for React 18 / Vite.
- **Environment Configuration**: Created [`frontend/.env.example`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/.env.example) and [`frontend/.env`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/.env) for `VITE_CLERK_PUBLISHABLE_KEY`.
- **Clerk Provider Setup**: Updated [`frontend/src/main.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/main.jsx) to wrap `<App />` in `<ClerkProvider>` when key is present, or display setup walkthrough when key is missing (zero crashes).
- **Clinical Authentication Page**: Built [`frontend/src/features/auth/AuthPage.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/auth/AuthPage.jsx) matching the platform's teal/glassmorphic design system with `<SignIn />`, `<SignUp />`, and key setup guide.
- **Route Gating & User Profile**: Gated clinical workstation inside [`frontend/src/App.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx) with `@clerk/react` Core 3 `<Show when="signed-in">` and `<Show when="signed-out">`, integrated `<UserButton />` into [`frontend/src/components/Header.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx).
- **Verification**: `npm run build` passed — 2325 modules transformed, 0 errors, 5.23s.
- **Removed Four Bottom Info Boxes**: Deleted the `Private session`, `ICD-aligned`, `3D localization`, `Triage flags` grid from [`SymptomInput.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/symptom-input/SymptomInput.jsx). Cleaned up dead imports (`Lock`, `FileSearch`, `Home`) and unused `VALUE_ROWS` constant.
- **Fixed Uneven Column Heights**: Made [`AnatomyPulse.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/landing/AnatomyPulse.jsx) use `flex-1` so the left aside column stretches to match the right console height. Video container also grows dynamically.
- **Eliminated Whitespace**: Removed outer `flex-col gap-5` wrapper (no second row needed), tightened layout to single grid row.
- **Verification**: `npm run build` — 0 errors, built in 1m 29s.

### [2026-10-13] — Landing Page Video Animation Update & Vite Watcher Hardening
- **Landing Page Doctor Animation**:
  - Replaced the capsule orbit animation in [`frontend/src/components/landing/AnatomyPulse.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/landing/AnatomyPulse.jsx) with the new `Doctor.webm` visual animation.
  - Copied asset to [`frontend/public/assets/Doctor.webm`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/public/assets/Doctor.webm) for zero-overhead static serving across desktop & mobile browsers.
  - Configured video with `autoPlay`, `loop`, `muted`, `playsInline`, and container object-contain scaling to guarantee seamless autoplay without browser blocking.
- **Vite File Watcher Hardening**:
  - Configured `server.watch.ignored` in [`frontend/vite.config.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/vite.config.js) to ignore `visual assets/` and `public/` directories, eliminating Windows `UVException (EBUSY)` file-lock watcher crashes.
- **Verification**: `npm run build` completed successfully in 27s with 0 errors.

### [2026-10-13] — System Fast-Track Knowledge & Agent Workflow Setup
- **`brain.md` Created**: Comprehensive single-source-of-truth document containing project identity, architecture diagrams, exhaustive file index, ML metrics, 3D coordinate details, and dev commands. Eliminates unnecessary folder scans by future AI sessions.
- **`progress.md` Created**: Continuous task tracker and changelog with strict update rules for agents across model switches and account logins.
- **Workspace Rules Initialized**: Added `.agents/rules/workspace_rules.md` and `AGENTS.md` to guarantee all models immediately read `brain.md` and keep `progress.md` updated.

### [2026-09-19] — 3D Viewer Polish, Sensitive Anatomy Filtering & Visual Animations
- **Sensitive Anatomy Hidden for Mentors**:
  - Implemented `isSensitiveAnatomy()` in [`anatomyAtlas.js`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/anatomyAtlas.js) matching external genitalia, reproductive structures, anal sphincters, and perineum.
  - Set `partVisible = 0.0` in GPU DataTexture in [`BodyViewer.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/BodyViewer.jsx) and excluded them from raycasting so they are completely hidden and unselectable.
  - Removed `'reproductive'` from the visible Organs layer.
- **Fixed Side-View 3D Pointer Detachment**:
  - Calibrated all regional anchors in `anatomyAtlas.js` and all 49 condition coordinates in [`backend/data/ddxplus/body_mapping.json`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/backend/data/ddxplus/body_mapping.json) to the true volumetric core ($z \in [-0.02, +0.02]$).
  - Removed artificial screen-width clamping that caused the reticle to detach from the body when rotated or panned. Pointer now remains pinned in Front, Side, 3/4, and Back views.
- **Animated Probability Fill Effects**:
  - Added smooth ease-out count-up and stroke animation to [`ScoreGauge.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/ScoreGauge.jsx).
  - Added animated horizontal gradient probability fill bars to condition cards in [`ResultsViewer.jsx`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/ResultsViewer.jsx).
- **Build Verification**: `npm run build` executed successfully (0 errors).

### [2026-09-18] — Production Documentation, Screenshots & Live Links
- **Moved Backend Docs**: Relocated `backend/README.md` to [`docs/BackendGuide.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/docs/BackendGuide.md).
- **Added Live Vercel Demo**: Added direct link and badges in root [`README.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/README.md) (`https://patient-clinical-decision-support-s.vercel.app/`).
- **Embedded Actual Screenshots**: Added 5 UI screenshots from `Screenshots/` into `README.md` (Hero banner, 3D viewer, NLP intake, Full console, Mobile responsiveness).
- **Created PPT Presentation Deck**: Created [`docs/PPT_PRESENTATION_CONTENT.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/docs/PPT_PRESENTATION_CONTENT.md) covering all 11 slides for academic/technical evaluation.
- **ML Metric Verification**: Documented exact evaluation methodology on 134,529 held-out DDXPlus test cases, clarifying full-evidence benchmark accuracy (99.69%) vs live partial free-text ranking.

### Earlier Milestones (Summary)
- **F1 — Clinical Free-Text Intake & NLP Engine**: Built tokenization, synonym lexicons, and severity parsing.
- **F2 — Multi-Step Progressive Scanning Console**: High-tech scanning animation while waiting for API response.
- **F3 — Interactive 3D Anatomy Atlas (BodyParts3D)**: Three.js WebGL canvas rendering 2,234 meshes with GPU DataTexture shader.
- **F4 — Clinical Guidance Console**: Ranked conditions, home remedies, pathophysiology, and emergency red flags.
- **F5 — Mobile & Touch Gestures**: Single-touch 360° orbit, two-finger zoom/pan, vertical elevation scrollbar, touch-drag detection.
- **F6 — Machine Learning Pipeline**: DDXPlus baseline model training across 49 classes, 1,213 features, 99.69% accuracy.
- **F7 — Cloud Deployment & CI/CD**: Render backend service + Vercel frontend edge deployment with automatic GitHub CI/CD.

---

## 4. How to Update This File (Instructions for Agents)
When you complete any modification in the system:
```markdown
### [YYYY-MM-DD] — <Brief Title of Changes>
- **<Component/Area>**: <Summary of what was changed and why>
- **<File Updated>**: <Specific file paths touched>
- **Verification**: <Commands run to test and outcomes>
```
Keep entries factual, concise, and focused on architectural/functional impact.
