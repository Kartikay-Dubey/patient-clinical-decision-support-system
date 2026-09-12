# Frontend Context Document

## Purpose
The **Patient Clinical Decision-Support System** frontend provides a modern, interactive, and visually refined clinical visualization interface. It enables clinicians and patients to input clinical symptoms, visualize body localization in a 3D spatial anatomical viewer, review algorithm-extracted symptoms, and evaluate ranked possible conditions with ICD-10 reference data.

## Technology Stack
- **Framework**: React 18 / 19
- **Build Tool**: Vite 6 (Dev server running on `http://localhost:3000`)
- **Styling**: Tailwind CSS v3.4 + PostCSS with Vanilla CSS variables and glassmorphism design tokens
- **3D Graphics**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Iconography**: Lucide React (`lucide-react`)
- **Language**: JavaScript (ES Next) with JSDoc typing conventions

## Frontend Architecture
```
frontend/
├── FRONTEND_CONTEXT.md        # Technical context, current state & prototype limitations
├── DESIGN_SYSTEM.md           # Visual language, typography, and UI specs
├── API_CONTRACT.md            # Data contracts and API schemas
├── FRONTEND_ROADMAP.md        # Iterative phase rollout plan
├── index.html                 # App shell with typography font links
├── vite.config.js             # Vite build & alias configuration
├── tailwind.config.js         # Clinical color palette & theme design tokens
├── postcss.config.js          # PostCSS configuration
├── package.json               # Dependencies and build scripts
└── src/
    ├── main.jsx               # Application entry point
    ├── index.css              # Theme CSS directives & glassmorphic utilities
    ├── App.jsx                # Unified clinical dashboard layout container
    ├── components/            # Reusable UI primitives (Header, StatusBadge)
    │   ├── Header.jsx         # Clinical header & safety disclaimer banner
    │   └── StatusBadge.jsx    # Pulsing operational status badge
    ├── features/              # Feature modules
    │   ├── symptom-input/     # Symptom presentation text, presets & indicator tags
    │   │   └── SymptomInput.jsx
    │   ├── analysis/          # Model processing status & anatomical system summary
    │   │   └── AnalysisStatus.jsx
    │   ├── body-viewer/       # Interactive 3D spatial region highlight canvas
    │   │   └── BodyViewer.jsx
    │   └── results/           # Ranked possible conditions & ICD-10 details
    │       └── ResultsViewer.jsx
    ├── services/              # API abstraction layer with mock adapter
    │   └── apiService.js
    └── mock/                  # Clinical dataset fixtures matching API contract
        └── clinicalData.js
```

## Current Implementation State
The frontend currently features an editorial, state-guided clinical analysis experience built around progressive disclosure:
- **Header & Clinical Safety**: Sleek minimal header with system versioning (`CDSS v0.1.0-prototype`), persistent safety disclaimer, and reset action.
- **Stage 1 — Symptom Input (`appState: 'input'`)**:
  - Centered hero input container with title *"Clinical Decision Support System"*.
  - Auto-expanding textarea with focus ring and 1,000-character counter.
  - "Try an example" scenario quick-load pills.
  - Interactive clinical symptom indicators with quick add/remove.
  - Primary button: *"Analyze Symptoms →"*.
- **Stage 2 — Analysis Sequence (`appState: 'analyzing'`)** *(F2 Completed)*:
  - Controlled ~3.0s presentation sequence moving through 5 non-diagnostic steps:
    1. *Understanding your description*
    2. *Extracting symptom signals*
    3. *Identifying the primary affected region* (triggers 3D spatial node highlight in real time)
    4. *Comparing relevant clinical patterns*
    5. *Preparing possible conditions*
  - Includes `aria-live="polite"` status region for screen reader accessibility.
  - Supports `prefers-reduced-motion` by omitting decorative spin/transform animations while preserving step logic.
  - Automatic transition to Stage 3 (`results`) upon sequence completion.
  - Clean timer cleanup on reset/unmount with zero memory leak.
- **Stage 3 — Clinical Results (`appState: 'results'`)**:
  - **Left Column**: Typography-driven ranked candidate conditions list (`01`, `02`, `03`) with confidence badges, ICD-10 codes, expandable details, and symptom alignment indicators.
  - **Right Column**: Sticky 3D Anatomical Spatial Viewer featuring solid titanium-slate Z-Anatomy GLB model (`human_anatomy.glb`) with distinct organic organ materials (Brain, Heart, Lungs, Stomach, Liver), cyan region highlights, multi-light setup, CC BY-SA 4.0 attribution tag, and OrbitControls.
- **Mock Service Layer**: `apiService.js` simulating network latency (750ms delay) and returning structured responses adhering to `API_CONTRACT.md`.

---

## Known Prototype Limitations

> [!WARNING]
> **Prototype Environment Scope**:
> - **Procedural Mannequin**: The current 3D body visualization utilizes a procedural geometric mannequin/prototype created with Three.js primitive shapes rather than a high-resolution anatomical mesh asset.
> - **Mock Dataset**: Clinical data is currently sourced from local mock data fixtures (`clinicalData.js`).
> - **Mock Model Scores**: Condition likelihood scores are static mock/model-placeholder values.
> - **Demonstration ICD-10 Data**: ICD-10 classification codes are currently demonstration data and must not be treated as verified medical coding.
> - **No Machine Learning Integration**: No real ML inference model backend is connected in this prototype phase.
> - **Non-Diagnostic System**: No real patient diagnosis is performed; output is strictly for clinical decision-support layout demonstration.

---

## Relevant Files
- [App.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/App.jsx)
- [Header.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/Header.jsx)
- [StatusBadge.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/components/StatusBadge.jsx)
- [SymptomInput.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/symptom-input/SymptomInput.jsx)
- [AnalysisStatus.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/analysis/AnalysisStatus.jsx)
- [BodyViewer.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/body-viewer/BodyViewer.jsx)
- [ResultsViewer.jsx](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/features/results/ResultsViewer.jsx)
- [apiService.js](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/services/apiService.js)
- [clinicalData.js](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/src/mock/clinicalData.js)
- [API_CONTRACT.md](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/API_CONTRACT.md)
- [DESIGN_SYSTEM.md](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/DESIGN_SYSTEM.md)
- [FRONTEND_ROADMAP.md](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/FRONTEND_ROADMAP.md)
