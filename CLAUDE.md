# BabyClothes Monorepo

C2C marketplace for buying/selling baby clothes with AI growth prediction.

## Monorepo Structure

- **Yarn 4 workspaces** with `nodeLinker: pnp` (`.yarnrc.yml`)
- **Node 22** (`.nvmrc`)
- Workspaces: `apps/web`, `apps/agents`, `packages/ui`
- `apps/api` is Elixir (Mix, not part of Yarn workspaces)

## Workspace Commands

```bash
yarn install                     # Install all dependencies
yarn dev:web                     # Start web dev server
yarn dev:agents                  # Start agents dev server
yarn build                       # Build all workspaces
yarn test                        # Test all workspaces
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

```bash
docker-compose up -d   # PostgreSQL (5432), API, Agents, Web
```

## Conventions

- **No emojis** in UI — use `lucide-svelte` for icons (web app) or inline SVGs (SDK)
- **Semantic commits**: `feat(scope):`, `fix(scope):`, `docs(scope):`, etc.
- **BEM CSS naming**: `.block__element--modifier`
- **i18n**: All user-facing strings must support en-US and pt-BR
