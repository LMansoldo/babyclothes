# BabyClothes Monorepo

C2C marketplace for buying/selling baby clothes with AI growth prediction.

> **Before writing any code**, read `.claude/rules/general.md`, then the domain
> rule file(s) relevant to what you're changing (linked below).

## Monorepo Structure

- **Yarn 4 workspaces** with `nodeLinker: pnp` (`.yarnrc.yml`)
- **Node 22** (`.nvmrc`)
- Workspaces: `apps/web`, `apps/agents`, `packages/design-system`
- `apps/api` is Elixir (Mix, not part of Yarn workspaces)

## Architecture Overview

| App | Tech | Port | Description |
|-----|------|------|-------------|
| `apps/web` | SvelteKit 2 + Svelte 5 | 5173 | Frontend SPA |
| `apps/api` | Elixir + Plug/Bandit | 4000 | REST API + gRPC client |
| `apps/agents` | TypeScript + LangGraph | 50051 (gRPC) | AI growth prediction |
| `packages/design-system` | Svelte 5 component lib | — | Shared UI components |

## Communication

- Web → API: REST (JSON) over HTTP
- API → Agents: gRPC (proto/agent.proto)
- Web → Agents: SSE streaming (planned)

## Rules & Best Practices

All prescriptive rules live in `.claude/rules/`:

| File | Covers |
|------|--------|
| [`.claude/rules/general.md`](.claude/rules/general.md) | Docker-first workflow, type safety, SRP/DRY, SOLID, Object Calisthenics, CSS units, commit/i18n/emoji conventions — applies repo-wide |
| [`.claude/rules/frontend.md`](.claude/rules/frontend.md) | `apps/web`: stack, structure, routes, Svelte 5 conventions, i18n, testing |
| [`.claude/rules/design-system.md`](.claude/rules/design-system.md) | `packages/design-system`: component layers, file set, reuse policy, tokens |
| [`.claude/rules/backend.md`](.claude/rules/backend.md) | `apps/api`: DDD/contexts, OTP, Ecto, security, testing |
| [`.claude/rules/agents.md`](.claude/rules/agents.md) | `apps/agents`: gRPC services, LangGraph conventions |
| [`.claude/rules/infra.md`](.claude/rules/infra.md) | Docker Compose services, Postgres, env vars |

## Dev Agents

Specialized agents in `.claude/agents/`:

| Agent | Use for |
|-------|---------|
| `frontend-builder` | Implementing/modifying UI in `apps/web` or `packages/design-system`, strict TDD |
| `backend-builder` | Implementing/modifying `apps/api` Elixir code, strict TDD |
| `backend-reviewer` | Standalone Elixir/OTP code-quality checklist review |
| `quality-reviewer` | Checking a finished implementation against a spec you provide |
