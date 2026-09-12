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

### F4 — Clinical Results & ICD-10 Explorer
*(Not yet started)*

---

### F5 — Backend API Integration
*(Not yet started)*
