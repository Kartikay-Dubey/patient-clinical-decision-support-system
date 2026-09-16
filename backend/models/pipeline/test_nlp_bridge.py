"""
Verification & Demonstration Script for DDXPlus Natural Language to Evidence Bridge
Tests mapping of free-form clinical texts into structured DDXPlus evidences and predictions.
"""

import sys
import os
from pathlib import Path

# Ensure project root is in path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Handle Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from backend.models.pipeline.clinical_service import ClinicalDiagnosisService

def test_nlp_bridge():
    print("=" * 80)
    print("DDXPLUS NATURAL LANGUAGE EVIDENCE BRIDGE & DIAGNOSTIC SERVICE TEST")
    print("=" * 80)

    service = ClinicalDiagnosisService()

    test_queries = [
        {
            "text": "I have chest pain, nausea and difficulty breathing",
            "age": 52,
            "sex": "M"
        },
        {
            "text": "Severe burning stomach pain, acid reflux, chronic cough, and bitter taste in mouth",
            "age": 45,
            "sex": "F"
        },
        {
            "text": "High fever, coughing up phlegm, shaking chills, and shortness of breath",
            "age": 28,
            "sex": "M"
        },
        {
            "text": "Patient is a smoker with high blood pressure reporting sudden sharp chest pain radiating to left shoulder, breathlessness, and dizziness",
            "age": 60,
            "sex": "M"
        },
        {
            "text": "Swollen lips, itchy skin rash, and difficulty swallowing with severe fatigue",
            "age": 22,
            "sex": "F"
        },
        {
            "text": "I was at the gym earlier today and felt like having ice cream, but I have a runny nose, nasal congestion and sneezing",
            "age": 30,
            "sex": "F"
        }
    ]

    for idx, query in enumerate(test_queries, 1):
        print("\n" + "=" * 80)
        print(f"TEST QUERY #{idx}")
        print(f"Input Text: \"{query['text']}\"")
        print(f"Demographics: Age {query['age']}, Sex {query['sex']}")
        print("=" * 80)

        result = service.diagnose_free_text(
            text=query["text"],
            age=query["age"],
            sex=query["sex"],
            top_k=5
        )

        nlp = result["nlp_extraction"]
        print(f"\n[1] MATCHED DDXPLUS CLINICAL EVIDENCES ({nlp['matched_count']} findings):")
        print(f"    - Symptoms/Signs: {nlp['symptoms_count']} | Medical Antecedents/Risk Factors: {nlp['antecedents_count']}")
        print()
        
        for ev_idx, ev in enumerate(nlp["matched_evidences"], 1):
            print(f"    {ev_idx:2d}. Token: [{ev['token']}] | Score: {ev['score']:.2f} ({ev['match_type']})")
            print(f"        Category: {ev['category']} (Type: {ev['data_type']})")
            print(f"        Matched Phrase: \"{ev['matched_phrase']}\"")
            print(f"        Clinical Finding: {ev['finding_en']}")
            print()

        if nlp["unmatched_phrases"]:
            print(f"[2] UNMATCHED / LOW-CONFIDENCE PHRASES:")
            for up in nlp["unmatched_phrases"]:
                print(f"    - \"{up}\"")
            print()
        else:
            print(f"[2] UNMATCHED PHRASES: None (All clinical mentions successfully resolved)\n")

        print(f"[3] PREDICTED DIFFERENTIAL DIAGNOSIS CANDIDATES (Top-5):")
        print(f"    {'Rank':<5} {'Condition':<38} {'ICD-10':<8} {'Severity':<10} {'Probability':<10}")
        print(f"    {'-'*4:<5} {'-'*36:<38} {'-'*6:<8} {'-'*8:<10} {'-'*9:<10}")
        for cand in result["differential_diagnosis"]:
            print(f"    {cand['rank']:<5} {cand['condition_name']:<38} {cand['icd10_id']:<8} Level {cand['severity']:<4} {cand['probability_percent']:>6.2f}%")
        print()

if __name__ == "__main__":
    test_nlp_bridge()
