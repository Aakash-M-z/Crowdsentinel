"""
Video-Level Dataset Splitting Module
Partitions dataset by distinct video scenes/files (70% Train, 15% Validation, 15% Test)
using fixed random seeds to strictly eliminate temporal leakage.
"""
import os
import json
import random
from typing import List, Dict, Any, Tuple
from datasets.dataset_loader import VideoAnnotation

def split_dataset_by_video(
    videos: List[VideoAnnotation],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_seed: int = 42
) -> Dict[str, List[VideoAnnotation]]:
    """
    Partitions videos into train, val, and test splits at the video-level.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-4, "Ratios must sum to 1.0"
    
    rng = random.Random(random_seed)
    shuffled = list(videos)
    rng.shuffle(shuffled)

    n_total = len(shuffled)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)
    
    # Guarantee at least 1 in val and test if total >= 3
    if n_total >= 3:
        n_train = max(1, n_train)
        n_val = max(1, n_val)

    train_vids = shuffled[:n_train]
    val_vids = shuffled[n_train:n_train + n_val]
    test_vids = shuffled[n_train + n_val:]

    for v in train_vids:
        v.split = "train"
    for v in val_vids:
        v.split = "val"
    for v in test_vids:
        v.split = "test"

    return {
        "train": train_vids,
        "val": val_vids,
        "test": test_vids
    }

def save_split_manifest(split_dict: Dict[str, List[VideoAnnotation]], save_path: str = "datasets/splits/split_manifest.json"):
    """Saves the partition manifest for reproducible experiments."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    manifest = {}
    for split_name, vids in split_dict.items():
        manifest[split_name] = [
            {
                "video_id": v.video_id,
                "video_path": v.video_path,
                "duration_sec": v.duration_sec,
                "total_frames": v.total_frames,
                "dataset_name": v.dataset_name
            }
            for v in vids
        ]

    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)