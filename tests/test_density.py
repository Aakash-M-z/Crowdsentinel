"""Unit tests for Crowd Density Estimation Module."""
import unittest
import numpy as np
from ml.detection.detector import Detection
from ml.density.density_estimator import DensityEstimator

class TestDensityEstimator(unittest.TestCase):
    def setUp(self):
        self.estimator = DensityEstimator(max_expected_capacity=50)

    def test_zero_occupancy(self):
        res = self.estimator.compute([], (480, 640), frame_id=0, timestamp_sec=0.0)
        self.assertEqual(res.person_count, 0)
        self.assertEqual(res.relative_density_pct, 0.0)
        self.assertEqual(len(res.zones), 4)

    def test_quadrant_partitioning(self):
        # Place 1 person in Zone A (Top-Left) and 1 person in Zone D (Bottom-Right)
        det_a = Detection(bbox=(50, 50, 40, 80), confidence=0.9)
        det_d = Detection(bbox=(400, 350, 40, 80), confidence=0.9)
        res = self.estimator.compute([det_a, det_d], (480, 640), frame_id=1, timestamp_sec=0.05)
        self.assertEqual(res.person_count, 2)
        self.assertEqual(res.zones["Zone A"].count, 1)
        self.assertEqual(res.zones["Zone B"].count, 0)
        self.assertEqual(res.zones["Zone C"].count, 0)
        self.assertEqual(res.zones["Zone D"].count, 1)

if __name__ == "__main__":
    unittest.main()