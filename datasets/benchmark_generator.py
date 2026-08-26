"""
Standardized Benchmark Video & Ground-Truth Dataset Generator
Synthesizes verified computer vision benchmark video sequences with realistic pedestrian motion,
ground-truth event onsets, density transitions, and directional turbulence for reproducible research.
"""
import os
import json
import math
import random
from typing import Tuple, List, Dict, Any
import numpy as np
import cv2
from datasets.render_utils import draw_realistic_pedestrian

class BenchmarkVideoGenerator:
    """Generates standardized benchmark video sequences with realistic pedestrian visuals and ground-truth metadata."""
    
    def __init__(self, output_dir: str = "datasets/raw"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_sequence(
        self,
        seq_name: str,
        duration_sec: float = 12.0,
        fps: float = 20.0,
        resolution: Tuple[int, int] = (640, 480),
        scenario: str = "normal_flow",
        random_seed: int = 42
    ) -> Tuple[str, str]:
        """
        Generates a video file and associated ground-truth event metadata.
        Scenarios: 'normal_flow', 'bottleneck_congestion', 'counter_flow_surge', 'panic_dispersion', 'dense_standstill'
        """
        rng = random.Random(random_seed)
        w, h = resolution
        total_frames = int(duration_sec * fps)
        video_path = os.path.join(self.output_dir, f"{seq_name}.mp4")
        meta_path = os.path.join(self.output_dir, f"{seq_name}_meta.json")

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(video_path, fourcc, fps, (w, h))

        # Pedestrian state agents: [(x, y, vx, vy, color, height, phase)]
        agents = []
        initial_count = 22 if scenario != "dense_standstill" else 55
        
        for _ in range(initial_count):
            ax = rng.uniform(50, w - 50)
            ay = rng.uniform(60, h - 60)
            base_speed = rng.uniform(1.2, 2.2)
            angle = rng.uniform(-0.25, 0.25) if "flow" in scenario else rng.uniform(0, 2 * math.pi)
            vx = base_speed * math.cos(angle)
            vy = base_speed * math.sin(angle)
            color = (rng.randint(60, 180), rng.randint(60, 180), rng.randint(120, 240))
            p_height = rng.randint(42, 54)
            agents.append([ax, ay, vx, vy, color, p_height, rng.uniform(0, math.pi)])

        ground_truth_records = []
        event_onsets = []

        escalation_frame = int(total_frames * 0.40) # 40% mark
        critical_frame = int(total_frames * 0.70)   # 70% mark

        if scenario != "normal_flow":
            event_onsets.append({
                "onset_sec": round(escalation_frame / fps, 2),
                "event_type": scenario,
                "target_risk_level": "HIGH RISK" if scenario != "panic_dispersion" else "CRITICAL"
            })

        for f_idx in range(total_frames):
            ts = f_idx / fps
            frame = np.ones((h, w, 3), dtype=np.uint8) * 242 # Off-white pavement background
            
            # Subtle tiled grid texture
            for gx in range(0, w, 50):
                cv2.line(frame, (gx, 0), (gx, h), (225, 225, 225), 1)
            for gy in range(0, h, 50):
                cv2.line(frame, (0, gy), (w, gy), (225, 225, 225), 1)

            # Evolve agents based on scenario
            if scenario == "normal_flow":
                current_risk = "NORMAL"
                for ag in agents:
                    ag[0] += ag[2]
                    ag[1] += ag[3]
                    ag[6] += 0.25
                    if ag[0] > w + 20: ag[0] = -15
                    if ag[1] < 30: ag[1] = h - 30
                    if ag[1] > h - 20: ag[1] = 40

            elif scenario == "bottleneck_congestion":
                if f_idx < escalation_frame:
                    current_risk = "NORMAL"
                elif f_idx < critical_frame:
                    current_risk = "WARNING"
                else:
                    current_risk = "HIGH RISK"

                # Inflow increases
                if f_idx > escalation_frame and len(agents) < 68 and f_idx % 3 == 0:
                    agents.append([rng.uniform(30, w - 30), h - 30, 0.4, -rng.uniform(1.0, 1.8), (40, 40, 200), rng.randint(44, 52), 0.0])

                # Slow down towards center
                for ag in agents:
                    dist_to_center = math.sqrt((ag[0] - w/2)**2 + (ag[1] - h/2)**2)
                    slowdown = max(0.12, min(1.0, dist_to_center / (w * 0.35))) if f_idx >= escalation_frame else 1.0
                    ag[0] += ag[2] * slowdown
                    ag[1] += ag[3] * slowdown
                    ag[6] += 0.25 * slowdown

            elif scenario == "counter_flow_surge":
                if f_idx < escalation_frame:
                    current_risk = "NORMAL"
                elif f_idx < critical_frame:
                    current_risk = "WARNING"
                else:
                    current_risk = "CRITICAL"

                if f_idx >= escalation_frame and f_idx % 2 == 0 and len(agents) < 70:
                    # Inflow opposing cross-stream from right to left
                    agents.append([w - 20, rng.uniform(80, h - 80), -rng.uniform(3.8, 5.8), rng.uniform(-0.6, 0.6), (20, 20, 220), rng.randint(44, 54), 0.0])

                for ag in agents:
                    ag[0] += ag[2]
                    ag[1] += ag[3]
                    ag[6] += 0.4

            elif scenario == "panic_dispersion":
                if f_idx < escalation_frame:
                    current_risk = "NORMAL"
                else:
                    current_risk = "CRITICAL"
                    for ag in agents:
                        dx = ag[0] - (w / 2)
                        dy = ag[1] - (h / 2)
                        dist = max(1.0, math.sqrt(dx * dx + dy * dy))
                        ag[2] = (dx / dist) * rng.uniform(5.0, 8.5)
                        ag[3] = (dy / dist) * rng.uniform(5.0, 8.5)

                for ag in agents:
                    ag[0] += ag[2]
                    ag[1] += ag[3]
                    ag[6] += 0.5
            else:
                current_risk = "HIGH RISK" if f_idx >= escalation_frame else "WARNING"
                for ag in agents:
                    ag[0] += rng.uniform(-0.5, 0.5)
                    ag[1] += rng.uniform(-0.5, 0.5)
                    ag[6] += 0.1

            # Render agents sorted by y (depth sorting)
            agents.sort(key=lambda a: a[1])
            for ag in agents:
                draw_realistic_pedestrian(
                    frame,
                    x=int(ag[0]),
                    y=int(ag[1]),
                    height=ag[5],
                    color=ag[4],
                    heading_rad=math.atan2(ag[3], ag[2]),
                    walk_phase=ag[6]
                )

            writer.write(frame)

            ground_truth_records.append({
                "frame_id": f_idx,
                "timestamp_sec": round(ts, 2),
                "ground_truth_risk_level": current_risk,
                "ground_truth_person_count": len(agents)
            })

        writer.release()

        meta_data = {
            "sequence_name": seq_name,
            "scenario": scenario,
            "duration_sec": duration_sec,
            "fps": fps,
            "resolution": [w, h],
            "total_frames": total_frames,
            "events": event_onsets,
            "frame_annotations": ground_truth_records
        }

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta_data, f, indent=2)

        return video_path, meta_path

    def generate_full_benchmark_suite(self) -> List[Tuple[str, str]]:
        """Generates a complete multi-sequence dataset suite."""
        suite_specs = [
            ("seq_01_normal_flow", 10.0, "normal_flow", 101),
            ("seq_02_bottleneck_congestion", 12.0, "bottleneck_congestion", 102),
            ("seq_03_counter_flow_surge", 10.0, "counter_flow_surge", 103),
            ("seq_04_rapid_panic_dispersion", 10.0, "panic_dispersion", 104),
            ("seq_05_dense_standstill", 8.0, "dense_standstill", 105),
            ("seq_06_steady_concourse", 10.0, "normal_flow", 106),
        ]
        
        generated = []
        for name, dur, scen, seed in suite_specs:
            v_path, m_path = self.generate_sequence(name, duration_sec=dur, scenario=scen, random_seed=seed)
            generated.append((v_path, m_path))
            print(f"Generated benchmark video: {v_path}")

        return generated

if __name__ == "__main__":
    gen = BenchmarkVideoGenerator()
    gen.generate_full_benchmark_suite()