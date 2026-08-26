"""
Baseline 3: Naive Density + Motion Combination
Evaluates crowd risk estimation using a naive 50/50 unweighted average of density and motion.
"""
from typing import Dict, Any, List
from ml.pipeline import CrowdSentinelPipeline

class BaselineNaiveDensityMotionEvaluator:
    def __init__(self, config_path: str = "configs/density_motion.yaml"):
        self.pipeline = CrowdSentinelPipeline(config_path=config_path)

    def evaluate_video(self, video_path: str) -> Dict[str, Any]:
        return self.pipeline.process_video(video_path)