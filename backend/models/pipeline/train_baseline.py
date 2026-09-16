"""
Reproducible Training Pipeline for DDXPlus Baseline Supervised Model
Uses SGD Logistic Regression (log_loss) with sparse multi-hot evidence & demographic features.
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, List, Any
import numpy as np
import joblib
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    top_k_accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)

# Set path to project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.data.ddxplus.loader import DDXPlusDataLoader
from backend.models.pipeline.feature_extractor import DDXPlusFeatureExtractor

MODEL_DIR = PROJECT_ROOT / "backend" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_and_evaluate(
    batch_size: int = 25000,
    epochs: int = 4,
    alpha: float = 1e-5,
    random_state: int = 42
):
    print("=" * 80)
    print("DDXPLUS BASELINE MODEL TRAINING PIPELINE")
    print("=" * 80)
    
    loader = DDXPlusDataLoader()
    
    # 1. Setup Feature Extractor & Label Encoder
    print("\n[Step 1/5] Building Feature Vocabulary & Label Encoder...")
    feature_extractor = DDXPlusFeatureExtractor().fit_from_metadata()
    print(f"  - Total Sparse Features: {feature_extractor.num_features}")

    conditions = sorted(list(loader.load_conditions().keys()))
    label_encoder = LabelEncoder().fit(conditions)
    all_classes = np.arange(len(label_encoder.classes_))
    print(f"  - Total Target Classes (Pathologies): {len(all_classes)}")

    # Save feature extractor and label encoder
    joblib.dump(feature_extractor, MODEL_DIR / "feature_extractor.joblib")
    joblib.dump(label_encoder, MODEL_DIR / "label_encoder.joblib")
    print("  - Saved feature_extractor.joblib and label_encoder.joblib")

    # 2. Initialize Baseline SGD Logistic Regression Model
    print("\n[Step 2/5] Initializing SGDClassifier (Logistic Regression baseline)...")
    clf = SGDClassifier(
        loss="log_loss",       # Multinomial Logistic Regression equivalent
        penalty="l2",
        alpha=alpha,
        max_iter=1,            # 1 iteration per partial_fit
        warm_start=True,
        random_state=random_state,
        learning_rate="optimal",
        eta0=0.01
    )

    # 3. Stream & Train on Official Train Split
    train_path = loader.get_split_path("train")
    print(f"\n[Step 3/5] Streaming & Training on Official Train Split ({train_path.name})...")
    print(f"  - Batch Size: {batch_size:,} samples | Epochs: {epochs}")

    start_train_time = time.time()
    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        batch_pts = []
        batch_labels = []
        processed_count = 0
        batch_idx = 0

        for pt in loader.stream_patients(split="train", parse_structures=True):
            batch_pts.append(pt)
            batch_labels.append(pt["pathology"])
            processed_count += 1

            if len(batch_pts) >= batch_size:
                batch_idx += 1
                X_batch = feature_extractor.transform_batch(batch_pts)
                y_batch = label_encoder.transform(batch_labels)
                clf.partial_fit(X_batch, y_batch, classes=all_classes)
                batch_pts = []
                batch_labels = []

        # Process any remaining records
        if batch_pts:
            batch_idx += 1
            X_batch = feature_extractor.transform_batch(batch_pts)
            y_batch = label_encoder.transform(batch_labels)
            clf.partial_fit(X_batch, y_batch, classes=all_classes)

        epoch_duration = time.time() - epoch_start
        print(f"  -> Epoch {epoch}/{epochs} Completed in {epoch_duration:.1f}s (Processed {processed_count:,} patients across {batch_idx} batches)")

    total_train_time = time.time() - start_train_time
    print(f"\nTraining Complete in {total_train_time:.1f}s.")

    # Save trained baseline model
    model_save_path = MODEL_DIR / "baseline_logistic_regression.joblib"
    joblib.dump(clf, model_save_path)
    print(f"Saved trained model to {model_save_path}")

    # 4. Evaluate on Official Validation and Test Splits
    print("\n[Step 4/5] Evaluating on Official Validation and Test Splits...")
    
    evaluation_results = {}
    
    for split_name in ["validate", "test"]:
        print(f"\n  --- Running Evaluation on '{split_name}' Split ---")
        eval_start = time.time()
        
        all_y_true = []
        all_y_proba = []
        batch_pts = []
        batch_labels = []
        
        for pt in loader.stream_patients(split=split_name, parse_structures=True):
            batch_pts.append(pt)
            batch_labels.append(pt["pathology"])
            
            if len(batch_pts) >= batch_size:
                X_batch = feature_extractor.transform_batch(batch_pts)
                y_batch = label_encoder.transform(batch_labels)
                proba_batch = clf.predict_proba(X_batch)
                
                all_y_true.append(y_batch)
                all_y_proba.append(proba_batch)
                batch_pts = []
                batch_labels = []

        if batch_pts:
            X_batch = feature_extractor.transform_batch(batch_pts)
            y_batch = label_encoder.transform(batch_labels)
            proba_batch = clf.predict_proba(X_batch)
            all_y_true.append(y_batch)
            all_y_proba.append(proba_batch)

        y_true = np.concatenate(all_y_true)
        y_proba = np.vstack(all_y_proba)
        y_pred = np.argmax(y_proba, axis=1)

        # Compute Metrics
        acc_top1 = accuracy_score(y_true, y_pred)
        acc_top3 = top_k_accuracy_score(y_true, y_proba, k=3, labels=all_classes)
        acc_top5 = top_k_accuracy_score(y_true, y_proba, k=5, labels=all_classes)
        
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average="macro", zero_division=0
        )
        weighted_precision, weighted_recall, weighted_f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average="weighted", zero_division=0
        )

        eval_duration = time.time() - eval_start
        print(f"  Results for {split_name} ({len(y_true):,} samples in {eval_duration:.1f}s):")
        print(f"    • Top-1 Accuracy: {acc_top1*100:.2f}%")
        print(f"    • Top-3 Accuracy: {acc_top3*100:.2f}%")
        print(f"    • Top-5 Accuracy: {acc_top5*100:.2f}%")
        print(f"    • Macro-Precision: {precision*100:.2f}%")
        print(f"    • Macro-Recall:    {recall*100:.2f}%")
        print(f"    • Macro-F1:        {f1*100:.2f}%")
        print(f"    • Weighted F1:     {weighted_f1*100:.2f}%")

        cm = confusion_matrix(y_true, y_pred, labels=all_classes)

        # Save confusion matrix for test set
        if split_name == "test":
            cm_path = MODEL_DIR / "confusion_matrix_test.csv"
            header = ",".join(label_encoder.classes_)
            np.savetxt(cm_path, cm, fmt="%d", delimiter=",", header=header, comments="")
            print(f"    • Saved test confusion matrix to {cm_path.name}")

        evaluation_results[split_name] = {
            "samples": int(len(y_true)),
            "top1_accuracy": float(acc_top1),
            "top3_accuracy": float(acc_top3),
            "top5_accuracy": float(acc_top5),
            "macro_precision": float(precision),
            "macro_recall": float(recall),
            "macro_f1": float(f1),
            "weighted_f1": float(weighted_f1)
        }

    # Save metrics report JSON
    metrics_path = MODEL_DIR / "evaluation_results.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "model": "SGD Logistic Regression Baseline",
            "epochs": epochs,
            "batch_size": batch_size,
            "alpha": alpha,
            "features_count": feature_extractor.num_features,
            "classes_count": len(label_encoder.classes_),
            "results": evaluation_results
        }, f, indent=2)
    print(f"\nSaved metrics summary to {metrics_path}")

    # 5. Summary
    print("\n[Step 5/5] Training and Evaluation Complete Successfully!")
    return evaluation_results

if __name__ == "__main__":
    train_and_evaluate(batch_size=30000, epochs=4, alpha=1e-5)
