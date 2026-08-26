"""
Crowd Density Estimation Module
Computes:
1. Absolute Person Count (N)
2. Relative Image-Space Density Percentage (0 - 100%)
3. 4-Quadrant Zone Densities (Zone A, B, C, D)
4. Temporal Density Change (Delta D) and Growth Rate (dD/dt)
"""
from dataclasses import dataclass
from typing import List, Dict, Tuple
import numpy as np
from ml.detection.detector import Detection

@dataclass
class ZoneDensity:
    """Density breakdown for a specific sub-region."""
    zone_name: str
    count: int
    relative_density_pct: float
    bbox: Tuple[int, int, int, int]  # Zone ROI (x, y, w, h)

@dataclass
class DensityMetrics:
    """Complete density telemetry for a frame."""
    frame_id: int
    timestamp_sec: float
    person_count: int
    relative_density_pct: float     # 0.0 - 100.0%
    density_change_rate: float      # Change compared to previous window
    zones: Dict[str, ZoneDensity]   # Zone A, B, C, D
    is_calibrated: bool = False     # False = image-space relative density

class DensityEstimator:
    """
    Computes spatial and temporal crowd density features.
    """
    def __init__(
        self,
        grid_rows: int = 2,
        grid_cols: int = 2,
        max_expected_capacity: int = 80,
        temporal_growth_interval_frames: int = 10
    ):
        self.grid_rows = grid_rows
        self.grid_cols = grid_cols
        self.max_expected_capacity = max_expected_capacity
        self.growth_interval = temporal_growth_interval_frames
        self.density_history: List[float] = []

    def compute(
        self,
        detections: List[Detection],
        frame_shape: Tuple[int, int],
        frame_id: int = 0,
        timestamp_sec: float = 0.0
    ) -> DensityMetrics:
        """
        Calculates whole-frame and quadrant zone density.
        """
        h_img, w_img = frame_shape[:2]
        total_frame_area = float(h_img * w_img) if h_img > 0 and w_img > 0 else 1.0
        person_count = len(detections)

        # Compute relative occupancy (sum of person bounding box area / frame area)
        # Apply scaling and clipping to represent realistic crowd occupancy
        total_bbox_area = sum([w * h for (_, _, w, h) in [d.bbox for d in detections]])
        occupancy_ratio = min(1.0, (total_bbox_area / total_frame_area) * 2.5) if total_frame_area > 0 else 0.0
        count_ratio = min(1.0, person_count / float(self.max_expected_capacity))
        
        # Combined relative image-space density percentage (0-100%)
        relative_density_pct = float(np.clip((occupancy_ratio * 0.6 + count_ratio * 0.4) * 100.0, 0.0, 100.0))

        # Quadrant Zone Partitioning (2x2 grid)
        # Zone A = Top-Left, Zone B = Top-Right, Zone C = Bottom-Left, Zone D = Bottom-Right
        mid_x = w_img // 2
        mid_y = h_img // 2
        
        zone_definitions = {
            "Zone A": (0, 0, mid_x, mid_y),
            "Zone B": (mid_x, 0, w_img - mid_x, mid_y),
            "Zone C": (0, mid_y, mid_x, h_img - mid_y),
            "Zone D": (mid_x, mid_y, w_img - mid_x, h_img - mid_y)
        }

        zone_counts = {"Zone A": 0, "Zone B": 0, "Zone C": 0, "Zone D": 0}
        zone_areas = {"Zone A": 0.0, "Zone B": 0.0, "Zone C": 0.0, "Zone D": 0.0}

        for det in detections:
            cx, cy = det.center
            w, h = det.bbox[2], det.bbox[3]
            area = w * h
            if cx < mid_x and cy < mid_y:
                zone_counts["Zone A"] += 1
                zone_areas["Zone A"] += area
            elif cx >= mid_x and cy < mid_y:
                zone_counts["Zone B"] += 1
                zone_areas["Zone B"] += area
            elif cx < mid_x and cy >= mid_y:
                zone_counts["Zone C"] += 1
                zone_areas["Zone C"] += area
            else:
                zone_counts["Zone D"] += 1
                zone_areas["Zone D"] += area

        zones: Dict[str, ZoneDensity] = {}
        for z_name, z_bbox in zone_definitions.items():
            z_total_area = float(z_bbox[2] * z_bbox[3])
            z_occ = min(1.0, (zone_areas[z_name] / z_total_area) * 2.5) if z_total_area > 0 else 0.0
            z_cnt_ratio = min(1.0, zone_counts[z_name] / (self.max_expected_capacity / 4.0))
            z_density_pct = float(np.clip((z_occ * 0.6 + z_cnt_ratio * 0.4) * 100.0, 0.0, 100.0))
            zones[z_name] = ZoneDensity(
                zone_name=z_name,
                count=zone_counts[z_name],
                relative_density_pct=z_density_pct,
                bbox=z_bbox
            )

        # Calculate Temporal Density Growth Rate (Delta D / Delta t)
        self.density_history.append(relative_density_pct)
        if len(self.density_history) > self.growth_interval:
            prev_density = self.density_history[-self.growth_interval]
            density_change_rate = float(relative_density_pct - prev_density)
        else:
            density_change_rate = 0.0

        if len(self.density_history) > 100:
            self.density_history.pop(0)

        return DensityMetrics(
            frame_id=frame_id,
            timestamp_sec=timestamp_sec,
            person_count=person_count,
            relative_density_pct=relative_density_pct,
            density_change_rate=density_change_rate,
            zones=zones,
            is_calibrated=False
        )