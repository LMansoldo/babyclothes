# BabyClothes Monorepo

> **Before writing any code, read `RULES.md` at the project root.**

C2C marketplace for buying/selling baby clothes with AI growth prediction.

## Monorepo Structure

- **Yarn 4 workspaces** with `nodeLinker: pnp` (`.yarnrc.yml`)
- **Node 22** (`.nvmrc`)
- Workspaces: `apps/web`, `apps/agents`, `packages/ui`
- `apps/api` is Elixir (Mix, not part of Yarn workspaces)

## Commands (Docker First)

All commands run inside Docker containers. See `RULES.md` for full list.

```bash
yarn dev               # Start all services (postgres + api + agents + web)
yarn dev:down          # Stop all services
yarn build             # Build all workspaces (inside container)
yarn preview           # Preview web build (inside container)
yarn test              # Test all workspaces (inside container)
yarn check             # Type check all workspaces (inside container)
yarn api:migrate       # Run Ecto migrations
```

## Architecture Overview

| App | Tech | Port | Description |
|-----|------|------|-------------|
| `apps/web` | SvelteKit 2 + Svelte 5 | 5173 | Frontend SPA |
| `apps/api` | Elixir + Plug/Bandit | 4000 | REST API + gRPC client |
| `apps/agents` | TypeScript + LangGraph | 50051 (gRPC) | AI growth prediction |
| `packages/ui` | Svelte 5 component lib | — | Shared UI components |

## Communication

- Web → API: REST (JSON) over HTTP
- API → Agents: gRPC (proto/agent.proto)
- Web → Agents: SSE streaming (planned)

## Design Tokens

CSS custom properties defined in `packages/ui/src/lib/tokens/tokens.css`:
- `--pk` (pink), `--bk` (black), `--wh` (white)
- `--of2`, `--of3` (off-white variants)
- `--gr` (Inter body font)
- `--ld` (Londrina Solid), `--sr` (Sriracha), `--vd` (Vidaloka) — display fonts

## Docker

All services run via `docker compose up`. Dependency chain: `postgres` → `api` → `agents` + `web`.

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL 16 |
| `api` | 4000 | Elixir REST API |
| `agents` | 50051 | TypeScript gRPC AI agent |
| `web` | 5173 | SvelteKit dev server |

## Conventions

- **No emojis** in UI — use `lucide-svelte` for icons (web app) or inline SVGs (SDK)
- **Semantic commits**: `feat(scope):`, `fix(scope):`, `docs(scope):`, etc.
- **BEM CSS naming**: `.block__element--modifier`
- **i18n**: All user-facing strings must support en-US and pt-BR
