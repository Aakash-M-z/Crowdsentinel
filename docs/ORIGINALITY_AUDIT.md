# CrowdSentinel — Originality & Plagiarism Audit Report

**Date of Audit**: August 27, 2026  
**Document Evaluated**: `CrowdSentinel_IEEE_Paper_Original.docx`  
**Evaluation Scope**: Full Manuscript (Title, Abstract, Sections I–VII, Equations 1–16, Tables I–IV, Figures 1–7, References 1–20)  
**Audit Objective**: Rigorous academic integrity verification, originality validation, elimination of formulaic AI-generation tropes, and citation validation for IEEE conference peer review.

---

## 1. Executive Summary & Verification Statement

> **Important Disclosure**: An external similarity verification tool (e.g., Turnitin or iThenticate) is required for an official similarity percentage score. The goal of this audit is not to manipulate, deceive, or bypass detection algorithms, but to ensure the manuscript is genuinely original in technical expression, thoroughly cited, and free of redundant or borrowed phrasing.

* **Originality Assessment**: High. All narrative prose, mathematical derivations, figure descriptions, and diagnostic interpretations were independently written from first principles based on the actual CrowdSentinel implementation and empirical result tables.
* **Internal Drafting Comments Removed**: 100% (No `[VALUE REQUIRED]`, `[EXPERIMENT REQUIRED]`, reviewer prompts, or generation notes remain).
* **Structural Conformity**: No bullet points; formatted in flowing, continuous IEEE academic prose.
* **Citation Traceability**: 20 verified real-world academic citations indexed across IEEE, NeurIPS, CVPR, ECCV, and ACM proceedings.

---

## 2. Comprehensive Section-by-Section Review

### A. Sections Reviewed
1. **Title & Author Block**: Exact institutional affiliation and verified author details.
2. **Abstract**: Problem statement, multi-modal integration gap, 6D feature overview, empirical results, latency, and operational limitations.
3. **Section I (Introduction)**: Historical physical disaster dynamics, sensor trade-offs between static density and differential motion, system goals, and 4 continuous contributions.
4. **Section II (Related Work)**: Density estimation, optical flow anomaly detection, multi-modal fusion, and explainability frameworks.
5. **Section III (Mathematical Formulation & Method)**: Derivations for Equations (1) through (16), spatial occupancy union, Farnebäck polynomial expansion, circular angular moments, kinetic fluid turbulence index, sliding temporal window convolution, analytical Jacobian factor attribution, and persistence gating.
6. **Section IV (Experimental Setup)**: Synthetic benchmark suite breakdown (6 sequences, 1,200 frames, 20 FPS), video-level partitioning (seed 42), and CPU hardware baseline.
7. **Section V (Results and Discussion)**: Empirical baseline comparison (Table II), feature ablation analysis (Table III), runtime throughput profiling (Table IV), and in-text figure narratives (Figures 1–7).
8. **Section VI (Limitations and Future Work)**: Transparent disclosure of synthetic domain gaps, heuristic weight calibration requirements, frame-level false alarm rate, and multi-camera roadmap.
9. **Section VII (Conclusion)**: Summary of technical findings, Macro F1 improvement (+62.1%), and foundational takeaways.
10. **References**: 20 fully verified academic publications cited in-text.

---

## 3. Potential Textual Overlap & Similarity Risk Categorization

Overlap risk is categorized as:
* **HIGH**: Potentially copied or excessively similar wording.
* **MEDIUM**: Strongly source-dependent wording that should be rewritten.
* **LOW**: Common technical phrasing or unavoidable academic expressions.
* **NECESSARY**: Standardized mathematical formulas, algorithm names, datasets, or properly cited technical terms.

### Detailed Passage Analysis

#### Passage 1: Farnebäck Optical Flow Polynomial Approximation
* **Original Drafting Text**: *"The Farnebäck algorithm approximates the neighbourhood of each pixel with quadratic polynomials f1(x) = x^T A1 x + b1^T x + c1 and f2(x) = x^T A2 x + b2^T x + c2..."*
* **Similarity Risk**: **NECESSARY**
* **Possible Source**: G. Farnebäck (2003) [10], OpenCV Documentation.
* **Reason for Similarity**: Mathematical definition of quadratic expansion is standard algebraic formulation.
* **Action Taken**: Formally cited [10] and explained local curvature matrix $A = (A_1 + A_2)/2$ and gradient change $\Delta b$ in our own technical terminology in Section III-B.

#### Passage 2: Crowd Turbulence and Disaster Progression
* **Original Drafting Text**: *"Crowd disasters are characterised by progressive spatial compression and abrupt kinematic transitions as proven by Helbing..."*
* **Similarity Risk**: **LOW / REWRITTEN**
* **Possible Source**: D. Helbing & P. Mukerji (2012) [1].
* **Reason for Similarity**: Common conceptual description of crowd disaster dynamics.
* **Action Taken**: Rewritten into an authentic physical explanation of localized compaction, shockwave propagation, and involuntary contact: *"Physical crowd crushes at stadium exits, religious gatherings, and transit interchanges are rarely instantaneous occurrences. Empirical investigations of historical crowd disasters have demonstrated that catastrophic stampedes follow a measurable physical progression: localized spatial compaction leads to involuntary physical contact between pedestrians, compressive shockwaves propagate through dense clusters, and sudden directional turbulence precedes structural breakdown and widespread falling [1], [14]."*

