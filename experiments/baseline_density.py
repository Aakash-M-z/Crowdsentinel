"""
Baseline 1: Density-Only Crowd Risk Assessment
Evaluates crowd risk estimation using strictly spatial crowd density features.
"""
from typing import Dict, Any, List
from ml.pipeline import CrowdSentinelPipeline
from ml.risk.risk_engine import RiskEngine

class BaselineDensityEvaluator:
    def __init__(self, config_path: str = "configs/baseline_density.yaml"):
        self.pipeline = CrowdSentinelPipeline(config_path=config_path)

    def evaluate_video(self, video_path: str) -> Dict[str, Any]:
        return self.pipeline.process_video(video_path)