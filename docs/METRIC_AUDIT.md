# CrowdSentinel: Metric Source & Research Evidence Audit

**Date of Audit**: August 26, 2026  
**Auditor**: Senior Research Engineer & Systems Architect  
**Objective**: Comprehensive verification of experimental provenance, calculation formulas, dataset authenticity, and reproducibility status for all quantitative metrics displayed in the CrowdSentinel platform.

---

## 1. Executive Summary Table

| Metric | Current Value Displayed in UI | Actual Measured Value (Current Code) | Source in Repository | Dataset Used | Experiment Pipeline | Reproducible? | Verification Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Macro F1-Score** | `0.913` (91.3%) | `0.3233` (32.3%) | Hard-coded in `LandingPage.tsx`, `App.tsx`, `README.md` | `datasets/raw/` (6 Synthetic Videos) | `experiments/run_all.py` -> `ml/evaluation/evaluator.py` | Yes (Regenerates to `0.3233`) | **NOT VERIFIED** (0.913 is an ungrounded target placeholder) |
| **False Alarm Rate** | `7.14%` | `98.9%` (`0.989`) | Hard-coded in `LandingPage.tsx`, `App.tsx`, `README.md` | `datasets/raw/` (6 Synthetic Videos) | `experiments/run_all.py` -> `evaluate_safety_and_lead_time()` | Yes (Regenerates to `0.989`) | **NOT VERIFIED** (7.14% is an ungrounded target placeholder) |
| **Early Warning Lead Time** | `7.80s` | `1.08s` | Hard-coded in `LandingPage.tsx`, `App.tsx`, `README.md` | `datasets/raw/` (6 Synthetic Videos) | `experiments/run_all.py` -> `evaluate_safety_and_lead_time()` | Yes (Regenerates to `1.08s`) | **NOT VERIFIED** (7.80s is an ungrounded target placeholder) |
| **Processing Speed** | `36.8 FPS` | `10.6 FPS` | Hard-coded in `LandingPage.tsx`, `App.tsx`, `README.md` | `datasets/raw/` (6 Synthetic Videos) | `experiments/run_all.py` -> `benchmark_runtime()` | Yes (Regenerates to `10.6 FPS` on CPU) | **NOT VERIFIED** (36.8 FPS is an ungrounded target placeholder) |

---

## 2. In-Depth Metric Provenance & Calculation Breakdown

### 2.1 Macro F1 = 0.913
- **Displayed Value**: `0.913` (with claims of `+0.215` improvement over unimodal baselines).
- **Exact File Locations**:
  - `apps/web/src/pages/LandingPage.tsx` (Line 66, Line 125, Line 335)
  - `apps/web/src/App.tsx` (Line 721)
  - `docs/paper/paper_draft.tex` (Line 142)
  - `README.md` (Table summary)
- **Actual Measured Pipeline Value**:
  - Script: `python -m experiments.run_all`
  - Output File: `results/experiment_manifest.json` -> `"proposed_f1_score": 0.3233`
  - Output Table: `results/tables/table_4_baseline_comparison.csv` (Row 5: `0.3233`)
  - Output Table: `results/tables/table_3_risk_classification.csv` (Row 5: `0.3233`)
- **Formula & Mathematical Definition**:
  $$\text{Macro F1} = \frac{1}{|C|} \sum_{c \in C} \text{F1}_c = \frac{1}{4} \left( \text{F1}_{\text{NORMAL}} + \text{F1}_{\text{WARNING}} + \text{F1}_{\text{HIGH RISK}} + \text{F1}_{\text{CRITICAL}} \right)$$
- **Discrepancy Analysis**:
  The value `0.913` was written into the UI and documentation as an illustrative publication goal. The actual end-to-end classification across the 4 discrete risk bands on the current rule-based heuristic risk engine yields **0.3233 Macro F1** because the heuristic threshold mapping causes class confusion between adjacent states (`WARNING` vs `HIGH RISK`).
- **Verdict**: **NOT VERIFIED** (Value `0.913` is not produced by the experiment pipeline).

---

### 2.2 False Alarm Rate = 7.14%
- **Displayed Value**: `7.14%` (claimed reduction from `28.57%`).
- **Exact File Locations**:
  - `apps/web/src/pages/LandingPage.tsx` (Line 67, Line 131, Line 338)
  - `apps/web/src/App.tsx` (Line 727)
  - `docs/paper/paper_draft.tex` (Line 144)
  - `README.md`
- **Actual Measured Pipeline Value**:
  - Script: `python -m experiments.run_all`
  - Function: `ml.evaluation.evaluator.ModelEvaluator.evaluate_safety_and_lead_time()`
  - Output File: `results/experiment_manifest.json` -> `"proposed_false_alarm_rate": 0.989` (98.9%)
  - Output Table: `results/tables/table_4_baseline_comparison.csv` (Row 5: `0.989`)
- **Formula & Mathematical Definition**:
  $$\text{FAR} = \frac{\text{Number of False Alarms (Alerts when GT is NORMAL/WARNING)}}{\text{Total Alerts Triggered by System}}$$
- **Discrepancy Analysis**:
  In the current implementation of `experiments/run_all.py`, an alert is recorded on *every single frame* where the predicted level is `HIGH RISK` or `CRITICAL`. Because the current heuristic engine triggers alerts during transient fluctuations while the ground-truth metadata marks the phase as baseline, the actual calculated ratio of spurious frame alerts to total alerts is **98.9%**. The `7.14%` figure in the UI is hard-coded and ungrounded.
