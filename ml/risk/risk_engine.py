import numpy as np
"""
Explainable Crowd Risk Engine (IEEE Multi-Modal Formulation)
Models both:
1. Spatial Congestion & Compression Risk (High Density + Inflow Surge / Velocity Breakdown)
2. Dynamic Surge & Turbulence Risk (Directional Chaos + Sudden Acceleration + Flow Irregularity)
Produces exact percentage factor contributions: C_i = (w_i * F_i) / R * 100%
"""
from dataclasses import dataclass
from typing import Dict, Tuple, Optional
import yaml
import os
import math
from ml.features.feature_fusion import FusedFeatureVector

@dataclass
class FactorContribution:
    """Explains a single feature's contribution to the composite risk score."""
    feature_name: str
    feature_value: float          # Raw normalized value [0, 100]
    weight: float                 # Assigned weight
    weighted_score: float         # weight * feature_value
    percentage_contribution: float # Exact percentage contribution to total score

@dataclass
class RiskAssessmentResult:
    """Comprehensive risk assessment and explainability report."""
    timestamp_sec: float
    risk_score: float             # [0, 100]
    risk_level: str               # NORMAL, WARNING, HIGH RISK, CRITICAL
    contributing_factors: Dict[str, FactorContribution]
    dominant_factor: str
    operational_advisory: str
    thresholds: Dict[str, float]
    weights: Dict[str, float]

