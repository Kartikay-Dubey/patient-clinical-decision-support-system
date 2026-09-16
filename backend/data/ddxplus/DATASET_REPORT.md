# DDXPlus Dataset (English Release) - Setup & Inspection Report

## 1. Dataset Origin & Source Links
- **Official GitHub Repository:** [https://github.com/mila-iqia/ddxplus](https://github.com/mila-iqia/ddxplus)
- **Official Figshare Dataset Release:** [Figshare Article #22687585](https://figshare.com/articles/dataset/DDXPlus_Dataset_English_/22687585)
- **Dataset Title:** `DDXPlus_Dataset_English_` (Official English Release by Mila - Quebec AI Institute)

### Direct Figshare Download URLs Used:
| File | Size (Bytes) | Figshare Direct Download Link |
| :--- | :--- | :--- |
| `release_conditions.json` | 20,889 B (~20.4 KB) | `https://ndownloader.figshare.com/files/62561569` |
| `release_evidences.json` | 120,263 B (~117.4 KB) | `https://ndownloader.figshare.com/files/40278013` |
| `release_train_patients.zip` | 140,923,730 B (~134.4 MB) | `https://ndownloader.figshare.com/files/40278019` |
| `release_validate_patients.zip` | 18,706,053 B (~17.8 MB) | `https://ndownloader.figshare.com/files/40278022` |
| `release_test_patients.zip` | 18,986,243 B (~18.1 MB) | `https://ndownloader.figshare.com/files/40278016` |

---

## 2. Directory Layout & Preserved Files
Raw DDXPlus files are stored in `backend/data/ddxplus/raw/` with their original formats and names preserved intact.

```
backend/data/ddxplus/
├── raw/
│   ├── release_conditions.json          # 49 pathologies with severity, ICD-10, symptoms, antecedents
│   ├── release_evidences.json           # 223 clinical evidences (symptoms, questions, categorical values)
│   ├── release_train_patients.zip       # Original raw zip from Figshare
│   ├── release_train_patients           # Extracted CSV records (1,025,602 rows, 639.5 MB)
│   ├── release_validate_patients.zip    # Original raw zip from Figshare
│   ├── release_validate_patients        # Extracted CSV records (132,448 rows, 83.3 MB)
│   ├── release_test_patients.zip        # Original raw zip from Figshare
│   └── release_test_patients            # Extracted CSV records (134,529 rows, 84.5 MB)
├── __init__.py                          # Exposes DDXPlusDataLoader
├── loader.py                            # Clean, zero-dependency streaming data loader
├── download_dataset.py                  # Reproducible download & extraction script
├── inspect_dataset.py                   # Statistical audit script
└── DATASET_REPORT.md                    # This report
```

---

## 3. Dataset Structure & Schema

### A. Conditions (`release_conditions.json`)
- **Total Pathologies / Diseases:** `49`
- **Fields per Condition:**
  - `condition_name` (str): Primary English disease name.
  - `cond-name-eng` (str): English disease name.
  - `cond-name-fr` (str): French disease name.
  - `icd10-id` (str): International ICD-10 clinical diagnosis code.
  - `severity` (int): Clinical severity rating (Scale 1 to 5).
  - `symptoms` (dict): Associated symptom evidence keys with probability distributions.
  - `antecedents` (dict): Associated antecedent/risk factor evidence keys.
- **Severity Distribution:**
  - Level 1 (Minor / Self-limiting): 5 conditions
  - Level 2 (Moderate): 12 conditions
  - Level 3 (Urgent / Serious): 17 conditions
  - Level 4 (Severe / Emergency): 12 conditions
  - Level 5 (Critical / Life-threatening): 3 conditions
- **Averages:**
  - Average symptoms per condition: `12.35` (min: 1, max: 27)
  - Average antecedents per condition: `5.78` (min: 1, max: 12)

### B. Evidences (`release_evidences.json`)
- **Total Clinical Evidences:** `223`
- **Fields per Evidence:**
  - `name` / `code_question` (str): Identifier code (e.g., `E_53`, `E_91`).
  - `question_en` (str): Clinical question phrased in English.
  - `question_fr` (str): Clinical question phrased in French.
  - `data_type` (str): Variable data type (`B` = Binary, `C` = Categorical/Numeric, `M` = Multi-choice).
  - `is_antecedent` (bool): `True` for medical history / risk factors / habits, `False` for active symptoms and signs.
  - `default_value` (any): Default clinical baseline value.
  - `possible-values` (list): Value codes or scale levels.
  - `value_meaning` (dict): English & French human-readable descriptions of value codes.
- **Breakdown by Data Type:**
  - `B` (Binary, Yes/No): `208`
  - `C` (Categorical / Scale): `10`
  - `M` (Multi-choice): `5`
- **Breakdown by Clinical Category:**
  - Antecedents (Risk factors / Medical history): `113` (50.67%)
  - Symptoms & Signs: `110` (49.33%)

### C. Patient Cohorts (`release_train_patients`, `release_validate_patients`, `release_test_patients`)
- **Total Patient Cases Across Dataset:** `1,292,579`
  - **Train:** `1,025,602` (79.35%)
  - **Validation:** `132,448` (10.25%)
  - **Test:** `134,529` (10.41%)
- **CSV Columns:**
  1. `AGE`: Patient age in years (`0` to `109`, mean `39.75`).
  2. `SEX`: Biological sex (`M` ~48.5%, `F` ~51.5%).
  3. `PATHOLOGY`: Ground truth diagnosis (all 49 pathologies represented across all 3 splits).
  4. `INITIAL_EVIDENCE`: Chief complaint / entry symptom code initiating the consultation (100% present).
  5. `EVIDENCES`: Complete list of positive symptoms and antecedents presented by the patient (average ~`20` evidences per patient).
  6. `DIFFERENTIAL_DIAGNOSIS`: Expert differential diagnosis ranking with probabilities (average `9.18` differential candidates per patient).
- **Missing / Null Values:** **0** (100% complete across all 1,292,579 records).

---

## 4. Backend Loader Utility (`DDXPlusDataLoader`)
A Python loader class is implemented at [backend/data/ddxplus/loader.py](file:///e:/Programs/Self_Projects/patient-diagnosis-system/backend/data/ddxplus/loader.py).

### Key Features:
- **Zero External Dependencies:** Uses standard library `csv`, `json`, `ast`, and `pathlib`.
- **Memory-Efficient Streaming:** `stream_patients(split="train", limit=...)` yields structured patient dictionaries via a Python generator, enabling batch processing without overloading RAM.
- **Evidence Token Resolution:** `parse_evidence_token("E_54_@_V_181")` maps raw evidence tokens to their English question (`Characterize your pain:`) and English meaning (`burning`).
- **Split Management:** Handles `train`, `validate`, and `test` splits seamlessly.
