# Patient Clinical Decision Support System (CDSS)
# Presentation Content — All Slide Details

---

## Slide 1 — Title Slide

**Title:** Patient Clinical Decision Support System (CDSS)

**Subtitle:** An AI-Powered 3D Anatomical Diagnostic Visualization Platform

**Tagline:** *Bridging natural language symptom input with evidence-based clinical guidance through interactive 3D anatomy*

**Presented By:** Kartikay Dubey

**Repository:** github.com/Kartikay-Dubey/patient-clinical-decision-support-system

---

## Slide 2 — Content (Table of Contents)

- Introduction
- Problem Statement
- Objective
- Purpose
- Hardware and Software Requirement
- Project Scope
- Tools and Technology
- Conclusion
- References

---

## Slide 3 — Introduction

### What is a Clinical Decision Support System (CDSS)?

- A **Clinical Decision Support System (CDSS)** is a health information technology tool that assists clinicians and patients in making informed healthcare decisions.
- It analyzes patient-reported symptoms and maps them to probable medical conditions using machine learning and evidence-based medical databases.
- Traditional CDSS tools rely on text-only outputs; this system **enhances clinical comprehension** through interactive **3D anatomical visualization**.

### What Makes This System Unique?

- Accepts **natural language symptom descriptions** (e.g., "I have stomach pain and acid reflux")
- Powered by a **Logistic Regression ML model** trained on the peer-reviewed **DDXPlus benchmark dataset** (1,025,602 patient records, 49 pathologies)
- Visualizes the **primary affected anatomical region** on a real **3D human body model** (BodyParts3D — 2,234 individual anatomical meshes: bones, muscles, and organs)
- Returns **ICD-10 coded differential diagnoses** with confidence scores, home care guidance, red-flag warnings, and pathophysiology explanations

### System Overview — 6-Stage Clinical Journey

| Stage | Action |
| :---: | :--- |
| 1. DESCRIBE | Patient enters symptoms in natural language |
| 2. UNDERSTAND | NLP extracts clinical evidence tokens |
| 3. LOCATE | Anatomical region & organ identified |
| 4. EXPLORE | Differential conditions ranked by ML model |
| 5. STANDARDIZE | ICD-10 codes and confidence scores assigned |
| 6. VISUALIZE | 3D anatomical atlas highlights the affected region |

---

## Slide 4 — Problem Statement

### The Challenge in Healthcare Information Access

1. **Information Gap for Patients**
   Patients often do not understand their symptoms and lack access to clear, structured guidance before reaching a doctor — leading to delayed care and unnecessary anxiety.

2. **Overloaded Healthcare Systems**
   Clinicians face high patient volumes. A preliminary AI-assisted triage tool can help patients self-assess urgency, reducing unnecessary emergency visits.

3. **Existing Tools Are Inadequate**
   - Search engines provide generic, often alarming, unstructured medical information
   - Existing symptom checkers lack clinical depth, ICD-10 coding, and anatomical context
   - No widely available tool combines **NLP-based diagnosis** with **interactive 3D anatomical visualization** in a single integrated system

4. **3D Anatomy is Clinically Powerful but Inaccessible**
   Medical students, patients, and non-specialist clinicians often struggle to correlate symptoms to specific anatomical structures. A visual, interactive body model greatly aids comprehension.

5. **Lack of Standardization**
   Most patient-facing tools do not map findings to **internationally recognized ICD-10 diagnostic codes**, making results difficult to communicate to healthcare professionals.

---

## Slide 5 — Objective

### Primary Objectives

1. **Develop a full-stack CDSS application** that accepts natural language symptom descriptions and returns evidence-based differential diagnoses

2. **Train and deploy a machine learning model** on the DDXPlus benchmark dataset to predict probable conditions across 49 pathologies

3. **Build an interactive 3D anatomical visualization engine** using BodyParts3D geometry (2,234 real anatomical meshes) rendered via Three.js WebGL with GPU-accelerated layer toggling

4. **Implement accurate anatomical localization** by mapping each predicted condition to a precise 3D spatial coordinate, highlighting the affected region automatically

5. **Provide structured clinical guidance** per condition: home remedies, pathophysiology explanations, and red-flag emergency warnings

6. **Deploy the system to cloud infrastructure** (Render + Vercel) with full CI/CD via GitHub, accessible on any device including mobile

### Key Performance Targets & Verified Results

