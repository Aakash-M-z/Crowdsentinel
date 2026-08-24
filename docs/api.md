# API

The OpenAPI source is `lib/api-spec/openapi.yaml`. Main routes:

- `GET /api/healthz`
- `GET /api/dashboard`
- `GET|POST /api/cameras`
- `PATCH|DELETE /api/cameras/:cameraId`
- `GET /api/alerts`
- `POST /api/monitoring/session`
- `GET /api/monitoring/session/:sessionId`
- `GET /api/analytics`
- `GET|PUT /api/settings/risk`

Run code generation after changing the contract:

```bash
pnpm --filter @workspace/api-spec run codegen
```