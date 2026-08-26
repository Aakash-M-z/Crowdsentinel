"""
Proposed Method: Multi-Feature Spatial-Temporal Fusion
Evaluates the full proposed system with multi-modal feature fusion,
sliding temporal windows (5s), and explainable risk factor breakdown.
"""
from typing import Dict, Any, List
from ml.pipeline import CrowdSentinelPipeline

class ProposedMethodEvaluator:
    def __init__(self, config_path: str = "configs/proposed.yaml"):
        self.pipeline = CrowdSentinelPipeline(config_path=config_path, window_seconds=5.0)

    def evaluate_video(self, video_path: str, output_video: str = None) -> Dict[str, Any]:
        return self.pipeline.process_video(video_path, output_video_path=output_video)