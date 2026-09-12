# System Architecture

## 1. Architecture Goal

Build a modular clinical symptom-analysis prototype in which the frontend, backend, machine-learning pipeline, retrieval system, and ICD-10 layer can be developed and tested independently.

---

# 2. Overall System

```text
                         PATIENT
                            │
                            ▼
                 ┌────────────────────┐
                 │   React Frontend   │
                 │                    │
                 │ Symptom Input      │
                 │ Analysis UI        │
                 │ 3D Human Body      │
                 │ Results            │
                 └─────────┬──────────┘
                           │
                       REST API
                           │
                           ▼
                 ┌────────────────────┐
                 │      FastAPI       │
                 │                    │
                 │ Request Validation │
                 │ Prediction API     │
                 │ ICD API            │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │  Clinical NLP      │
                 │                    │
                 │ Symptom Extraction │
                 │ Normalization      │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Representation     │
                 │                    │
                 │ Clinical Embedding │
                 │ / NLP Features     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Candidate Retrieval│
                 │                    │
                 │ FAISS / Vector     │
                 │ Similarity Search  │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Condition Ranking  │
                 │                    │
                 │ ML Classifier /    │
                 │ Ranking Model      │
                 └─────────┬──────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
          ┌────────────────┐  ┌──────────────┐
          │ Body Localizer │  │ ICD-10 Layer │
          │                │  │              │
          │ Region         │  │ Code         │
          │ System         │  │ Description  │
          │ Organ          │  │ Mapping      │
          └───────┬────────┘  └──────┬───────┘
                  │                  │
                  └────────┬─────────┘
                           ▼
                  Structured API Result
                           │
                           ▼
                 ┌────────────────────┐
                 │   React Frontend   │
                 │                    │
                 │ 3D Highlight       │
                 │ Symptoms           │
                 │ Conditions         │
                 │ ICD-10             │
                 └────────────────────┘
```

---

# 3. Frontend Architecture

```text
frontend/
│
├── FRONTEND_CONTEXT.md
├── DESIGN_SYSTEM.md
├── API_CONTRACT.md
├── FRONTEND_ROADMAP.md
│
└── src/
    ├── components/
    │
    ├── features/
    │   ├── symptom-input/
    │   ├── analysis/
    │   ├── body-viewer/
    │   └── results/
    │
    ├── services/
    │
    ├── mock/
    │
    └── utils/
```

The frontend must be feature-oriented.

Do not place all application logic into App.jsx/App.js.

---

# 4. Symptom Input

Input:

```text
"I have fever, cough and chest discomfort."
```

Responsibilities:

* accept natural-language symptoms
* basic validation
* submit to backend
* show validation errors
* prevent empty submissions

The frontend does not perform final medical interpretation.

---

# 5. Analysis Pipeline

```text
Natural-language input
        ↓
Preprocessing
        ↓
Symptom extraction
        ↓
Symptom normalization
        ↓
Body-region identification
        ↓
Clinical representation
        ↓
Candidate retrieval
        ↓
Condition ranking
        ↓
ICD-10 mapping
        ↓
Structured response
```

---

# 6. Body Localization

Body localization is a separate output from condition ranking.

The system should represent:

```json
{
  "region": "chest",
  "system": "respiratory",
  "organ": null
}
```

Possible hierarchy:

```text
Body
 ├── Head
 ├── Neck
 ├── Chest
 │   ├── Respiratory
 │   └── Cardiovascular
 ├── Abdomen
 ├── Pelvis
 ├── Left Arm
 ├── Right Arm
 ├── Left Leg
 └── Right Leg
```

The system should not claim organ-level localization unless sufficient evidence exists.

---

# 7. 3D Body Viewer

Technology:

* Three.js
* React Three Fiber

The 3D body viewer should eventually receive structured data such as:

```json
{
  "region": "chest",
  "system": "respiratory",
  "organ": null
}
```

The viewer translates this into visual highlighting.

Example:

```text
API
 ↓
region = chest
 ↓
HumanBody3D
 ↓
highlight chest
```

The 3D viewer should be independent of the ML model.

---

# 8. Condition Ranking

The final implementation depends on the dataset.

Potential architecture:

```text
Patient symptoms
       ↓
Clinical embedding
       ↓
Vector retrieval
       ↓
Top-K similar clinical cases
       ↓
Candidate conditions
       ↓
Ranking model
       ↓
Ranked possible conditions
```

Potential baseline:

```text
TF-IDF
+
Logistic Regression
```

Potential advanced approach:

```text
Clinical/Biomedical Transformer
+
Embeddings
+
FAISS
+
Ranking model
```

Final model choice must be based on dataset characteristics and available hardware.

---

# 9. ICD-10 Layer

ICD-10 should be handled by a dedicated service.

Conceptual flow:

```text
Predicted condition
        ↓
Condition normalization
        ↓
ICD-10 lookup
        ↓
Code
        ↓
Official description
```

The frontend should never contain a large hard-coded ICD-10 database.

---

# 10. API Boundary

Frontend communicates with backend through a stable API.

Initial endpoint:

```text
POST /api/v1/analyze
```

Request:

```json
{
  "symptoms": "fever, cough and chest discomfort"
}
```

Response:

```json
{
  "analysis_id": "string",
  "status": "complete",
  "symptoms": [],
  "body": {
    "region": "chest",
    "system": "respiratory",
    "organ": null
  },
  "conditions": []
}
```

This contract is provisional and can evolve after dataset analysis.

---

# 11. Data Flow

```text
Raw Dataset
     ↓
Data Profiling
     ↓
Cleaning
     ↓
Normalization
     ↓
Train / Validation / Test
     ↓
Feature / Embedding Generation
     ↓
Model Training
     ↓
Evaluation
     ↓
Model Artifact
     ↓
FastAPI Service
     ↓
Frontend
```

Raw data must remain separate from application code.

---

# 12. Separation of Responsibilities

### Frontend

Responsible for:

* UI
* visualization
* user interaction
* loading states
* displaying model results

### Backend

Responsible for:

* API
* validation
* orchestration
* model inference
* ICD service

### ML

Responsible for:

* NLP
* embeddings
* retrieval
* condition ranking
* evaluation

### ICD service

Responsible for:

* ICD-10 lookup
* code normalization
* descriptions

---

# 13. Core Architectural Principle

No module should depend unnecessarily on internal implementation details of another module.

Example:

The frontend should know:

```text
body.region = "chest"
```

It should NOT know:

```text
ClinicalBERT generated embedding #92817
```

Similarly, the ML pipeline should not know how the frontend renders the human body.

This allows each module to evolve independently.
