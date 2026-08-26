# CrowdSentinel: Comprehensive Project Audit & Research Gap Analysis

**Project**: CrowdSentinel — AI-Based Early Crowd Risk Detection Using Density and Motion Analysis  
**Context**: Final-Year Capstone Project & IEEE Research Paper Submission  
**Audit Date**: August 2026  
**Auditor**: Senior Computer Vision & Machine Learning Research Team  

---

## 1. Existing Architecture

The current repository is structured as a pnpm-managed TypeScript full-stack monorepo:

```text
CrowdSentinel-Safety-Monitor/
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite + Tailwind CSS UI
│   └── api/                     # Express 5 + Pino REST API server
├── packages/
│   ├── db/                      # Drizzle ORM PostgreSQL schema & in-memory fallback
│   ├── api-spec/                # OpenAPI 3.0 specification & Orval config
│   ├── api-zod/                 # Shared Zod validation schemas
│   └── api-client-react/        # TanStack React Query typed hooks & fetch client
└── docs/                        # High-level architecture and methodology notes
```

### Architectural Strengths:
- Clear contract-first design using OpenAPI (`packages/api-spec/openapi.yaml`) with automated type generation.
- Responsive, accessible dashboard UI in React 19 with modular page routing (`/dashboard`, `/monitor`, `/cameras`, `/alerts`, `/analytics`, `/settings`, `/about`).
- Decoupled API server with structured logging (Pino) and CORS handling.
- Graceful database fallback mechanism allowing standalone operation with or without PostgreSQL.

---

## 2. Existing Features

| Module | Current Implementation | Status |
| :--- | :--- | :--- |
| **Situation Overview (`/dashboard`)** | Real-time crowd count, density %, movement speed, direction, composite risk score, and factor breakdown. | Simulated / Demo Mode |
| **Video Monitor (`/monitor`)** | Session creation for demo feed or video file upload, polling progressive telemetry readouts. | Simulated Progression |
| **Camera Configurations (`/cameras`)** | CRUD operations for camera sources (RTSP, HLS, Upload, Demo) backed by Drizzle/in-memory store. | Working Functional |
| **Alert History (`/alerts`)** | Queryable and filterable alert log with risk severity badges and recommended actions. | Mocked Sample Data |
| **Analytics (`/analytics`)** | Time-series charts for crowd count, risk distribution bars, weekly alert counts, and evaluation metrics card. | Placeholder Data |
| **Risk Settings (`/settings`)** | Configurable risk thresholds (Warning, High, Critical) and weights for density, movement, density increase, and flow. | Configurable Working |
| **Methodology Page (`/about`)** | Honest disclosure of limitations, non-claim of stampede prediction, and decision-support framing. | Complete |

---

## 3. Existing AI/ML Components

### Current State:
- **Detection & Tracking**: No real computer vision inference pipeline was previously connected. The API generated mathematical waveforms (`Math.sin`, `Math.cos`) to simulate crowd fluctuations.
- **Optical Flow & Motion Analysis**: No computer vision motion extraction algorithms were integrated.
- **Risk Engine**: Mathematical weighting formula exists in Node.js, but operates on synthetic inputs rather than extracted visual features.
- **Python ML Pipeline**: Completely absent in the initial repository.

---

## 4. Existing Dataset Usage

- **Current State**: No actual dataset loader, annotations, video parser, or benchmark dataset was integrated.
- **Documentation**: Mentioned planned support for UMN Unusual Crowd Activity, GBA-Stampedes, and GSMADC, but lacked pipeline scripts (`dataset_loader.py`, `dataset_split.py`, `dataset_validator.py`).
- **Data Splitting**: No temporal or video-level splitting was implemented.

---

## 5. Existing APIs

The existing OpenAPI contract provides the following endpoints:
- `GET /api/healthz` & `GET /api/health`: System health status
- `GET /api/dashboard`: Live telemetry snapshot
- `GET /api/cameras`, `POST /api/cameras`: Camera management
- `PATCH /api/cameras/:cameraId`, `DELETE /api/cameras/:cameraId`: Camera CRUD
- `GET /api/alerts`: Alert history querying
- `POST /api/monitoring/session`: Start video analysis session
- `GET /api/monitoring/session/:sessionId`: Retrieve progressive analysis telemetry
- `GET /api/analytics`: Time-series trends and evaluation results
- `GET /api/settings/risk`, `PUT /api/settings/risk`: Risk threshold and weights management

---

## 6. Existing Database

- **ORM**: Drizzle ORM with PostgreSQL (`drizzle-orm/pg-core`, `pg`).
- **Tables Defined**:
  - `camerasTable` (id, name, location, source, sourceType, status, lastActive)
  - `detectionsTable` (id, timestamp, cameraId, personCount, density, movementSpeed, movementDirection)
  - `riskEventsTable` (id, timestamp, cameraId, riskScore, riskLevel, reason)
  - `alertsTable` (id, timestamp, riskEventId, alertType, status)
  - `analysisSessionsTable` (id, source, mode, startTime, endTime, summary)
- **Missing Table**:
  - `experimentsTable` / `benchmarkRunsTable`: Storing reproducible experiment runs, manifests, configurations, baseline comparisons, and ablation metrics.

---

## 7. Existing Problems & Deficiencies

