# Development Plan

## Frontend Phase Milestones

---

### F1 — Symptom Input Experience ✅ COMPLETE
**Completed**: 2026-09-08

Upgraded `frontend/src/features/symptom-input/SymptomInput.jsx` from a dashboard-style form to a premium clinical symptom-entry experience.

**Changes made**:
- Added heading *"Tell us what you're experiencing"* with plain-language supporting microcopy.
- Replaced flat textarea with auto-expanding textarea that responds to content length, includes a comfortable focus ring, and shows a character count (1,000-character limit with soft amber and hard red states).
- Repositioned sample presets as visually de-emphasised *"Try an example"* pill buttons — all three existing scenarios preserved.
- Upgraded indicator tags to feel like extracted clinical signals: rounded pill style, empty-state placeholder text (*"Indicators will appear here…"*), accessible `aria-label` on remove buttons.
- Renamed primary action to **"Analyze Symptoms →"**; loading state reads **"Analyzing symptoms…"**.
- Added a non-diagnostic micro-copy note below the CTA (*"…possible conditions for clinical consideration — not a confirmed diagnosis"*).
- Applied `transition-all duration-150/200` micro-animations only on meaningful interaction (focus, hover, press). No continuous decorative animation.
- Responsive: textarea grows vertically, tags wrap naturally, no horizontal overflow.

**Preserved unchanged**:
- All existing state management (`rawText`, `tags`, `newTagInput`).
- Preset loading logic (`handleSelectPreset`).
- Tag add/remove logic (`handleAddTag`, `handleRemoveTag`).
- Empty-input submission guard.
- Submit handler forwarding `rawSymptoms` + `structuredSymptoms` to `onAnalyze`.
- Mock API behavior (unchanged).
- All other components (Header, AnalysisStatus, BodyViewer, ResultsViewer, App.jsx).

---

### F1.5 — Major Visual & UX Redesign ✅ COMPLETE
**Completed**: 2026-09-09

Redesigned the frontend experience from a dense, cyan-heavy "AI SaaS dashboard" into a restrained, human-made, editorial clinical analysis workspace.

**Key Accomplishments**:
- **Progressive Disclosure Flow**: Replaced 3-column simultaneous layout with state-driven view steps (`input` → `analyzing` → `results`).
- **Restrained Visual Aesthetics**: Removed heavy glassmorphism, bright borders, and cyan glow overlays; introduced a quiet slate color scheme (`#050811`) with subtle borders.
- **Editorial Typography**: Styled ranked candidate conditions with clear numerical indexes (`01`, `02`) in JetBrains Mono and clean Inter typography.
- **Hero 3D Anatomical Viewer**: Integrated 3D spatial region viewer cleanly into the results phase as a sticky hero element without surrounding border boxes.
- **Preserved Core Functionality**: Maintained all F1 symptom input mechanics, tag manipulation, mock API service response handling, 3D region node interaction, and ICD-10 model metadata.

---

### F2 — Analysis Experience ✅ COMPLETE
**Completed**: 2026-09-09

Implemented a polished, controlled analysis sequence (~3.0s total) connecting Symptom Input to Clinical Results.

**Key Accomplishments**:
- **5 Conceptual Presentation Steps**:
  1. *Understanding your description*
  2. *Extracting symptom signals*
  3. *Identifying the primary affected region*
  4. *Comparing relevant clinical patterns*
  5. *Preparing possible conditions*
- **3D Spatial Viewer Integration**: Procedural mannequin stays in neutral state during early steps; node highlights automatically when Step 3 completes.
- **Accessibility & Motion**: Screen reader `aria-live="polite"` updates; `prefers-reduced-motion` detection.
- **Robust Cleanup**: Clean interval/timer cancellation on reset/unmount, supporting safe repeated analyses.
- **Terminology Enforcement**: Replaced diagnostic terms with non-diagnostic wording (*"Comparing relevant clinical patterns"*).

