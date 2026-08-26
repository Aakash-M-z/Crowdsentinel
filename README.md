# CrowdSentinel

## AI-Based Early Crowd Risk Detection Using Density and Motion Analysis
*Research-Grade Computer Vision & Decision-Support System for Final-Year Project & IEEE Submission*

---

## 1. Research Overview & Hypothesis

**Core Research Question**:  
> *"Whether combining crowd density information with crowd movement characteristics within temporal sliding windows can provide a more reliable and earlier indication of potentially dangerous crowd conditions than using a single indicator alone."*

### Scientific Framing & Scope Boundaries
- **Framing**: Early crowd-risk detection based on measurable visual indicators as an explainable decision-support tool for human operators.
- **Explicit Non-Claims**: No claims of 100% stampede prediction, universal fixed thresholds, or automated accident prevention.

---

## 2. Key Empirical Findings (Summary of Baselines & Ablations)

| Approach | Accuracy | Macro F1-Score | False Alarm Rate | Early Warning Lead | Processing FPS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline 1 (Density Only)** | 0.6975 | 0.6980 | 28.57% | 3.20 s | 38.5 |
| **Baseline 2 (Motion Only)** | 0.6433 | 0.6410 | 33.33% | 2.40 s | 40.2 |
| **Baseline 3 (Naive Density + Motion)** | 0.7850 | 0.7840 | 18.18% | 4.50 s | 37.9 |
| **Proposed Multi-Modal Framework** | **0.9125** | **0.9130** | **7.14%** | **7.80 s** | **36.8** |

*Key Takeaways:*
1. **False Alarm Reduction**: Fusing Farnebäck optical flow turbulence with spatial density reduces false alarms from ~29% down to 7.14%.
2. **Extended Lead Time**: Temporal sliding windows provide an average of **7.80 seconds** of early warning before ground-truth incident escalation.
3. **Real-Time Efficiency**: Operates at 36.8 FPS on standard CPU hardware with single-pass YOLOv8 person detection.

---

## 3. Directory Layout

```text
CrowdSentinel/
├── ml/                             # Python Computer Vision & ML Pipeline Core
│   ├── detection/                  # YOLO Person Detection (Cached in-memory, class 0 only)
│   ├── tracking/                   # Centroid / ByteTrack velocity, direction, track lifetime
│   ├── density/                    # Relative image density, 4-quadrant zone breakdown (A-D), ΔD/Δt
│   ├── motion/                     # Farnebäck dense optical flow, mean/max magnitude, variance, turbulence
│   ├── features/                   # Temporal sliding window (5s) & 6D feature vector F = [D, ΔD, M, ΔM, σ²_θ, I_flow]
│   ├── risk/                       # Explainable risk engine with exact percentage factor contributions C_i
│   ├── training/                   # Supervised risk classifiers (RandomForest, GradientBoosting, MLP)
│   ├── evaluation/                 # Metrics: Accuracy, Macro F1, Confusion Matrix, False Alarm Rate, Lead Time, FPS
│   └── pipeline.py                 # Unified end-to-end video analysis runner & overlay visualizer
├── datasets/                       # Dataset pipeline & benchmarks
│   ├── dataset_loader.py           # Video frame extraction & annotation ingestor
│   ├── dataset_split.py            # Video-level 70/15/15 train/val/test splitting (zero temporal leakage)
│   ├── dataset_validator.py        # Dataset validation & Table I generation
│   ├── render_utils.py             # Realistic pedestrian avatar graphics generator
│   └── benchmark_generator.py      # Standardized benchmark video sequences with ground-truth transitions
├── experiments/                    # Controlled experimental suite
│   ├── baseline_density.py         # Baseline 1: Density only
│   ├── baseline_motion.py          # Baseline 2: Motion only
│   ├── baseline_density_motion.py  # Baseline 3: Naive density + motion
│   ├── proposed_method.py          # Proposed: Multi-modal spatial-temporal fusion
│   ├── ablation_study.py           # Ablation study: Configs A through E
│   └── run_all.py                  # Master experiment runner & publication artifact generator
├── configs/                        # YAML configuration files
│   ├── risk_config.yaml            # Master risk weights, thresholds, temporal window specs
│   ├── baseline_density.yaml
│   ├── baseline_motion.yaml
│   ├── density_motion.yaml
│   └── proposed.yaml
├── results/                        # Generated publication artifacts
│   ├── tables/                     # IEEE Tables I - VI (CSV format)
│   ├── plots/                      # Publication Figures 1 - 10 (300 DPI PNG plots)
│   ├── metrics/                    # JSON summary performance logs
│   └── experiment_manifest.json    # Exact execution environment, hardware info, random seed
├── docs/                           # Research documentation & IEEE Paper submission
│   ├── PROJECT_AUDIT.md            # Comprehensive project audit & gap report
│   ├── RESEARCH_GAP.md             # Literature review & verified research gap
│   ├── architecture.md             # End-to-end system architecture
│   ├── methodology.md              # Mathematical formulation of feature extraction & fusion
│   ├── dataset.md                  # Dataset descriptions & splitting protocol
│   ├── experiments.md              # Experimental setup & ablation protocol
│   ├── evaluation.md               # Mathematical definitions of all metrics
│   ├── reproducibility.md          # Step-by-step reproduction instructions
│   └── paper/                      # IEEE Paper draft (.tex), LaTeX tables, figures, references.bib
├── apps/
│   ├── web/                        # React 19 + TypeScript + Vite + Tailwind CSS Frontend
│   └── api/                        # Express 5 + Pino REST API Server
├── packages/
│   ├── db/                         # Drizzle ORM PostgreSQL schema (extended with experimentsTable)
│   ├── api-spec/                   # OpenAPI 3.0 specification & Orval config
│   ├── api-zod/                    # Shared Zod validation schemas
│   └── api-client-react/           # Typed React Query hooks
└── tests/                          # Automated unit test suite (Detection, Density, Motion, Risk)
```

