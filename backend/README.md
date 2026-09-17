# Patient Diagnosis System - Backend Guide & Architecture

This directory contains the production-grade FastAPI backend for the **Patient Clinical Decision Support System (CDSS)**. It converts free-form patient symptom narratives into structured DDXPlus evidence tokens, performs ML diagnostic inference across 49 clinical pathologies, enriches findings with ICD-10 classification, generates patient storylines (precautions, red flags, home remedies), and calculates 3D anatomical coordinates with orientation vectors for the interactive Three.js body viewer.

> **Medical Disclaimer:** This system is an educational clinical decision-support prototype. Its outputs are probabilistic and do NOT constitute a medical diagnosis or a substitute for professional clinical care.

---

## 1. Quickstart: Starting the Backend (Foolproof)

### ⚠️ Common Error: `Clinical analysis error (HTTP 500)`
If you see the red notification `Clinical analysis error (HTTP 500)` on the frontend:
- **Root Cause:** The backend server on port 8000 is **not running**. The Vite dev server (`http://localhost:3000`) proxies all `/api/*` requests to `http://127.0.0.1:8000`. When port 8000 is offline or refused (`ECONNREFUSED`), Vite responds with an `HTTP 500 Proxy Error`.
- **Why running `python -m uvicorn backend.app.main:app` from inside `backend/` fails:**
  When your terminal is inside the `backend/` directory, Python does not include the project root in its module search path (`sys.path`), causing `ModuleNotFoundError: No module named 'backend'`.

---

### Method A: Start via the Dedicated Runner (Recommended)

Run either of these commands from **any** terminal directory. They automatically inject the project root into `sys.path` and start Uvicorn with hot-reload enabled:

**From the project root (`patient-diagnosis-system/`):**
```powershell
python run_server.py
```

**Or from inside the `backend/` folder:**
```powershell
python run.py
```

---

### Method B: Start via Standard Uvicorn Command

If running Uvicorn directly, you **must** execute it from the repository root:

```powershell
# 1. Navigate to the repository root
cd E:\Programs\Self_Projects\patient-diagnosis-system

# 2. Activate virtual environment (if using .venv)
.\.venv\Scripts\Activate.ps1

# 3. Start Uvicorn
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Expected startup output:
```text
[FastAPI Startup] Initializing ClinicalDiagnosisService & ML Diagnostic Models...
[FastAPI Startup] Clinical model ready. Loaded 49 pathologies.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

## 2. Verification & Health Checks

Once the server is running, verify the endpoints in a second PowerShell window or browser:

- **Swagger Interactive API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint:**
  ```powershell
  Invoke-RestMethod http://127.0.0.1:8000/health
  ```
  Returns:
  ```json
  {
    "status": "healthy",
    "service": "Clinical Decision Support System",
    "version": "1.0.0",
    "classes_loaded": 49,
    "features_loaded": 1213
  }
  ```

---

## 3. Directory Layout & File Responsibilities

```text
backend/
├── app/
│   ├── main.py                         # FastAPI app initialization, lifespan, CORS, error handlers
│   ├── api/
│   │   └── v1/
│   │       └── analyze.py              # POST /api/v1/analyze route definition & OpenAPI schema
│   ├── schemas/
│   │   └── clinical.py                 # Pydantic schemas (AnalyzeRequest, AnalyzeResponse, BodyLocalization, Storyline)
│   └── services/
│       └── clinical_adapter.py         # Primary orchestrator: NLP bridge, ML pipeline, priority overrides, storylines
├── data/
│   └── ddxplus/
│       ├── body_mapping.json           # Condition-to-anatomy spatial database (coordinates, systems, organs)
│       └── raw/
│           ├── release_evidences.json  # 223 DDXPlus evidence definitions (symptoms, antecedents)
│           ├── release_conditions.json # 49 pathology metadata entries (ICD-10 codes, clinical severity)
│           └── release_*_patients/     # DDXPlus benchmark patient cohorts
├── models/
│   ├── baseline_logistic_regression.joblib  # Trained multi-class diagnostic classifier
│   ├── feature_extractor.joblib             # 1213-dimensional DDXPlus feature transformer
│   ├── label_encoder.joblib                 # Condition label encoder (indices <-> condition names)
│   └── pipeline/
│       ├── clinical_service.py         # Unified NLP + Model inference wrapper
│       ├── nlp_matcher.py              # Clinical NLP tokenizer, alias matcher, TF-IDF evidence extractor
│       ├── feature_extractor.py        # Feature vector assembly logic
│       ├── baseline_predictor.py       # Inference, probability ranking, and top-K candidate extraction
│       └── anatomy_mapper.py           # ConditionAnatomyMapper: queries body_mapping.json
├── run.py                              # Zero-configuration launcher when working inside backend/
├── test_call.py                        # Live HTTP smoke test script
├── test_queries.py                     # Multi-scenario test runner (headache, spine, shoulder, knee)
└── requirements.txt                    # Python dependency manifest
```

