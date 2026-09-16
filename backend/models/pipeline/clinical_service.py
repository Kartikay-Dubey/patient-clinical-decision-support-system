"""
Unified Clinical Diagnosis Service
Connects Natural Language Evidence Extraction to the trained ML Diagnostic Engine.
"""

from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from .nlp_matcher import DDXPlusNLPEvidenceMatcher, NLPParseResult
from .predictor import DDXPlusBaselinePredictor

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_MODEL_DIR = PROJECT_ROOT / "backend" / "models"
DEFAULT_RAW_DIR = PROJECT_ROOT / "backend" / "data" / "ddxplus" / "raw"

class ClinicalDiagnosisService:
    """
    End-to-end service for converting free-form symptom text into structured
    DDXPlus evidence tokens and predicting ranked differential diagnosis candidates.
    """

    def __init__(
        self,
        model_dir: Optional[Union[str, Path]] = None,
        raw_dir: Optional[Union[str, Path]] = None
    ):
        self.nlp_matcher = DDXPlusNLPEvidenceMatcher(raw_dir=raw_dir)
        self.predictor = DDXPlusBaselinePredictor(model_dir=model_dir, raw_dir=raw_dir)

    def diagnose_free_text(
        self,
        text: str,
        age: int = 45,
        sex: str = "M",
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Takes raw natural language symptom descriptions, extracts structured DDXPlus evidences,
        and generates ranked differential diagnosis predictions.
        
        Args:
            text: Free-form text (e.g., "I have chest pain, nausea and difficulty breathing")
            age: Patient age in years
            sex: 'M' or 'F'
            top_k: Number of ranked candidate conditions to return
        """
        # 1. NLP Evidence Extraction
        nlp_result: NLPParseResult = self.nlp_matcher.parse_text(text)

        # 2. Build model input
        model_input = nlp_result.to_model_input(age=age, sex=sex)

        # 3. Model Inference & Ranking
        differential_candidates = self.predictor.predict_top_k(model_input, top_k=top_k)

        return {
            "query_text": text,
            "patient_demographics": {
                "age": age,
                "sex": sex.upper()
            },
            "nlp_extraction": nlp_result.to_dict(),
            "differential_diagnosis": differential_candidates
        }
