# Methodology

CrowdSentinel combines four observable signals:

1. Relative image-space occupancy and people count.
2. Movement magnitude and dominant direction.
3. Change in density over time.
4. Irregularity in crowd flow.

These signals are combined using configurable weights and mapped to an initial 0–100 risk score. Thresholds classify the score as NORMAL, WARNING, HIGH RISK, or CRITICAL.

The score is a decision-support signal. It is not a stampede classifier and must be validated against venue-specific footage and ground truth before operational use.