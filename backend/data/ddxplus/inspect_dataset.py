import os
import json
import csv
import ast
from collections import Counter, defaultdict

RAW_DIR = r"e:\Programs\Self_Projects\patient-diagnosis-system\backend\data\ddxplus\raw"

def analyze():
    print("=" * 60)
    print("DDXPLUS DATASET COMPREHENSIVE INSPECTION & AUDIT")
    print("=" * 60)
    
    # 1. Conditions
    cond_path = os.path.join(RAW_DIR, "release_conditions.json")
    with open(cond_path, "r", encoding="utf-8") as f:
        conditions = json.load(f)
    
    total_conditions = len(conditions)
    severities = Counter()
    cond_keys = set()
    symptoms_per_cond = []
    antecedents_per_cond = []
    
    for c_name, c_data in conditions.items():
        cond_keys.update(c_data.keys())
        severities[c_data.get("severity", "Unknown")] += 1
        symptoms_per_cond.append(len(c_data.get("symptoms", {})))
        antecedents_per_cond.append(len(c_data.get("antecedents", {})))
        
    print(f"\n1. CONDITIONS (release_conditions.json)")
    print(f"   Total Conditions / Pathologies: {total_conditions}")
    print(f"   Metadata Fields per condition: {sorted(list(cond_keys))}")
    print(f"   Severity Distribution: {dict(severities)}")
    print(f"   Avg Symptoms per condition: {sum(symptoms_per_cond)/len(symptoms_per_cond):.2f} (min: {min(symptoms_per_cond)}, max: {max(symptoms_per_cond)})")
    print(f"   Avg Antecedents per condition: {sum(antecedents_per_cond)/len(antecedents_per_cond):.2f} (min: {min(antecedents_per_cond)}, max: {max(antecedents_per_cond)})")
    
    # 2. Evidences
    ev_path = os.path.join(RAW_DIR, "release_evidences.json")
    with open(ev_path, "r", encoding="utf-8") as f:
        evidences = json.load(f)
        
    total_evidences = len(evidences)
    data_types = Counter()
    is_antecedent_count = Counter()
    ev_keys = set()
    
    for ev_name, ev_data in evidences.items():
        ev_keys.update(ev_data.keys())
        data_types[ev_data.get("data_type", "Unknown")] += 1
        is_antecedent_count[ev_data.get("is_antecedent", False)] += 1
        
    print(f"\n2. EVIDENCES (release_evidences.json)")
    print(f"   Total Evidences: {total_evidences}")
    print(f"   Metadata Fields per evidence: {sorted(list(ev_keys))}")
    print(f"   Data Types: {dict(data_types)}")
    print(f"   Is Antecedent (Risk factor/Medical history): True={is_antecedent_count[True]}, False (Symptoms/Signs)={is_antecedent_count[False]}")

    # 3. Patient Splits
    splits = {
        "Train": "release_train_patients",
        "Validation": "release_validate_patients",
        "Test": "release_test_patients"
    }
    
    split_stats = {}
    
    print(f"\n3. PATIENT DATASETS AUDIT")
    for split_name, fname in splits.items():
        p_path = os.path.join(RAW_DIR, fname)
        row_count = 0
        missing_counts = defaultdict(int)
        sex_counts = Counter()
        ages = []
        pathology_counts = Counter()
        evidence_counts = []
        ddx_counts = []
        initial_ev_present = 0
        
        with open(p_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fields = reader.fieldnames
            
            for row in reader:
                row_count += 1
                for k, v in row.items():
                    if v is None or v.strip() == "":
                        missing_counts[k] += 1
                
                # Parse fields
                age = int(row["AGE"])
                ages.append(age)
                sex = row["SEX"]
                sex_counts[sex] += 1
                pathology = row["PATHOLOGY"]
                pathology_counts[pathology] += 1
                
                # Evidences string parsing (list format: "['E_1', 'E_2']")
                ev_str = row["EVIDENCES"]
                # quick count by comma if starts with [
                if ev_str.startswith("[") and ev_str.endswith("]"):
                    ev_items = [x.strip() for x in ev_str[1:-1].split(",") if x.strip()]
                    evidence_counts.append(len(ev_items))
                else:
                    evidence_counts.append(0)
                    
                ddx_str = row["DIFFERENTIAL_DIAGNOSIS"]
                # ddx is list of [cond, prob]
                if ddx_str.startswith("[") and ddx_str.endswith("]"):
                    # count occurrences of condition quotes or inner brackets
                    # using ast.literal_eval for precise parsing sample
                    ddx_items = [x for x in ddx_str.split("],") if x]
                    ddx_counts.append(len(ddx_items))
                else:
                    ddx_counts.append(0)
                    
                if row.get("INITIAL_EVIDENCE"):
                    initial_ev_present += 1

        split_stats[split_name] = {
            "file": fname,
            "fields": fields,
            "records": row_count,
            "missing": dict(missing_counts),
            "sex": dict(sex_counts),
            "age_min": min(ages),
            "age_max": max(ages),
            "age_mean": sum(ages) / len(ages),
            "unique_pathologies": len(pathology_counts),
            "avg_evidences": sum(evidence_counts) / len(evidence_counts),
            "avg_ddx": sum(ddx_counts) / len(ddx_counts),
            "initial_ev_present": initial_ev_present
        }
        
        print(f"\n   --- {split_name} Split ({fname}) ---")
        print(f"   Total Records: {row_count:,}")
        print(f"   CSV Columns: {fields}")
        print(f"   Missing / Null Values: {dict(missing_counts) if missing_counts else 'None (0 missing)'}")
        print(f"   Demographics - Sex: {dict(sex_counts)} (M: {sex_counts['M']/row_count*100:.2f}%, F: {sex_counts['F']/row_count*100:.2f}%)")
        print(f"   Demographics - Age: Min={min(ages)}, Max={max(ages)}, Mean={sum(ages)/len(ages):.2f}")
        print(f"   Unique Ground-Truth Pathologies: {len(pathology_counts)} / {total_conditions}")
        print(f"   Avg Evidences per Patient: {sum(evidence_counts)/len(evidence_counts):.2f} (min: {min(evidence_counts)}, max: {max(evidence_counts)})")
        print(f"   Avg Differential Diagnoses per Patient: {sum(ddx_counts)/len(ddx_counts):.2f}")
        print(f"   Initial Evidence Present: {initial_ev_present:,} / {row_count:,} (100%)")

    total_records = sum(s["records"] for s in split_stats.values())
    print(f"\n" + "=" * 60)
    print(f"DATASET TOTALS SUMMARY:")
    print(f"Total Patient Cases: {total_records:,}")
    print(f"  - Train: {split_stats['Train']['records']:,} ({split_stats['Train']['records']/total_records*100:.2f}%)")
    print(f"  - Validation: {split_stats['Validation']['records']:,} ({split_stats['Validation']['records']/total_records*100:.2f}%)")
    print(f"  - Test: {split_stats['Test']['records']:,} ({split_stats['Test']['records']/total_records*100:.2f}%)")
    print(f"Conditions: {total_conditions}")
    print(f"Evidences: {total_evidences}")
    print("=" * 60)

if __name__ == "__main__":
    analyze()
