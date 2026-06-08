# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
# Install
pnpm install

# Build all packages (client builds first via Nx dependency graph)
pnpm build                    # or: pnpm nx run-many -t build

# Build individual packages
pnpm nx run client:build      # libs/client - tsup (ESM + d.ts)
pnpm nx run apparatus:build   # apps/apparatus - tsc
pnpm nx run cli:build         # apps/cli - tsup (ESM + shebang)

# Dev servers
pnpm dev:server               # HTTP/1 :8090, HTTP/2 :8443, gRPC :50051, WS, Redis, SMTP, etc.
pnpm dev:cli                  # CLI watch mode

# Test
pnpm test                     # All packages (vitest)
pnpm nx run apparatus:test    # Server tests only
pnpm nx run client:test       # Client tests only

# Single test file
cd apps/apparatus && npx vitest run test/some-file.test.ts

# Type check & lint
pnpm type-check               # tsc --noEmit all packages
pnpm lint                     # eslint all packages
```

## Architecture

**Monorepo layout** — pnpm workspaces + Nx for task orchestration and caching.

```
apps/apparatus/   → @atlascrew/apparatus  (Express server, 50+ endpoints, multi-protocol)
apps/cli/         → @atlascrew/apparatus-cli     (Commander.js CLI with REPL)
libs/client/      → @atlascrew/apparatus-sdk  (HTTP client library, 16 API categories)
```

**Dependency graph:** CLI depends on client (`workspace:*`). Server is standalone. Client is the shared library consumed by CLI and dashboard.

**Module system:** All ESM (`"type": "module"`). Server imports use `.js` extensions. Cross-package imports use `@atlascrew/apparatus-sdk` path alias (configured in `tsconfig.base.json`).

**Build tools:** Server uses plain `tsc`. CLI and client use `tsup` (ESM output, node22 target). CLI bundles the client via `noExternal` and prepends a shebang.

## Server (apps/apparatus)

**Entry:** `src/index.ts` starts all protocol servers. `src/app.ts` defines Express routes and middleware.

**Protocols served:** HTTP/1.1 (:8090), HTTP/2 TLS (:8443), WebSocket (/ws), gRPC (:50051), TCP/UDP echo (:9000/:9001), Redis mock (:6379), SMTP sink (:2525), MQTT (:1883), ICAP (:1344), Syslog (:5140/:5514), Bad SSL (:8444).

**Middleware order matters** — applied in `createHttp1Server()`:
1. MTD (polymorphic route hiding) → 2. Self-healing → 3. Deception (honeypot) → 4. Tarpit (slow attackers) → 5. Metrics → 6. Compression → 7. Logging → 8. Body parsers → 9. Active Shield (WAF) → 10. CORS → 11. Routes → 12. Echo catchall

**Handler pattern:** Each feature is a standalone file exporting handler functions (`deception.ts`, `tarpit.ts`, `sentinel.ts`, `mtd.ts`, `chaos.ts`, etc.). State is in-memory (arrays, Sets, Maps). SSE events broadcast via `sse-broadcast.ts`.

**Config:** `src/config.ts` reads env vars. Key vars: `PORT_HTTP1`, `PORT_HTTP2`, `HOST`, `TLS_KEY`, `TLS_CRT`, `DEMO_MODE`, `TUNNEL_URL`.

**TUI:** Terminal dashboard at `src/tui/` using blessed + blessed-contrib. Run with `pnpm tui`. Architecture: `dashboard.ts` (main), `api-client.ts` (polling), `sse-client.ts` (real-time), `core/store.ts` (state), `widgets/` (18 widget types).

**Web Dashboard:** React SPA at `src/dashboard/` (Vite + Tailwind + React Router). Built to `dist-dashboard/`, served at `/dashboard`. Uses `@atlascrew/apparatus-sdk`.

## Client Library (libs/client)

**Main export:** `ApparatusClient` class with 16 lazy-loaded category APIs (`client.core.*`, `client.chaos.*`, `client.defense.*`, etc.). Factory: `createClient({ baseUrl })`.

**HTTP layer:** Custom `HttpClient` wrapping fetch with timeout (AbortController), retry, and header management. SSE via separate `SSEClient` with auto-reconnect.

**Error hierarchy:** `ApparatusError` → `NetworkError`, `ApiError`, `TimeoutError`, `ValidationError`, `SSEError`, `ConfigurationError`. Type guards exported (`isApiError()`, etc.).

## CLI (apps/cli)

**12 command categories** registered in `src/cli.ts`, each in `src/commands/*.ts`. Pattern: `registerXxxCommands(program)`.

**REPL mode:** `apparatus repl` — tab completion, command history, shortcuts (`h`, `cpu`, `dns`, `trap`, etc.).

**Config:** `APPARATUS_URL` env var or `-u/--url` flag. JSON output via `--json`. Config file at `~/.apparatus/config.json`.

## Conventions

- TypeScript strict mode, ES2023 target, bundler module resolution
- Vitest for tests (`*.test.ts`), globals enabled, v8 coverage
- Nx caching enabled for build/test/lint/type-check targets
- `dependsOn: ["^build"]` ensures client builds before CLI
- All three packages (`@atlascrew/apparatus`, `@atlascrew/apparatus-sdk`, `@atlascrew/apparatus-cli`) publish to npm under the `@atlascrew` org

## Task tracking

Tasks live in **GitHub Issues**, aggregated on the org **Atlas Crew Security** board
(<https://github.com/orgs/atlas-crew/projects/8>). Use `gh issue` and `gh project`
to create and update work. Cross-repo grouping is the board's **Initiative** field;
execution order (from `blocked-by` dependencies) comes from `gh seq`. Completed
tasks remain under `backlog/` as a frozen archive.
