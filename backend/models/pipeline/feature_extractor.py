"""
DDXPlus Feature Extractor Module
Converts raw or interpreted patient clinical cases into sparse ML feature vectors.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple
import numpy as np
from scipy import sparse

class DDXPlusFeatureExtractor:
    """Extracts demographic, chief complaint, and evidence features for ML models."""

    def __init__(self, raw_data_dir: Optional[Union[str, Path]] = None):
        if raw_data_dir is None:
            raw_data_dir = Path(__file__).resolve().parent.parent.parent / "data" / "ddxplus" / "raw"
        self.raw_data_dir = Path(raw_data_dir)
        
        # Feature vocabulary maps: feature_name -> column_index
        self.feature_to_idx: Dict[str, int] = {}
        self.idx_to_feature: Dict[int, str] = {}
        self.is_fitted: bool = False
        self.num_features: int = 0

    def fit_from_metadata(self) -> "DDXPlusFeatureExtractor":
        """
        Builds feature vocabulary from official release_evidences.json and condition files.
        """
        ev_file = self.raw_data_dir / "release_evidences.json"
        with open(ev_file, "r", encoding="utf-8") as f:
            evidences = json.load(f)

        features = []
        
        # 1. Demographics
        features.extend(["demo_age_norm", "demo_sex_M", "demo_sex_F"])

        # 2. Initial Evidence vocabulary (Chief complaints)
        # In DDXPlus, initial evidence can be any evidence code
        for ev_code in sorted(evidences.keys()):
            features.append(f"init_{ev_code}")

        # 3. Clinical Evidences (binary, categorical, multi-choice)
        for ev_code, ev_data in sorted(evidences.items()):
            # Base presence feature
            features.append(f"ev_{ev_code}")
            
            # Possible values (e.g. for M and C types)
            pv_list = ev_data.get("possible-values", [])
            for val in pv_list:
                features.append(f"ev_{ev_code}_@_{val}")

        # Remove any potential duplicates while maintaining consistent order
        unique_features = []
        seen = set()
        for ft in features:
            if ft not in seen:
                seen.add(ft)
                unique_features.append(ft)

        self.feature_to_idx = {ft: idx for idx, ft in enumerate(unique_features)}
        self.idx_to_feature = {idx: ft for idx, ft in enumerate(unique_features)}
        self.num_features = len(unique_features)
        self.is_fitted = True
        return self

    def fit_from_data(self, patient_stream, extra_from_meta: bool = True) -> "DDXPlusFeatureExtractor":
        """
        Optionally fits or extends vocabulary directly from a stream of patient records.
        """
        if extra_from_meta:
            self.fit_from_metadata()

        features_set = set(self.feature_to_idx.keys())
        
        for pt in patient_stream:
            init_ev = pt.get("initial_evidence") or pt.get("INITIAL_EVIDENCE")
            if init_ev:
                features_set.add(f"init_{init_ev}")
            
            evs = pt.get("evidences") or pt.get("EVIDENCES", [])
            if isinstance(evs, str):
                import ast
                evs = ast.literal_eval(evs)
            for ev in evs:
                features_set.add(f"ev_{ev}")
                if "_@_" in ev:
                    base_code = ev.split("_@_")[0]
                    features_set.add(f"ev_{base_code}")

        sorted_features = sorted(list(features_set))
        self.feature_to_idx = {ft: idx for idx, ft in enumerate(sorted_features)}
        self.idx_to_feature = {idx: ft for idx, ft in enumerate(sorted_features)}
        self.num_features = len(sorted_features)
        self.is_fitted = True
        return self

    def transform_patient(self, pt: Dict[str, Any]) -> Tuple[List[int], List[float]]:
        """
        Extracts non-zero feature indices and values for a single patient record.
        Returns: (feature_indices, feature_values)
        """
        if not self.is_fitted:
            raise RuntimeError("DDXPlusFeatureExtractor must be fitted before transforming data.")

        indices = []
        values = []

        # Age
        age = pt.get("age") if "age" in pt else pt.get("AGE", 0)
        try:
            age_val = float(age) / 100.0
        except (ValueError, TypeError):
            age_val = 0.40  # Default ~40 years
        
        idx_age = self.feature_to_idx.get("demo_age_norm")
        if idx_age is not None:
            indices.append(idx_age)
            values.append(age_val)

        # Sex
        sex = str(pt.get("sex") or pt.get("SEX", "")).strip().upper()
        if sex == "M":
            idx_sex = self.feature_to_idx.get("demo_sex_M")
            if idx_sex is not None:
                indices.append(idx_sex)
                values.append(1.0)
        elif sex == "F":
            idx_sex = self.feature_to_idx.get("demo_sex_F")
            if idx_sex is not None:
                indices.append(idx_sex)
                values.append(1.0)

        # Initial Evidence (Chief Complaint)
        init_ev = pt.get("initial_evidence") or pt.get("INITIAL_EVIDENCE", "")
        if init_ev:
            init_key = f"init_{init_ev}"
            idx_init = self.feature_to_idx.get(init_key)
            if idx_init is not None:
                indices.append(idx_init)
                values.append(1.0)
            elif "_@_" in init_ev:
                base_code = f"init_{init_ev.split('_@_')[0]}"
                idx_base = self.feature_to_idx.get(base_code)
                if idx_base is not None:
                    indices.append(idx_base)
                    values.append(1.0)

        # Evidences (Symptoms & Antecedents)
        evs = pt.get("evidences") or pt.get("EVIDENCES", [])
        if isinstance(evs, str):
            import ast
            evs = ast.literal_eval(evs)

        for ev in evs:
            ev_key = f"ev_{ev}"
            idx_ev = self.feature_to_idx.get(ev_key)
            if idx_ev is not None:
                indices.append(idx_ev)
                values.append(1.0)
            
            # Also trigger base code if compound value token
            if "_@_" in ev:
                base_code = f"ev_{ev.split('_@_')[0]}"
                idx_base = self.feature_to_idx.get(base_code)
                if idx_base is not None and idx_base not in indices:
                    indices.append(idx_base)
                    values.append(1.0)

        return indices, values

    def transform_batch(self, patient_list: List[Dict[str, Any]]) -> sparse.csr_matrix:
        """
        Converts a list/batch of patient records into a sparse CSR matrix.
        """
        rows = []
        cols = []
        data = []

        for row_idx, pt in enumerate(patient_list):
            indices, values = self.transform_patient(pt)
            for c_idx, val in zip(indices, values):
                rows.append(row_idx)
                cols.append(c_idx)
                data.append(val)

        return sparse.csr_matrix(
            (data, (rows, cols)),
            shape=(len(patient_list), self.num_features),
            dtype=np.float32
        )
