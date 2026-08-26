"""
Ablation Study Framework
Systematically evaluates the contribution of each module:
Config A: Density only
Config B: Density + Density Change (Delta D)
Config C: Density + Motion
Config D: Density + Motion + Temporal Windowing
Config E: Full Proposed System (Multi-Feature Spatial-Temporal Fusion)
"""
from typing import Dict, Any, List
from ml.pipeline import CrowdSentinelPipeline

class AblationStudyRunner:
    """Executes ablation experiments across configurations A through E."""
    
    CONFIGS = {
        "Config A (Density Only)": {
            "weights": {"density": 1.0, "density_change": 0.0, "movement_magnitude": 0.0, "movement_change": 0.0, "direction_variance": 0.0, "flow_irregularity": 0.0},
            "window": 0.5
        },
        "Config B (Density + Delta D)": {
            "weights": {"density": 0.60, "density_change": 0.40, "movement_magnitude": 0.0, "movement_change": 0.0, "direction_variance": 0.0, "flow_irregularity": 0.0},
            "window": 2.0
        },
        "Config C (Density + Motion)": {
            "weights": {"density": 0.50, "density_change": 0.0, "movement_magnitude": 0.50, "movement_change": 0.0, "direction_variance": 0.0, "flow_irregularity": 0.0},
            "window": 0.5
        },
        "Config D (Density + Motion + Temp. Win)": {
            "weights": {"density": 0.35, "density_change": 0.25, "movement_magnitude": 0.40, "movement_change": 0.0, "direction_variance": 0.0, "flow_irregularity": 0.0},
            "window": 5.0
        },
        "Config E (Full Proposed System)": {
            "weights": {"density": 0.25, "density_change": 0.20, "movement_magnitude": 0.20, "movement_change": 0.15, "direction_variance": 0.10, "flow_irregularity": 0.10},
            "window": 5.0
        }
    }

    def run_configuration(self, config_name: str, video_path: str) -> Dict[str, Any]:
        spec = self.CONFIGS[config_name]
        pipeline = CrowdSentinelPipeline(window_seconds=spec["window"])
        pipeline.risk_engine.weights = spec["weights"].copy()
        pipeline.risk_engine._normalize_weights()
        return pipeline.process_video(video_path)