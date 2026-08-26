# CrowdSentinel: Experimental Protocols & Results

## 1. Baseline Approaches
1. **Baseline 1 (Density Only)**: Uses spatial occupancy $D$ and inflow $\Delta D$ ($w_D = 0.60, w_{\Delta D} = 0.40$).
2. **Baseline 2 (Motion Only)**: Uses optical flow velocity $M$, surge $\Delta M$, and turbulence $I_{\text{flow}}$ ($w_M = 0.40, w_{\Delta M} = 0.30, w_\sigma = 0.15, w_{turb} = 0.15$).
3. **Baseline 3 (Naive Density + Motion)**: Unweighted 50/50 linear average of density and motion.
4. **Proposed Method**: Multi-modal spatial-temporal fusion with 5s sliding window and explainability engine.

## 2. Baseline Comparison Results (Table IV)

| Experiment Baseline | Accuracy | F1-Score | False Alarm Rate | Mean Early Warning Lead | Processing FPS |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline 1 (Density Only)** | 0.6975 | 0.6980 | 28.57% | 3.20 s | 38.5 |
| **Baseline 2 (Motion Only)** | 0.6433 | 0.6410 | 33.33% | 2.40 s | 40.2 |
| **Baseline 3 (Density + Motion)** | 0.7850 | 0.7840 | 18.18% | 4.50 s | 37.9 |
| **Proposed Method** | **0.9125** | **0.9130** | **7.14%** | **7.80 s** | **36.8** |

## 3. Ablation Study Results (Table V)

| Ablation Configuration | Precision | Recall | F1-Score | False Alarm Rate | Early Lead Time | FPS |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Config A (Density Only)** | 0.6850 | 0.6620 | 0.6710 | 31.25% | 2.80 s | 38.8 |
| **Config B (Density + $\Delta D$)** | 0.7420 | 0.7280 | 0.7330 | 23.53% | 4.10 s | 38.4 |
| **Config C (Density + Motion)** | 0.7920 | 0.7810 | 0.7840 | 18.18% | 4.50 s | 37.9 |
| **Config D (Density + Motion + Temp. Win)** | 0.8540 | 0.8420 | 0.8470 | 12.50% | 6.20 s | 37.5 |
| **Config E (Full Proposed System)** | **0.9180** | **0.9090** | **0.9130** | **7.14%** | **7.80 s** | **36.8** |