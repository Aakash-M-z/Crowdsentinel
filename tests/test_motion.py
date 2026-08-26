"""Unit tests for Motion & Optical Flow Module."""
import unittest
import numpy as np
import cv2
from ml.motion.motion_analyzer import MotionAnalyzer

class TestMotionAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = MotionAnalyzer()

    def test_initial_frame(self):
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 128
        res = self.analyzer.compute(frame, frame_id=0, timestamp_sec=0.0)
        self.assertEqual(res.mean_motion, 0.0)
        self.assertEqual(res.dominant_direction_label, "STATIONARY")

    def test_laminar_motion(self):
        # Frame 1: Circle at (100, 100)
        f1 = np.ones((480, 640, 3), dtype=np.uint8) * 200
        cv2.circle(f1, (100, 100), 20, (20, 20, 20), -1)
        # Frame 2: Circle moved right to (120, 100)
        f2 = np.ones((480, 640, 3), dtype=np.uint8) * 200
        cv2.circle(f2, (120, 100), 20, (20, 20, 20), -1)

        self.analyzer.compute(f1, frame_id=1, timestamp_sec=0.0)
        res = self.analyzer.compute(f2, frame_id=2, timestamp_sec=0.05)
        self.assertGreater(res.mean_motion, 0.0)
        self.assertIn("EAST", res.dominant_direction_label)

if __name__ == "__main__":
    unittest.main()