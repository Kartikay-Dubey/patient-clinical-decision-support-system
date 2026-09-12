# Clinical API Contract & Data Schemas

This document defines the stable contract between the Clinical Decision-Support System frontend and backend mock/production API services.

> [!WARNING]
> **Prototype Scope**: The current frontend consumes this contract exclusively via mock data fixtures (`src/mock/clinicalData.js`). No live backend endpoint is connected. All field values are demonstration data. See **Section 4: Known Prototype Limitations** for details.

---

## 1. Symptom Analysis Endpoint

### `POST /api/v1/analyze`

#### Request Payload
The frontend submits the following shape from `SymptomInput.jsx` via `apiService.analyzeSymptoms()`:

```json
{
  "rawSymptoms": "Patient reports acute chest discomfort, shortness of breath on exertion, and mild dizziness.",
  "structuredSymptoms": [
    "chest pain",
    "dyspnea",
    "dizziness"
  ]
}
```

> [!NOTE]
> The `patientContext` field (`ageGroup`, `onsetHours`) is defined in this contract for future use but is **not currently sent** by the frontend prototype. The mock service ignores it.

---

#### Response Payload (200 OK)
The following shape is consumed by `AnalysisStatus.jsx` and `ResultsViewer.jsx`:

```json
{
  "status": "completed",
  "timestamp": "2026-09-08T21:45:00Z",
  "extractedSymptoms": [
    {
      "id": "sym_001",
      "name": "Chest Pain",
      "severity": "moderate",
      "category": "cardiovascular"
    },
    {
      "id": "sym_002",
      "name": "Dyspnea",
      "severity": "mild",
      "category": "respiratory"
    },
    {
      "id": "sym_003",
      "name": "Dizziness",
      "severity": "mild",
      "category": "neurological"
    }
  ],
  "bodyLocalization": {
    "primaryRegion": "Thorax",
    "secondaryRegions": ["Epigastrium"],
    "bodySystem": "Cardiovascular / Respiratory",
    "targetOrgan": "Heart / Lungs",
    "spatialCoordinates": {
      "x": 0.0,
      "y": 1.2,
      "z": 0.3
    }
  },
  "possibleConditions": [
    {
      "id": "cond_001",
      "name": "Angina Pectoris",
      "icd10Code": "I20.9",
      "modelScore": 0.84,
      "confidenceCategory": "High",
      "description": "Chest discomfort or pressure resulting from temporary ischemia to the myocardium.",
      "supportingSymptoms": ["Chest Pain", "Dyspnea"]
    },
    {
      "id": "cond_002",
      "name": "Gastroesophageal Reflux Disease",
      "icd10Code": "K21.9",
      "modelScore": 0.61,
      "confidenceCategory": "Moderate",
      "description": "Mucosal damage produced by abnormal reflux of gastric contents into the esophagus.",
      "supportingSymptoms": ["Chest Pain"]
    },
    {
      "id": "cond_003",
      "name": "Acute Bronchitis",
      "icd10Code": "J20.9",
      "modelScore": 0.42,
      "confidenceCategory": "Low",
      "description": "Transient inflammation of the major bronchial airways causing breathlessness.",
      "supportingSymptoms": ["Dyspnea"]
    }
  ],
  "modelMetaData": {
    "version": "1.0.0",
    "inferenceTimeMs": 240,
    "disclaimer": "This analysis provides probabilistic clinical decision support only and does not constitute a confirmed diagnosis."
  }
}
```

---

## 2. Error Response Schemas

