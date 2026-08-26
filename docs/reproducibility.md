# CrowdSentinel: Scientific Reproducibility Guide

## 1. Hardware & Software Requirements
- **OS**: Windows 10/11, Ubuntu 20.04+, or macOS
- **Python**: 3.10+ (tested on Python 3.13.5)
- **Node.js**: v18+ (tested on Node v22.16.0 with pnpm 10+)

## 2. Exact Commands to Reproduce All Experiments

```bash
# Step 1: Install Python dependencies
pip install ultralytics opencv-python numpy pandas matplotlib seaborn scikit-learn pyyaml

# Step 2: Generate the standardized benchmark video dataset
python -m datasets.benchmark_generator

# Step 3: Execute all baseline and ablation experiments
python -m experiments.run_all
```

## 3. Verifying Results
- Generated tables are located in `results/tables/` (`table_1` through `table_6`).
- Generated figures are located in `results/plots/` (`fig_1` through `fig_10`).
- The full execution metadata is logged in `results/experiment_manifest.json`.