"""Unit tests for Person Detection Module."""
import unittest
import numpy as np
from ml.detection.detector import PersonDetector, Detection

class TestPersonDetection(unittest.TestCase):
    def setUp(self):
        self.detector = PersonDetector()

    def test_empty_frame_handling(self):
        empty_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        result = self.detector.detect(empty_frame)
        self.assertEqual(result.person_count, 0)
        self.assertEqual(len(result.detections), 0)

    def test_detection_dataclass(self):
        det = Detection(bbox=(100, 100, 50, 100), confidence=0.88, class_id=0)
        self.assertEqual(det.center, (125, 150))
        self.assertEqual(det.class_id, 0)

if __name__ == "__main__":
    unittest.main()