### Invalid Input Error (`400 Bad Request`)
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "At least one valid symptom string or tag must be provided.",
    "details": [
      {
        "field": "rawSymptoms",
        "issue": "Field cannot be empty or contain whitespace only."
      }
    ]
  }
}
```

### Server Error (`500 Internal Server Error`)
```json
{
  "error": {
    "code": "MODEL_INFERENCE_FAILURE",
    "message": "Unable to complete symptom classification. Please retry."
  }
}
```

---

## 3. Data Dictionary

Fields marked **[consumed]** are actively read by current frontend components.

| Field | Type | Consumed By | Description | Medical UX Rule |
| :--- | :--- | :--- | :--- | :--- |
| `status` | String | `App.jsx` | Processing state (`idle`, `analyzing`, `completed`, `error`) | Operational |
| `extractedSymptoms[].id` | String | `AnalysisStatus.jsx` | Unique symptom token ID | Internal key |
| `extractedSymptoms[].name` | String | `AnalysisStatus.jsx` | Display name of extracted symptom | Normalized terms |
| `extractedSymptoms[].severity` | String | `AnalysisStatus.jsx` | `mild` / `moderate` / `severe` | Clinical descriptor |
| `extractedSymptoms[].category` | String | `AnalysisStatus.jsx` | Physiological system category | Classification |
| `bodyLocalization.primaryRegion` | String | `App.jsx`, `AnalysisStatus.jsx`, `BodyViewer.jsx` | Main anatomical zone (`Thorax`, `Head`, `Abdomen`, `Pelvis`, `Upper Limb`, `Lower Limb`) | Must use anatomical terms |
| `bodyLocalization.bodySystem` | String | `AnalysisStatus.jsx` | Affected physiological system | System classification |
| `bodyLocalization.targetOrgan` | String | `AnalysisStatus.jsx` *(not currently rendered)* | Specific organ estimate | Reference only |
| `bodyLocalization.spatialCoordinates` | Object | *(not currently consumed)* | x/y/z scene coordinates for future mesh targeting | Future use |
| `bodyLocalization.secondaryRegions` | Array | *(not currently consumed)* | Secondary affected anatomical zones | Future use |
| `possibleConditions[].id` | String | `ResultsViewer.jsx` | Unique condition ID (React key) | Internal key |
| `possibleConditions[].name` | String | `ResultsViewer.jsx` | Clinical condition name | **Must NOT use "Diagnosis"** |
| `possibleConditions[].icd10Code` | String | `ResultsViewer.jsx` | ICD-10 classification code | Reference only — demonstration data |
| `possibleConditions[].modelScore` | Float | `ResultsViewer.jsx` | 0.00–1.00 score, displayed as % bar | Displayed as percentage + category |
| `possibleConditions[].confidenceCategory` | String | `ResultsViewer.jsx` | `High` / `Moderate` / `Low` | Probabilistic tier label |
| `possibleConditions[].description` | String | `ResultsViewer.jsx` | Condition clinical description | Informational |
| `possibleConditions[].supportingSymptoms` | Array | `ResultsViewer.jsx` | Named symptoms that support this candidate | Supporting indicators |
| `modelMetaData.inferenceTimeMs` | Number | `AnalysisStatus.jsx` | Simulated inference duration in ms | Prototype-simulated value |
| `modelMetaData.version` | String | *(not currently rendered)* | Model version string | Future display |
| `modelMetaData.disclaimer` | String | *(not currently rendered)* | Safety disclaimer text | Future display |

---

## 4. Known Prototype Limitations

> [!WARNING]
> The following limitations apply to the current prototype implementation and must be understood before interpreting any frontend output:
>
> - **Mock dataset only**: All clinical data is served from `src/mock/clinicalData.js`. No backend network request is made.
> - **Mock model scores**: `modelScore` values are static hardcoded demonstration values, not outputs from any inference model.
> - **Demonstration ICD-10 codes**: `icd10Code` values are illustrative and must not be treated as verified medical coding.
> - **No ML model connected**: No machine learning inference pipeline is integrated in this prototype phase.
> - **No real diagnosis**: The system performs no actual patient diagnosis. All output is for layout demonstration and clinical UX prototyping only.
> - **`spatialCoordinates` unused**: The `bodyLocalization.spatialCoordinates` field is defined in this contract and present in mock data, but is not currently consumed by `BodyViewer.jsx`. Region highlighting is driven by the `primaryRegion` string match only.
> - **`patientContext` unused**: The `patientContext` request field is defined for future use but not sent or processed by the mock service.
