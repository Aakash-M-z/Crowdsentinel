# CrowdSentinel

CrowdSentinel is a public-safety monitoring workspace that explains measurable crowd density and movement signals instead of claiming perfect stampede prediction.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API
- `pnpm --filter @workspace/crowdsentinel run dev` — run the web app
- `pnpm run typecheck` — check all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate typed API clients
- `pnpm --filter @workspace/db run push` — push development schema changes

## Product

Dashboard, progressive demo/upload monitoring, camera CRUD, alert history, analytics, configurable risk thresholds, and methodology/evaluation documentation.

## Architecture decisions

- OpenAPI in `lib/api-spec/openapi.yaml` is the API source of truth.
- Analysis outputs are explicitly labeled `DEMO / SIMULATED ANALYSIS` until real inference is configured.
- Relative image-space density is shown instead of claiming calibrated people-per-square-metre accuracy.
- Risk is a transparent weighted signal with configurable thresholds, not a validated stampede classifier.

## Where things live

- Web app: `artifacts/crowdsentinel`
- API: `artifacts/api-server/src/routes/crowd.ts`
- Database schema: `lib/db/src/schema/crowd.ts`
- API contract: `lib/api-spec/openapi.yaml`
- Project documentation: `docs/`

## Gotchas

- Artifact workflows provide `PORT` and `BASE_PATH`; do not run the Vite command manually without them.
- The initial analysis data is simulated and must not be presented as ground truth.