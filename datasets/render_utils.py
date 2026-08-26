"""
Enhanced Pedestrian Renderer for Standardized Benchmarks
Draws realistic standing and walking human figures (head, torso, arms, legs, shoes)
with natural perspective and shadow for accurate visual feature extraction.
"""
import math
import cv2
import numpy as np

def draw_realistic_pedestrian(img: np.ndarray, x: int, y: int, height: int = 50, color=(60, 90, 180), heading_rad: float = 0.0, walk_phase: float = 0.0):
    h_img, w_img = img.shape[:2]
    if x < 20 or x > w_img - 20 or y < 40 or y > h_img - 20:
        return (x, y, 0, 0)

    # Scale components by height
    head_r = int(height * 0.12)
    torso_h = int(height * 0.42)
    torso_w = int(height * 0.28)
    leg_h = int(height * 0.46)
    leg_w = max(2, int(height * 0.08))

    # Shadow
    cv2.ellipse(img, (x, y + height // 2), (torso_w, int(torso_w * 0.4)), 0, 0, 360, (180, 180, 180), -1)

    # Legs with walking stride
    leg_offset = int(math.sin(walk_phase) * (leg_w * 2))
    # Left leg
    cv2.rectangle(img, (x - torso_w//3 - leg_w//2, y + torso_h//2 - 5), 
                        (x - torso_w//3 + leg_w//2 + leg_offset, y + torso_h//2 + leg_h), (40, 40, 60), -1)
    # Right leg
    cv2.rectangle(img, (x + torso_w//3 - leg_w//2, y + torso_h//2 - 5), 
                        (x + torso_w//3 + leg_w//2 - leg_offset, y + torso_h//2 + leg_h), (40, 40, 60), -1)

    # Torso / Jacket / Shirt
    cv2.rectangle(img, (x - torso_w // 2, y - torso_h // 2), 
                        (x + torso_w // 2, y + torso_h // 2), color, -1)
    cv2.rectangle(img, (x - torso_w // 2, y - torso_h // 2), 
                        (x + torso_w // 2, y + torso_h // 2), (20, 20, 20), 1)

    # Head
    head_y = y - torso_h // 2 - head_r
    cv2.circle(img, (x, head_y), head_r, (200, 175, 150), -1)
    cv2.circle(img, (x, head_y), head_r, (40, 40, 40), 1)
    # Hair
    cv2.ellipse(img, (x, head_y - 2), (head_r, int(head_r * 0.6)), 0, 180, 360, (30, 20, 10), -1)

    bbox_x = max(0, x - torso_w // 2 - 2)
    bbox_y = max(0, head_y - head_r)
    bbox_w = torso_w + 4
    bbox_h = (y + torso_h//2 + leg_h) - bbox_y
    return (bbox_x, bbox_y, bbox_w, bbox_h)