---

## 4. End-to-End Processing Architecture

When the frontend sends a clinical symptom prompt to `POST /api/v1/analyze`, the backend processes it through a strict 7-stage pipeline:

```text
                    PATIENT SYMPTOMS (Free-text + Tags + Demographics)
                                          │
                                          ▼
                      STAGE 1: Request Validation (FastAPI / Pydantic)
                      Validates non-empty input, maps top-level or nested
                      demographics (age, sex) via AnalyzeRequest schema.
                                          │
                                          ▼
                      STAGE 2: NLP Evidence Extraction (nlp_matcher.py)
                      - Normalizes text & strips punctuation.
                      - Runs deterministic clinical synonym/alias lexicon.
                      - Evaluates anatomical qualifiers & negation detection.
                      - Computes TF-IDF cosine similarity against DDXPlus evidence bank.
                      - Outputs: matched evidence codes & confidence scores.
                                          │
                                          ▼
                      STAGE 3: 1213-D Feature Vector Assembly (feature_extractor.py)
                      - Encodes patient age (normalized) and sex (binary).
                      - Encodes initial presentation evidence.
                      - Expands categorical & binary evidence features into a 1213-D vector.
                                          │
                                          ▼
                      STAGE 4: ML Classifier Inference (baseline_predictor.py)
                      - Runs LogisticRegression.predict_proba across 49 pathologies.
                      - Decodes class indices to pathology names via LabelEncoder.
                      - Ranks top-K candidates (probabilities, ICD-10, severity).
                                          │
                                          ▼
                      STAGE 5: Anatomical Localization & Priority Overrides
                      (clinical_adapter.py + anatomy_mapper.py)
                      - Condition Anatomy: Queries body_mapping.json for disease anchor.
                      - Patient Priority Overrides: If patient reported explicit localized
                        symptoms (e.g. "back spinal cord pain", "headache", "shoulder"),
                        the exact symptom site OVERRIDES condition defaults so the 3D
                        viewer camera frames what the patient is actively complaining of.
                      - Calculates (x, y, z) spatial coordinates, region, and target organ.
                                          │
                                          ▼
                      STAGE 6: Clinical Narrative & Storyline Generation
                      - Empathetic pathobiology explanation ("Why It Happens").
                      - High-urgency clinical red flag alerts.
                      - Safe non-pharmacological home remedies with iconography.
                      - Care timeline escalation recommendations.
                                          │
                                          ▼
                      STAGE 7: Final Structured JSON Response (AnalyzeResponse)
                      Returned to frontend via Vite proxy with HTTP 200.
```

---

## 5. Detailed Component Breakdown

### 5.1 `app/main.py`
- **Application Lifespan:** Pre-warms `ClinicalDiagnosisService` at startup, caching the TF-IDF vectorizer, label encoder, and ML model in memory so incoming user requests encounter **zero cold-start latency**.
- **CORS Middleware:** Permissive configuration allowing cross-origin requests from frontend dev servers.
- **Exception Handlers:** Formats validation and internal errors into standard JSON schemas matching `API_CONTRACT.md`.