class RiskEngine:
    """
    Transparent, configurable, and explainable decision-support risk scoring engine.
    """
    DEFAULT_WEIGHTS = {
        "density": 0.25,
        "density_change": 0.20,
        "movement_magnitude": 0.20,
        "movement_change": 0.15,
        "direction_variance": 0.10,
        "flow_irregularity": 0.10
    }

    DEFAULT_THRESHOLDS = {
        "warning": 31.0,
        "high_risk": 51.0,
        "critical": 76.0
    }

    def __init__(self, config_path: Optional[str] = None, weights: Optional[Dict[str, float]] = None, thresholds: Optional[Dict[str, float]] = None):
        self.weights = self.DEFAULT_WEIGHTS.copy()
        self.thresholds = self.DEFAULT_THRESHOLDS.copy()

        if config_path and os.path.exists(config_path):
            self.load_config(config_path)

        if weights:
            self.weights.update(weights)
        if thresholds:
            self.thresholds.update(thresholds)

        self._normalize_weights()

    def _normalize_weights(self):
        """Ensures weights sum to 1.0."""
        total = sum(self.weights.values())
        if total > 0:
            for k in self.weights:
                self.weights[k] = self.weights[k] / total

    def load_config(self, config_path: str):
        """Loads configuration from YAML file."""
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                cfg = yaml.safe_load(f)
                if "weights" in cfg:
                    self.weights.update(cfg["weights"])
                if "thresholds" in cfg:
                    self.thresholds.update(cfg["thresholds"])
                self._normalize_weights()
        except Exception:
            pass

    def classify_level(self, score: float) -> str:
        """Maps numerical score to discrete qualitative risk categories."""
        if score >= self.thresholds.get("critical", 76.0):
            return "CRITICAL"
        elif score >= self.thresholds.get("high_risk", 51.0):
            return "HIGH RISK"
        elif score >= self.thresholds.get("warning", 31.0):
            return "WARNING"
        else:
            return "NORMAL"

    def _generate_advisory(self, level: str, dominant: str, factors: Dict[str, FactorContribution]) -> str:
        """Generates human-operator decision-support recommendations based on primary signals."""
        if level == "CRITICAL":
            return f"URGENT: Extreme escalation driven primarily by {dominant}. Alert incident commander, open auxiliary egress routes, and throttle intake."
        elif level == "HIGH RISK":
            return f"ELEVATED: High crowd risk signal detected due to {dominant}. Dispatch floor marshals to investigate throughput and prepare diversion protocols."
        elif level == "WARNING":
            return f"CAUTION: Moderate crowd build-up or motion irregularity ({dominant}). Increase observation frequency and verify bottleneck clearances."
        else:
            return "NORMAL: Crowd parameters within safe operational tolerances. Continuous monitoring active."

    def evaluate(self, features: FusedFeatureVector) -> RiskAssessmentResult:
        """
        Calculates composite risk score and exact percentage explainability breakdown.
        """
        f_density = features.density
        f_d_change = features.density_change
        f_motion = features.movement_magnitude
        f_m_change = features.movement_change
        f_dir_var = features.direction_variance
        f_flow_irr = features.flow_irregularity

        # Check if we are running baseline or full proposed
        # If density-only baseline:
        if self.weights.get("movement_magnitude", 0) == 0 and self.weights.get("flow_irregularity", 0) == 0:
            score_d = self.weights.get("density", 0.6) * f_density + self.weights.get("density_change", 0.4) * f_d_change
            composite_score = float(np.clip(score_d, 0.0, 100.0))
            weighted_scores = {
                "density": self.weights.get("density", 0.6) * f_density,
                "density_change": self.weights.get("density_change", 0.4) * f_d_change,
                "movement_magnitude": 0.0,
                "movement_change": 0.0,
                "direction_variance": 0.0,
                "flow_irregularity": 0.0
            }
        # If motion-only baseline:
        elif self.weights.get("density", 0) == 0 and self.weights.get("density_change", 0) == 0:
            score_m = (self.weights.get("movement_magnitude", 0.4) * f_motion +
                       self.weights.get("movement_change", 0.3) * f_m_change +
                       self.weights.get("direction_variance", 0.15) * f_dir_var +
                       self.weights.get("flow_irregularity", 0.15) * f_flow_irr)
            composite_score = float(np.clip(score_m, 0.0, 100.0))
            weighted_scores = {
                "density": 0.0,
                "density_change": 0.0,
                "movement_magnitude": self.weights.get("movement_magnitude", 0.4) * f_motion,
                "movement_change": self.weights.get("movement_change", 0.3) * f_m_change,
                "direction_variance": self.weights.get("direction_variance", 0.15) * f_dir_var,
                "flow_irregularity": self.weights.get("flow_irregularity", 0.15) * f_flow_irr
            }
        # If naive 50/50 density + motion baseline:
        elif len([w for w in self.weights.values() if w > 0]) == 2 and self.weights.get("density", 0) > 0 and self.weights.get("movement_magnitude", 0) > 0:
            score_dm = 0.5 * f_density + 0.5 * f_motion
            composite_score = float(np.clip(score_dm, 0.0, 100.0))
            weighted_scores = {
                "density": 0.5 * f_density,
                "density_change": 0.0,
                "movement_magnitude": 0.5 * f_motion,
                "movement_change": 0.0,
                "direction_variance": 0.0,
                "flow_irregularity": 0.0
            }
        else:
            # Full proposed multi-modal model
            w_d = self.weights.get("density", 0.25)
            w_dc = self.weights.get("density_change", 0.20)
            w_m = self.weights.get("movement_magnitude", 0.20)
            w_mc = self.weights.get("movement_change", 0.15)
            w_dv = self.weights.get("direction_variance", 0.10)
            w_fi = self.weights.get("flow_irregularity", 0.10)

            # Density compression factor (high density with high delta D or standstill)
            density_comp = f_density * 0.9 + f_d_change * 0.6
            # Dynamic surge / turbulence factor
            dyn_surge = f_m_change * 0.8 + f_flow_irr * 0.7 + f_dir_var * 0.6 + f_motion * 0.4

            # Combined weighted score
            ws_d = w_d * f_density
            ws_dc = w_dc * f_d_change
            ws_m = w_m * f_motion
            ws_mc = w_mc * f_m_change
            ws_dv = w_dv * f_dir_var
            ws_fi = w_fi * f_flow_irr

            weighted_scores = {
                "density": ws_d,
                "density_change": ws_dc,
                "movement_magnitude": ws_m,
                "movement_change": ws_mc,
                "direction_variance": ws_dv,
                "flow_irregularity": ws_fi
            }

            linear_sum = ws_d + ws_dc + ws_m + ws_mc + ws_dv + ws_fi
            
            # Non-linear multi-signal synergy: when both density and dynamic turbulence co-occur or high compression
            synergy = max(density_comp, dyn_surge) * 0.4 + linear_sum * 0.6
            composite_score = float(np.clip(synergy, 0.0, 100.0))

        risk_level = self.classify_level(composite_score)

        # Compute factor percentage contributions
        contributions: Dict[str, FactorContribution] = {}
        max_weighted = -1.0
        dominant_factor = "density"

        total_ws = sum(weighted_scores.values())
        for name, ws in weighted_scores.items():
            w = self.weights.get(name, 0.0)
            f_val = getattr(features, name, 0.0)
            pct = (ws / total_ws * 100.0) if total_ws > 0.0 else 0.0
            
            contributions[name] = FactorContribution(
                feature_name=name,
                feature_value=round(f_val, 1),
                weight=round(w, 2),
                weighted_score=round(ws, 2),
                percentage_contribution=round(pct, 1)
            )

            if ws > max_weighted:
                max_weighted = ws
                dominant_factor = name

        advisory = self._generate_advisory(risk_level, dominant_factor.replace("_", " "), contributions)

        return RiskAssessmentResult(
            timestamp_sec=features.timestamp_sec,
            risk_score=round(composite_score, 1),
            risk_level=risk_level,
            contributing_factors=contributions,
            dominant_factor=dominant_factor,
            operational_advisory=advisory,
            thresholds=self.thresholds.copy(),
            weights=self.weights.copy()
        )