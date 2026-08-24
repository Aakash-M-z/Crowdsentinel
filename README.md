# CrowdSentinel

## Project Overview

CrowdSentinel is an AI-based early crowd-risk monitoring system for public-safety teams. It analyzes CCTV or uploaded footage through a visible pipeline: frame extraction, person detection, tracking, density and movement analysis, explainable risk scoring, and early-warning alerts.

It identifies potentially dangerous crowd conditions and increasing risk. It does not claim to perfectly predict a stampede.

## Problem Statement

Large gatherings can change quickly. Operators need a clear view of crowd count, relative occupancy, movement changes, and escalation signals before a situation becomes difficult to manage.

## Objectives

- Make crowd conditions measurable and explainable.
- Keep risk thresholds configurable and honest about their validation status.
- Provide a demonstrable workflow for footage analysis.
- Preserve a clean boundary between demo/simulated analysis and future real inference.

## Features

- Live situation dashboard with risk posture and contributing factors.
- Progressive demo/upload analysis session flow.
- Camera management with persistent database-backed configuration.
- Searchable and filterable alert history.
- Crowd count, density, speed, and risk trend analytics.
- Configurable thresholds and signal weights.
- Evaluation status that reports `Evaluation Pending` until a real dataset evaluation is run.
- Methodology and limitations page.

## Architecture

The React frontend calls typed hooks generated from the OpenAPI contract. The Express API serves the dashboard and analysis surfaces and uses PostgreSQL/Drizzle for camera configuration. The analysis layer is structured to accept replaceable detection, tracking, density, movement, and risk modules.

## Technology Stack

- React + TypeScript + Vite
- Express 5 + Pino logging
- PostgreSQL + Drizzle ORM
- OpenAPI + Orval-generated React Query and Zod clients
- Tailwind CSS + Recharts + Lucide icons

## Dataset

The planned dataset adapter can support UMN Unusual Crowd Activity, GBA-Stampedes, GSMADC, and other legally usable datasets. Dataset paths, labels, and train/validation/test splits should be configured per experiment; the proposed default is 70/15/15.

## Installation and Running Locally

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
```

Run the API and web workflows from the Replit workspace. The web app is available at the root preview path.

## Environment Variables

See `.env.example`. Never commit actual secrets. `DATABASE_URL` is provided by the managed development database.

## Model Setup

The first build intentionally runs in a clearly labeled demo/simulated mode. A production detector can be added behind the same analysis contract using an Ultralytics YOLO person model, ByteTrack/DeepSORT tracking, and optical-flow movement analysis.

## API Documentation

The source contract is `lib/api-spec/openapi.yaml`. It includes dashboard, cameras, alerts, monitoring sessions, analytics, and risk-settings endpoints. Generated clients are in `lib/api-client-react` and `lib/api-zod`.

## Evaluation

Evaluation is intentionally marked pending until ground-truth data is available. Accuracy, precision, recall, F1, false-alarm rate, response time, FPS, MAE, and RMSE should only be populated by a reproducible evaluation run.

## Limitations

- Demo analysis is simulated and not ground truth.
- Relative occupancy is image-space only without camera calibration.
- Occlusion, lighting, camera angle, and source quality affect detection reliability.
- Risk thresholds are initial configurable values, not scientifically proven stampede thresholds.
- Human operators and local emergency procedures remain responsible for action.

## Future Scope

Add YOLO inference, tracking IDs, dense optical-flow overlays, video frame storage, background workers, WebSocket/SSE updates, dataset adapters, calibrated zones, and reproducible model evaluation.

## Team Members

Add team member names and roles here for the final-year submission.