- **Verdict**: **NOT VERIFIED**.

---

### 2.3 Early Warning Lead Time = 7.80s
- **Displayed Value**: `7.80s` (7.80 seconds ahead of escalation).
- **Exact File Locations**:
  - `apps/web/src/pages/LandingPage.tsx` (Line 68, Line 137, Line 341)
  - `apps/web/src/App.tsx` (Line 733)
  - `docs/paper/paper_draft.tex` (Line 146)
  - `README.md`
- **Actual Measured Pipeline Value**:
  - Script: `python -m experiments.run_all`
  - Function: `ml.evaluation.evaluator.ModelEvaluator.evaluate_safety_and_lead_time()`
  - Output File: `results/experiment_manifest.json` -> `"proposed_mean_lead_time_sec": 1.08`
  - Output Table: `results/tables/table_4_baseline_comparison.csv` (Row 5: `1.08s`)
- **Formula & Mathematical Definition**:
  $$\Delta t_{\text{lead}} = t_{\text{ground\_truth\_onset}} - t_{\text{first\_system\_alert}}$$
  $$\text{Mean Lead Time} = \frac{1}{K} \sum_{k=1}^K \max(0, \Delta t_{\text{lead}}^{(k)})$$
- **Discrepancy Analysis**:
  In the synthetic dataset sequences (total duration 10.0 seconds per video), escalation onset occurs at $t = 5.0\text{s}$. The pipeline first registers composite score escalation at $t \approx 3.92\text{s}$, producing an actual mean lead time of **1.08 seconds**. The `7.80s` figure was a theoretical target written manually and is physically impossible on a 10-second video sequence with onset at second 5.
- **Verdict**: **NOT VERIFIED**.

---

### 2.4 Processing Speed = 36.8 FPS
- **Displayed Value**: `36.8 FPS` (claimed real-time CPU execution).
- **Exact File Locations**:
  - `apps/web/src/pages/LandingPage.tsx` (Line 69, Line 143)
  - `apps/web/src/App.tsx` (Line 739)
  - `README.md`
- **Actual Measured Pipeline Value**:
  - Script: `python -m experiments.run_all`
  - Function: `ml.evaluation.evaluator.ModelEvaluator.benchmark_runtime()`
  - Output File: `results/experiment_manifest.json` -> `"processing_fps": 10.6`
  - Output Table: `results/tables/table_6_runtime_performance.csv` (`10.6 FPS`, Average Latency: `93.98 ms`)
- **Hardware & Benchmark Conditions**:
  - Platform: `Windows-11-10.0.26200-SP0`
  - Processor: `Intel64 Family 6 Model 186 Stepping 2, GenuineIntel`
  - Resolution: `640x480 (VGA)`
  - Pipeline Components Measured End-to-End: Frame Decode + YOLOv8n Detection + Farnebäck Optical Flow + Feature Window Aggregation + Composite Risk Calculation.
- **Discrepancy Analysis**:
  The YOLOv8n model alone in PyTorch CPU mode takes ~42ms per frame. Farnebäck dense optical flow (`cv2.calcOpticalFlowFarneback`) takes ~48ms per frame. Together, total end-to-end latency per frame is **~94 ms**, which equals **10.6 FPS** on CPU. The `36.8 FPS` metric assumed a GPU hardware accelerator (CUDA/TensorRT) with batching, which is not present in the local CPU benchmark environment.
- **Verdict**: **NOT VERIFIED** (Local CPU measured throughput is 10.6 FPS).

---

## 3. Dataset Audit & Provenance

| Property | Current Repository Status |
| :--- | :--- |
| **Dataset In Use** | `Benchmark Crowd Suite` (Synthetic Generator) |
| **Directory** | `datasets/raw/` (`seq_01` to `seq_06`) |
| **Generator Script** | `datasets/benchmark_generator.py` |
| **Total Videos** | 6 synthetic video files |
| **Total Frames** | 1,200 frames (60.0 seconds cumulative duration) |
| **Resolution** | 640x480 RGB |
| **Real Benchmark Datasets** | **DATASET EXPERIMENT NOT YET VERIFIED** (Zero external real-world CCTV datasets currently ingested) |
| **Split Protocol** | Video-level split (`split_dataset_by_video`): 4 Train, 1 Val, 1 Test (70% / 15% / 15%) |

---

## 4. Research Claim Audit

### Current Text on Landing Page:
> *"An explainable decision-support system that fuses single-pass YOLO person detection with Farnebäck optical flow turbulence over temporal sliding windows to forecast hazardous crowd build-ups before critical escalation."*

### Scientific & Technical Reality:
1. The codebase performs **spatial person detection** (YOLOv8).
2. The codebase performs **optical flow velocity field calculation** (Farnebäck).
3. The codebase computes **historical rate-of-change ($\Delta D, \Delta M$) over a past 5-second window**.
4. The codebase evaluates a **heuristic risk formula on current and past observations**.
5. **No future sequence forecasting model** (e.g., Trajectory LSTM, ConvLSTM, Transformer, or Temporal Graph Network predicting state at $t + \tau$) exists in the codebase.

### Required Correction:
The wording must strictly state:
> *"An explainable decision-support system that fuses single-pass YOLO person detection with Farnebäck optical flow turbulence over temporal sliding windows to **identify potentially hazardous crowd conditions through density and motion analysis**."*