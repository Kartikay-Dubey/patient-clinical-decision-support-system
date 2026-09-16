"""
Clinical Inspection Script for DDXPlus Patient Cases
Demonstrates human-readable resolution of patient records from DDXPlus.
"""

import sys
import os

# Ensure backend package is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

# Configure UTF-8 encoding for Windows stdout
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from backend.data.ddxplus.loader import DDXPlusDataLoader

def print_patient_case(case_num: int, patient):
    print("=" * 80)
    print(f"PATIENT CASE #{case_num}")
    print("=" * 80)
    
    # Demographics
    print("[1] DEMOGRAPHICS:")
    print(f"    - Age: {patient.age} years old")
    print(f"    - Biological Sex: {'Male' if patient.sex == 'M' else 'Female'} ({patient.sex})")
    print()

    # Ground Truth Diagnosis
    print("[2] GROUND-TRUTH PATHOLOGY (TRUE DIAGNOSIS):")
    print(f"    - Disease / Condition: {patient.pathology}")
    print(f"    - ICD-10 Code: {patient.icd10_id}")
    print(f"    - Severity Level: Level {patient.severity} / 5")
    print()

    # Initial Evidence
    print("[3] INITIAL EVIDENCE (CHIEF COMPLAINT):")
    if patient.initial_evidence:
        ie = patient.initial_evidence
        print(f"    - Evidence Code: {ie.code}")
        print(f"    - Clinical Question: \"{ie.question_en}\"")
        print(f"    - Finding: {ie.value_meaning_en} ({ie.category})")
    else:
        print("    - None specified")
    print()

    # Positive Evidences - Symptoms & Signs
    print(f"[4] ACTIVE SYMPTOMS & CLINICAL SIGNS ({len(patient.symptoms)} positive findings):")
    for idx, s in enumerate(patient.symptoms, 1):
        print(f"    {idx:2d}. [{s.token}] {s.question_en}")
        print(f"        -> Finding: {s.value_meaning_en} (Data Type: {s.data_type})")
    print()

    # Positive Evidences - Medical Antecedents & Risk Factors
    print(f"[5] CLINICAL ANTECEDENTS & RISK FACTORS ({len(patient.antecedents)} positive findings):")
    if patient.antecedents:
        for idx, a in enumerate(patient.antecedents, 1):
            print(f"    {idx:2d}. [{a.token}] {a.question_en}")
            print(f"        -> Finding: {a.value_meaning_en} (Data Type: {a.data_type})")
    else:
        print("    - No positive antecedents or risk factors recorded")
    print()

    # Differential Diagnosis
    print(f"[6] EXPERT DIFFERENTIAL DIAGNOSIS RANKING ({len(patient.differential_diagnosis)} candidates):")
    print(f"    {'Rank':<5} {'Condition':<40} {'ICD-10':<8} {'Severity':<10} {'Probability':<10}")
    print(f"    {'-'*4:<5} {'-'*38:<40} {'-'*6:<8} {'-'*8:<10} {'-'*9:<10}")
    for rank, ddx in enumerate(patient.differential_diagnosis, 1):
        is_true = " [True Diagnosis]" if ddx.condition_name == patient.pathology else ""
        print(f"    {rank:<5} {ddx.condition_name + is_true:<40} {ddx.icd10_id:<8} Level {ddx.severity:<4} {ddx.probability*100:>6.2f}%")
    print()

def main():
    loader = DDXPlusDataLoader()
    print("Loading test split sample cases...\n")
    
    # Pick a diverse set of cases
    target_conditions = ["GERD", "Bronchitis", "Spontaneous pneumothorax", "Anaphylaxis", "Possible NSTEMI / STEMI"]
    found_cases = {}
    
    for patient in loader.stream_interpreted_patients(split="test"):
        pathology = patient.pathology
        if pathology in target_conditions and pathology not in found_cases:
            found_cases[pathology] = patient
        if len(found_cases) >= 4:
            break

    for idx, (pathology, pt) in enumerate(found_cases.items(), 1):
        print_patient_case(idx, pt)

if __name__ == "__main__":
    main()
