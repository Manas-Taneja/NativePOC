# NativePOC Packages

NativePOC is now the home for all frontend code. Shared libraries from the former NativeIQ pnpm workspace will live under npm workspaces here:

- `packages/types` — canonical interfaces for insights, tasks, KPIs, auth payloads.
- `packages/ui` — reusable React UI primitives + tokens (ported from `packages/ui` in NativeIQ).
- `packages/utils` — formatting helpers, hooks, and other framework-agnostic utilities.

Each package will expose ESM modules (TypeScript source in `src/`) and ship local build/test scripts managed through the root npm workspace.

