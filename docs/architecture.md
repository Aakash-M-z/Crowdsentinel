# CrowdSentinel: System Architecture

## Architecture Diagram

```text
+-------------------------------------------------------------------------+
|                              INPUT LAYER                                |
|        CCTV RTSP Streams  |  Uploaded MP4/MOV  |  Benchmark Feeds       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                     COMPUTER VISION INFERENCE CORE                      |
|  +--------------------------------+  +-------------------------------+  |
|  | Person Detection: YOLOv8n      |  | Dense Motion: Farnebäck Flow  |  |
|  | - Single Model Cached          |  | - Pixel Displacement (u, v)   |  |
|  | - Person Class Filter (Class 0)|  | - Velocity Magnitude          |  |
|  | - Bounding Box & Count Extr.   |  | - Circular Angle Variance     |  |
|  +--------------------------------+  +-------------------------------+  |
|  +--------------------------------+  +-------------------------------+  |
|  | Centroid / ByteTrack Tracking  |  | Quadrant Spatial Density      |  |
|  | - Trajectory & Track Lifetime  |  | - Zone A, B, C, D Occupancy   |  |
|  | - Instantaneous Velocity       |  | - Temporal Growth Rate ΔD/Δt  |  |
|  +--------------------------------+  +-------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  FEATURE FUSION & EXPLAINABLE RISK ENGINE               |
|  - Temporal Sliding Window Aggregation (5s / 10s / 15s)                 |
|  - 6D Normalized Feature Vector: F = [D, ΔD, M, ΔM, σ²_θ, I_flow]       |
|  - Weighted Decision-Support Scoring & Exact Percentage Explainability  |
|  - Multi-Level Thresholding: NORMAL | WARNING | HIGH RISK | CRITICAL    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         APPLICATION & API LAYER                         |
|  - Express 5 REST API Server (Node.js) & Python Subprocess Execution    |
|  - Drizzle ORM Database Persistence (PostgreSQL + In-Memory Fallback)   |
|  - React 19 Frontend Dashboard, Live HUD Visualizer & Research Analytics|
+-------------------------------------------------------------------------+
```