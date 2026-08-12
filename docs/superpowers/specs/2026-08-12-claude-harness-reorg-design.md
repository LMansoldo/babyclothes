# Claude Harness Reorg — Design Spec

Date: 2026-08-12

## Goal

Consolidate every rules/best-practices markdown file into `.claude/rules/`, organized
by domain (general, frontend, design-system, backend, agents, infra). The root
`CLAUDE.md` keeps only the project overview + monorepo structure and *references* the
domain rule files — it stops containing prescriptive rules itself. Add a TDD backend
dev agent (mirroring the existing TDD frontend agent) and a spec-quality reviewer
agent that checks final deliverables against a user-supplied spec.

## Current state (as of this spec)

```
CLAUDE.md                     # project overview + Docker table + Conventions (mixed: descriptive + prescriptive)
RULES.md                      # general rules (Docker First, Type Safety, SRP, DRY, CSS units, SOLID, Object Calisthenics) + a Backend section that duplicates apps/api/CLAUDE.md
apps/web/CLAUDE.md            # stack + structure + routes + Svelte/CSS/i18n conventions
apps/agents/CLAUDE.md         # stack + structure + gRPC services + conventions
apps/api/CLAUDE.md            # stack + structure + DDD/OTP/Ecto/security/testing rules (full version; RULES.md has a condensed duplicate)
packages/design-system/       # NO CLAUDE.md — conventions only exist implicitly inside .claude/agents/frontend-builder.md's "REUSE" step
.claude/agents/frontend-builder.md   # TDD frontend agent, has valid frontmatter (name/description/model), correctly registered
.claude/agents/backend-reviewer.md   # Elixir review checklist, but has NO frontmatter at all — it is NOT currently registered as an invocable subagent (confirmed: absent from the live agent-type list in this session)
```

## Target layout

```
.claude/
  rules/
    general.md          # cross-cutting rules that apply repo-wide
    frontend.md          # apps/web specifics
    design-system.md      # packages/design-system specifics (NEW doc)
    backend.md              # apps/api specifics
    agents.md                 # apps/agents specifics
    infra.md                    # Docker Compose, Postgres, env vars (NEW aggregation)
  agents/
    frontend-builder.md    # existing, only its ORIENT step's file references are updated
    backend-builder.md      # NEW — TDD Elixir/OTP dev agent
    backend-reviewer.md       # existing content kept, frontmatter added so it's actually invocable
    quality-reviewer.md         # NEW — spec-vs-implementation reviewer, report-only

CLAUDE.md   # rewritten: project description, monorepo structure, architecture table,
            # communication flow, "Rules & Best Practices" links, "Dev Agents" links

RULES.md              → deleted (content migrated into .claude/rules/general.md + backend.md)
apps/web/CLAUDE.md    → deleted (content migrated into .claude/rules/frontend.md)
apps/agents/CLAUDE.md → deleted (content migrated into .claude/rules/agents.md)
apps/api/CLAUDE.md    → deleted (content migrated into .claude/rules/backend.md)
```

Root `CLAUDE.md` is always loaded regardless of which subdirectory a session's cwd is
in (Claude Code walks up from cwd to the repo root collecting `CLAUDE.md` files), so
deleting the three nested files loses no auto-load coverage as long as the root file
references the right domain doc.

## Exact content mapping

### `.claude/rules/general.md`

Source: `RULES.md` sections **Docker First**, **Type Safety**, **Single
Responsibility**, **DRY**, **CSS Units**, **SOLID Principles**, **Object
Calisthenics** (copy verbatim, including code samples and the table) — PLUS the
`## Conventions` section currently at the bottom of root `CLAUDE.md` (No emojis,
Semantic commits, BEM CSS naming, i18n requirement). Do not include `RULES.md`'s
`## Backend (Elixir/OTP)` section here — that whole section moves to
`.claude/rules/backend.md` instead (see below), since `apps/api/CLAUDE.md` already
has a fuller version of the same rules and the two should merge, not duplicate.

Resulting section order: Docker First → Type Safety → Single Responsibility → DRY →
CSS Units → SOLID Principles → Object Calisthenics → Conventions (emojis, commits,
BEM, i18n).

### `.claude/rules/frontend.md`

