"""
DDXPlus Baseline Inference & Ranking Service
Loads trained model artifacts and provides ranked candidate predictions with ICD-10 & severity resolution.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import numpy as np
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_MODEL_DIR = PROJECT_ROOT / "backend" / "models"
DEFAULT_RAW_DIR = PROJECT_ROOT / "backend" / "data" / "ddxplus" / "raw"

class DDXPlusBaselinePredictor:
    """Inference predictor for DDXPlus baseline model."""

    def __init__(
        self,
        model_dir: Optional[Union[str, Path]] = None,
        raw_dir: Optional[Union[str, Path]] = None
    ):
        self.model_dir = Path(model_dir) if model_dir else DEFAULT_MODEL_DIR
        self.raw_dir = Path(raw_dir) if raw_dir else DEFAULT_RAW_DIR

        # Load artifacts
        self.model = joblib.load(self.model_dir / "baseline_logistic_regression.joblib")
        self.feature_extractor = joblib.load(self.model_dir / "feature_extractor.joblib")
        self.label_encoder = joblib.load(self.model_dir / "label_encoder.joblib")

        # Load conditions metadata for ICD-10 & severity enrichment
        with open(self.raw_dir / "release_conditions.json", "r", encoding="utf-8") as f:
            self.conditions_meta = json.load(f)

    def predict_top_k(
        self,
        patient_data: Dict[str, Any],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Predicts and ranks candidate pathologies for a single patient case.
        
        Args:
            patient_data: Dict with 'age', 'sex', 'initial_evidence', 'evidences' (or CSV column names)
            top_k: Number of top candidate conditions to return
        """
        # Transform into sparse feature vector
        X_sparse = self.feature_extractor.transform_batch([patient_data])
        
        # Predict class probabilities
        probabilities = self.model.predict_proba(X_sparse)[0]
        
        # Sort top-k indices by descending probability
        top_indices = np.argsort(probabilities)[::-1][:top_k]
        
        results = []
        for rank, class_idx in enumerate(top_indices, 1):
            cond_name = self.label_encoder.classes_[class_idx]
            prob = float(probabilities[class_idx])
            cond_info = self.conditions_meta.get(cond_name, {})
            
            results.append({
                "rank": rank,
                "condition_name": cond_name,
                "probability": prob,
                "probability_percent": round(prob * 100, 2),
                "icd10_id": cond_info.get("icd10-id", "Unknown"),
                "severity": cond_info.get("severity", 0),
                "is_ground_truth": (cond_name == (patient_data.get("pathology") or patient_data.get("PATHOLOGY")))
            })

        return results

    def predict_batch(
        self,
        patient_list: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[List[Dict[str, Any]]]:
        """Predicts top-k candidates for a batch of patients."""
        X_sparse = self.feature_extractor.transform_batch(patient_list)
        prob_matrix = self.model.predict_proba(X_sparse)
        
        batch_results = []
        for i, row_probs in enumerate(prob_matrix):
            pt = patient_list[i]
            top_indices = np.argsort(row_probs)[::-1][:top_k]
            pt_results = []
            for rank, class_idx in enumerate(top_indices, 1):
                cond_name = self.label_encoder.classes_[class_idx]
                prob = float(row_probs[class_idx])
                cond_info = self.conditions_meta.get(cond_name, {})
                pt_results.append({
                    "rank": rank,
                    "condition_name": cond_name,
                    "probability": prob,
                    "probability_percent": round(prob * 100, 2),
                    "icd10_id": cond_info.get("icd10-id", "Unknown"),
                    "severity": cond_info.get("severity", 0),
                    "is_ground_truth": (cond_name == (pt.get("pathology") or pt.get("PATHOLOGY")))
                })
            batch_results.append(pt_results)

        return batch_results
