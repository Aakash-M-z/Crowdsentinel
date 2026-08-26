# CrowdSentinel: Evaluation Metrics & Mathematical Definitions

## 1. Classification Metrics
- **Accuracy**: $\frac{TP + TN}{TP + TN + FP + FN}$
- **Precision (Macro)**: $\frac{1}{K} \sum_{k=1}^K \frac{TP_k}{TP_k + FP_k}$
- **Recall (Macro)**: $\frac{1}{K} \sum_{k=1}^K \frac{TP_k}{TP_k + FN_k}$
- **F1-Score (Macro)**: $2 \cdot \frac{\text{Precision}_{\text{macro}} \cdot \text{Recall}_{\text{macro}}}{\text{Precision}_{\text{macro}} + \text{Recall}_{\text{macro}}}$

## 2. Safety-Oriented Operational Metrics
- **False Alarm Rate (FAR)**:
  $$\text{FAR} = \frac{\text{False Positive Alarms}}{\text{Total Alarms Issued}}$$
- **Missed Detection Rate (MDR)**:
  $$\text{MDR} = \frac{\text{Unflagged Ground-Truth Escalations}}{\text{Total Ground-Truth Escalations}}$$
- **Early Warning Lead Time ($T_{\text{lead}}$)**:
  $$T_{\text{lead}} = T_{\text{ground\_truth\_onset}} - T_{\text{system\_warning}}$$

## 3. Density Accuracy Metrics
- **Mean Absolute Error (MAE)**: $\frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$
- **Root Mean Squared Error (RMSE)**: $\sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$

## 4. Runtime Benchmark Metrics
- **Processing FPS**: $\frac{\text{Total Processed Frames}}{\text{Total Execution Time (seconds)}}$
- **Average Latency**: Mean end-to-end inference time per frame in milliseconds (ms).
- **P95 / P99 Latency**: 95th and 99th percentile processing time per frame.