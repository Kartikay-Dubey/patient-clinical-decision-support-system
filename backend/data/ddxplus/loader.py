"""
DDXPlus Dataset Loader & Utility Module
Provides clean, memory-efficient access to the DDXPlus English dataset.
"""

import os
import json
import csv
import ast
from pathlib import Path
from typing import Dict, List, Any, Optional, Iterator, Tuple, Union
from .interpreter import DDXPlusClinicalKnowledge, PatientCase, ClinicalEvidence, DifferentialCandidate

DEFAULT_RAW_DIR = Path(__file__).resolve().parent / "raw"

class DDXPlusDataLoader:
    """Loader utility for DDXPlus dataset files."""

    def __init__(self, raw_data_dir: Optional[Union[str, Path]] = None):
        self.raw_dir = Path(raw_data_dir) if raw_data_dir else DEFAULT_RAW_DIR
        self._conditions: Optional[Dict[str, Any]] = None
        self._evidences: Optional[Dict[str, Any]] = None
        self._interpreter: Optional[DDXPlusClinicalKnowledge] = None

    @property
    def conditions_path(self) -> Path:
        return self.raw_dir / "release_conditions.json"

    @property
    def evidences_path(self) -> Path:
        return self.raw_dir / "release_evidences.json"

    def get_split_path(self, split: str) -> Path:
        split_map = {
            "train": "release_train_patients",
            "validate": "release_validate_patients",
            "val": "release_validate_patients",
            "test": "release_test_patients"
        }
        key = split.lower().strip()
        if key not in split_map:
            raise ValueError(f"Invalid split '{split}'. Must be one of: 'train', 'validate', 'test'")
        
        # Check if file exists as release_xxx or release_xxx.csv
        base_path = self.raw_dir / split_map[key]
        if base_path.exists():
            return base_path
        csv_path = self.raw_dir / f"{split_map[key]}.csv"
        if csv_path.exists():
            return csv_path
        raise FileNotFoundError(f"Could not find patient file for split '{split}' at {base_path} or {csv_path}")

    def load_conditions(self, force_reload: bool = False) -> Dict[str, Any]:
        """Loads release_conditions.json mapping condition names to metadata."""
        if self._conditions is None or force_reload:
            if not self.conditions_path.exists():
                raise FileNotFoundError(f"Conditions file not found at {self.conditions_path}")
            with open(self.conditions_path, "r", encoding="utf-8") as f:
                self._conditions = json.load(f)
        return self._conditions

    def load_evidences(self, force_reload: bool = False) -> Dict[str, Any]:
        """Loads release_evidences.json mapping evidence codes to metadata."""
        if self._evidences is None or force_reload:
            if not self.evidences_path.exists():
                raise FileNotFoundError(f"Evidences file not found at {self.evidences_path}")
            with open(self.evidences_path, "r", encoding="utf-8") as f:
                self._evidences = json.load(f)
        return self._evidences

    def parse_evidence_token(self, token: str) -> Dict[str, Any]:
        """
        Parses evidence token like 'E_53' or 'E_54_@_V_112' into structured dictionary.
        """
        evidences = self.load_evidences()
        if "_@_" in token:
            code, value = token.split("_@_", 1)
        else:
            code, value = token, True

        ev_meta = evidences.get(code, {})
        meaning = None
        if ev_meta and isinstance(ev_meta.get("value_meaning"), dict):
            val_info = ev_meta["value_meaning"].get(str(value))
            if isinstance(val_info, dict):
                meaning = val_info.get("en")

        return {
            "token": token,
            "evidence_code": code,
            "value": value,
            "question_en": ev_meta.get("question_en"),
            "data_type": ev_meta.get("data_type"),
            "is_antecedent": ev_meta.get("is_antecedent", False),
            "meaning_en": meaning
        }

    def stream_patients(
        self,
        split: str = "train",
        parse_structures: bool = True,
        limit: Optional[int] = None
    ) -> Iterator[Dict[str, Any]]:
        """
        Memory-efficient streaming generator for patient records.
        
        Args:
            split: 'train', 'validate', or 'test'
            parse_structures: If True, parses EVIDENCES and DIFFERENTIAL_DIAGNOSIS from string representations.
            limit: Maximum number of records to yield.
        """
        file_path = self.get_split_path(split)
        count = 0

        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if parse_structures:
                    parsed_evidences = ast.literal_eval(row["EVIDENCES"]) if row.get("EVIDENCES") else []
                    parsed_ddx = ast.literal_eval(row["DIFFERENTIAL_DIAGNOSIS"]) if row.get("DIFFERENTIAL_DIAGNOSIS") else []
                    record = {
                        "age": int(row["AGE"]),
                        "sex": row["SEX"],
                        "pathology": row["PATHOLOGY"],
                        "initial_evidence": row.get("INITIAL_EVIDENCE", ""),
                        "evidences": parsed_evidences,
                        "differential_diagnosis": [{"condition": d[0], "probability": float(d[1])} for d in parsed_ddx]
                    }
                else:
                    record = {
                        "age": int(row["AGE"]),
                        "sex": row["SEX"],
                        "pathology": row["PATHOLOGY"],
                        "initial_evidence": row.get("INITIAL_EVIDENCE", ""),
                        "evidences_raw": row.get("EVIDENCES", ""),
                        "differential_diagnosis_raw": row.get("DIFFERENTIAL_DIAGNOSIS", "")
                    }

                yield record
                count += 1
                if limit is not None and count >= limit:
                    break

    def load_patients(
        self,
        split: str = "test",
        limit: Optional[int] = 1000,
        parse_structures: bool = True
    ) -> List[Dict[str, Any]]:
        """Loads a list of patient records in-memory."""
        return list(self.stream_patients(split=split, parse_structures=parse_structures, limit=limit))

    @property
    def interpreter(self) -> DDXPlusClinicalKnowledge:
        if self._interpreter is None:
            self._interpreter = DDXPlusClinicalKnowledge(raw_dir=self.raw_dir)
        return self._interpreter

    def interpret_patient(self, raw_patient: Dict[str, Any]) -> PatientCase:
        """Interprets a single patient record into human-readable clinical form."""
        return self.interpreter.interpret_patient(raw_patient)

    def stream_interpreted_patients(
        self,
        split: str = "train",
        limit: Optional[int] = None
    ) -> Iterator[PatientCase]:
        """Streams patients directly as fully resolved PatientCase objects."""
        for raw_pt in self.stream_patients(split=split, parse_structures=True, limit=limit):
            yield self.interpreter.interpret_patient(raw_pt)

    def get_summary(self) -> Dict[str, Any]:
        """Returns basic structure summary of the dataset."""
        conditions = self.load_conditions()
        evidences = self.load_evidences()
        
        splits_info = {}
        for sp in ["train", "validate", "test"]:
            p = self.get_split_path(sp)
            splits_info[sp] = {
                "filename": p.name,
                "size_mb": round(p.stat().st_size / (1024 * 1024), 2)
            }

        return {
            "total_conditions": len(conditions),
            "total_evidences": len(evidences),
            "splits": splits_info
        }