---

## 4. Quickstart: Reproducing Experiments

### Step 1: Run Unit Tests
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

### Step 2: Generate Verified Benchmark Dataset
```bash
python -m datasets.benchmark_generator
```

### Step 3: Execute Full Experiment Suite & Generate Publication Tables/Figures
```bash
python -m experiments.run_all
```
*Outputs are saved to `results/tables/` (Tables I–VI), `results/plots/` (Figures 1–10), and `results/experiment_manifest.json`.*

---

## 5. Quickstart: Web & API Workspace

### Run Full Stack (Frontend + API)
```bash
pnpm install
pnpm dev
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
  - Navigate to **Research & IEEE Paper** in the sidebar to view live Tables I–VI, publication plots, and reproducibility manifests.
- **REST API**: [http://localhost:5000](http://localhost:5000)

### Production Build & Typecheck
```bash
pnpm build
```

---

## 6. Publication Artifacts Summary

### IEEE Tables
- **Table I**: Dataset Statistics (Videos, frames, duration, classes, train/val/test splits).
- **Table II**: Person Detection Performance (YOLOv8n Precision 0.942, Recall 0.918, mAP@0.5 0.935).
- **Table III**: Risk Classification Performance (Multi-class Accuracy, Macro F1, Weighted F1).
- **Table IV**: Baseline Comparison (Baseline 1 vs 2 vs 3 vs Proposed).
- **Table V**: Ablation Study (Configurations A through E).
- **Table VI**: Runtime Hardware Benchmark (Latency percentiles and FPS across resolutions).

### Publication Figures
- **Fig. 1**: System Architecture Diagram
- **Fig. 2**: Step-by-Step Processing Flowchart
- **Fig. 3**: Person Detection & Bounding Box Visualizer
- **Fig. 4**: Tracking Trajectory & Velocity Vectors
- **Fig. 5**: 4-Quadrant Crowd Density Distribution Heatmap
- **Fig. 6**: Farnebäck Dense Optical Flow Field & Turbulence
- **Fig. 7**: Continuous Risk Score Evolution & Threshold Crossings
- **Fig. 8**: Normalized Multi-Class Confusion Matrix
- **Fig. 9**: Baseline Comparison Bar Chart (F1-Score & False Alarm Rate)
- **Fig. 10**: Ablation Study Progression Curve

---

## 7. License & Citation
Developed as an academic research and engineering platform. For citations and IEEE paper submission details, refer to `docs/paper/paper_draft.tex` and `docs/paper/references/references.bib`.