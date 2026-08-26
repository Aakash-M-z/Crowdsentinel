"""
Model Training & Machine Learning Risk Classifier Pipeline
Trains supervised models (Random Forest, Gradient Boosting, MLP)
on 6-dimensional fused feature vectors F = [D, dD, M, dM, var_theta, I_flow].
Saves checkpoints, training history, and evaluation metrics.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from ml.evaluation.evaluator import ModelEvaluator

def train_classifier(
    X: np.ndarray,
    y: np.ndarray,
    model_type: str = "random_forest",
    random_seed: int = 42,
    save_path: str = "ml/training/checkpoints/risk_classifier.joblib"
) -> Tuple[Any, Dict[str, Any]]:
    """
    Trains a risk classification model with reproducible random seed and cross-validation.
    """
    np.random.seed(random_seed)
    
    if model_type == "random_forest":
        clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=4,
            random_state=random_seed
        )
    elif model_type == "gradient_boosting":
        clf = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            random_state=random_seed
        )
    elif model_type == "mlp":
        clf = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation="relu",
            max_iter=300,
            random_state=random_seed
        )
    else:
        raise ValueError(f"Unsupported model type: {model_type}")

    # Stratified K-Fold Cross Validation (5 folds)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_seed)
    cv_scores = cross_val_score(clf, X, y, cv=cv, scoring="f1_macro")

    # Fit final model
    clf.fit(X, y)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(clf, save_path)

    training_meta = {
        "model_type": model_type,
        "random_seed": random_seed,
        "n_samples": len(X),
        "cv_f1_macro_mean": float(np.mean(cv_scores)),
        "cv_f1_macro_std": float(np.std(cv_scores)),
        "feature_importances": clf.feature_importances_.tolist() if hasattr(clf, "feature_importances_") else [],
        "checkpoint_path": save_path
    }

    meta_path = save_path.replace(".joblib", "_meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(training_meta, f, indent=2)

    return clf, training_meta

if __name__ == "__main__":
    print("Train module ready. Use with feature dataset.")