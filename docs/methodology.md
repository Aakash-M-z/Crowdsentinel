# CrowdSentinel: Mathematical Methodology & Pipeline Formulation

## 1. Pipeline Overview

$$\text{Video Stream} \xrightarrow{\text{YOLOv8}} \{B_i\} \xrightarrow{\text{Tracking}} \{T_i\} \xrightarrow{\text{Farneb{\"a}ck Flow}} (\vec{u}, \vec{v}) \xrightarrow{\text{Aggregation}} F \xrightarrow{\text{Risk Engine}} (R, \{C_i\})$$

---

## 2. Mathematical Formulations

### 2.1 Person Detection & Image Density
Let a video frame $I_t \in \mathbb{R}^{H \times W \times 3}$ yield $N_t$ bounding boxes $B_i = (x_i, y_i, w_i, h_i)$.
The relative image-space occupancy is computed as:
$$D_{\text{occ}}(t) = \min\left(1.0, \frac{\sum_{i=1}^{N_t} (w_i \cdot h_i)}{H \cdot W} \cdot \alpha\right)$$
where $\alpha = 2.5$ scales bounding box footprint to monitored ground projection.
The composite normalized density feature $D(t) \in [0, 100]$ is:
$$D(t) = \left(0.6 \cdot D_{\text{occ}}(t) + 0.4 \cdot \min\left(1.0, \frac{N_t}{N_{\max}}\right)\right) \times 100$$

### 2.2 Temporal Density Growth Rate ($\Delta D$)
Over a temporal displacement interval $k$ frames:
$$\Delta D(t) = \max\left(0, \frac{D(t) - D(t - k)}{k / \text{FPS}}\right)$$

### 2.3 Dense Optical Flow & Velocity Magnitude
Farnebäck optical flow estimates dense displacement field $\vec{v}(x,y) = (u(x,y), v(x,y))$.
The active motion magnitude is:
$$M(t) = \frac{1}{|\Omega|} \sum_{(x,y) \in \Omega} \sqrt{u(x,y)^2 + v(x,y)^2}$$
where $\Omega = \{(x,y) \mid \|\vec{v}(x,y)\| > \tau_{\text{motion}}\}$.

### 2.4 Flow Directional Variance ($\sigma^2_\theta$) and Irregularity ($I_{\text{flow}}$)
Using directional vector coherence:
$$I_{\text{flow}}(t) = \left(1.0 - \frac{\|\sum_{(x,y) \in \Omega} \vec{v}(x,y)\|}{\sum_{(x,y) \in \Omega} \|\vec{v}(x,y)\|}\right) \times 100$$
$$R_{\text{circ}} = \frac{\sqrt{(\sum \sin \theta)^2 + (\sum \cos \theta)^2}}{|\Omega|}, \quad \sigma^2_\theta = (1.0 - R_{\text{circ}}) \times 100$$

### 2.5 Fused Feature Vector $F$
Aggregated over sliding window $W \in [t - \Delta t, t]$:
$$F = [D, \Delta D, M, \Delta M, \sigma^2_\theta, I_{\text{flow}}] \in [0, 100]^6$$

### 2.6 Composite Risk Score & Explainability Breakdown
The composite risk score $R \in [0, 100]$ is computed as:
$$R = \sum_{i=1}^6 w_i \cdot F_i, \quad \text{subject to} \quad \sum_{i=1}^6 w_i = 1.0$$
The exact percentage contribution of factor $i$ is:
$$C_i = \frac{w_i \cdot F_i}{R} \times 100\%$$
Risk categorization follows configurable thresholds:
$$\text{Level}(R) = \begin{cases} 
\text{NORMAL} & 0 \le R < 31 \\
\text{WARNING} & 31 \le R < 51 \\
\text{HIGH RISK} & 51 \le R < 76 \\
\text{CRITICAL} & 76 \le R \le 100 
\end{cases}$$