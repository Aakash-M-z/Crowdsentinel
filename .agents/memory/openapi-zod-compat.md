---
name: OpenAPI Zod compatibility
description: Constraints discovered when generating validation schemas in this workspace
---

Generated Zod schemas currently target Zod 3, so OpenAPI integer fields can produce unsupported `zod.int()` calls during the workspace typecheck. Use numeric schemas at the API boundary when compatibility matters, and enforce integer semantics in route validation or business logic if needed.

**Why:** The code generator completed successfully but the generated validation package failed to typecheck against the installed Zod version.

**How to apply:** After OpenAPI changes, run codegen and the full library typecheck before relying on generated schemas.