| Metric | Target | Benchmark Test Result (DDXPlus Full Evidence) |
| :--- | :---: | :---: |
| **Top-1 Accuracy** | ≥ 95% | **99.69%** (134,098 / 134,529 cases) |
| **Top-3 Accuracy** | ≥ 98% | **99.99%** |
| **Top-5 Accuracy** | ≥ 99% | **100.00%** |
| **Macro-Precision** | ≥ 95% | **99.72%** |
| **Macro-Recall** | ≥ 95% | **99.59%** |
| **Macro-F1 Score** | ≥ 95% | **99.65%** |
| **Weighted F1 Score** | ≥ 95% | **99.69%** |
| **Pathologies Covered** | 40+ | **49 conditions** |
| **Anatomical Meshes in 3D Model** | 500+ | **2,234 real meshes** |
| **Mobile Touch Support** | Yes | ✅ iOS & Android (Touch/Pinch) |
| **Cloud Deployment** | Yes | ✅ Render (API) + Vercel (UI) |

> **Context on the 99.69% Benchmark Metric:**
> - These metrics reflect official **test-split evaluation** (134,529 cases) on the peer-reviewed **DDXPlus benchmark** (NeurIPS 2022) using complete structured clinical evidence vectors (1,213 features).
> - In live production, when patients provide **partial/unstructured free text**, the model functions as a **probabilistic differential ranking engine** (e.g., GERD 68%, Gastritis 18%, Pancreatitis 5%), rather than a rigid single-label classifier.

---

## Slide 6 — Purpose

### Who Is This System For?

| User Group | How This System Helps |
| :--- | :--- |
| **Patients** | Understand symptoms visually; receive safe home guidance; identify when to seek emergency care |
| **Medical Students** | Study anatomical correlates of common pathologies with an interactive 3D atlas |
| **Junior Clinicians** | Use as a pre-consultation reference for differential diagnosis generation |
| **Healthcare Educators** | Demonstrate pathology-anatomy relationships in an engaging classroom tool |
| **Researchers** | Explore DDXPlus dataset predictions with visual anatomical context |

### Core Purpose Statement

> To bridge the gap between patient symptom experience and clinical anatomical understanding — empowering individuals with structured, evidence-based, visually rich medical information in a safe, non-diagnostic format.

### What This System Is NOT

- ❌ Not a replacement for a licensed physician
- ❌ Not a certified medical diagnostic device
- ❌ Not intended for emergency triage decisions
- ✅ An **educational clinical decision-support demonstration** — always seek professional advice for medical concerns

---

## Slide 7 — Hardware and Software Requirements

### Hardware Requirements

#### Development Machine (Minimum)

| Component | Specification |
| :--- | :--- |
| **CPU** | Intel Core i5 (8th Gen) / AMD Ryzen 5 or better |
| **RAM** | 8 GB minimum, 16 GB recommended |
| **Storage** | 10 GB free (models, dataset, node_modules, .venv) |
| **GPU** | Not required (WebGL runs on any integrated GPU) |
| **Internet** | Required for cloud deployment and package installation |

#### End-User Device (Minimum)

| Component | Specification |
| :--- | :--- |
| **Browser** | Chrome 90+, Firefox 88+, Safari 15+, Edge 90+ (WebGL 2.0) |
| **RAM** | 2 GB free RAM |
| **Device** | Desktop, Laptop, Tablet, or Smartphone |
| **Internet** | Required to stream 3D model binary geometry chunks |

---

### Software Requirements

#### Backend Stack

| Software | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | 3.11 | Backend runtime |
| **FastAPI** | ≥ 0.110.0 | REST API framework |
| **Uvicorn** | ≥ 0.28.0 | ASGI production server |
| **Gunicorn** | ≥ 21.2.0 | Production process manager |
| **Scikit-Learn** | 1.7.2 (pinned) | ML training & inference |
| **NumPy** | ≥ 1.26.0 | Numerical arrays |
| **SciPy** | ≥ 1.12.0 | Sparse feature matrices |
| **Pydantic** | v2 | Schema validation |
| **Joblib** | ≥ 1.3.0 | Model artifact serialization |

#### Frontend Stack

| Software | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | ≥ 18.0 | JavaScript runtime |
| **React** | 18.3.1 | UI component framework |
| **Vite** | 6.1.1 | Dev server & bundler |
| **Three.js** | r173 | WebGL 3D rendering engine |
| **Tailwind CSS** | v3.4.17 | Utility-first CSS framework |
| **Framer Motion** | latest | Smooth UI animations |
| **Lucide React** | latest | Medical & UI icon set |

#### DevOps & Infrastructure

| Tool | Purpose |
| :--- | :--- |
| **Docker + Docker Compose** | Multi-container local development |
| **Nginx** | SPA routing + reverse proxy |
| **Git / GitHub** | Version control and CI/CD trigger |
| **Render** | Backend cloud hosting |
| **Vercel** | Frontend CDN-edge hosting |

---

## Slide 8 — Project Scope

### In Scope

