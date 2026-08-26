# CrowdSentinel: Dataset Pipeline & Protocol

## 1. Supported Datasets & Benchmarks
- **Benchmark Crowd Suite**: 6 standardized video sequences (1,240 frames, 62.0 seconds) capturing diverse crowd dynamics:
  1. `seq_01_normal_flow.mp4`: Unobstructed laminar pedestrian movement.
  2. `seq_02_bottleneck_congestion.mp4`: Convergent bottleneck density buildup.
  3. `seq_03_counter_flow_surge.mp4`: High directional variance opposing streams.
  4. `seq_04_rapid_panic_dispersion.mp4`: Rapid velocity spike and radial dispersion.
  5. `seq_05_dense_standstill.mp4`: High-density static gathering.
  6. `seq_06_steady_concourse.mp4`: Transit concourse baseline.
- **Planned Real-World Dataset Adapters**: UMN Unusual Crowd Activity, GBA-Stampedes, GSMADC.

## 2. Partitioning Protocol (Zero Temporal Leakage)
- Partitioned at the **video/scene level** with fixed random seed ($42$):
  - **Training Partition (70%)**: Model tuning and weight optimization.
  - **Validation Partition (15%)**: Threshold calibration and hyperparameter validation.
  - **Testing Partition (15%)**: Completely unseen evaluation scenes.

## 3. Dataset Summary Statistics (Table I)

| Dataset Name | Total Videos | Total Duration (s) | Total Frames | Resolution | Train Videos | Val Videos | Test Videos | Split Proportions |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Benchmark Crowd Suite** | 6 | 62.0 | 1240 | 640x480 | 4 | 1 | 1 | 70% / 15% / 15% |