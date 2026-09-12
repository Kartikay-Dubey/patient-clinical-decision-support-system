# Project Context

## Project Name
Patient Clinical Decision-Support System (CDSS)

## Purpose
A clinical visualization tool that allows clinicians and patients to enter symptom descriptions, receive probabilistic candidate condition assessments based on model analysis, visualize body region localization in a 3D anatomical viewer, and review conditions ranked by model score with ICD-10 reference classification.

> [!IMPORTANT]
> This system provides **clinical decision support**, not confirmed diagnoses. All outputs are probabilistic assessments intended to support clinical evaluation. The system must never be used as a substitute for professional medical judgment.

---

## Current Project Phase
**Phase 1 — Frontend Foundation & Functional Prototype**

The frontend layer has been initialized and a working prototype is running. The prototype demonstrates the full user journey interface with mock data. No backend, ML model, or real data pipeline is connected at this stage.

---

## Current State Summary

### Frontend (Active)
- React + Vite application running on `http://localhost:3000`
- Full clinical workspace UI with three-column responsive grid layout
- Working prototype components: Header, SymptomInput, AnalysisStatus, BodyViewer (3D), ResultsViewer
- Mock API service layer with 750ms simulated latency
- Three clinical scenario presets (Chest Discomfort, Headache, Abdominal Pain)
- 3D procedural wireframe mannequin with interactive region highlighting (React Three Fiber)
- Ranked possible conditions display with ICD-10 reference badges

### Backend
- Not yet implemented.

### ML / Inference Pipeline
- Not yet implemented.

### Dataset
- Not yet processed.

---

## Known Prototype Limitations
- **3D Body**: Uses a procedural geometric mannequin built from Three.js primitives. No real anatomical mesh asset is present.
- **Clinical Data**: All data is mock data from local fixtures. No real patient data is processed.
- **Condition Scores**: `modelScore` values are static demonstration values, not ML outputs.
- **ICD-10 Codes**: ICD-10 values in the prototype are demonstration data and must not be treated as verified medical coding.
- **No ML Model**: No machine learning inference model is connected.
- **No Real Diagnosis**: No actual patient diagnosis is performed at any stage.

---

## Technology Stack

### Frontend
- React 18 / Vite 6 / Tailwind CSS v3 / Three.js / React Three Fiber / Lucide React
- JavaScript (ES Next)

### Backend (Planned)
- FastAPI (Python)

### ML / Inference (Planned)
- Python-based classifier model

---

## Repository Structure
```
patient-diagnosis-system/
├── Project Docs/
│   ├── PROJECT_CONTEXT.md      # This file
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_PLAN.md
└── frontend/
    ├── FRONTEND_CONTEXT.md
    ├── DESIGN_SYSTEM.md
    ├── API_CONTRACT.md
    ├── FRONTEND_ROADMAP.md
    └── src/
```

---

## Medical UX Compliance
All frontend UI text, labels, and data field names must follow clinical safety terminology standards:
- **Required**: "Possible conditions", "Primary affected region", "Body system", "Model analysis"
- **Prohibited**: "Confirmed diagnosis", "You have...", "Definitive diagnosis"