#### Core Functionality
- Natural language symptom input with clinical example presets
- NLP-based symptom extraction (synonym dictionary + TF-IDF similarity)
- ML differential diagnosis across **49 pathological conditions**
- ICD-10 code assignment with probabilistic confidence scoring
- Anatomical region localization (Head / Thorax / Abdomen / Pelvis / Upper Limb / Lower Limb)
- 3D body visualization with GPU-accelerated region highlighting

#### 3D Anatomy Viewer
- BodyParts3D real anatomical geometry — 2,234 meshes
- Anatomical layer toggling: Muscles, Skeleton, Organs
- Dynamic camera positioning per clinical region with smooth animation
- Vertical anatomy exploration scrollbar (head → feet)
- Interactive hover/click raycasting for part identification
- Medical HUD callout card — draggable glassmorphic overlay
- View presets: Front, 3/4, Side, Back, Full Body
- Fullscreen mode support

#### Clinical Guidance Console
- Ranked differential conditions with match percentages
- Evidence-based home care remedies (non-pharmacological)
- Pathophysiology explanations ("Why It Happens")
- Red-flag emergency warning signs

#### Deployment & Accessibility
- Mobile-responsive (touch rotation, pinch-zoom, swipe navigation)
- Live cloud deployment — Render + Vercel
- Docker Compose local development environment
- Automatic GitHub CI/CD deployment pipeline

### Out of Scope

- ❌ Real patient EHR / FHIR data integration
- ❌ HIPAA / GDPR patient data storage compliance
- ❌ Prescription or treatment plan recommendations
- ❌ Radiology or imaging system integration
- ❌ Real-time clinician collaboration
- ❌ Voice input (planned as future enhancement)

---

## Slide 9 — Tools and Technology

### System Architecture

```
User Browser (Mobile / Desktop)
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│            REACT FRONTEND (Vite + Three.js)             │
│                                                         │
│  [ Symptom Input ] → [ Scanning Console ] → [ Results ] │
│                                                         │
│  3D Anatomical Viewer (Three.js WebGL)                  │
│  BodyParts3D — 2,234 Real Meshes                        │
│  GPU DataTexture Custom Vertex Shaders                  │
└──────────────────────────────────┬──────────────────────┘
                                   │ REST API
                                   │ POST /api/v1/analyze
                                   ▼
┌─────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Python 3.11)              │
│                                                         │
│  NLP Matcher → Feature Extractor → ML Classifier        │
│                      ↓                                  │
│  Anatomy Mapper ← Clinical Adapter                      │
└─────────────────────────────────────────────────────────┘
        Deployed on Render.com (GitHub auto-deploy)
```

### Frontend Technology Summary

| Technology | Version | Role |
| :--- | :--- | :--- |
| React | 18.3.1 | Component UI, state management |
| Vite | 6.1.1 | Fast bundler, HMR dev server |
| Three.js | r173 | WebGL 3D renderer, OrbitControls, raycasting |
| Tailwind CSS | v3 | Responsive utility-first styling |
| Framer Motion | latest | UI animations and transitions |
| Custom GLSL Shaders | — | GPU DataTexture part visibility (<1ms) |

### Backend / ML Technology Summary

| Technology | Role |
| :--- | :--- |
| FastAPI (Python 3.11) | Async REST API, OpenAPI documentation |
| Scikit-Learn 1.7.2 | Multi-class Logistic Regression classifier |
| SciPy | Sparse CSR matrix — 1,213-D feature vector |
| Pydantic v2 | Request/response validation |
| DDXPlus Dataset | 1,025,602 training records, 49 pathologies |
| BodyParts3D | 2,234 CC BY 4.0 licensed anatomical meshes |

### Verified ML Model Performance (Official DDXPlus Splits)

The model was trained on **1,025,602 patient cases** using **SGD Multi-Class Logistic Regression** across **1,213 sparse evidence features** and evaluated on completely held-out official splits:

| Evaluation Metric | Validation Split (132,448 cases) | Test Split (134,529 cases) |
| :--- | :---: | :---: |
| **Top-1 Diagnostic Accuracy** | **99.66%** | **99.69%** |
| **Top-3 Diagnostic Accuracy** | **100.00%** | **99.99%** |
| **Top-5 Diagnostic Accuracy** | **100.00%** | **100.00%** |
| **Macro-Precision** | 99.69% | **99.72%** |
| **Macro-Recall** | 99.41% | **99.59%** |
| **Macro-F1 Score** | 99.53% | **99.65%** |
| **Weighted F1 Score** | 99.66% | **99.69%** |

### Why Is Top-1 Benchmark Accuracy So High (~99.69%)?

