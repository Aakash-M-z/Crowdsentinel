"""
CrowdSentinel Unified Computer Vision & Risk Analysis Pipeline
Executes the full end-to-end multi-modal crowd safety analysis on video inputs or synthetic feeds.
"""
import os
import sys
import time
import json
import argparse
from typing import Dict, Any, List, Optional
import numpy as np
import cv2

from ml.detection.detector import PersonDetector
from ml.tracking.tracker import PersonTracker
from ml.density.density_estimator import DensityEstimator
from ml.motion.motion_analyzer import MotionAnalyzer
from ml.features.feature_fusion import TemporalFeatureAggregator, FusedFeatureVector
from ml.risk.risk_engine import RiskEngine, RiskAssessmentResult

class CrowdSentinelPipeline:
    """
    Unified Computer Vision & Risk Pipeline integrating Detection, Tracking,
    Density, Optical Flow, Feature Fusion, and Explainable Risk Scoring.
    """
    def __init__(
        self,
        config_path: Optional[str] = "configs/risk_config.yaml",
        detector_model: str = "yolov8n.pt",
        conf_threshold: float = 0.35,
        window_seconds: float = 5.0,
        enable_tracking: bool = True
    ):
        self.detector = PersonDetector(model_name=detector_model, conf_threshold=conf_threshold)
        self.tracker = PersonTracker() if enable_tracking else None
        self.density_estimator = DensityEstimator()
        self.motion_analyzer = MotionAnalyzer()
        self.feature_aggregator = TemporalFeatureAggregator(window_seconds=window_seconds)
        self.risk_engine = RiskEngine(config_path=config_path)

    def process_frame(
        self,
        frame: np.ndarray,
        frame_id: int,
        timestamp_sec: float,
        fps: float = 20.0
    ) -> Dict[str, Any]:
        """
        Executes full multi-modal analysis on a single video frame.
        """
        t0 = time.perf_counter()
        h, w = frame.shape[:2]

        # 1. Person Detection
        det_result = self.detector.detect(frame, frame_id=frame_id, timestamp_sec=timestamp_sec)

        # 2. Person Tracking
        tracks = []
        if self.tracker is not None:
            tracks = self.tracker.update(det_result.detections, fps=fps)

        # 3. Density Estimation (Count, Occupancy, 4-Quadrants, Delta D)
        density_metrics = self.density_estimator.compute(
            detections=det_result.detections,
            frame_shape=(h, w),
            frame_id=frame_id,
            timestamp_sec=timestamp_sec
        )

        # 4. Dense Optical Flow & Movement Analysis (Magnitude, Direction, Variance, Turbulence)
        motion_metrics = self.motion_analyzer.compute(
            frame=frame,
            frame_id=frame_id,
            timestamp_sec=timestamp_sec
        )

        # 5. Temporal Windowing & Feature Fusion -> F = [D, dD, M, dM, var_theta, I_flow]
        self.feature_aggregator.add_observation(density_metrics, motion_metrics)
        fused_features = self.feature_aggregator.get_fused_features()

        # 6. Explainable Risk Assessment & Exact Percentage Factor Breakdown
        risk_result = self.risk_engine.evaluate(fused_features)

        t1 = time.perf_counter()
        latency_ms = (t1 - t0) * 1000.0

        # Construct frame telemetry dictionary
        factor_dict = {}
        for k, v in risk_result.contributing_factors.items():
            factor_dict[k] = {
                "value": round(v.feature_value, 1),
                "weight": round(v.weight, 2),
                "percentage_contribution": v.percentage_contribution
            }

        zone_dict = {}
        for z_name, z_val in density_metrics.zones.items():
            zone_dict[z_name] = {
                "count": z_val.count,
                "density_pct": round(z_val.relative_density_pct, 1)
            }

        return {
            "frame_id": frame_id,
            "timestamp_sec": round(timestamp_sec, 2),
            "latency_ms": round(latency_ms, 2),
            "person_count": det_result.person_count,
            "density_pct": round(density_metrics.relative_density_pct, 1),
            "density_change_rate": round(density_metrics.density_change_rate, 2),
            "zones": zone_dict,
            "mean_motion_speed": round(motion_metrics.mean_motion, 2),
            "max_motion_speed": round(motion_metrics.max_motion, 2),
            "dominant_direction": motion_metrics.dominant_direction_label,
            "dominant_direction_deg": round(motion_metrics.dominant_direction_deg, 1),
            "direction_variance": round(motion_metrics.direction_variance, 3),
            "flow_irregularity": round(motion_metrics.flow_irregularity, 1),
            "risk_score": risk_result.risk_score,
            "risk_level": risk_result.risk_level,
            "dominant_factor": risk_result.dominant_factor,
            "operational_advisory": risk_result.operational_advisory,
            "factor_contributions": factor_dict,
            "detections": [{"bbox": list(d.bbox), "conf": round(d.confidence, 2)} for d in det_result.detections]
        }

    def process_video(
        self,
        video_path: str,
        output_video_path: Optional[str] = None,
        max_frames: Optional[int] = None,
        stride: int = 1,
        progress_callback = None
    ) -> Dict[str, Any]:
        """
        Processes an entire video file, extracting per-frame metrics and summarizing the session.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Could not open video file at: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        writer = None
        if output_video_path:
            os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            writer = cv2.VideoWriter(output_video_path, fourcc, fps / stride, (width, height))

        frames_telemetry = []
        frame_idx = 0
        processed_count = 0
        t_start = time.perf_counter()

        while True:
            ret, frame = cap.read()
            if not ret or (max_frames and processed_count >= max_frames):
                break

            if frame_idx % stride == 0:
                ts = frame_idx / fps
                result = self.process_frame(frame, frame_id=frame_idx, timestamp_sec=ts, fps=fps)
                frames_telemetry.append(result)

                if writer:
                    annotated = self.render_overlay(frame, result)
                    writer.write(annotated)

                processed_count += 1
                if progress_callback:
                    progress_callback(processed_count, total_frames // stride)

            frame_idx += 1

        cap.release()
        if writer:
            writer.release()

        total_elapsed = time.perf_counter() - t_start
        overall_fps = (processed_count / total_elapsed) if total_elapsed > 0 else 0.0

        # Session summary aggregation
        if len(frames_telemetry) > 0:
            scores = [f["risk_score"] for f in frames_telemetry]
            densities = [f["density_pct"] for f in frames_telemetry]
            speeds = [f["mean_motion_speed"] for f in frames_telemetry]
            counts = [f["person_count"] for f in frames_telemetry]
            levels = [f["risk_level"] for f in frames_telemetry]
            
            summary = {
                "source_video": video_path,
                "total_frames_processed": processed_count,
                "duration_sec": round(processed_count / (fps / stride), 2),
                "processing_fps": round(overall_fps, 1),
                "peak_risk_score": round(max(scores), 1),
                "mean_risk_score": round(float(np.mean(scores)), 1),
                "peak_person_count": max(counts),
                "mean_density_pct": round(float(np.mean(densities)), 1),
                "mean_motion_speed": round(float(np.mean(speeds)), 2),
                "risk_distribution": {
                    "NORMAL": levels.count("NORMAL"),
                    "WARNING": levels.count("WARNING"),
                    "HIGH RISK": levels.count("HIGH RISK"),
                    "CRITICAL": levels.count("CRITICAL")
                }
            }
        else:
            summary = {}

        return {
            "summary": summary,
            "frames": frames_telemetry
        }

    def render_overlay(self, frame: np.ndarray, telemetry: Dict[str, Any]) -> np.ndarray:
        """
        Draws research visualizer overlay: bounding boxes, telemetry HUD, risk badge.
        """
        out = frame.copy()
        h, w = out.shape[:2]

        # Draw Person Bounding Boxes
        for d in telemetry.get("detections", []):
            x, y, bw, bh = d["bbox"]
            conf = d["conf"]
            cv2.rectangle(out, (x, y), (x + bw, y + bh), (0, 220, 110), 2)
            cv2.putText(out, f"Person {conf:.2f}", (x, max(15, y - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 110), 1)

        # Draw HUD Panel at Top-Left
        overlay = out.copy()
        cv2.rectangle(overlay, (15, 15), (380, 195), (20, 35, 40), -1)
        cv2.addWeighted(overlay, 0.75, out, 0.25, 0, out)

        risk_score = telemetry.get("risk_score", 0.0)
        risk_level = telemetry.get("risk_level", "NORMAL")
        
        # Color based on risk level
        if risk_level == "CRITICAL":
            badge_color = (60, 60, 220)
        elif risk_level == "HIGH RISK":
            badge_color = (40, 150, 240)
        elif risk_level == "WARNING":
            badge_color = (30, 200, 240)
        else:
            badge_color = (70, 190, 80)

        cv2.putText(out, f"CrowdSentinel AI Safety Monitor", (25, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        cv2.putText(out, f"Risk: {risk_level} ({risk_score:.0f}/100)", (25, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.65, badge_color, 2)
        cv2.putText(out, f"People in Frame: {telemetry.get('person_count', 0)}", (25, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 230, 230), 1)
        cv2.putText(out, f"Relative Density: {telemetry.get('density_pct', 0.0):.1f}%", (25, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 230, 230), 1)
        cv2.putText(out, f"Flow: {telemetry.get('dominant_direction', 'N/A')} ({telemetry.get('mean_motion_speed', 0.0):.1f} px/f)", (25, 145), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 230, 230), 1)
        cv2.putText(out, f"Turbulence: {telemetry.get('flow_irregularity', 0.0):.1f}% | Latency: {telemetry.get('latency_ms', 0.0):.0f}ms", (25, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 200, 200), 1)

        return out

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CrowdSentinel Video Processing CLI")
    parser.add_argument("--video", type=str, required=True, help="Path to input video")
    parser.add_argument("--output", type=str, default=None, help="Path to save annotated video")
    parser.add_argument("--json", type=str, default=None, help="Path to save JSON telemetry")
    parser.add_argument("--max-frames", type=int, default=None, help="Max frames to process")
    args = parser.parse_args()

    pipeline = CrowdSentinelPipeline()
    res = pipeline.process_video(args.video, output_video_path=args.output, max_frames=args.max_frames)
    
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)
        print(f"Results saved to {args.json}")
    else:
        print(json.dumps(res["summary"], indent=2))