#### Passage 3: YOLOv8 Object Detection Description
* **Original Drafting Text**: *"YOLOv8 is a state-of-the-art, real-time object detection model that leverages an anchor-free split ultralytics backbone..."*
* **Similarity Risk**: **MEDIUM / REWRITTEN**
* **Possible Source**: Ultralytics YOLOv8 Documentation / GitHub [12].
* **Reason for Similarity**: Promotional/marketing language from open-source documentation.
* **Action Taken**: Completely replaced with direct system-level implementation specifics: *"Given an incoming frame $I(t)$ of dimensions $H \times W$, YOLOv8n [12], [13] extracts $N(t)$ pedestrian bounding boxes $B_i(t) = (x_{i,1}, y_{i,1}, x_{i,2}, y_{i,2})$ satisfying confidence threshold $c_i \ge 0.25$."*

#### Passage 4: Circular Directional Statistics
* **Original Drafting Text**: *"Directional variance is computed using circular statistics by calculating the mean resultant vector length R = sqrt(C^2 + S^2)/N..."*
* **Similarity Risk**: **NECESSARY**
* **Possible Source**: Krausz & Bauckhage (2012) [14], Mardia & Jupp (Directional Statistics).
* **Reason for Similarity**: Standard circular trigonometric moment definition.
* **Action Taken**: Retained formal equations (10)–(11), cited [14], and added an in-depth physical explanation of unit vector projection and angular dispersion behavior under laminar versus counter-flow conditions.

#### Passage 5: Linear Factor Attribution Formulation
* **Original Drafting Text**: *"The contribution of each feature is calculated as C_i = (w_i * F_i / R) * 100% which provides an explainable AI framework..."*
* **Similarity Risk**: **NECESSARY / LOW**
* **Possible Source**: CrowdSentinel custom implementation.
* **Reason for Similarity**: Analytical decomposition derived from convex combination.
* **Action Taken**: Expanded into analytical sensitivity derivation $\frac{\partial R(t)}{\partial \bar{F}_j(t)} = w_j$ in Equation (15), proving that percentage contributions sum identically to 100% and providing clear operational guidance for security personnel.

---

## 4. Passages Retained as Standard Technical Terminology (NECESSARY)
The following terminology and constructs were intentionally retained as essential domain vocabulary:
* *"Macro F1 score"*, *"False Alarm Rate (FAR)"*, *"Frames Per Second (FPS)"*, *"mean resultant vector magnitude"*
* *"YOLOv8n"*, *"Farnebäck dense optical flow"*, *"Microsoft COCO dataset"*
* *"spatial occupancy domain $\Omega_{\text{crowd}}$"*, *"vector coherence ratio $I_{\text{flow}}$"*
* Mathematical matrix representations ($A(x) d(x) = \Delta b(x)$)

---

## 5. Technical & Results Consistency Check

| Evaluated Parameter | Value Reported in Paper | Value in `results/experiment_manifest.json` / CSVs | Verification Status |
|:---|:---:|:---:|:---:|
| **Proposed Macro F1** | `0.3233` | `0.3233` (`table_3_risk_classification.csv`) | **VERIFIED** |
| **Proposed Accuracy** | `0.4992` | `0.4992` (`table_3_risk_classification.csv`) | **VERIFIED** |
| **Density Baseline Macro F1** | `0.1995` | `0.1995` (`table_4_baseline_comparison.csv`) | **VERIFIED** |
| **Motion Baseline Macro F1** | `0.1778` | `0.1778` (`table_4_baseline_comparison.csv`) | **VERIFIED** |
| **Density+Motion Baseline Macro F1**| `0.1767` | `0.1767` (`table_4_baseline_comparison.csv`) | **VERIFIED** |
| **Frame-Level False Alarm Rate** | `98.90%` | `0.989` (`table_4_baseline_comparison.csv`) | **VERIFIED** |
| **VGA Processing Throughput** | `10.6 FPS` | `10.6 FPS` (`table_6_runtime_performance.csv`) | **VERIFIED** |
| **VGA Average Latency** | `93.98 ms` | `93.98 ms` (`table_6_runtime_performance.csv`) | **VERIFIED** |
| **VGA P95 Latency** | `110.84 ms` | `110.84 ms` (`table_6_runtime_performance.csv`) | **VERIFIED** |
| **Total Video Sequences** | `6` | `6` (`table_1_dataset_statistics.csv`) | **VERIFIED** |
| **Total Benchmark Frames** | `1,200` | `1,200` (`table_1_dataset_statistics.csv`) | **VERIFIED** |
| **Benchmark Resolution** | `640x480 (VGA)` | `640x480` (`table_1_dataset_statistics.csv`) | **VERIFIED** |

---

## 6. Recommendations for Submission

1. **Plagiarism Checking Protocol**: Submit `CrowdSentinel_IEEE_Paper_Original.docx` to institutional Turnitin / iThenticate repositories without repository storage (to prevent self-match on subsequent conference resubmission).
2. **Author Block Consistency**: Ensure student register numbers and institutional email addresses match official college portal records.
3. **Camera-Ready PDF Compilation**: When converting from `.docx` to PDF, verify that all 7 embedded figures maintain 300 DPI vector clarity and that two-column margins adhere to standard IEEE conference 0.75-inch (1.9 cm) top and 1.0-inch bottom specifications.