### 5.2 `app/services/clinical_adapter.py`
The orchestration nerve-center:
- **`process_clinical_analysis(request)`**: Validates input, executes inference, handles no-match scenarios (HTTP 422), formats candidates, and builds storylines.
- **`_resolve_anatomical_localization(...)`**: Implements smart clinical priority rules:
  - **Spinal Cord / Spine Symptoms** (`back`, `spine`, `spinal`, `cord`, `vertebra`, `lumbar`): Maps to `Thoracic Spine & Spinal Cord` (`z = -0.12`) or `Lumbar Spine & Spinal Cord` (`z = -0.10`). Signals the frontend to **auto-rotate camera to the posterior view** and isolate the skeleton layer.
  - **Cranial Symptoms** (`headache`, `migraine`, `vertigo`): Maps to `Cranial Region & Cephalic Structures` (`Head`, `z = 0.10`).
  - **Visceral / GI Symptoms** (`esophagus`, `heartburn`, `acid reflux`): Maps to `Esophagus & Gastroesophageal Junction` (`Thorax`, `z = 0.05`).
  - **Upper Extremity Joint Symptoms** (`shoulder`, `deltoid`, `rotator cuff`): Maps to left (`x = 0.19`) or right (`x = -0.19`) shoulder joint.
- **`generate_storyline_for_condition(...)`**: Curates tailored clinical care plans, red flags, and home remedies.

### 5.3 `models/pipeline/nlp_matcher.py`
- Converts unstructured patient language (e.g. `"I have crushing chest pressure and can't breathe"`) into standardized DDXPlus evidence codes (`pain_chest`, `dyspnea`, `sweating`).
- Uses high-recall clinical n-gram tokenization and TF-IDF feature scoring against the 223 DDXPlus evidence corpus.

### 5.4 `models/pipeline/baseline_predictor.py`
- Loads serialized `baseline_logistic_regression.joblib` and `label_encoder.joblib`.
- Transforms patient feature dictionaries into NumPy sparse arrays matching the 1213 feature training distribution.
- Returns calibrated probability distributions across all 49 medical conditions.

### 5.5 `models/pipeline/anatomy_mapper.py`
- Reads `backend/data/ddxplus/body_mapping.json`.
- Links each of the 49 conditions to primary and secondary anatomical regions (`Head`, `Thorax`, `Abdomen`, `Pelvis`, `Upper Limb`, `Lower Limb`), body systems, target organs, and 3D spatial anchor points.

---

## 6. Frontend Integration Architecture

The frontend and backend communicate seamlessly via the Vite development proxy:

1. **Frontend Request:**
   In `frontend/src/services/apiService.js`, the app sends:
   ```javascript
   const response = await fetch('/api/v1/analyze', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       rawSymptoms: "back spinal cord pain",
       structuredSymptoms: [],
       patientDemographics: { age: 35, sex: "M" }
     })
   });
   ```

2. **Vite Proxy Relay:**
   In `frontend/vite.config.js`:
   ```javascript
   server: {
     port: 3000,
     proxy: {
       '/api': {
         target: 'http://127.0.0.1:8000',
         changeOrigin: true
       }
     }
   }
   ```
   Requests to `http://localhost:3000/api/v1/analyze` are transparently forwarded to `http://127.0.0.1:8000/api/v1/analyze`.

3. **Backend Schema Compatibility:**
   `AnalyzeRequest` in `backend/app/schemas/clinical.py` supports both top-level `age`/`sex` and nested `patientDemographics: { age, sex }`, automatically assigning defaults if omitted.

4. **Frontend 3D Model Response Handling:**
   When the backend returns `bodyLocalization`, the frontend `BodyViewer.jsx`:
   - Inspects `spatialCoordinates` (`x`, `y`, `z`).
   - If `z < -0.04` (posterior/back), triggers an **orbital camera sweep to the back** (`view: back`).
   - Automatically toggles layer visibility (`Skeleton: on`, `Muscles: off`, `Organs: off`).
   - Pins the animated SVG pointer arrow and glowing reticle to the exact 3D coordinates.

---

## 7. Testing & Quality Assurance

Run the automated test suites from the project root:

```powershell
# 1. Run FastAPI endpoint unit and regression tests
python -m pytest backend\tests\test_api_analyze.py -q

# 2. Run NLP evidence matcher validation
python -m pytest backend\models\pipeline\test_nlp_bridge.py -q

# 3. Run multi-scenario HTTP integration smoke tests (server must be running)
python backend\test_queries.py
```
