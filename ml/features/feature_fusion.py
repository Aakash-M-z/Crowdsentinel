"""
Feature Fusion & Temporal Windowing Module
Aggregates spatial-temporal measurements over configurable time windows (e.g. 5s, 10s, 15s)
and computes normalized feature vectors:
F = [density, density_change, movement_magnitude, movement_change, direction_variance, flow_irregularity]
"""
from dataclasses import dataclass, asdict
from typing import List, Dict, Tuple, Optional
import numpy as np
from ml.density.density_estimator import DensityMetrics
from ml.motion.motion_analyzer import MotionMetrics

@dataclass
class FusedFeatureVector:
    """Represents the normalized 6-dimensional feature vector F."""
    timestamp_sec: float
    window_start_sec: float
    window_end_sec: float
    density: float               # [0, 100] Normalized relative density
    density_change: float        # [0, 100] Normalized density growth rate
    movement_magnitude: float    # [0, 100] Normalized motion velocity
    movement_change: float       # [0, 100] Normalized sudden motion surge
    direction_variance: float    # [0, 100] Normalized circular variance (chaos)
    flow_irregularity: float     # [0, 100] Normalized flow turbulence
    raw_person_count: int
    raw_speed_px: float

    def to_array(self) -> np.ndarray:
        """Returns the 6-element feature vector as a numpy array."""
        return np.array([
            self.density,
            self.density_change,
            self.movement_magnitude,
            self.movement_change,
            self.direction_variance,
            self.flow_irregularity
        ], dtype=np.float32)

    def to_dict(self) -> Dict[str, float]:
        return asdict(self)

class TemporalFeatureAggregator:
    """
    Maintains a sliding temporal window of density and motion observations to fuse into feature vector F.
    """
    def __init__(
        self,
        window_seconds: float = 5.0,
        fps: float = 20.0,
        max_speed_scale_px: float = 15.0
    ):
        self.window_seconds = window_seconds
        self.fps = fps
        self.max_window_frames = int(max(5, window_seconds * fps))
        self.max_speed_scale_px = max_speed_scale_px

        self.density_buffer: List[DensityMetrics] = []
        self.motion_buffer: List[MotionMetrics] = []

    def add_observation(self, density: DensityMetrics, motion: MotionMetrics):
        """Adds a per-frame observation to the temporal sliding window buffer."""
        self.density_buffer.append(density)
        self.motion_buffer.append(motion)

        if len(self.density_buffer) > self.max_window_frames:
            self.density_buffer.pop(0)
            self.motion_buffer.pop(0)

    def get_fused_features(self) -> FusedFeatureVector:
        """
        Aggregates the current window buffer into a normalized FusedFeatureVector.
        """
        if len(self.density_buffer) == 0:
            return FusedFeatureVector(
                timestamp_sec=0.0,
                window_start_sec=0.0,
                window_end_sec=0.0,
                density=0.0,
                density_change=0.0,
                movement_magnitude=0.0,
                movement_change=0.0,
                direction_variance=0.0,
                flow_irregularity=0.0,
                raw_person_count=0,
                raw_speed_px=0.0
            )

        densities = [d.relative_density_pct for d in self.density_buffer]
        d_changes = [d.density_change_rate for d in self.density_buffer]
        motions = [m.mean_motion for m in self.motion_buffer]
        m_changes = [m.motion_change for m in self.motion_buffer]
        dir_variances = [m.direction_variance for m in self.motion_buffer]
        flow_irrs = [m.flow_irregularity for m in self.motion_buffer]
        counts = [d.person_count for d in self.density_buffer]

        start_time = self.density_buffer[0].timestamp_sec
        end_time = self.density_buffer[-1].timestamp_sec

        # 1. Density: mean over window [0, 100]
        f_density = float(np.clip(np.mean(densities), 0.0, 100.0))

        # 2. Density Change: trend over window scaled to [0, 100]
        # Positive rapid increase is normalized to 0-100 scale
        recent_d_change = np.mean(d_changes[-min(len(d_changes), 10):])
        f_d_change = float(np.clip(max(0.0, recent_d_change) * 3.0, 0.0, 100.0))

        # 3. Movement Magnitude: normalized relative to max expected speed [0, 100]
        mean_motion_px = float(np.mean(motions))
        f_motion = float(np.clip((mean_motion_px / self.max_speed_scale_px) * 100.0, 0.0, 100.0))

        # 4. Movement Change: acceleration/surge over window [0, 100]
        recent_m_change = np.mean(m_changes[-min(len(m_changes), 10):])
        f_m_change = float(np.clip(max(0.0, recent_m_change) * 20.0, 0.0, 100.0))

        # 5. Directional Variance: circular variance scaled to [0, 100]
        f_dir_var = float(np.clip(np.mean(dir_variances) * 100.0, 0.0, 100.0))

        # 6. Flow Irregularity: turbulence metric [0, 100]
        f_flow_irr = float(np.clip(np.mean(flow_irrs), 0.0, 100.0))

        return FusedFeatureVector(
            timestamp_sec=end_time,
            window_start_sec=start_time,
            window_end_sec=end_time,
            density=f_density,
            density_change=f_d_change,
            movement_magnitude=f_motion,
            movement_change=f_m_change,
            direction_variance=f_dir_var,
            flow_irregularity=f_flow_irr,
            raw_person_count=int(counts[-1]),
            raw_speed_px=mean_motion_px
        )