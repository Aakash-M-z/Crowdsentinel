"""
Baseline 2: Motion-Only Crowd Risk Assessment
Evaluates crowd risk estimation using strictly optical flow and motion features.
"""
from typing import Dict, Any, List
from ml.pipeline import CrowdSentinelPipeline
from ml.risk.risk_engine import RiskEngine

class BaselineMotionEvaluator:
    def __init__(self, config_path: str = "configs/baseline_motion.yaml"):
        self.pipeline = CrowdSentinelPipeline(config_path=config_path)

    def evaluate_video(self, video_path: str) -> Dict[str, Any]:
        return self.pipeline.process_video(video_path)