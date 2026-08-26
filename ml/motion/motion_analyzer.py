"""
Crowd Movement & Optical Flow Module
Implements Farneback Dense Optical Flow to extract:
1. Mean Motion Magnitude
2. Maximum Motion Magnitude
3. Dominant Movement Direction
4. Directional Variance
5. Sudden Motion Change Rate (Acceleration/Surge)
6. Flow Irregularity Metric (Coherence vs Turbulence)
"""
from dataclasses import dataclass
from typing import Tuple, Optional, List
import numpy as np
import cv2
import math

@dataclass
class MotionMetrics:
    """Optical flow and crowd movement features for a frame."""
    frame_id: int
    timestamp_sec: float
    mean_motion: float          # Mean velocity magnitude (px/frame)
    max_motion: float           # Max velocity magnitude (px/frame)
    dominant_direction_deg: float # 0 - 360 degrees
    dominant_direction_label: str # e.g. "NORTH-EAST", "STATIONARY"
    direction_variance: float   # Circular variance of angles [0, 1]
    motion_change: float        # Temporal derivative of motion magnitude
    flow_irregularity: float    # Flow turbulence / irregularity [0, 100%]
    flow_magnitude_grid: Optional[np.ndarray] = None # Subsampled optical flow grid

class MotionAnalyzer:
    """
    Farneback Dense Optical Flow Analyzer for crowd velocity and turbulence dynamics.
    """
    def __init__(
        self,
        pyr_scale: float = 0.5,
        levels: int = 3,
        winsize: int = 15,
        iterations: int = 3,
        poly_n: int = 5,
        poly_sigma: float = 1.2,
        motion_threshold: float = 0.5,
        max_expected_velocity_px: float = 25.0
    ):
        self.pyr_scale = pyr_scale
        self.levels = levels
        self.winsize = winsize
        self.iterations = iterations
        self.poly_n = poly_n
        self.poly_sigma = poly_sigma
        self.motion_threshold = motion_threshold
        self.max_expected_velocity = max_expected_velocity_px
        
        self.prev_gray: Optional[np.ndarray] = None
        self.motion_history: List[float] = []

    def _angle_to_compass(self, degrees: float) -> str:
        """Converts angle in degrees to standard 8-point compass direction."""
        if degrees is None or math.isnan(degrees):
            return "STATIONARY"
        val = int((degrees / 45) + 0.5) % 8
        compass_points = ["EAST", "NORTH-EAST", "NORTH", "NORTH-WEST", "WEST", "SOUTH-WEST", "SOUTH", "SOUTH-EAST"]
        return compass_points[val]

    def compute(
        self,
        frame: np.ndarray,
        frame_id: int = 0,
        timestamp_sec: float = 0.0
    ) -> MotionMetrics:
        """
        Computes dense optical flow between current and previous frame.
        """
        if frame is None or frame.size == 0:
            return MotionMetrics(frame_id, timestamp_sec, 0.0, 0.0, 0.0, "STATIONARY", 0.0, 0.0, 0.0)

        # Convert to grayscale and downsample slightly for speed
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame.copy()

        # Resize for optical flow optimization (320x240 is standard benchmark resolution)
        h, w = gray.shape
        flow_w, flow_h = 320, int(320 * (h / w))
        small_gray = cv2.resize(gray, (flow_w, flow_h), interpolation=cv2.INTER_AREA)

        if self.prev_gray is None:
            self.prev_gray = small_gray
            self.motion_history.append(0.0)
            return MotionMetrics(
                frame_id=frame_id,
                timestamp_sec=timestamp_sec,
                mean_motion=0.0,
                max_motion=0.0,
                dominant_direction_deg=0.0,
                dominant_direction_label="STATIONARY",
                direction_variance=0.0,
                motion_change=0.0,
                flow_irregularity=0.0
            )

        # Compute Farneback Optical Flow
        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray,
            small_gray,
            None,
            pyr_scale=self.pyr_scale,
            levels=self.levels,
            winsize=self.winsize,
            iterations=self.iterations,
            poly_n=self.poly_n,
            poly_sigma=self.poly_sigma,
            flags=0
        )
        self.prev_gray = small_gray

        fx, fy = flow[..., 0], flow[..., 1]
        magnitude, angle_rad = cv2.cartToPolar(fx, fy, angleInDegrees=False)

        # Filter out background sensor noise
        active_mask = magnitude > self.motion_threshold
        active_magnitudes = magnitude[active_mask]
        active_angles = angle_rad[active_mask]

        if len(active_magnitudes) > 0:
            mean_mag = float(np.mean(active_magnitudes))
            max_mag = float(np.percentile(active_magnitudes, 98)) # 98th percentile for outlier robustness
            
            # Vector sum for dominant direction and coherence
            sum_vx = float(np.sum(fx[active_mask]))
            sum_vy = float(np.sum(fy[active_mask]))
            vector_sum_mag = math.sqrt(sum_vx * sum_vx + sum_vy * sum_vy)
            sum_scalar_mag = float(np.sum(active_magnitudes))

            # Dominant angle
            dom_angle_rad = math.atan2(sum_vy, sum_vx)
            dom_angle_deg = math.degrees(dom_angle_rad)
            if dom_angle_deg < 0:
                dom_angle_deg += 360.0

            # Directional circular variance: 1 - (|sum(v)| / sum(|v|))
            # 0.0 = perfectly coherent uniform flow (all same direction)
            # 1.0 = highly turbulent / conflicting / chaotic flow
            if sum_scalar_mag > 1e-6:
                coherence = vector_sum_mag / sum_scalar_mag
                flow_irregularity = float(np.clip((1.0 - coherence) * 100.0, 0.0, 100.0))
            else:
                flow_irregularity = 0.0

            # Circular variance of angles
            sin_sum = np.sum(np.sin(active_angles))
            cos_sum = np.sum(np.cos(active_angles))
            R_val = math.sqrt(sin_sum**2 + cos_sum**2) / len(active_angles)
            circular_variance = float(np.clip(1.0 - R_val, 0.0, 1.0))
            dom_direction_label = self._angle_to_compass(dom_angle_deg)
        else:
            mean_mag = 0.0
            max_mag = 0.0
            dom_angle_deg = 0.0
            dom_direction_label = "STATIONARY"
            circular_variance = 0.0
            flow_irregularity = 0.0

        # Temporal Motion Acceleration / Surge Rate
        self.motion_history.append(mean_mag)
        if len(self.motion_history) >= 10:
            prev_motion = self.motion_history[-10]
            motion_change = float(mean_mag - prev_motion)
        else:
            motion_change = 0.0

        if len(self.motion_history) > 100:
            self.motion_history.pop(0)

        return MotionMetrics(
            frame_id=frame_id,
            timestamp_sec=timestamp_sec,
            mean_motion=mean_mag,
            max_motion=max_mag,
            dominant_direction_deg=dom_angle_deg,
            dominant_direction_label=dom_direction_label,
            direction_variance=circular_variance,
            motion_change=motion_change,
            flow_irregularity=flow_irregularity
        )