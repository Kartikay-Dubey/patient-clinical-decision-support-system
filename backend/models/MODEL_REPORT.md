# DDXPlus Baseline Model: Supervised Logistic Regression Architecture & Evaluation Report

## 1. Overview & Objective
This report details the implementation, features, training pipeline, and evaluation metrics for the initial supervised baseline model trained on the official **English DDXPlus** dataset.

The baseline model provides an interpretable, highly scalable benchmark predicting across all **49 DDXPlus pathologies** using patient demographics, chief complaint, and resolved positive clinical evidences, outputting a ranked distribution of differential candidates with corresponding ICD-10 diagnostic codes and clinical severity levels.

---

## 2. Feature Engineering & Preprocessing

### Input Features Used (1,213 Sparse Features Total):
1. **Patient Demographics (3 continuous / binary features):**
   - `demo_age_norm`: Patient age normalized as $\frac{\text{AGE}}{100.0}$.
   - `demo_sex_M`: Binary indicator (1.0 if Male, 0.0 otherwise).
   - `demo_sex_F`: Binary indicator (1.0 if Female, 0.0 otherwise).
2. **Initial Evidence / Chief Complaint (223 one-hot features):**
   - `init_{code}`: Binary indicator designating the entry symptom/chief complaint that prompted the consultation (e.g. `init_E_66`, `init_E_201`).
3. **Clinical Evidences (987 multi-hot binary & categorical features):**
   - `ev_{code}`: Base presence indicator for all binary, categorical, and multi-choice evidence codes.
   - `ev_{code}_@_{value}`: Distinct categorical and multi-choice value indicator (e.g. `ev_E_54_@_V_181` for burning pain, `ev_E_55_@_V_29` for lower chest location, `ev_E_56_@_10` for 10/10 pain scale).

### Data Leakage Prevention:
> [!IMPORTANT]
> `DIFFERENTIAL_DIAGNOSIS` from the patient records is **strictly excluded** from feature extraction and model inputs. The model predicts solely from raw patient presentation (`AGE`, `SEX`, `INITIAL_EVIDENCE`, and positive `EVIDENCES`).

---

## 3. Training Pipeline & Configuration

- **Dataset Splits (Official, No Reshuffling):**
  - **Train:** 1,025,602 patient records
  - **Validation:** 132,448 patient records
  - **Test:** 134,529 patient records
- **Algorithm:** Multi-Class Logistic Regression via mini-batch SGD with Multinomial Log-Loss (`loss='log_loss'`, `penalty='l2'`, `alpha=1e-5`, $\text{batch\_size}=30,000$, $\text{epochs}=4$).
- **Label Encoding:** 49 unique ground-truth pathologies mapped alphabetically to class indices $[0..48]$.
- **Matrix Representation:** Memory-efficient `scipy.sparse.csr_matrix` for streaming partial fits without RAM overflow.

---

## 4. Official Evaluation Metrics

### Validation Split (132,448 Patient Cases)
| Metric | Value |
| :--- | :--- |
| **Top-1 Accuracy** | **99.66%** |
| **Top-3 Accuracy** | **100.00%** |
| **Top-5 Accuracy** | **100.00%** |
| **Macro-Precision** | **99.69%** |
| **Macro-Recall** | **99.41%** |
| **Macro-F1 Score** | **99.53%** |
| **Weighted F1 Score** | **99.66%** |

### Test Split (134,529 Patient Cases)
| Metric | Value |
| :--- | :--- |
| **Top-1 Accuracy** | **99.69%** |
| **Top-3 Accuracy** | **100.00%** |
| **Top-5 Accuracy** | **100.00%** |
| **Macro-Precision** | **99.72%** |
| **Macro-Recall** | **99.59%** |
| **Macro-F1 Score** | **99.65%** |
| **Weighted F1 Score** | **99.69%** |

---

## 5. Artifacts Saved

All model components and evaluation outputs are persisted under `backend/models/`:
- `baseline_logistic_regression.joblib`: Trained multi-class logistic regression weights.
- `feature_extractor.joblib`: Serialized vocabulary and sparse transform pipeline (`DDXPlusFeatureExtractor`).
- `label_encoder.joblib`: 49-class label encoder.
- `evaluation_results.json`: Complete JSON summary of validation and test metrics.
- `confusion_matrix_test.csv`: Full $49 \times 49$ test confusion matrix with condition headers.

---

## 6. Inference Service Usage

```python
from backend.models.pipeline.predictor import DDXPlusBaselinePredictor

predictor = DDXPlusBaselinePredictor()

# Predict top-k differential candidates for a patient case
patient = {
    "age": 49,
    "sex": "F",
    "initial_evidence": "E_201",
    "evidences": ["E_53", "E_54_@_V_181", "E_55_@_V_197", "E_56_@_7", "E_201", "E_215", "E_70"]
}

ranked_candidates = predictor.predict_top_k(patient, top_k=5)
# Output:
# [
#   {"rank": 1, "condition_name": "GERD", "probability": 0.9991, "probability_percent": 99.91, "icd10_id": "K21", "severity": 3},
#   {"rank": 2, "condition_name": "Tuberculosis", "probability": 0.0002, "probability_percent": 0.02, "icd10_id": "a15", "severity": 3}, ...
# ]
```