Source: `apps/web/CLAUDE.md`, verbatim, all sections (Tech Stack, Commands, Directory
Structure, Routes, Svelte 5 Conventions, Component Props Pattern, CSS Conventions,
i18n, Icons, Testing, Storybook). Drop the generic "BEM naming" bullet under CSS
Conventions since it now lives in `general.md` — keep the frontend-specific bullets
(design-system tokens import, component-scoped `<style>`, mobile-first).

### `.claude/rules/design-system.md` (NEW)

This domain has no existing doc — write it from scratch using verified facts from the
current `packages/design-system/src` tree and from `frontend-builder.md`'s REUSE
step. Structure:

```markdown
# Design System Rules

> Before writing any code, read `.claude/rules/general.md` first.

## Package

`packages/design-system` — Svelte 5 component library, workspace dependency
`@babyclothes/design-system`.

## Component Layers

Components live in exactly one of three layers, in `src/`:

| Layer | Path | Examples |
|-------|------|----------|
| Primitive | `src/primitives/` | Avatar, Badge, Button, Chip, Input, Select, Spinner, Toggle |
| Composite | `src/composites/` | Card, Modal, FormField, SearchBar, ItemList |
| Pattern | `src/patterns/` | TopBar, BottomNav, ChatBubble, ItemCard, PageHeader |

A primitive must not import a composite or pattern. A composite may compose
primitives. A pattern may compose composites and primitives. Never import "sideways"
across an unrelated pattern/composite.

## File set per component

Every component directory contains exactly:

```
ComponentName/
├── ComponentName.svelte
├── ComponentName.stories.ts
├── ComponentName.test.ts
└── index.ts
```

`index.ts` re-exports the component (and any exported prop types). New components
MUST be added to the layer's barrel (`src/{primitives,composites,patterns}/index.ts`)
AND the top-level `src/index.ts`.

## Reuse before creating

Before writing any new component: search `src/{primitives,composites,patterns}` and
grep for the purpose. Exact match → import and use it, don't restyle a copy locally.
Close-but-not-exact → extend via a new prop/variant, additive only — never change an
existing default (blast-radius scan: `grep -rn "ComponentName" apps
packages/design-system/src` and re-verify every consumer before changing a shared
component). Truly new → create it in the correct layer with the full file set above.

## Tokens

CSS custom properties in `src/tokens/tokens.css` (plus `brand.css`, `semantic.css`,
`typography.css`, `layout.css`, `primitives.css`, `themes.css`):
- `--pk` (pink), `--bk` (black), `--wh` (white), `--of2`/`--of3` (off-white variants)
- `--gr` (Inter body font), `--ld` (Londrina Solid), `--sr` (Sriracha), `--vd`
  (Vidaloka) — display fonts
Prefer an existing token over a raw hex/rem literal.

## CSS & naming

- BEM (`.block__element--modifier`), scoped `<style>` blocks — see `general.md`.
- Units: `rem` only, `10px = 1rem` — see `general.md`.

## Storybook

Every component has a co-located `.stories.ts`. Token docs live in `src/tokens/*.stories.ts`.
Run: `yarn storybook:ds` (runs locally, not in Docker — see `infra.md`).

## Testing

Vitest + `@testing-library/svelte`, co-located `ComponentName.test.ts`. Run inside
Docker: `docker compose exec -T web yarn workspace @babyclothes/design-system test --run <file>`.
```

### `.claude/rules/backend.md`

Source: `apps/api/CLAUDE.md`, verbatim, all sections (Tech Stack, Commands, Directory
Structure, Dependencies table, Architecture: DDD + Contexts, Processes & Concurrency,
Pattern Matching & Errors incl. code samples, Database/Ecto incl. code samples,
Performance, Tests incl. factory example, Code Quality incl. code sample, Security,
API Documentation). Drop the `## Environment Variables` section — that moves to
`infra.md` (it's infra config, not a backend coding rule). `RULES.md`'s `## Backend
(Elixir/OTP)` section is a strict subset of this content (same rules, no code
samples) — do not append it; it is fully superseded by the migrated
`apps/api/CLAUDE.md` content, so drop it silently during migration (nothing new to
add).

### `.claude/rules/agents.md`

Source: `apps/agents/CLAUDE.md`, verbatim, all sections (Tech Stack, Commands,
Structure, gRPC Services table, Current Status, Conventions). Drop the `##
Environment Variables` section — moves to `infra.md`.

### `.claude/rules/infra.md` (NEW aggregation)

Structure:

```markdown
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

(reuse the exact code block currently under RULES.md's "Docker First" heading:
yarn dev / dev:down / build / build:ds / build:web / preview / test / test:web /
test:ds / test:agents / test:api / check / check:web / check:ds / api:migrate /
api:seed / api:credo / lint / lint:ds / lint:web / lint:fix / format / stylelint /
stylelint:ds / stylelint:web / logs / logs:web / logs:api / logs:agents)

**Exception:** Storybook runs locally, not in containers (`yarn storybook:ds`, `yarn storybook:web`).

## Database

PostgreSQL 16, database `babyclothes` (dev), user/password `babyclothes`/`babyclothes`
(local dev only — see `.env` for other environments). Migrations are immutable once
applied (see `backend.md`). Run migrations: `yarn api:migrate`.

## Environment Variables

From `apps/api/CLAUDE.md` and `apps/agents/CLAUDE.md`, merged:

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
```

### Root `CLAUDE.md` (rewritten in full)

```markdown
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
```

## New agent: `.claude/agents/backend-builder.md`

Frontmatter (matches `frontend-builder.md`'s pattern exactly, no `tools:` restriction
— needs full tool access to write/run code):

```yaml
---
name: backend-builder
description: >-
  Use to implement or modify backend code in this monorepo (apps/api, Elixir +
  Plug/Bandit + Ecto). Builds via strict TDD (ExUnit red-green-refactor), follows
  DDD/context boundaries, reuses existing contexts, gates on Credo + Dialyzer, and
  self-reviews twice before closing. Ideal for executing backend specs or any
  "build/fix this endpoint/context" task.
model: sonnet
---
```

Body structure mirrors `frontend-builder.md`'s six-step order (ORIENT → REUSE → TDD →
FIX-LOOP → VERIFY → REVIEW×2 → REPORT), adapted per-step to Elixir:

- **0. ORIENT**: read `.claude/rules/general.md`, `.claude/rules/backend.md`,
  `.claude/rules/infra.md`, then the spec/task. Non-negotiables to restate: no
  business logic in controllers/changesets, contexts don't cross-call each other's
  Repo, `{:ok, _}`/`{:error, _}` + `with`, `@moduledoc`/`@doc`/`@spec` on all public
  modules/functions, migrations are immutable.
- **1. REUSE**: before creating a new context/schema, check
  `lib/api/<context_name>/` for an existing context that already owns this data;
  extend its public API instead of reaching into its Repo queries or duplicating a
  schema. Blast-radius scan (`grep -rn "Api.ContextName" apps/api/lib apps/api/test`)
  before changing a shared context's public function signature.
- **2. TDD**: red (ExUnit test against the context's public API, run via
  `docker compose exec -T api mix test <path>`, watch it fail for the right reason) →
  green (minimal implementation, changeset validation, no extra fields/YAGNI) →
  refactor while green. Use Mox for behaviour-based mocks (no global mocks), ExMachina
  factories for test data, `Ecto.Adapters.SQL.Sandbox` for DB isolation. Cover: the
  happy path, changeset validation failures, not-found/error tuples, and any
  authorization boundary.
- **3. FIX-LOOP**: after each changed `.ex`/`.exs` file, run `mix credo` and `mix
  dialyzer` (via `docker compose exec -T api ...`) and fix every finding before moving
  to the next file — this is the Elixir equivalent of the Svelte MCP autofixer loop in
  `frontend-builder.md`.
- **4. VERIFY**: run and paste real output for `yarn api:credo`, `yarn test:api`, `mix
  dialyzer`, and confirm `yarn api:migrate` applies cleanly if a migration was added.
- **5. REVIEW×2**: pass 1 = correctness & rules (reuse the full checklist from
  `.claude/agents/backend-reviewer.md` — Structure, Processes, Pattern
  Matching/Errors, Ecto, Performance, Tests, Code Quality, Security, API Docs); pass 2
  = fidelity & artifacts (no stray `IO.inspect`/`IO.puts` debug calls, no `TODO`,
  nothing unrelated changed, diff is minimal).
- **6. REPORT**: what changed and why, verification evidence, any deferred/ambiguous
  decision flagged (not decided unilaterally), and — if a shared context changed —
  which other consumers were re-verified.
- **Hard stops** (mirroring `frontend-builder.md`'s): no production code without a
  failing test first; no new context/schema without checking for an existing owner
  first; never close while Credo/Dialyzer/tests are failing; never edit
  `apps/web`, `packages/design-system`, or `apps/agents` unless the task explicitly
  says so.

## Frontmatter fix: `.claude/agents/backend-reviewer.md`

Currently has **no frontmatter** — it is not registered as an invocable subagent
(confirmed absent from the live agent-type list this session). Add this block at the
very top, before the existing `# Backend Reviewer Agent` heading, content unchanged
otherwise:

```yaml
---
name: backend-reviewer
description: >-
  Use for a standalone Elixir/OTP code-quality review against this repo's backend
  rules (apps/api) — structure, processes, Ecto, security, testing, docs. Reports
  violations with file:line and severity; does not write or edit code.
model: sonnet
---
```

## New agent: `.claude/agents/quality-reviewer.md`

Report-only, per the approved decision — no `Edit`/`Write`/`Agent` access, cannot
re-dispatch other agents or modify code:

```yaml
---
name: quality-reviewer
description: >-
  Use after frontend-builder and/or backend-builder finish implementing a spec, to
  verify the final diff actually satisfies what the spec asked for. Takes a spec
  (pasted text or a file path you give it) plus the current working tree, and
  produces a PASS/FAIL report per acceptance criterion with evidence (files, test
  output, screenshots if applicable) — it does not edit code or re-invoke other
  agents. Use when you want an independent check before merging, not mid-implementation.
tools: Read, Grep, Glob, Bash
model: sonnet
---
```

Body:

1. **Ingest the spec** — if given a file path, read it; if pasted inline, use it
   as-is. Extract an explicit checklist of acceptance criteria / Definition of Done
   items. If the spec has no explicit DoD, derive one from its "what" statements and
   say so in the report (flag it as inferred, not written).
2. **Inspect the diff** — `git status`, `git diff` (or `git diff <base>...HEAD` if a
   base ref is given), `git log` for the branch's commits. Confirm which files changed
   and whether that set matches the spec's stated scope; flag any out-of-scope file
   touched — always diff the full commit, not just a summary of it.
3. **Run verification commands** relevant to what changed — `yarn check`, `yarn test`
   (or the scoped `:web`/`:ds`/`:api`/`:agents` variants), `yarn lint`, `yarn
   api:credo` — and capture real output. Never assert a test passed without having run
   it in this pass.
4. **Cross-check rule compliance** by reading the relevant `.claude/rules/*.md` files
   for the domains touched (frontend/design-system/backend/agents/general) and
   checking the diff against them directly (TDD evidence — was a test added/changed
   alongside each behavior; CSS units; i18n key parity between `en.json`/`pt.json`;
   design-system reuse vs duplication; DDD context boundaries; etc.) — do not simply
   trust that the builder agents' own self-review passed; verify independently.
5. **Produce the report**: one line per acceptance criterion (`PASS` / `FAIL` /
   `PARTIAL` + evidence), a "Rule compliance" section (violations found, file:line),
   and a final verdict — `READY TO MERGE` or `NOT READY` with a prioritized punch
   list of what's missing. End of report. Do not fix anything; do not invoke other
   agents.

## Out of scope

- No changes to `apps/regrow` (has its own `RULES.md`/`README.md`, untouched by this
  reorg).
- No changes to how Claude Code discovers/loads `CLAUDE.md` files — this relies on
  existing hierarchical auto-load behavior, not new tooling.
- Not touching `.claude/settings.json`, `.claude/settings.local.json`, or any hooks.

## Testing / validation for this change

This is a documentation/config-only change — no application code runs. Validation is:

1. Every fact migrated into `.claude/rules/*.md` must be traceable to something that
   existed in `RULES.md`, an `apps/*/CLAUDE.md`, `docker-compose.yml`, or the current
   `packages/design-system/src` tree (no invented commands/paths).
2. After migration, `grep -rn "RULES.md\|apps/web/CLAUDE.md\|apps/agents/CLAUDE.md\|apps/api/CLAUDE.md"` across the repo (excluding `node_modules`, `_build`, `deps`, `.git`) must return nothing — no dangling references to the deleted files.
3. `frontend-builder.md`'s ORIENT step must reference `.claude/rules/general.md` /
   `.claude/rules/frontend.md` / `.claude/rules/design-system.md` instead of
   `RULES.md` / `apps/web/CLAUDE.md`.
4. All four files in `.claude/agents/` must have valid YAML frontmatter with at least
   `name` and `description` (verify `backend-reviewer.md` specifically, since it
   currently has none).
