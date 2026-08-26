"""
Person Tracking Module
Tracks detected individuals across frames using Centroid / IoU association.
Computes position, displacement, instantaneous velocity, movement direction, and track lifetime.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
import numpy as np
import math
from ml.detection.detector import Detection

@dataclass
class TrackedPerson:
    """Represents a tracked individual over multiple frames."""
    track_id: int
    current_bbox: Tuple[int, int, int, int]
    centroid: Tuple[int, int]
    previous_centroid: Tuple[int, int]
    velocity: Tuple[float, float] = (0.0, 0.0)  # (vx, vy) in pixels/frame
    speed: float = 0.0                          # magnitude in pixels/frame
    direction_degrees: float = 0.0              # 0-360 degrees
    history: List[Tuple[int, int]] = field(default_factory=list)
    frames_active: int = 1
    disappeared_count: int = 0

    def update(self, bbox: Tuple[int, int, int, int], fps: float = 20.0):
        x, y, w, h = bbox
        new_centroid = (int(x + w / 2), int(y + h / 2))
        self.previous_centroid = self.centroid
        self.centroid = new_centroid
        self.current_bbox = bbox
        self.history.append(new_centroid)
        if len(self.history) > 30:
            self.history.pop(0)

        vx = self.centroid[0] - self.previous_centroid[0]
        vy = self.centroid[1] - self.previous_centroid[1]
        self.velocity = (float(vx), float(vy))
        self.speed = float(math.sqrt(vx * vx + vy * vy))
        
        # Calculate angle in degrees [0, 360)
        angle = math.degrees(math.atan2(vy, vx))
        if angle < 0:
            angle += 360.0
        self.direction_degrees = float(angle)

        self.frames_active += 1
        self.disappeared_count = 0

class PersonTracker:
    """
    Multi-object person tracker tracking trajectories and velocities.
    """
    def __init__(self, max_disappeared: int = 15, max_distance: float = 75.0):
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance
        self.next_track_id = 1
        self.tracks: Dict[int, TrackedPerson] = {}

    def update(self, detections: List[Detection], fps: float = 20.0) -> List[TrackedPerson]:
        """
        Associates detections with existing tracks based on Euclidean distance of centroids.
        """
        if len(detections) == 0:
            # Mark all existing tracks as disappeared
            for track_id in list(self.tracks.keys()):
                self.tracks[track_id].disappeared_count += 1
                if self.tracks[track_id].disappeared_count > self.max_disappeared:
                    del self.tracks[track_id]
            return list(self.tracks.values())

        input_centroids = np.array([d.center for d in detections], dtype="int")
        input_bboxes = [d.bbox for d in detections]

        if len(self.tracks) == 0:
            # Register all detections as new tracks
            for i in range(len(detections)):
                self._register_track(input_bboxes[i], input_centroids[i])
            return list(self.tracks.values())

        track_ids = list(self.tracks.keys())
        track_centroids = np.array([self.tracks[tid].centroid for tid in track_ids], dtype="int")

        # Compute pairwise distance matrix between existing track centroids and detection centroids
        D = np.linalg.norm(track_centroids[:, np.newaxis] - input_centroids, axis=2)

        # Match smallest distances first
        rows = D.min(axis=1).argsort()
        cols = D.argmin(axis=1)[rows]

        used_rows = set()
        used_cols = set()

        for row, col in zip(rows, cols):
            if row in used_rows or col in used_cols:
                continue

            if D[row, col] > self.max_distance:
                continue

            track_id = track_ids[row]
            self.tracks[track_id].update(input_bboxes[col], fps=fps)
            used_rows.add(row)
            used_cols.add(col)

        unused_rows = set(range(0, D.shape[0])).difference(used_rows)
        unused_cols = set(range(0, D.shape[1])).difference(used_cols)

        # Handle disappeared tracks
        for row in unused_rows:
            track_id = track_ids[row]
            self.tracks[track_id].disappeared_count += 1
            if self.tracks[track_id].disappeared_count > self.max_disappeared:
                del self.tracks[track_id]

        # Register new tracks for unmatched detections
        for col in unused_cols:
            self._register_track(input_bboxes[col], input_centroids[col])

        return list(self.tracks.values())

    def _register_track(self, bbox: Tuple[int, int, int, int], centroid: Tuple[int, int]):
        track = TrackedPerson(
            track_id=self.next_track_id,
            current_bbox=bbox,
            centroid=(int(centroid[0]), int(centroid[1])),
            previous_centroid=(int(centroid[0]), int(centroid[1])),
            history=[(int(centroid[0]), int(centroid[1]))]
        )
        self.tracks[self.next_track_id] = track
        self.next_track_id += 1