"""
DDXPlus Clinical Knowledge Representation & Patient Interpreter
Resolves raw DDXPlus patient records into structured, human-readable clinical representations.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

@dataclass
class ClinicalEvidence:
    token: str
    code: str
    question_en: str
    value_raw: Any
    value_meaning_en: str
    data_type: str
    is_antecedent: bool
    category: str
    formatted_text: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "token": self.token,
            "code": self.code,
            "question_en": self.question_en,
            "value_raw": self.value_raw,
            "value_meaning_en": self.value_meaning_en,
            "data_type": self.data_type,
            "is_antecedent": self.is_antecedent,
            "category": self.category,
            "formatted_text": self.formatted_text
        }


@dataclass
class DifferentialCandidate:
    condition_name: str
    probability: float
    icd10_id: str
    severity: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "condition_name": self.condition_name,
            "probability": self.probability,
            "icd10_id": self.icd10_id,
            "severity": self.severity
        }


@dataclass
class PatientCase:
    age: int
    sex: str
    initial_evidence: ClinicalEvidence
    evidences: List[ClinicalEvidence]
    symptoms: List[ClinicalEvidence]
    antecedents: List[ClinicalEvidence]
    pathology: str
    icd10_id: str
    severity: int
    differential_diagnosis: List[DifferentialCandidate]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "demographics": {
                "age": self.age,
                "sex": self.sex
            },
            "initial_evidence": self.initial_evidence.to_dict(),
            "pathology": {
                "name": self.pathology,
                "icd10_id": self.icd10_id,
                "severity": self.severity
            },
            "symptoms_count": len(self.symptoms),
            "antecedents_count": len(self.antecedents),
            "symptoms": [s.to_dict() for s in self.symptoms],
            "antecedents": [a.to_dict() for a in self.antecedents],
            "differential_diagnosis": [d.to_dict() for d in self.differential_diagnosis]
        }


class DDXPlusClinicalKnowledge:
    """Knowledge base resolving codes to clinical meanings."""

    def __init__(self, raw_dir: Optional[Union[str, Path]] = None):
        if raw_dir is None:
            raw_dir = Path(__file__).resolve().parent / "raw"
        self.raw_dir = Path(raw_dir)
        
        with open(self.raw_dir / "release_conditions.json", "r", encoding="utf-8") as f:
            self.conditions: Dict[str, Any] = json.load(f)
            
        with open(self.raw_dir / "release_evidences.json", "r", encoding="utf-8") as f:
            self.evidences: Dict[str, Any] = json.load(f)

    def resolve_evidence(self, token: str) -> ClinicalEvidence:
        """Resolves a raw evidence token into a structured ClinicalEvidence instance."""
        if "_@_" in token:
            code, val_raw = token.split("_@_", 1)
        else:
            code, val_raw = token, "Y"

        ev_meta = self.evidences.get(code, {})
        question = ev_meta.get("question_en", f"Unknown question for {code}")
        data_type = ev_meta.get("data_type", "B")
        is_antecedent = ev_meta.get("is_antecedent", False)
        category = "Antecedent / Risk Factor" if is_antecedent else "Symptom / Sign"

        # Resolve human-readable meaning
        value_meaning_en = ""
        vm = ev_meta.get("value_meaning", {})
        
        if data_type == "B":
            value_meaning_en = "Yes / Present"
            formatted_text = f"{question} -> Yes"
        elif data_type == "M":
            if isinstance(vm, dict) and str(val_raw) in vm:
                value_meaning_en = vm[str(val_raw)].get("en", str(val_raw))
            else:
                value_meaning_en = str(val_raw)
            formatted_text = f"{question} {value_meaning_en}"
        elif data_type == "C":
            if isinstance(vm, dict) and str(val_raw) in vm:
                val_dict = vm[str(val_raw)]
                if isinstance(val_dict, dict):
                    value_meaning_en = val_dict.get("en", str(val_raw))
                else:
                    value_meaning_en = str(val_dict)
                formatted_text = f"{question} {value_meaning_en}"
            else:
                # Scale / Numeric value (e.g., pain scale 0-10)
                value_meaning_en = f"{val_raw} / 10" if str(val_raw).isdigit() else str(val_raw)
                formatted_text = f"{question} -> {value_meaning_en}"
        else:
            value_meaning_en = str(val_raw)
            formatted_text = f"{question} -> {value_meaning_en}"

        return ClinicalEvidence(
            token=token,
            code=code,
            question_en=question,
            value_raw=val_raw,
            value_meaning_en=value_meaning_en,
            data_type=data_type,
            is_antecedent=is_antecedent,
            category=category,
            formatted_text=formatted_text
        )

    def resolve_condition(self, condition_name: str) -> Dict[str, Any]:
        """Returns metadata for condition."""
        return self.conditions.get(condition_name, {
            "condition_name": condition_name,
            "icd10-id": "Unknown",
            "severity": 0
        })

    def interpret_patient(self, raw_patient: Dict[str, Any]) -> PatientCase:
        """
        Takes a raw patient dictionary (from DDXPlusDataLoader or CSV)
        and resolves all fields into a rich PatientCase.
        """
        age = int(raw_patient["age"]) if "age" in raw_patient else int(raw_patient["AGE"])
        sex = raw_patient.get("sex") or raw_patient.get("SEX")
        pathology_name = raw_patient.get("pathology") or raw_patient.get("PATHOLOGY")
        initial_ev_token = raw_patient.get("initial_evidence") or raw_patient.get("INITIAL_EVIDENCE", "")
        
        # Evidences
        raw_evs = raw_patient.get("evidences", [])
        if not raw_evs and "EVIDENCES" in raw_patient:
            import ast
            raw_evs = ast.literal_eval(raw_patient["EVIDENCES"]) if raw_patient["EVIDENCES"] else []

        resolved_evidences = [self.resolve_evidence(tok) for tok in raw_evs]
        symptoms = [e for e in resolved_evidences if not e.is_antecedent]
        antecedents = [e for e in resolved_evidences if e.is_antecedent]

        # Initial Evidence
        initial_evidence = self.resolve_evidence(initial_ev_token) if initial_ev_token else None

        # Pathology details
        cond_meta = self.resolve_condition(pathology_name)
        icd10_id = cond_meta.get("icd10-id", "Unknown")
        severity = cond_meta.get("severity", 0)

        # Differential Diagnosis
        raw_ddx = raw_patient.get("differential_diagnosis", [])
        if not raw_ddx and "DIFFERENTIAL_DIAGNOSIS" in raw_patient:
            import ast
            raw_ddx = ast.literal_eval(raw_patient["DIFFERENTIAL_DIAGNOSIS"]) if raw_patient["DIFFERENTIAL_DIAGNOSIS"] else []

        differential_candidates = []
        for item in raw_ddx:
            if isinstance(item, dict):
                c_name = item.get("condition")
                prob = float(item.get("probability", 0.0))
            elif isinstance(item, (list, tuple)) and len(item) == 2:
                c_name = item[0]
                prob = float(item[1])
            else:
                continue

            c_info = self.resolve_condition(c_name)
            differential_candidates.append(DifferentialCandidate(
                condition_name=c_name,
                probability=prob,
                icd10_id=c_info.get("icd10-id", "Unknown"),
                severity=c_info.get("severity", 0)
            ))

        # Sort differential by probability descending
        differential_candidates.sort(key=lambda x: x.probability, reverse=True)

        return PatientCase(
            age=age,
            sex=sex,
            initial_evidence=initial_evidence,
            evidences=resolved_evidences,
            symptoms=symptoms,
            antecedents=antecedents,
            pathology=pathology_name,
            icd10_id=icd10_id,
            severity=severity,
            differential_diagnosis=differential_candidates
        )
