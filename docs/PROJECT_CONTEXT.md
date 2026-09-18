# Project Context

## Project Name
Patient Clinical Decision-Support System (CDSS)

## Purpose
An evidence-based Clinical Decision Support System (CDSS) that enables patients and clinicians to describe symptoms in natural language, receive probabilistic differential diagnosis assessments powered by an ML model trained on the DDXPlus benchmark dataset, and visually explore affected anatomy through an interactive 3D anatomical atlas rendered with Three.js (BodyParts3D geometry — 2,234 real anatomical meshes).

> [!IMPORTANT]
> This system provides **clinical decision support**, not confirmed diagnoses. All outputs are probabilistic assessments intended to support clinical evaluation. The system must never be used as a substitute for professional medical judgment.

---

## Current Project Phase
**Phase 4 — Production-Deployed Full-Stack System**

Both the backend (FastAPI + Scikit-Learn ML pipeline) and frontend (React + Three.js) are fully implemented, integrated, and deployed to cloud infrastructure. The system is publicly accessible.

---

## Live Deployment URLs

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Backend API** | Render (Python Web Service) | `https://patient-clinical-decision-support-system.onrender.com` |
| **Frontend** | Vercel (Static + Edge) | Connected via GitHub; `VITE_API_URL` env var points to Render backend |
| **Source Code** | GitHub | `https://github.com/Kartikay-Dubey/patient-clinical-decision-support-system` |

---

## Current State Summary

### Frontend ✅ COMPLETE & DEPLOYED
- React 18 + Vite 6 + Tailwind CSS v3 application
- **6-Stage Clinical Journey Flow**: `input` → `analyzing` → `results`
- **Interactive 3D Anatomical Viewer (BodyParts3D)**: Real scientific dataset, 2,234 mesh parts, GPU shader-based region highlighting, OrbitControls with full touch support
- **Clinical Region Navigation Pills**: Head, Thorax, Abdomen, Pelvis, Upper Limb, Lower Limb — smooth animated camera transitions
- **Anatomical Layer Toggling**: Muscles, Skeleton, Organs — GPU DataTexture visibility with <1ms response
- **Medical HUD Callout**: Draggable glassmorphic info card anchored near the 3D beacon; shows target organ, body system, ICD-10 code, and model score
- **Minimal Medical Reticle (Beacon)**: Pulsing emerald ring + crisp center dot pinned to the 3D anchor coordinate
- **Vertical Anatomy Exploration Scrollbar**: Navigates from Head (cranial) to Lower Extremities via draggable thumb rail
- **Mobile-Responsive**: Touch rotation, pinch-zoom, tap-to-select; drag-gesture detection prevents phantom clicks
- **Tabbed Clinical Guidance Console**: Conditions, Remedies, Why It Happens, Red Flags
- **ScoreGauge**: Animated SVG circular match percentage dial with confidence color tiers

### Backend ✅ COMPLETE & DEPLOYED
- FastAPI (Python 3.11) REST API deployed on Render
- Endpoint: `POST /api/v1/analyze` — accepts natural-language symptom descriptions
- **NLP Matcher** (`nlp_matcher.py`): Clinical synonym lexicon (colloquial → DDXPlus codes) + TF-IDF cosine similarity for symptom extraction
- **Feature Extractor**: Maps parsed symptoms to a 1,213-dimensional sparse binary/categorical feature vector
- **ML Classifier**: Multi-class Logistic Regression trained on DDXPlus, predicting across 49 pathologies
- **Anatomy Mapper** (`anatomy_mapper.py`): Maps predicted condition to `primaryRegion`, `spatialCoordinates` (x, y, z in BodyParts3D space), `bodySystem`, and `targetOrgan`
- **Clinical Adapter** (`clinical_adapter.py`): Generates structured storyline, home remedies, red-flag warnings, and pathophysiology explanations per condition

### ML / Inference Pipeline ✅ COMPLETE
- Trained on official English DDXPlus dataset (1,025,602 training records, 49 pathologies)
- **Top-1 Accuracy: 99.69%** on held-out test set (134,529 cases)
- **Macro-F1: 99.65%** on test set
- Artifacts: `baseline_logistic_regression.joblib`, `feature_extractor.joblib`, `label_encoder.joblib`

---

## Technology Stack

### Frontend
- React 18 / Vite 6 / Tailwind CSS v3 / Three.js r173 / Framer Motion / Lucide React
- JavaScript (ES Next)
- Three.js custom vertex shaders (GPU DataTexture for part visibility/selection)
- OrbitControls, RoomEnvironment, mergeGeometries (Three.js addons)

### Backend
- FastAPI ≥ 0.110 / Uvicorn / Gunicorn (Python 3.11)
- Scikit-Learn 1.7.2 / SciPy / NumPy / Joblib
- Pydantic v2 (request/response validation)

### DevOps / Deployment
- Docker + Docker Compose (multi-container local development)
- Render (Backend Python Web Service — auto-deploy from GitHub `main`)
- Vercel (Frontend SPA — auto-deploy from GitHub `main`)

---

## Medical UX Compliance
All frontend UI text, labels, and data field names follow clinical safety terminology standards:
- **Required**: "Possible conditions", "Primary affected region", "Body system", "Model analysis", "Clinical decision support"
- **Prohibited**: "Confirmed diagnosis", "You have...", "Definitive diagnosis", "Treatment"
