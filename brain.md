# 🧠 SYSTEM BRAIN (`brain.md`)
**Patient Clinical Decision Support System (CDSS)**  
*Universal System Knowledge Base, Architectural Blueprint & Agent Fast-Track Context*

---

> [!IMPORTANT]
> **ATTENTION AGENTS & MODELS:**  
> **DO NOT spend time recursively listing or inspecting repository folders.**  
> Everything you need to understand about this project—its architecture, file tree, ML pipelines, 3D coordinate system, running instructions, and rules—is documented in this file.  
> Read this file along with [`progress.md`](file:///e:/Programs/Self_Projects/patient-diagnosis-system/progress.md) before performing any task.

---

## 1. Project Identity & Purpose
- **Name:** Patient Clinical Decision Support System (CDSS)
- **Repository:** `https://github.com/Kartikay-Dubey/patient-clinical-decision-support-system`
- **Live Frontend:** `https://patient-clinical-decision-support-s.vercel.app/`
- **Live Backend:** `https://patient-clinical-decision-support-system.onrender.com`
- **Core Purpose:** An evidence-based clinical decision support tool allowing users to enter natural-language symptom descriptions, receive differential diagnosis predictions across 49 pathologies (trained on the DDXPlus benchmark), and visually explore the affected anatomical structures on a real 3D anatomical human model (BodyParts3D: 2,234 meshes).
- **Clinical Safety Disclaimer:** The system provides *decision support and educational guidance*, NOT confirmed diagnoses. Language must always use probabilistic terms: *"Possible conditions"*, *"Primary affected region"*, *"Clinical findings"*. Never use *"You have..."* or *"Definitive diagnosis"*.

---

## 2. Exhaustive Repository Map & File Responsibilities

### Root Directory
| File / Directory | Purpose |
| :--- | :--- |
| `brain.md` | Single source of truth context file for AI agents & models |
| `progress.md` | Living changelog & task progress tracker |
| `AGENTS.md` | Workspace instructions for AI models/agents |
| `run_server.py` | One-click FastAPI backend launcher (injects repo root into `sys.path`) |
| `README.md` | Public GitHub README with UI screenshots, badges, and quickstart |
| `docker-compose.yml`| Multi-container orchestration (Backend + Nginx Frontend) |
| `backend/` | Python FastAPI + ML inference service |
| `frontend/` | React 18 + Vite 6 + Three.js 3D web application |
| `docs/` | In-depth engineering, clinical, deployment, and PPT documentation |
| `Screenshots/` | UI screenshots showcasing 3D Viewer, NLP Scanner, Mobile View |

---

### Backend (`backend/`)
| File Path | Role & Key Logic |
| :--- | :--- |
| `backend/run.py` | Local standalone backend runner |
| `backend/requirements.txt` | Python dependencies (FastAPI, Scikit-learn 1.7.2, SciPy, NumPy, Uvicorn, Gunicorn) |
| `backend/app/main.py` | FastAPI application factory, CORS middleware, lifespan events, health endpoint |
| `backend/app/api/v1/analyze.py` | Route definition for `POST /api/v1/analyze` |
| `backend/app/schemas/clinical.py` | Pydantic request/response schemas (`AnalyzeRequest`, `AnalyzeResponse`, `BodyLocalization`, `Storyline`, `PossibleCondition`) |
| `backend/app/services/clinical_adapter.py` | Primary clinical orchestrator. Bridges NLP extraction, ML model predictions, anatomical localization priority overrides (e.g. joints vs viscera), and clinical storylines |
| `backend/models/pipeline/nlp_matcher.py` | Clinical synonym dictionary (colloquial words → DDXPlus codes) + TF-IDF cosine similarity matcher |
| `backend/models/pipeline/feature_extractor.py` | Transforms parsed evidence into 1,213-D sparse feature matrix (`scipy.sparse.csr_matrix`) |
| `backend/models/pipeline/predictor.py` | `DDXPlusBaselinePredictor`: loads model weights and computes calibrated probabilities |
| `backend/models/pipeline/anatomy_mapper.py` | `ConditionAnatomyMapper`: links condition names to 3D BodyParts3D coordinates |
| `backend/models/pipeline/train_baseline.py` | Supervised SGD Logistic Regression training script on 1.025M DDXPlus records |
| `backend/models/baseline_logistic_regression.joblib` | Trained model weights (SGDClassifier, log_loss, 49 classes) |
| `backend/models/feature_extractor.joblib` | Serialized 1,213-feature extractor |
| `backend/models/label_encoder.joblib` | 49-class label encoder |
| `backend/models/evaluation_results.json` | Official validation (132k) & test (134k) split metrics |
| `backend/data/ddxplus/body_mapping.json` | 49-condition spatial coordinate database (`x`, `y`, `z` calibrated for 3D body viewer) |

---

### Frontend (`frontend/src/`)
| File Path | Role & Key Logic |
| :--- | :--- |
| `frontend/src/App.jsx` | Main clinical journey controller (`input` ➔ `analyzing` ➔ `results` state machine). Renders ScoreGauge, top summary card, and master console layout |
| `frontend/src/index.css` | Editorial design system tokens, typography, glassmorphism utilities, warm palette |
| `frontend/src/services/apiService.js` | API client calling `POST /api/v1/analyze` with graceful client-side fallback |
| `frontend/src/components/ScoreGauge.jsx` | Animated circular SVG match dial with ease-out count-up animation (`0%` ➔ target %) |
| `frontend/src/features/results/ResultsViewer.jsx` | Tabbed clinical console: Conditions (with animated probability bars), Remedies, Why It Happens, Red Flags |
| `frontend/src/features/body-viewer/BodyViewer.jsx` | Three.js WebGL canvas, OrbitControls, GPU DataTexture custom vertex shader (<1ms layer toggles), raycasting, vertical slider rail, mobile touch handling, sensitive anatomy filtering |
| `frontend/src/features/body-viewer/anatomyAtlas.js` | 15 body systems, 3 layers (`Muscles`, `Skeleton`, `Organs`), 6 regions (`Head`, `Thorax`, `Abdomen`, `Pelvis`, `Upper Limb`, `Lower Limb`), `REGION_ANCHORS` (core $z \approx 0.00$), and `isSensitiveAnatomy()` filter |
| `frontend/src/features/body-viewer/AnatomyHUDCallout.jsx` | Draggable glassmorphic HUD card + minimal pulsing reticle beacon pinned to 3D anchor |
| `frontend/src/features/body-viewer/modelLoader.js` | Streaming binary chunk decompression (`DecompressionStream`) for 2,234 meshes |
| `frontend/public/models/atlas.json` | Manifest of all 2,234 BodyParts3D parts, bounds, systems, and chunks |

---

### Documentation (`docs/`)
| File Path | Content |
| :--- | :--- |
| `docs/BackendGuide.md` | Comprehensive FastAPI guide, Swagger specs, troubleshooting, and commands |
| `docs/ARCHITECTURE.md` | System architecture, data flow, component boundaries, and contracts |
| `docs/PROJECT_CONTEXT.md` | Project goals, clinical journey stages, and current production status |
| `docs/SYSTEM_FEATURES.md` | Complete deep dive into 3D graphics, camera math, NLP pipeline, and shaders |
| `docs/DEPLOYMENT_GUIDE.md` | Render, Vercel, Docker, and Nginx production deployment instructions |
| `docs/PPT_PRESENTATION_CONTENT.md` | 11-slide complete presentation deck content for academic/technical reviews |

---

## 3. Core System Workflows

### 3.1 Clinical Analysis & NLP Pipeline
1. User enters natural language symptoms (e.g., *"Stomach pain, acid reflux, mild headache"*).
2. Frontend calls `apiService.analyzeSymptoms()` ➔ `POST /api/v1/analyze`.
3. `nlp_matcher.py` matches tokens using a synonym dictionary + TF-IDF similarity across 223 DDXPlus evidence codes.
4. `feature_extractor.py` builds a 1,213-dimensional sparse vector.
5. `predictor.py` runs multi-class Logistic Regression yielding probabilities across 49 conditions.
6. `clinical_adapter.py` determines primary region & spatial coordinates (`bodyLocalization`), builds home remedies, pathophysiology, and emergency red-flag warnings (`storyline`).

### 3.2 3D Anatomical Atlas (Three.js WebGL)
1. **Geometry Loading:** `modelLoader.js` loads binary chunks for 2,234 real BodyParts3D meshes.
2. **GPU DataTexture Shader:** Instead of mutating 2,234 meshes in JavaScript loops, a 1D `DataTexture` feeds visibility and selection uniforms into custom vertex/fragment shaders. Toggling layers or regions occurs at GPU speed (<1ms).
3. **Sensitive Anatomy Filtering:** `isSensitiveAnatomy()` in `anatomyAtlas.js` permanently suppresses external genital, reproductive, anal, and perineal meshes (`partVisible = 0.0`) so the 3D model remains clean, clinical, and dignified for mentor presentations.
4. **Volumetric Z-Calibration:** Regional anchors (`REGION_ANCHORS`) and condition spatial coordinates are calibrated to the core volumetric center ($z \approx -0.02$ to $+0.02$). This prevents the reticle beacon from drifting outside the body when rotating to side or back views.
5. **Interactive Controls:**
   - Single-touch / mouse drag: 360° orbital rotation.
   - Two-finger / pinch-zoom: Dolly-zoom.
   - Vertical Anatomy Slider: Smooth elevation scroll from cranial level ($y = 1.58$) down to lower extremities ($y = 0.42$).
   - Draggable HUD Card: Glassmorphic callout card can be dragged anywhere on the canvas by user.

---

## 4. Machine Learning Verified Performance
- **Dataset:** DDXPlus (NeurIPS 2022 Benchmark, Mila / Université de Montréal)
- **Training Records:** 1,025,602
- **Validation Split:** 132,448 cases
- **Test Split:** 134,529 cases
- **Features:** 1,213 sparse multi-hot evidence features
- **Pathologies:** 49 conditions
- **Top-1 Test Accuracy:** **99.69%** (134,098 / 134,529 correct)
- **Top-3 Test Accuracy:** **99.99%**
- **Top-5 Test Accuracy:** **100.00%**
- **Macro-F1 Score:** **99.65%**
- *Note:* In live inference with partial free-text input (2–4 symptoms), the model acts as a calibrated probabilistic differential ranking engine.

---

## 5. Local Development & Commands

### Running Locally
1. **Start Backend (FastAPI on Port 8000):**
   ```powershell
   python run_server.py
   ```
   *Always run from repository root to maintain `sys.path`.*  
   API Documentation: `http://127.0.0.1:8000/docs`

2. **Start Frontend (Vite on Port 3000):**
   ```powershell
   cd frontend
   npm run dev
   ```
   *Vite proxies `/api/*` to `http://127.0.0.1:8000`.*  
   UI available at `http://localhost:3000`.

3. **Production Build Verification:**
   ```powershell
   cd frontend
   npm run build
   ```

---

## 6. Critical Engineering Guidelines & Constraints
1. **Never Re-Scan the Whole Workspace:** Consult this `brain.md` directly. All file paths and architectures are indexed here.
2. **Never Break 3D Shaders:** Meshes use `partIndex` and `partState` / `selectionState` DataTextures. Do not change buffer geometry attributes without verifying shader uniform bindings.
3. **Preserve Medical Terminology Standards:** UI text must never state definitive diagnoses. Always use "Possible conditions", "Match percentage", "Clinical findings".
4. **Keep Sensitive Anatomy Hidden:** Maintain the `isSensitiveAnatomy()` filter in `anatomyAtlas.js` and `BodyViewer.jsx`.
5. **Git Push Rule:** Never push to GitHub without explicit user permission.
6. **Progress Tracking Rule:** Always update `progress.md` after making changes to the codebase.
