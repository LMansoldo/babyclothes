# Infra & DB Rules

> Before writing any code, read `.claude/rules/general.md` first.

## Docker Compose

All services run via `docker compose up` (`docker-compose.yml`). Dependency chain:
`postgres` → `api` → `agents` + `web`.

| Service | Port(s) | Description |
|---------|---------|-------------|
| `postgres` | 5432 | PostgreSQL 16 |
| `api` | 4000 | Elixir REST API |
| `agents` | 50051 (gRPC), 50052 (HTTP) | TypeScript gRPC AI agent |
| `web` | 5173 | SvelteKit dev server |

## Commands

```bash
# Dev (all services: postgres + api + agents + web)
yarn dev
yarn dev:down

# Build
yarn build           # all workspaces
yarn build:ds        # just design-system
yarn build:web       # just web

# Preview
yarn preview

# Test
yarn test            # all
yarn test:web        # just web
yarn test:ds         # just design-system
yarn test:agents     # just agents
yarn test:api        # just api (mix test, forces MIX_ENV=test)

# Type check
yarn check           # all
yarn check:web       # just web
yarn check:ds        # just design-system

# API
yarn api:migrate     # mix ecto.migrate
yarn api:seed        # mix seeds (standalone, no Bandit)
yarn api:credo       # mix credo

# Lint
yarn lint            # all workspaces
yarn lint:ds         # just design-system
yarn lint:web        # just web
yarn lint:fix        # auto-fix all

# Format
yarn format          # prettier --write all workspaces

# Stylelint
yarn stylelint       # all workspaces
yarn stylelint:ds    # just design-system
yarn stylelint:web   # just web

# Logs
yarn logs            # all services
yarn logs:web        # just web
yarn logs:api        # just api
yarn logs:agents     # just agents
```

**Exception:** Storybook runs locally (not in containers):
```bash
yarn storybook:ds
yarn storybook:web
```

## Database

PostgreSQL 16, database `babyclothes` (dev), user/password `babyclothes`/`babyclothes`
(local dev only — see `.env` for other environments). Migrations are immutable once
applied (see `.claude/rules/backend.md`). Run migrations: `yarn api:migrate`.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (api)
- `SECRET_KEY_BASE` — JWT signing (api)
- `AWS_*` — S3 credentials (api)
- `GOOGLE_CLIENT_ID` — OAuth (api)
- `GRPC_AGENT_URL` / `AGENTS_HTTP_URL` — api → agents service URLs (docker-compose)
- `GRPC_PORT` — gRPC listen port, default `50051` (agents)
- `INTERNAL_API_URL` — agents → api callback URL (docker-compose)
- `ANTHROPIC_API_KEY` — Anthropic API key (agents, planned)
- `PUBLIC_API_URL` — web → api URL, server-side only (docker-compose)

See root `.env.example` for the full list.
