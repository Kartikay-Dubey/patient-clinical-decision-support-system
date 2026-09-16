"""
Natural Language to DDXPlus Evidence Bridge & Matcher
Converts free-form patient clinical symptom text into structured DDXPlus evidence codes.
Uses deterministic clinical lexicon matching, anatomical location resolution, and semantic similarity.
"""

import re
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Set, Union
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_RAW_DIR = PROJECT_ROOT / "backend" / "data" / "ddxplus" / "raw"

@dataclass
class EvidenceMatch:
    token: str
    code: str
    value: Any
    question_en: str
    finding_en: str
    score: float
    match_type: str
    matched_phrase: str
    category: str
    data_type: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "token": self.token,
            "code": self.code,
            "value": self.value,
            "question_en": self.question_en,
            "finding_en": self.finding_en,
            "score": round(self.score, 3),
            "match_type": self.match_type,
            "matched_phrase": self.matched_phrase,
            "category": self.category,
            "data_type": self.data_type
        }

@dataclass
class NLPParseResult:
    raw_text: str
    matched_evidences: List[EvidenceMatch] = field(default_factory=list)
    unmatched_phrases: List[str] = field(default_factory=list)

    @property
    def tokens(self) -> List[str]:
        return [m.token for m in self.matched_evidences]

    @property
    def symptoms(self) -> List[EvidenceMatch]:
        return [m for m in self.matched_evidences if m.category == "Symptom / Sign"]

    @property
    def antecedents(self) -> List[EvidenceMatch]:
        return [m for m in self.matched_evidences if m.category == "Antecedent / Risk Factor"]

    def to_model_input(
        self,
        age: int = 40,
        sex: str = "M",
        initial_evidence: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Converts the parsed NLP result into a dictionary directly accepted by
        DDXPlusFeatureExtractor and DDXPlusBaselinePredictor.
        """
        tokens_list = self.tokens
        # If no initial evidence explicitly provided, pick the first symptom token
        if not initial_evidence:
            if self.symptoms:
                initial_evidence = self.symptoms[0].code
            elif tokens_list:
                initial_evidence = tokens_list[0].split("_@_")[0]
            else:
                initial_evidence = "E_53"  # default general complaint

        return {
            "age": age,
            "sex": sex.upper(),
            "initial_evidence": initial_evidence,
            "evidences": tokens_list
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "raw_text": self.raw_text,
            "matched_count": len(self.matched_evidences),
            "symptoms_count": len(self.symptoms),
            "antecedents_count": len(self.antecedents),
            "matched_evidences": [m.to_dict() for m in self.matched_evidences],
            "unmatched_phrases": self.unmatched_phrases
        }


class DDXPlusNLPEvidenceMatcher:
    """
    Hybrid Deterministic + Semantic NLP Matcher for DDXPlus Clinical Evidences.
    """

    def __init__(self, raw_dir: Optional[Union[str, Path]] = None):
        self.raw_dir = Path(raw_dir) if raw_dir else DEFAULT_RAW_DIR
        with open(self.raw_dir / "release_evidences.json", "r", encoding="utf-8") as f:
            self.evidences_meta: Dict[str, Any] = json.load(f)

        # 1. Build Clinical Synonyms & Alias Index
        self._build_clinical_lexicon()

        # 2. Build Anatomical & Qualifier Maps
        self._build_anatomical_and_qualifier_maps()

        # 3. Build TF-IDF Semantic Index over all evidence questions
        self._build_semantic_index()

    def _build_clinical_lexicon(self):
        """
        Comprehensive clinical alias mapping for common symptoms, risk factors, and colloquial medical terms.
        """
        self.alias_to_tokens: Dict[str, List[Tuple[str, float]]] = {
            # Pain & Core Presentation
            "pain": [("E_53", 1.0)],
            "chest pain": [("E_53", 1.0), ("E_55_@_V_29", 0.95)],
            "chest discomfort": [("E_53", 1.0), ("E_55_@_V_29", 0.95)],
            "chest tightness": [("E_53", 1.0), ("E_55_@_V_29", 0.95), ("E_54_@_V_183", 0.90)],
            "stomach pain": [("E_53", 1.0), ("E_55_@_V_197", 0.95)],
            "abdominal pain": [("E_53", 1.0), ("E_55_@_V_197", 0.95)],
            "belly pain": [("E_53", 1.0), ("E_55_@_V_197", 0.90)],
            "epigastric pain": [("E_53", 1.0), ("E_55_@_V_197", 1.0)],
            "headache": [("E_53", 1.0), ("E_55_@_V_162", 0.95)],
            "head ache": [("E_53", 1.0), ("E_55_@_V_162", 0.95)],
            "migraine": [("E_53", 1.0)],
            "sore throat": [("E_97", 1.0), ("E_53", 0.90)],
            "throat pain": [("E_97", 1.0), ("E_53", 0.90)],
            "neck pain": [("E_53", 1.0), ("E_55_@_V_143", 0.95)],
            "back pain": [("E_53", 1.0), ("E_55_@_V_39", 0.90)],
            "lower back pain": [("E_53", 1.0), ("E_55_@_V_40", 0.95)],
            "shoulder pain": [("E_53", 1.0), ("E_55_@_V_194", 0.90)],
            "arm pain": [("E_53", 1.0), ("E_55_@_V_30", 0.90)],
            "joint pain": [("E_53", 1.0), ("E_170", 0.95)],
            "burning pain": [("E_53", 1.0), ("E_54_@_V_181", 0.95)],
            "sharp pain": [("E_53", 1.0), ("E_54_@_V_192", 0.95)],
            "stabbing pain": [("E_53", 1.0), ("E_54_@_V_179", 0.95)],
            "throbbing pain": [("E_53", 1.0), ("E_54_@_V_184", 0.95)],

            # Respiratory & ENT
            "shortness of breath": [("E_66", 1.0)],
            "difficulty breathing": [("E_66", 1.0)],
            "trouble breathing": [("E_66", 1.0)],
            "hard to breathe": [("E_66", 1.0)],
            "breathlessness": [("E_66", 1.0)],
            "dyspnea": [("E_66", 1.0)],
            "cough": [("E_201", 1.0)],
            "coughing": [("E_201", 1.0)],
            "dry cough": [("E_201", 1.0)],
            "productive cough": [("E_201", 1.0), ("E_219", 0.95)],
            "coughing up phlegm": [("E_201", 1.0), ("E_219", 1.0)],
            "coughing up blood": [("E_201", 1.0), ("E_178", 1.0)],
            "hemoptysis": [("E_178", 1.0)],
            "wheezing": [("E_66", 0.90)],
            "stridor": [("E_194", 1.0)],
            "runny nose": [("E_181", 1.0)],
            "rhinorrhea": [("E_181", 1.0)],
            "stuffy nose": [("E_181", 0.90)],
            "nasal congestion": [("E_181", 1.0)],
            "nasal discharge": [("E_182", 1.0)],
            "yellow discharge": [("E_182", 1.0)],
            "green discharge": [("E_182", 1.0)],
            "sneezing": [("E_169", 0.90), ("E_181", 0.85)],
            "sinus pressure": [("E_181", 0.90)],
            "hoarseness": [("E_99", 1.0)],
            "lost voice": [("E_99", 0.95)],
            "difficulty swallowing": [("E_65", 1.0)],
            "dysphagia": [("E_65", 1.0)],
            "painful swallowing": [("E_65", 0.95), ("E_97", 0.90)],

            # Gastrointestinal
            "nausea": [("E_148", 1.0)],
            "nauseous": [("E_148", 1.0)],
            "feeling sick": [("E_148", 0.85)],
            "vomiting": [("E_148", 1.0), ("E_211", 0.95)],
            "threw up": [("E_148", 1.0), ("E_211", 1.0)],
            "heartburn": [("E_173", 1.0), ("E_125", 0.90)],
            "acid reflux": [("E_173", 1.0), ("E_125", 0.90), ("E_215", 0.90)],
            "sour taste in mouth": [("E_215", 1.0)],
            "bitter taste": [("E_215", 1.0)],
            "regurgitation": [("E_215", 1.0)],
            "diarrhea": [("E_51", 1.0)],
            "loose stools": [("E_51", 1.0)],
            "constipation": [("E_119", 1.0)],
            "bloating": [("E_30", 1.0)],
            "abdominal bloating": [("E_30", 1.0)],
            "loss of appetite": [("E_161", 1.0)],
            "anorexia": [("E_174", 1.0)],
            "weight loss": [("E_162", 0.90), ("E_174", 0.90)],
            "unintentional weight loss": [("E_162", 1.0), ("E_174", 1.0)],

            # Systemic & Constitutional
            "fever": [("E_91", 1.0)],
            "high temperature": [("E_91", 1.0)],
            "febrile": [("E_91", 1.0)],
            "chills": [("E_94", 1.0)],
            "shivering": [("E_94", 1.0)],
            "night sweats": [("E_50", 0.95)],
            "sweating": [("E_50", 0.90)],
            "diaphoresis": [("E_50", 1.0)],
            "excessive sweating": [("E_50", 1.0)],
            "fatigue": [("E_89", 1.0)],
            "tired": [("E_89", 0.90)],
            "exhausted": [("E_88", 1.0)],
            "bedridden": [("E_88", 1.0)],
            "general fatigue": [("E_175", 1.0)],
            "malaise": [("E_175", 1.0)],
            "weakness": [("E_84", 1.0)],
            "muscle weakness": [("E_84", 1.0)],
            "limb weakness": [("E_84", 1.0)],
            "dizziness": [("E_76", 1.0)],
            "lightheaded": [("E_76", 1.0)],
            "lightheadedness": [("E_76", 1.0)],
            "vertigo": [("E_76", 0.95)],
            "fainting": [("E_82", 1.0)],
            "about to faint": [("E_82", 1.0)],
            "passed out": [("E_82", 1.0)],
            "syncope": [("E_82", 1.0)],

            # Cardiovascular
            "palpitations": [("E_155", 1.0)],
            "racing heart": [("E_155", 1.0)],
            "heart pounding": [("E_155", 1.0)],
            "rapid heartbeat": [("E_155", 1.0)],
            "irregular heartbeat": [("E_164", 1.0)],
            "heart fluttering": [("E_155", 1.0)],
            "swollen legs": [("E_151", 1.0), ("E_152_@_V_171", 0.95)],
            "swollen ankles": [("E_151", 1.0), ("E_152_@_V_17", 0.95)],
            "edema": [("E_151", 1.0)],
            "swelling": [("E_151", 0.90)],

            # Skin & Allergy
            "rash": [("E_130_@_V_86", 0.90)],
            "skin rash": [("E_130_@_V_86", 0.90)],
            "hives": [("E_130_@_V_86", 0.95)],
            "itching": [("E_136_@_8", 0.95)],
            "itchy": [("E_136_@_8", 0.95)],
            "pruritus": [("E_136_@_8", 1.0)],
            "swollen lips": [("E_151", 1.0), ("E_152_@_V_141", 0.95)],
            "swollen tongue": [("E_151", 1.0), ("E_152_@_V_142", 0.95)],
            "swollen eyes": [("E_151", 1.0), ("E_152_@_V_134", 0.95)],

            # Medical Antecedents & Risk Factors
            "smoker": [("E_79", 1.0)],
            "smoking": [("E_79", 1.0)],
            "smoke cigarettes": [("E_79", 1.0)],
            "former smoker": [("E_191", 1.0)],
            "quit smoking": [("E_191", 1.0)],
            "drinker": [("E_78", 0.95)],
            "alcohol": [("E_78", 0.95)],
            "diabetes": [("E_69", 1.0)],
            "diabetic": [("E_69", 1.0)],
            "high blood pressure": [("E_104", 1.0)],
            "hypertension": [("E_104", 1.0)],
            "high cholesterol": [("E_71", 1.0)],
            "hyperlipidemia": [("E_71", 1.0)],
            "asthma": [("E_77", 1.0)],
            "copd": [("E_123", 1.0)],
            "chronic bronchitis": [("E_123", 0.95)],
            "heart attack history": [("E_105", 1.0)],
            "prior heart attack": [("E_105", 1.0)],
            "hiv": [("E_2", 1.0)],
            "travel": [("E_204_@_V_12", 0.85)],
            "travelled abroad": [("E_204_@_V_12", 0.95)],
            "nsaids": [("E_167", 1.0)],
            "ibuprofen regularly": [("E_167", 1.0)],
            "family heart disease": [("E_225", 1.0)],
            "family history of heart disease": [("E_225", 1.0)],
        }

    def _build_anatomical_and_qualifier_maps(self):
        """Builds lookup for anatomical pain/swelling locations and qualifiers."""
        self.pain_locations: Dict[str, str] = {}
        if "E_55" in self.evidences_meta:
            e55_vm = self.evidences_meta["E_55"].get("value_meaning", {})
            for v_code, meaning in e55_vm.items():
                en_name = meaning.get("en", "").lower().strip()
                if en_name and en_name != "nowhere":
                    self.pain_locations[en_name] = v_code

        # Add common clinical anatomical synonyms
        self.anatomical_aliases: Dict[str, str] = {
            "chest": "V_29",           # lower chest / chest
            "lower chest": "V_29",
            "epigastrium": "V_197",
            "epigastric": "V_197",
            "stomach": "V_197",
            "abdomen": "V_197",
            "belly": "V_197",
            "throat": "V_144",
            "neck": "V_143",
            "head": "V_162",
            "forehead": "V_163",
            "back": "V_39",
            "lumbar": "V_40",
            "lower back": "V_40",
            "right breast": "V_159",
            "left breast": "V_160",
            "breast": "V_159",
            "shoulder": "V_194",
            "right shoulder": "V_194",
            "left shoulder": "V_195",
            "arm": "V_30",
            "right arm": "V_30",
            "left arm": "V_31"
        }

        self.pain_qualifiers: Dict[str, str] = {
            "burning": "V_181",
            "sharp": "V_192",
            "stabbing": "V_179",
            "knife": "V_179",
            "heavy": "V_183",
            "pressure": "V_183",
            "tight": "V_183",
            "cramp": "V_182",
            "cramping": "V_182",
            "throbbing": "V_184",
            "pulse": "V_184",
            "pulsing": "V_184",
            "violent": "V_191",
            "sickening": "V_193",
            "tedious": "V_154",
            "scary": "V_196"
        }

    def _build_semantic_index(self):
        """Indexes all evidence question texts and meanings with TF-IDF."""
        self.doc_tokens: List[str] = []
        self.doc_texts: List[str] = []

        for code, ev_data in self.evidences_meta.items():
            q_en = ev_data.get("question_en", "")
            if q_en:
                self.doc_tokens.append(code)
                self.doc_texts.append(q_en)

            # Include specific values
            vm = ev_data.get("value_meaning", {})
            for v_code, v_dict in vm.items():
                val_en = v_dict.get("en", "")
                if val_en and val_en != "nowhere" and val_en != "NA":
                    token = f"{code}_@_{v_code}"
                    self.doc_tokens.append(token)
                    self.doc_texts.append(f"{q_en} {val_en}")

        self.tfidf = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
        self.tfidf_matrix = self.tfidf.fit_transform(self.doc_texts)

    def _clean_and_segment_text(self, text: str) -> List[str]:
        """Cleans conversational text and segments into symptom candidate clauses."""
        norm = text.lower().strip()

        # Remove common conversational fillers
        fillers = [
            r"\bi have\b", r"\bi am experiencing\b", r"\bi'm experiencing\b",
            r"\bi feel\b", r"\bi'm feeling\b", r"\bi got\b", r"\bpatient has\b",
            r"\bpatient reports\b", r"\bstarted feeling\b", r"\bsuffering from\b",
            r"\bcomplaining of\b", r"\bthere is\b", r"\bthere's\b",
        ]
        for f in fillers:
            norm = re.sub(f, " ", norm)

        # Collapse multiple spaces
        norm = re.sub(r"\s+", " ", norm).strip()

        # Split on conjunctions and punctuation
        delimiters = r"[,;\.\n\r&]+|\band\b|\bwith\b|\bas well as\b|\bplus\b|\bbut\b"
        parts = re.split(delimiters, norm)

        cleaned_phrases = []
        for p in parts:
            p_clean = p.strip()
            if len(p_clean) >= 3:
                cleaned_phrases.append(p_clean)

        return cleaned_phrases if cleaned_phrases else [text.lower().strip()]


    def _create_match(
        self,
        token: str,
        score: float,
        match_type: str,
        matched_phrase: str
    ) -> EvidenceMatch:
        """Helper to build a rich ClinicalEvidence match container."""
        if "_@_" in token:
            code, val_code = token.split("_@_", 1)
        else:
            code, val_code = token, "Y"

        ev_meta = self.evidences_meta.get(code, {})
        question = ev_meta.get("question_en", f"Clinical finding: {code}")
        data_type = ev_meta.get("data_type", "B")
        is_antecedent = ev_meta.get("is_antecedent", False)
        category = "Antecedent / Risk Factor" if is_antecedent else "Symptom / Sign"

        # Resolve human-readable finding
        if data_type == "B":
            finding = f"Present ({question})"
        else:
            vm = ev_meta.get("value_meaning", {})
            if isinstance(vm, dict) and str(val_code) in vm:
                val_en = vm[str(val_code)].get("en", str(val_code))
                finding = f"{val_en} ({question})"
            else:
                finding = f"{val_code} ({question})"

        return EvidenceMatch(
            token=token,
            code=code,
            value=val_code,
            question_en=question,
            finding_en=finding,
            score=score,
            match_type=match_type,
            matched_phrase=matched_phrase,
            category=category,
            data_type=data_type
        )

    def parse_text(
        self,
        text: str,
        semantic_threshold: float = 0.45
    ) -> NLPParseResult:
        """
        Parses free-form clinical symptom text and returns structured DDXPlus evidence matches.
        """
        phrases = self._clean_and_segment_text(text)
        matched_tokens: Dict[str, EvidenceMatch] = {}
        unmatched_phrases: List[str] = []

        full_lower = text.lower()

        # Step 1: Lexicon & Alias Exact Matching
        for phrase in phrases:
            matched_any_in_phrase = False

            # Check direct alias dictionary
            for alias, token_list in self.alias_to_tokens.items():
                if alias in phrase or phrase in alias:
                    for tok, conf in token_list:
                        if tok not in matched_tokens or conf > matched_tokens[tok].score:
                            matched_tokens[tok] = self._create_match(
                                token=tok,
                                score=conf,
                                match_type="lexicon_alias",
                                matched_phrase=phrase
                            )
                            matched_any_in_phrase = True

            # Check anatomical locations for pain
            for anat_alias, v_code in self.anatomical_aliases.items():
                if anat_alias in phrase:
                    tok = f"E_55_@_{v_code}"
                    if tok not in matched_tokens:
                        matched_tokens[tok] = self._create_match(
                            token=tok,
                            score=0.95,
                            match_type="anatomical_location",
                            matched_phrase=phrase
                        )
                        # Ensure base pain E_53 is also triggered
                        if "E_53" not in matched_tokens:
                            matched_tokens["E_53"] = self._create_match(
                                token="E_53",
                                score=1.0,
                                match_type="anatomical_location",
                                matched_phrase=phrase
                            )
                        matched_any_in_phrase = True

            # Check pain qualifiers (burning, sharp, etc.)
            for qual_word, v_code in self.pain_qualifiers.items():
                if qual_word in phrase:
                    tok = f"E_54_@_{v_code}"
                    if tok not in matched_tokens:
                        matched_tokens[tok] = self._create_match(
                            token=tok,
                            score=0.95,
                            match_type="pain_qualifier",
                            matched_phrase=phrase
                        )
                        matched_any_in_phrase = True

            # Step 2: Semantic TF-IDF Matching (fallback if no exact alias)
            if not matched_any_in_phrase and len(phrase.strip()) > 3:
                vec = self.tfidf.transform([phrase])
                sims = cosine_similarity(vec, self.tfidf_matrix)[0]
                best_idx = int(np.argmax(sims))
                best_score = float(sims[best_idx])

                if best_score >= semantic_threshold:
                    best_tok = self.doc_tokens[best_idx]
                    if best_tok not in matched_tokens or best_score > matched_tokens[best_tok].score:
                        matched_tokens[best_tok] = self._create_match(
                            token=best_tok,
                            score=best_score,
                            match_type="semantic_similarity",
                            matched_phrase=phrase
                        )
                        matched_any_in_phrase = True

            if not matched_any_in_phrase:
                unmatched_phrases.append(phrase)

        # Sort matches by score descending
        sorted_matches = sorted(list(matched_tokens.values()), key=lambda m: m.score, reverse=True)

        return NLPParseResult(
            raw_text=text,
            matched_evidences=sorted_matches,
            unmatched_phrases=unmatched_phrases
        )