1. **Clean High-Dimensional Feature Space (1,213 Features):**
   In the DDXPlus benchmark, when all positive symptoms, exact anatomical locations, pain characteristics (burning, sharp, cramp), severity (1–10), duration, and antecedents are provided, each of the 49 pathologies possesses a statistically distinct evidence profile.
2. **Zero Data Leakage:**
   `DIFFERENTIAL_DIAGNOSIS` columns from the raw dataset are **strictly excluded**. Training is conducted exclusively on patient presentation (`AGE`, `SEX`, `INITIAL_EVIDENCE`, `EVIDENCES`).
3. **Benchmark Evaluation vs. Real-World Free-Text Intake:**
   - **Benchmark Test (99.69%):** Evaluates classification when all ~10–15 clinical evidences for a patient case are known.
   - **Live Production App (Probabilistic CDSS):** When patients type casual natural language (2–4 symptoms extracted), the model generates a **differential probability distribution** across candidate conditions, enabling safe clinical exploration rather than overconfident single predictions.

---

## Slide 10 — Conclusion

### What Was Accomplished

The **Patient Clinical Decision Support System** successfully integrates three advanced technologies into one cohesive platform:

1. **Machine Learning (DDXPlus Logistic Regression)**
   99.69% Top-1 accuracy across 49 pathologies — transforming natural language symptoms into ICD-10-coded probabilistic differential diagnoses.

2. **Clinical NLP Pipeline**
   Extracts structured medical evidence from colloquial patient language using a clinical synonym lexicon and TF-IDF cosine similarity.

3. **Interactive 3D Anatomical Visualization (Three.js + BodyParts3D)**
   Renders 2,234 real anatomical meshes with GPU-accelerated region highlighting, smart layer isolation, draggable HUD callouts, and full mobile touch support.

### Key Achievements at a Glance

| Achievement | Result |
| :--- | :---: |
| ML Top-1 Accuracy (Test) | **99.69%** |
| Anatomical Structures Rendered | **2,234 meshes** |
| Pathologies Supported | **49 conditions** |
| Deployed (Cloud) | ✅ Render + Vercel |
| Mobile Support | ✅ iOS & Android |
| ICD-10 Standardization | ✅ All conditions |
| Open Source (MIT) | ✅ GitHub |

### Limitations & Future Roadmap

| Current Limitation | Future Enhancement |
| :--- | :--- |
| Logistic Regression model | ClinicalBERT / transformer upgrade |
| English only | Multi-language NLP support |
| No real EHR data | FHIR/HL7 integration |
| No voice input | Speech-to-text symptom entry |
| Educational use only | Clinical validation & regulatory pathway |

### Final Statement

> This system demonstrates that AI-powered clinical decision support combined with real anatomical 3D visualization can meaningfully improve patient health literacy and serve as a powerful educational tool — fully deployed on commodity cloud infrastructure at zero recurring cost.

---

## Slide 11 — References

### Dataset References

1. **DDXPlus: A Large-Scale Automatic Medical Diagnosis Dataset**
   Fansi Tchango, A., Goel, R., Wen, Z., Martel, J., & Ghosn, J. (2022).
   *NeurIPS 2022 Datasets and Benchmarks Track.*
   https://github.com/mila-iqia/ddxplus

2. **BodyParts3D / Anatomography**
   Database Center for Life Science (DBCLS), Japan.
   License: CC Attribution 4.0 International.
   https://dbcls.rois.ac.jp/en/

### Framework & Library References

3. **React 18** — Meta Open Source. https://react.dev/

4. **Vite 6** — Evan You et al. https://vitejs.dev/

5. **Three.js r173** — Mr.doob et al. https://threejs.org/

6. **FastAPI** — Sebastián Ramírez. https://fastapi.tiangolo.com/

7. **Scikit-Learn 1.7.2** — Pedregosa, F., et al. (2011).
   *Scikit-learn: Machine Learning in Python.* JMLR 12, 2825–2830.
   https://scikit-learn.org/

8. **Tailwind CSS v3** — Adam Wathan. https://tailwindcss.com/

9. **Framer Motion** — Framer Inc. https://www.framer.com/motion/

### Medical Standards

10. **ICD-10-CM Official Guidelines for Coding and Reporting** (2024)
    World Health Organization (WHO) / CDC.
    https://www.cdc.gov/nchs/icd/icd10cm.htm

### Infrastructure

11. **Render** — https://render.com

12. **Vercel** — https://vercel.com

13. **Docker** — https://www.docker.com/

### Project Source Code

14. **Patient Clinical Decision Support System — GitHub**
    Author: Kartikay Dubey. MIT License.
    https://github.com/Kartikay-Dubey/patient-clinical-decision-support-system

---

*This document was prepared for academic presentation purposes. All medical information is for educational reference only and does not constitute medical advice or a certified diagnostic output.*