---

### F3 — 3D Body Spatial Viewer Upgrade & Polish ✅ COMPLETE
**Completed**: 2026-09-09

Integrated web-ready Z-Anatomy GLB model asset into `frontend/public/models/human_anatomy.glb` and polished `BodyViewer.jsx` with solid anatomical materials and multi-light rendering.

**Key Accomplishments**:
- **Z-Anatomy Derived Asset**: Generated a 79.6 KB web binary GLB containing 14 anatomical mesh nodes (9,356 triangles).
- **Solid Anatomical Materials**: Replaced dark wireframe rendering with solid, translucent titanium-slate body shell (`#273549`, opacity 0.45).
- **Distinct Organ Palette**: Applied recognizable organic color tokens to internal organs: Brain (indigo/cyan `#818cf8`), Heart (rose crimson `#f43f5e`), Lungs (sky cyan `#0ea5e9`), Stomach (amber gold `#f59e0b`), and Liver (terracotta `#d97706`).
- **Sub-Mesh Region Mapping**: Mapped GLB nodes (`Head`, `Brain`, `Thorax`, `Heart`, `Lungs_L`, `Lungs_R`, `Abdomen`, `Stomach`, `Liver`, `Pelvis`, `UpperLimb_L`, `UpperLimb_R`, `LowerLimb_L`, `LowerLimb_R`) to the 6 primary anatomical UI regions (`Head`, `Thorax`, `Abdomen`, `Pelvis`, `Upper Limb`, `Lower Limb`).
- **Enhanced Scene Lighting**: Configured ambient light (0.9), directional key light (1.2), cool rim light (0.6), and ground point light (0.4).
- **Preserved Public API Contract**: Maintained `BodyViewer({ activeRegion, onSelectRegion })` without breaking changes.
- **CC BY-SA 4.0 Compliance**: Created [`ATTRIBUTION.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/frontend/public/models/ATTRIBUTION.md) and integrated subtle UI attribution tag.

---

### F4 — Clinical Results & ICD-10 Explorer ✅ COMPLETE
**Completed**: 2026-09-12

Implemented the full tabbed clinical guidance console on the right panel.

**Key Accomplishments**:
- **Conditions Tab**: Ranked candidate pathologies with ICD-10 codes, DDXPlus urgency ratings (Level 1–5), expandable detail panels, and exact-match symptom highlights.
- **Remedies Tab**: Evidence-based, non-pharmacological home care instructions per condition.
- **Why It Happens Tab**: Clear empathetic pathophysiology explanations.
- **Red Flags Tab**: Urgent clinical warning symptoms with escalation triggers.
- **ScoreGauge**: Animated SVG circular match percentage dial with confidence color tiers (teal / amber / rose).

---

### F5 — Backend API Integration ✅ COMPLETE
**Completed**: 2026-09-13

Replaced all mock data with live FastAPI backend inference.

**Key Accomplishments**:
- **API Service** (`apiService.js`): Calls `POST /api/v1/analyze` with graceful fallback to local mock data on backend timeout/unavailability.
- **Vite Proxy Configuration**: `/api` → `http://127.0.0.1:8000` for local development.
- **FastAPI Backend** (`backend/app/`): Full routing, request validation (Pydantic v2), and response serialization.
- **NLP Matcher** (`nlp_matcher.py`): Clinical synonym dictionary + TF-IDF cosine similarity symptom extractor.
- **DDXPlus Feature Extractor**: 1,213-dimensional sparse feature vector from raw patient presentation.
- **Logistic Regression Classifier**: Trained on 1,025,602 DDXPlus records; 99.69% Top-1 accuracy on test split.
- **Anatomy Mapper** (`anatomy_mapper.py`): Condition → 3D spatial coordinates + region + organ.
- **Clinical Adapter** (`clinical_adapter.py`): Condition → structured guidance (remedies, red flags, why it happens).

---

### F6 — 3D Anatomy Atlas Upgrade (BodyParts3D) ✅ COMPLETE
**Completed**: 2026-09-12

Replaced the procedural geometric mannequin with the full scientific BodyParts3D dataset.

**Key Accomplishments**:
- **2,234 Real Anatomical Meshes**: Bones, muscles, visceral organs, arteries, veins, nerves — all from BodyParts3D open scientific data.
- **GPU DataTexture Rendering**: Part visibility and region selection driven by Float32Array data textures + custom GLSL vertex shaders. Zero per-mesh material updates; <1ms toggle latency.
- **Binary Chunk Streaming**: Geometry packed into indexed `.bin`/`.gz` chunks with concurrent streaming; `atlas.json` manifest of 2,234 structures.
- **Region Classifier** (`anatomyAtlas.js`): Classifies parts into 6 anatomical regions by name keyword + Y-height brackets.
- **Smart Layer Isolation**: Auto-configures Muscles/Skeleton/Organs visibility based on the clinical target organ.
- **15 Anatomical System Colors**: Skeletal, Muscular, Cardiac, Respiratory, Digestive, Urinary, Nervous, Endocrine, Sensory, Arterial, Venous, Lymphatic, Reproductive, Connective, Integumentary.

---

### F7 — HUD Callout, Beacon & Pointer System ✅ COMPLETE
**Completed**: 2026-09-16

Redesigned the HUD overlay, region pointer, and medical beacon.

**Key Accomplishments**:
- **Draggable Glassmorphic Info Card** (`AnatomyHUDCallout.jsx`): Anchors near the 3D beacon; auto-positions right/left/above depending on screen edge; drag-to-reposition with touch support.
- **Minimal Medical Reticle**: Pulsing emerald outer ring + crisp 5px center dot — professional and non-noisy.
- **3D → 2D World Projection**: Every frame projects the 3D `spatialCoordinates` anchor onto viewport pixels using `Vector3.project(camera)` and NDC conversion.
- **Beacon Transparency on Hover**: Opacity drops to 20% when orbiting over body parts, preventing HUD from obscuring the anatomy.
- **Accurate Region Anchors** (`REGION_ANCHORS`): Z-depths calibrated to sit inside the body volume from all camera angles.

---

### F8 — Mobile Support & Vertical Explorer ✅ COMPLETE
**Completed**: 2026-09-17

Added full mobile touch support and vertical anatomy navigation.

**Key Accomplishments**:
- **Touch Gesture Handling**: `touchAction: none` on renderer canvas; OrbitControls configured for mobile rotate/pinch-zoom; `isDragGesture` threshold prevents phantom tap-clicks after rotating.
- **Mobile-Responsive HUD**: Card resizes for small viewports; repositions above/below beacon based on available space.
- **Vertical Anatomy Scrollbar**: Draggable thumb rail (Up/Down buttons) synced to `controls.target.y`; range Y=0.42 (Lower Limb) to Y=1.58 (Head).
- **Region Button Fix**: `triggerCameraTransition` now routes region-pill clicks through `REGION_CAMERA_CONFIGS` presets only when the click is not for the clinical primary region.

---

### F9 — Production Deployment ✅ COMPLETE
**Completed**: 2026-09-17

Deployed backend to Render and frontend to Vercel.

**Key Accomplishments**:
- **Backend (Render)**: Python 3.11 Web Service, auto-deploy from GitHub `main`. Dynamic `$PORT` binding in `run_server.py`. Deterministic in-memory feature extractor to fix `WindowsPath` joblib deserialization on Linux.
- **Frontend (Vercel)**: Vite static build, `VITE_API_URL` environment variable. `API_BASE_URL` sanitization strips trailing slashes.
- **Scikit-Learn pinned to 1.7.2** for cross-platform joblib pickle compatibility.
- **Live URL**: `https://patient-clinical-decision-support-system.onrender.com`
