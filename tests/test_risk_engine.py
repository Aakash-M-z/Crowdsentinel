"""Unit tests for Explainable Risk Engine."""
import unittest
import numpy as np
from ml.features.feature_fusion import FusedFeatureVector
from ml.risk.risk_engine import RiskEngine

class TestRiskEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RiskEngine()

    def test_normal_conditions(self):
        vec = FusedFeatureVector(
            timestamp_sec=1.0, window_start_sec=0.0, window_end_sec=1.0,
            density=12.0, density_change=0.0, movement_magnitude=10.0,
            movement_change=0.0, direction_variance=5.0, flow_irregularity=5.0,
            raw_person_count=10, raw_speed_px=1.5
        )
        res = self.engine.evaluate(vec)
        self.assertEqual(res.risk_level, "NORMAL")
        self.assertLess(res.risk_score, 31.0)

    def test_factor_percentage_sum(self):
        vec = FusedFeatureVector(
            timestamp_sec=5.0, window_start_sec=0.0, window_end_sec=5.0,
            density=75.0, density_change=40.0, movement_magnitude=20.0,
            movement_change=30.0, direction_variance=45.0, flow_irregularity=60.0,
            raw_person_count=65, raw_speed_px=2.0
        )
        res = self.engine.evaluate(vec)
        pct_sum = sum([f.percentage_contribution for f in res.contributing_factors.values()])
        self.assertAlmostEqual(pct_sum, 100.0, delta=1.0)
        self.assertIn(res.risk_level, ["HIGH RISK", "CRITICAL"])

if __name__ == "__main__":
    unittest.main()