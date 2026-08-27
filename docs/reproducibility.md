# CrowdSentinel — Reproducibility & Experiment Verification Guide

**Project**: CrowdSentinel: AI-Based Early Crowd Risk Detection Using Spatial-Temporal Density and Motion Analysis  
**Benchmark Suite**: 18 Video Sequences (3,600 frames, 20 FPS, 640×480 VGA)  
**Deterministic Random Seed**: `42` (Fixed across all dataset generators, cross-validation splitters, and model initializers)

---

## 1. System & Environment Specifications

* **Operating System**: Windows 11 / Linux (Ubuntu 22.04 LTS tested)
* **Python Version**: Python 3.10+ (or Python 3.11)
* **Hardware Device Baseline**: Intel Core i7 CPU (1360P / 12 Cores, 16 Threads @ 2.2 GHz)
* **Core Dependencies**:
  * `torch >= 2.0.0`
  * `ultralytics >= 8.0.0` (YOLOv8n detector)
  * `opencv-python >= 4.8.0` (Farnebäck dense optical flow)
  * `scikit-learn >= 1.3.0` (Classifiers, scalers, cross-validation)
  * `numpy >= 1.24.0`
  * `pandas >= 2.0.0`
  * `matplotlib >= 3.7.0` & `seaborn >= 0.12.0`

---

## 2. Step-by-Step Reproduction Workflow

### Step 1: Synthesize the 18-Sequence Benchmark Dataset
To synthesize the standardized multi-scenario benchmark video suite with ground-truth frame-level annotations:
```powershell
python scratch/generate_expanded_dataset.py
```
This generates 18 video sequences in `datasets/raw/` with exact deterministic seed mappings (`201` to `212`).

### Step 2: Extract Computer Vision Features
Extract YOLOv8n detections, quadrant densities, and Farnebäck optical flow telemetry:
```powershell
python scratch/extract_expanded_features.py
```
Outputs: `results/dataset/expanded_extracted_features.csv` (3,600 frames).

### Step 3: Run Master ML Training, Optimization & Ablation
Train and evaluate all 8 model architectures, conduct 6-fold sequence cross-validation, feature ablation, temporal window comparisons, persistence suppression gating, and figure generation:
```powershell
python scratch/run_master_experiments.py
```

---

## 3. Verified Output Artifacts Matrix

| Artifact Path | Contents & Structure |
|:---|:---|
| `results/model_comparison.csv` | Full comparative benchmark (Macro F1, Accuracy, Precision, Recall, FAR, Fit Latency) across 8 models |
| `results/sequence_cv_results.csv` | 6-Fold GroupKFold cross-validation results across all 18 sequences |
| `results/ablation_results.csv` | Incremental feature ablation progression from Config A (Density Only) to Config F (Full System) |
| `results/alert_suppression_results.csv` | Performance metrics across persistence gating windows ($K = 1, 3, 5, 7, 10$) |
| `results/temporal_results.csv` | Comparison of rolling temporal window durations (3.0s, 5.0s, 7.0s) |
| `results/feature_importance.csv` | Gini MDI importance ranking of all 21 spatial-temporal physical indicators |
| `results/confusion_matrix.csv` | Final multi-class confusion matrix on the held-out test partition |
| `results/final_metrics.json` | Top-level JSON summary linking all empirical performance numbers |
| `results/plots/model_comparison.png` | 300 DPI publication horizontal bar chart comparing model Macro F1 scores |
| `results/plots/confusion_matrix.png` | 300 DPI publication normalized confusion matrix heatmap |
| `results/plots/feature_importance.png` | 300 DPI publication feature importance ranking bar chart |
| `results/plots/alert_suppression.png` | 300 DPI publication false alarm rate reduction vs Macro F1 trade-off curve |
| `results/plots/ablation_progression.png` | 300 DPI publication multi-stage ablation trajectory |

---

## 4. Verification Check

To verify that the generated results match the recorded findings:
```powershell
python -c "import json; m = json.load(open('results/final_metrics.json')); print(f'Best Model: {m[\"best_model\"]}, Test F1: {m[\"final_test_macro_f1\"]}, Test FAR: {m[\"final_test_far_pct\"]}%')"
```
Expected output:
```
Best Model: HistGradientBoosting (LightGBM Type), Test F1: 0.8266, Test FAR: 0.0%
```