# CrowdSentinel — Final Paper Quality & Submission Checklist

**Document**: `CrowdSentinel_IEEE_Paper_Original.docx`  
**Date**: August 27, 2026  
**Format**: IEEE Conference (Two-Column, Times New Roman, Standard Typography)  
**Status**: Ready for External Similarity Check & Peer Review  

---

## 1. Quantitative Document Metrics

| Metric | Measured Value | Requirement / Target | Compliance Status |
|:---|:---:|:---:|:---:|
| **Estimated Pages (IEEE 2-Column)** | **6 Pages** | 5–8 Pages (Standard IEEE Conference) | **COMPLIANT** |
| **Total Word Count** | **~3,450 words** | 3,000–4,500 words | **COMPLIANT** |
| **Total References** | **20** | Above 15 References | **COMPLIANT** (20 / >15) |
| **Total In-Text Citations** | **20 distinct ([1]–[20])** | 100% cited in narrative text | **COMPLIANT** |
| **Total Embedded Figures** | **7 figures (300 DPI)** | All required pipeline diagrams & plots | **COMPLIANT** |
| **Total Tables** | **4 tables** | Dataset, Results, Ablation, Hardware | **COMPLIANT** |
| **Total Numbered Equations** | **16 equations** | Derivations for all 6 features + score + gating | **COMPLIANT** |
| **Bullet Points in Text** | **0** | No bullet points (flowing academic prose) | **COMPLIANT** |
| **Drafting Placeholders Remaining** | **0** | No `[VALUE REQUIRED]`, `[EXPERIMENT REQUIRED]` | **COMPLIANT** |
| **Passages Rewritten for Originality** | **5 major passages** | Independent first-principles prose | **COMPLIANT** |
| **Citation Corrections** | **0** | All 20 references verified authentic | **COMPLIANT** |
| **Unresolved Similarity Risks** | **0** | Standard technical terms retained as necessary | **COMPLIANT** |
| **Unsupported Claims** | **0** | All metrics traced to `results/tables/*.csv` | **COMPLIANT** |

---

## 2. Comprehensive Quality Verification Checklist

### A. Academic Integrity & Originality
- [x] **No Copied Paragraphs**: Narrative text is independently formulated from system implementation and physical principles.
- [x] **No Generic AI Promotional Phrasing**: Eliminated words such as *"cutting-edge"*, *"seamlessly integrates"*, *"pivotal role"*, *"highly sophisticated"*, and *"paramount"*.
- [x] **Zero Plagiarism-Bypass Tricks**: No hidden text, no white characters, no font substitutions, no artificial synonym scrambling.
- [x] **Related Work Independence**: Formulated as comparative literature analysis rather than disconnected summaries.
- [x] **Zero Fabricated References**: All 20 citations correspond to indexed academic literature with genuine authors, titles, and venues.

### B. Mathematical Formulations & Derivations
- [x] **Equation (1)–(2)**: Bounding-box spatial union occupancy domain $\Omega_{\text{crowd}}(t)$ and normalized density $D(t) \in [0, 100]$.
- [x] **Equation (3)**: Backward temporal density accumulation rate $\Delta D(t)$.
- [x] **Equation (4)–(6)**: Farnebäck quadratic intensity expansion $f_1(x) \approx x^T A_1 x + b_1^T x + c_1$ and displacement solution $d(x)$.
- [x] **Equation (7)–(9)**: Spatial integral of Euclidean velocity magnitude $M(t)$ and kinematic acceleration $\Delta M(t)$.
- [x] **Equation (10)–(11)**: Circular trigonometric moments $C_{\text{dir}}, S_{\text{dir}}$, mean resultant vector length $R_{\text{dir}}$, and circular angular dispersion $\sigma^2_\theta$.
- [x] **Equation (12)**: Fluid dynamic vector coherence irregularity index $I_{\text{flow}}$.
- [x] **Equation (13)**: 5.0-second sliding temporal window moving average convolution $\bar{F}_j(t)$.
- [x] **Equation (14)–(15)**: Convex weighted risk combination $R(t) = \sum w_j \bar{F}_j(t)$ and analytical Jacobian sensitivity factor attribution $C_j(t) = \frac{w_j \bar{F}_j}{R} \times 100\%$.
- [x] **Equation (16)**: Temporal persistence gating $A(t) = \mathbb{I}\left(\sum_{m=0}^{K-1} \mathbb{I}(R(t - m\Delta t) \ge \tau_{\text{risk}}) = K\right)$.

### C. Visual Figures & Narrative Explanations
- [x] **Fig. 1 (Architecture)**: Full dual-path layout (YOLOv8 spatial path + Farnebäck kinematic path + temporal FIFO buffer + risk engine + persistence gate).
- [x] **Fig. 2 (Workflow)**: 20 FPS procedural loop from frame decoding to alert dispatch.
- [x] **Fig. 3 (Feature Representation)**: Normalized 6D feature vector $F = [D, \Delta D, M, \Delta M, \sigma^2_\theta, I_{\text{flow}}]$.
- [x] **Fig. 4 (Explainability Breakdown)**: Horizontal percentage attribution interface for control-room operators.
- [x] **Fig. 5 (Macro F1 Comparison)**: Quantitative baseline comparison (+62.1% over density baseline, +81.8% over motion baseline).
- [x] **Fig. 6 (Feature Ablation)**: Performance breakdown illustrating the +70.2% jump from temporal windowing and the motivation for supervised calibration.
- [x] **Fig. 7 (FAR Diagnostic & Temporal Suppression)**: Frame-level false alarm diagnosis and $K$-consecutive-frame persistence solution.

### D. Experimental Results & Empirical Grounding
- [x] **Table I (Dataset Statistics)**: 6 synthetic video sequences, 1,200 frames, 60.0 s, 20 FPS, 640×480 VGA, video-level 4/1/1 split (seed 42).
- [x] **Table II (Classification Performance)**: Accuracy 0.4992, Precision 0.3067, Recall 0.3462, Macro F1 0.3233, Weighted F1 0.4779.
- [x] **Table III (Feature Ablation)**: Config A (0.3864) $\rightarrow$ Config B (0.2040) $\rightarrow$ Config C (0.1796) $\rightarrow$ Config D (0.3056) $\rightarrow$ Config E (0.3229).
- [x] **Table IV (Runtime Profiling)**: VGA 10.6 FPS (93.98 ms), HD 7.6 FPS (129.70 ms), FHD 5.1 FPS (192.70 ms) on Intel Core i7-1360P CPU.

### E. Author Block & Institutional Formatting
- [x] **Author 1**: Aakash M (711523BCS001, kit27.cse01@gmail.com)
- [x] **Author 2**: Hema Dharshana S J (711523BCS021, kit27.cse21@gmail.com)
- [x] **Author 3**: Santhosh Kumar R (711523BCS049, Kit27.cse49@gmail.com)
- [x] **Project Guide**: Mr MugeshKumar S ([guide@kit.edu])
- [x] **Department & Affiliation**: Department of Computer Science and Engineering, KIT - Kalaignarkarunanidhi Institute of Technology, Coimbatore, India.

---

## 3. Official Verification Disclaimer

> **Official Disclaimer**: An external similarity checker such as Turnitin or iThenticate is required for an actual similarity percentage report. The manuscript `CrowdSentinel_IEEE_Paper_Original.docx` has been formulated in original academic English, rigorously verified against empirical experiment logs, and structured for IEEE conference peer review without synthetic inflation or deceptive formatting.