1. **Absence of Real Computer Vision Inference**: The analysis session generated synthetic data; no actual frames were passed through YOLO, Farnebäck optical flow, or spatial-temporal density models.
2. **Missing Research & Experimentation Framework**: No Python-based ML module existed to run controlled experiments, ablation studies, and baseline comparisons.
3. **No Measurable Metric Generation**: Evaluation metrics (Precision, Recall, F1, MAE, RMSE, False Alarm Rate, Early Warning Time) were marked "Pending" with no computation scripts.
4. **Lack of Paper-Ready Output Generation**: No automated export of IEEE-compliant Table I–VI CSV/JSON tables or Fig. 1–10 high-resolution publication plots.
5. **No Temporal Window Aggregation**: Analysis only operated on instantaneous points rather than sliding temporal windows (5s, 10s, 15s) essential for detecting crowd dynamics.

---

## 8. Missing Research Components to Be Added

1. **Python ML Research Core (`ml/`)**:
   - `detection/`: Ultralytics YOLO person detection module with single-model caching, confidence filtering, and bounding box telemetry.
   - `tracking/`: ByteTrack / centroid tracking for velocity, trajectory, and track lifetime.
   - `density/`: Person count, relative image-space density, 4-quadrant zone density, and temporal density growth rate ($\Delta D / \Delta t$).
   - `motion/`: Farnebäck Dense Optical Flow computing mean magnitude, max magnitude, dominant direction, directional variance, sudden motion change, and flow irregularity.
   - `features/`: Temporal window aggregation (5s/10s/15s) and normalized feature fusion vector $F = [D, \Delta D, M, \Delta M, \sigma^2_\theta, I_{flow}]$.
   - `risk/`: Transparent, explainable, rule/ML-based risk scoring engine with configurable weights and exact percentage factor contributions.
   - `training/`: Training and validation scripts for learned risk estimators (e.g. Random Forest, MLP, Gradient Boosting).
   - `evaluation/`: Comprehensive metric computation (Precision, Recall, F1, False Alarm Rate, Early Warning Time, Density MAE/RMSE, Runtime Latency & FPS).
2. **Standardized Dataset Pipeline (`datasets/`)**:
   - `dataset_loader.py`: Video ingestion, frame extraction, and annotation parsing.
   - `dataset_split.py`: Video-level train/val/test splitting (70/15/15) to prevent temporal data leakage.
   - `dataset_validator.py`: Automated dataset integrity validation and class distribution reporting.
   - `datasets/synthetic_benchmark/` & standard dataset adapter for reproducible benchmarks.
3. **Controlled Experimentation & Ablation Framework (`experiments/`)**:
   - `baseline_density.py` (Baseline 1: Density only)
   - `baseline_motion.py` (Baseline 2: Motion only)
   - `baseline_density_motion.py` (Baseline 3: Naive density + motion)
   - `proposed_method.py` (Proposed: Feature fusion + temporal windowing + explainable risk engine)
   - `ablation_study.py` (Evaluating Configurations A through E)
4. **Automated Publication Artifact Generator (`results/`, `docs/paper/`)**:
   - Automated generation of IEEE Tables I–VI (CSV and LaTeX/Markdown formats).
   - Automated rendering of IEEE Figures 1–10 (PNG/SVG plots using Matplotlib/Seaborn).
   - `experiment_manifest.json` generation ensuring full scientific reproducibility (seeds, environment, git commit, hardware info).
5. **Backend & Frontend Integration**:
   - Real Python analysis execution bridge in the backend (`apps/api`) so uploaded videos run actual inference.
   - Research Experiment Results & Model Evaluation tab in the Frontend dashboard (`apps/web`).

---

## 9. Recommended Changes

1. Build modular Python package `ml/` with standard CLI entrypoints for video processing, experiment execution, and figure/table generation.
2. Extend `packages/db` schema with `experimentsTable` to store formal experiment manifests and metric records.
3. Add backend endpoint `/api/experiments` and `/api/research/metrics` to expose reproducible research outputs to the frontend.
4. Enhance Frontend UI (`apps/web`) to visualize research metrics, confusion matrices, baseline comparison charts, and ablation tables alongside live monitoring.
5. Create comprehensive research documentation: `docs/RESEARCH_GAP.md`, `docs/methodology.md`, `docs/architecture.md`, `docs/dataset.md`, `docs/experiments.md`, `docs/evaluation.md`, `docs/reproducibility.md`, and IEEE paper templates under `docs/paper/`.

---

## 10. What Should NOT Be Changed

- **Frontend Core UX**: Do NOT break the existing layout, sidebar navigation, dark operations styling, Lucide icons, or reactive components.
- **REST Contract Compatibility**: Maintain all existing OpenAPI endpoints (`/api/dashboard`, `/api/cameras`, `/api/alerts`, `/api/analytics`, `/api/settings/risk`) without breaking changes.
- **Demo Mode**: Preserve the clearly labeled "DEMO / SIMULATED ANALYSIS" mode as an explicit fallback when running in lightweight environments without local GPU/video inputs.
- **Safe Scientific Framing**: Maintain strict adherence to IEEE research principles: NO claims of perfect stampede prediction or 100% prevention; frame explicitly as "Early crowd-risk detection based on measurable visual indicators" for operator decision-support.