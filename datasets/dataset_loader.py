"""
Dataset Ingestion & Annotation Loader
Supports standard video formats, extracts frame sequences, and loads temporal ground-truth risk labels.
"""
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple
import os
import glob
import json
import cv2
import pandas as pd

@dataclass
class VideoAnnotation:
    video_id: str
    video_path: str
    duration_sec: float
    total_frames: int
    fps: float
    resolution: Tuple[int, int]
    ground_truth_events: List[Dict[str, Any]] # e.g. [{"start_sec": 12.0, "end_sec": 25.0, "level": "HIGH RISK"}]
    dataset_name: str
    split: str # "train", "val", "test"

class DatasetLoader:
    """
    Loads and standardizes public and benchmark crowd datasets (UMN, GBA-Stampedes, Synthetic Benchmark).
    """
    def __init__(self, data_root: str = "datasets"):
        self.data_root = data_root

    def scan_videos(self, directory: str, extension: str = "*.mp4") -> List[str]:
        """Discovers all video files in the specified directory."""
        search_path = os.path.join(self.data_root, directory, "**", extension)
        return glob.glob(search_path, recursive=True)

    def load_video_metadata(self, video_path: str, dataset_name: str = "Benchmark") -> Optional[VideoAnnotation]:
        """Extracts technical metadata and frame counts from a video file."""
        if not os.path.exists(video_path):
            return None

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = frames / fps if fps > 0 else 0.0
        cap.release()

        video_id = os.path.splitext(os.path.basename(video_path))[0]
        meta_file = video_path.replace(".mp4", "_meta.json")
        gt_events = []
        if os.path.exists(meta_file):
            with open(meta_file, "r", encoding="utf-8") as f:
                gt_events = json.load(f).get("events", [])

        return VideoAnnotation(
            video_id=video_id,
            video_path=video_path,
            duration_sec=round(duration, 2),
            total_frames=frames,
            fps=round(fps, 2),
            resolution=(w, h),
            ground_truth_events=gt_events,
            dataset_name=dataset_name,
            split="unassigned"
        )