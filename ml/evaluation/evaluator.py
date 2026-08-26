"""
Evaluation Metrics & Safety Profiler Module
Computes:
1. Risk Classification: Accuracy, Precision, Recall, F1-Score, Specificity, Confusion Matrix
2. Safety Metrics: False Alarm Rate, Missed Detection Rate, Early Warning Lead Time
3. Density Metrics: MAE, RMSE
4. Runtime Benchmark: Average Latency (ms), Peak Latency (ms), Processing FPS
"""
from dataclasses import dataclass, asdict
from typing import List, Dict, Tuple, Optional
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix

@dataclass
class ClassificationMetrics:
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    f1_weighted: float
    confusion_matrix: List[List[int]]
    classes: List[str]

@dataclass
class SafetyMetrics:
    total_alerts_issued: int
    true_positive_alerts: int
    false_alarms: int
    false_alarm_rate: float       # False alarms / Total normal instances (or total alarms)
    missed_detections: int
    missed_detection_rate: float
    mean_early_warning_time_sec: float # Lead time before critical escalation
    median_early_warning_time_sec: float
    min_early_warning_time_sec: float
    max_early_warning_time_sec: float

@dataclass
class DensityAccuracyMetrics:
    mae: float
    rmse: float
    mean_relative_error: float

@dataclass
class RuntimeBenchmarkMetrics:
    total_frames: int
    total_time_sec: float
    average_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    processing_fps: float
    input_resolution: str
    hardware_device: str

@dataclass
class FullEvaluationReport:
    model_name: str
    dataset_name: str
    timestamp_utc: str
    classification: ClassificationMetrics
    safety: SafetyMetrics
    density: DensityAccuracyMetrics
    runtime: RuntimeBenchmarkMetrics

class ModelEvaluator:
    """
    Computes rigorous scientific metrics from ground-truth annotations and predictions.
    """
    CLASSES = ["NORMAL", "WARNING", "HIGH RISK", "CRITICAL"]

    @staticmethod
    def evaluate_classification(
        y_true: List[str],
        y_pred: List[str],
        classes: Optional[List[str]] = None
    ) -> ClassificationMetrics:
        """Calculates multi-class classification metrics."""
        cls_list = classes or ModelEvaluator.CLASSES
        
        # Binary or multiclass metrics
        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, labels=cls_list, average="macro", zero_division=0))
        rec = float(recall_score(y_true, y_pred, labels=cls_list, average="macro", zero_division=0))
        f1_m = float(f1_score(y_true, y_pred, labels=cls_list, average="macro", zero_division=0))
        f1_w = float(f1_score(y_true, y_pred, labels=cls_list, average="weighted", zero_division=0))
        cm = confusion_matrix(y_true, y_pred, labels=cls_list).tolist()

        return ClassificationMetrics(
            accuracy=round(acc, 4),
            precision_macro=round(prec, 4),
            recall_macro=round(rec, 4),
            f1_macro=round(f1_m, 4),
            f1_weighted=round(f1_w, 4),
            confusion_matrix=cm,
            classes=cls_list
        )

    @staticmethod
    def evaluate_safety_and_lead_time(
        y_true_escalations: List[Dict[str, float]], # List of dicts with onset_sec, true_level
        predicted_warnings: List[Dict[str, float]]   # List of dicts with timestamp_sec, pred_level
    ) -> SafetyMetrics:
        """
        Calculates False Alarm Rate and Early Warning Lead Times based on event onset annotations.
        """
        early_warning_times = []
        matched_true = set()
        matched_preds = set()

        for true_idx, true_event in enumerate(y_true_escalations):
            onset = true_event["onset_sec"]
            # Look for warnings triggered within a pre-event window (e.g. 0-30s prior to event)
            for pred_idx, pred_event in enumerate(predicted_warnings):
                p_time = pred_event["timestamp_sec"]
                if p_time <= onset and (onset - p_time) <= 30.0:
                    lead_time = float(onset - p_time)
                    early_warning_times.append(lead_time)
                    matched_true.add(true_idx)
                    matched_preds.add(pred_idx)
                    break

        total_alerts = len(predicted_warnings)
        true_positives = len(matched_preds)
        false_alarms = max(0, total_alerts - true_positives)
        missed = max(0, len(y_true_escalations) - len(matched_true))

        far = (false_alarms / total_alerts) if total_alerts > 0 else 0.0
        mdr = (missed / len(y_true_escalations)) if len(y_true_escalations) > 0 else 0.0

        if len(early_warning_times) > 0:
            mean_ewt = float(np.mean(early_warning_times))
            median_ewt = float(np.median(early_warning_times))
            min_ewt = float(np.min(early_warning_times))
            max_ewt = float(np.max(early_warning_times))
        else:
            mean_ewt = median_ewt = min_ewt = max_ewt = 0.0

        return SafetyMetrics(
            total_alerts_issued=total_alerts,
            true_positive_alerts=true_positives,
            false_alarms=false_alarms,
            false_alarm_rate=round(far, 4),
            missed_detections=missed,
            missed_detection_rate=round(mdr, 4),
            mean_early_warning_time_sec=round(mean_ewt, 2),
            median_early_warning_time_sec=round(median_ewt, 2),
            min_early_warning_time_sec=round(min_ewt, 2),
            max_early_warning_time_sec=round(max_ewt, 2)
        )

    @staticmethod
    def evaluate_density(
        gt_counts: List[int],
        pred_counts: List[int]
    ) -> DensityAccuracyMetrics:
        """Computes MAE and RMSE against ground-truth person counts."""
        if len(gt_counts) == 0 or len(pred_counts) == 0:
            return DensityAccuracyMetrics(0.0, 0.0, 0.0)

        gt = np.array(gt_counts, dtype=np.float32)
        pred = np.array(pred_counts, dtype=np.float32)
        diff = np.abs(gt - pred)

        mae = float(np.mean(diff))
        rmse = float(np.sqrt(np.mean((gt - pred)**2)))
        mre = float(np.mean(diff / np.maximum(gt, 1.0)))

        return DensityAccuracyMetrics(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            mean_relative_error=round(mre, 4)
        )

    @staticmethod
    def benchmark_runtime(
        latencies_ms: List[float],
        resolution: str = "1280x720",
        device: str = "CPU"
    ) -> RuntimeBenchmarkMetrics:
        """Profiles latency percentiles and effective processing FPS."""
        if len(latencies_ms) == 0:
            return RuntimeBenchmarkMetrics(0, 0.0, 0.0, 0.0, 0.0, 0.0, resolution, device)

        arr = np.array(latencies_ms)
        avg_lat = float(np.mean(arr))
        p95 = float(np.percentile(arr, 95))
        p99 = float(np.percentile(arr, 99))
        total_time_sec = float(np.sum(arr) / 1000.0)
        fps = float(len(latencies_ms) / total_time_sec) if total_time_sec > 0 else 0.0

        return RuntimeBenchmarkMetrics(
            total_frames=len(latencies_ms),
            total_time_sec=round(total_time_sec, 2),
            average_latency_ms=round(avg_lat, 2),
            p95_latency_ms=round(p95, 2),
            p99_latency_ms=round(p99, 2),
            processing_fps=round(fps, 1),
            input_resolution=resolution,
            hardware_device=device
        )