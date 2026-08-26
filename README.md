# CrowdSentinel - AI Safety Monitor

## Project Overview

CrowdSentinel is an AI-based early crowd-risk monitoring system for public-safety teams. It analyzes CCTV or uploaded footage through an explainable pipeline: frame extraction, person detection, tracking, density and movement analysis, explainable risk scoring, and early-warning alerts.

---

## Directory Structure

```
CrowdSentinel-Safety-Monitor/
├── apps/
│   ├── web/                        # React 19 + Vite + Tailwind CSS Frontend
│   │   ├── src/
│   │   │   ├── components/         # UI components & ErrorBoundary
│   │   │   ├── hooks/              # Custom hooks (toast, mobile)
│   │   │   ├── pages/              # Route pages (dashboard, monitor, cameras, alerts, analytics)
│   │   │   ├── App.tsx             # Main application layout & routes
│   │   │   └── main.tsx            # React DOM root entry
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts          # Vite configuration with /api proxy
│   └── api/                        # Express 5 + Pino REST API Server
│       ├── src/
│       │   ├── lib/                # Pino logger & utilities
│       │   ├── middlewares/        # Express middlewares
│       │   ├── routes/             # REST endpoints (crowd, health, dashboard, cameras, alerts)
│       │   ├── app.ts              # Express application setup
│       │   └── index.ts            # Server entry point
│       ├── build.mjs               # Server build script (esbuild)
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── db/                         # Drizzle ORM schema & database connector
│   ├── api-spec/                   # OpenAPI specification & code-generation config
│   ├── api-zod/                    # Shared Zod validation schemas
│   └── api-client-react/           # Shared React Query hooks & Fetch client
├── docs/                           # Architecture, API, and methodology documentation
├── package.json                    # Workspace root scripts
├── pnpm-workspace.yaml             # pnpm monorepo workspace configuration
├── tsconfig.base.json              # Shared TypeScript base configuration
└── tsconfig.json                   # Root TypeScript project references
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query, Lucide Icons, Recharts, Wouter
- **Backend**: Node.js, Express 5, TypeScript, Pino Logger, Drizzle ORM, PostgreSQL (with in-memory fallback for local demo)
- **API Contract**: OpenAPI 3.0 + Orval code generation

---

## Quick Start & Running Locally

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Both Frontend & Backend Concurrently
```bash
pnpm dev
```
- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)

### 3. Run Individually
```bash
# Run backend only (port 5000)
pnpm dev:api

# Run frontend only (port 5173)
pnpm dev:web
```

### 4. Build for Production & Typecheck
```bash
pnpm build
```

---

## Environment Variables

Copy `.env.example` to `.env` if you wish to configure custom ports or PostgreSQL database connection:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/crowdsentinel
```
*Note: If `DATABASE_URL` is not provided, the API server will run with built-in in-memory fallback data.*

---

## API Documentation

The OpenAPI contract is located at `packages/api-spec/openapi.yaml`. It defines endpoints for:
- `/api/healthz` & `/api/health`: System health status
- `/api/dashboard`: Live situation metrics and composite risk read
- `/api/cameras`: Camera source CRUD operations
- `/api/alerts`: Searchable and filterable alert event history
- `/api/monitoring/session`: Start and poll progressive video analysis sessions
- `/api/analytics`: Time-series crowd trends and distribution statistics
- `/api/settings/risk`: Configurable risk weights and thresholds