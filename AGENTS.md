# AI AGENT & MODEL OPERATING PROTOCOL

This repository is configured with a dedicated fast-track knowledge base and living progress log. All AI assistants, regardless of model, vendor, or account login, MUST adhere strictly to these rules:

---

## 1. MANDATORY FIRST STEP (DO NOT SCAN ALL FOLDERS)
- **DO NOT** run recursive directory listings, wide regex searches, or exploratory scans across all folders (`backend`, `frontend`, `docs`, etc.).
- **INSTEAD**: Read [`brain.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/brain.md). It contains the complete, verified architectural map, file index, model details, 3D coordinate system, and commands for the entire project.
- Next, read [`progress.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/progress.md) to see the latest system state, active tasks, and recent modifications.

---

## 2. MANDATORY CHANGE LOGGING PROTOCOL
Whenever you implement changes, bug fixes, features, or configuration adjustments in the project:
1. **Update [`progress.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/progress.md)** before concluding your turn:
   - Add an entry under **Section 3: Recent Activity & Change Log** with today's date (`[YYYY-MM-DD]`).
   - List what components were modified, why, and which files were touched.
   - Note verification results (e.g. `npm run build`, Python script tests).
2. If file structures, new endpoints, or architectural paradigms are introduced, also update the corresponding section in [`brain.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/brain.md).

---

## 3. CORE ARCHITECTURAL CONSTRAINTS
- **3D Anatomy Atlas (BodyParts3D):**
  - Meshes use custom WebGL DataTexture vertex/fragment shaders in Three.js. Do not alter geometry attributes without checking shader uniform bindings.
  - Sensitive anatomy (reproductive, genital, anal, perineal) MUST remain completely suppressed/transparent via `isSensitiveAnatomy()`.
  - Regional anchors and condition coordinates must stay volumetrically centered ($z \in [-0.02, 0.02]$) so the 3D reticle beacon remains pinned to the body on 360° rotations.
- **Medical Terminology Standards:**
  - Never use "You have [Condition]" or "Confirmed diagnosis".
  - Always use probabilistic language: "Possible conditions", "Match percentage", "Clinical decision support".
- **Local Dev Launchers:**
  - Backend must be launched via `python run_server.py` from repository root (preserves `sys.path`).
  - Frontend runs via `npm run dev` in `frontend/` (Vite proxies `/api` to `127.0.0.1:8000`).
- **Git Push Constraint:**
  - DO NOT execute `git push` unless the user explicitly requests it.
