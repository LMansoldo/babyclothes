# Claude Harness Reorg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate every rules/best-practices markdown file into `.claude/rules/`
(one file per domain), rewrite the root `CLAUDE.md` to be an overview + reference
index, and add a TDD backend dev agent plus a spec-vs-implementation quality reviewer
agent to `.claude/agents/`.

**Architecture:** Six new domain rule files under `.claude/rules/` replace `RULES.md`
and the three per-workspace `CLAUDE.md` files. Root `CLAUDE.md` becomes a thin index
linking to them. Two new agent files join the existing `frontend-builder.md`; a
frontmatter bug in `backend-reviewer.md` (currently unregistered — no frontmatter at
all) is fixed along the way.

**Tech Stack:** N/A — this is a documentation/config-only change, no application code.

## Global Constraints

- Every fact placed in a new `.claude/rules/*.md` file must be traceable to content
  that already existed in `RULES.md`, an `apps/*/CLAUDE.md`, `docker-compose.yml`, or
  the current `packages/design-system/src` tree — no invented commands or paths.
- After the reorg, `grep -rln "RULES.md\|apps/web/CLAUDE.md\|apps/agents/CLAUDE.md\|apps/api/CLAUDE.md"` across the repo (excluding `node_modules`, `_build`, `deps`, `.git`, `docs/superpowers/specs`, `docs/superpowers/plans`) must return nothing — the two directories are excluded because the spec/plan documents themselves are allowed to mention the old filenames when describing the migration.
- All four files under `.claude/agents/` must end with valid YAML frontmatter
  containing at least `name` and `description`.
- Full design spec: `docs/superpowers/specs/2026-08-12-claude-harness-reorg-design.md`.

---

### Task 1: Create `.claude/rules/general.md`

**Files:**
- Create: `.claude/rules/general.md`

**Interfaces:**
- Produces: the canonical location for cross-cutting rules (Docker First, Type
  Safety, SRP, DRY, CSS Units, SOLID, Object Calisthenics, Conventions) that every
  other domain rule file and every agent file will link to as `.claude/rules/general.md`.

- [ ] **Step 1: Write the file**

```markdown
# General Rules

> Mandatory rules for all code in this monorepo. Read this file before writing any code.

## Docker First

All dev, build, test, and preview commands **must run inside Docker containers**. Never run workspace commands directly on the host.

```bash
# Dev (all services: postgres + api + agents + web)
yarn dev

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

## Type Safety

- **Never use `any`.** Use `unknown` with runtime type validation (type guards, Zod, `typeof` checks).
- Always narrow `unknown` before accessing properties.

```ts
// Bad
function parse(data: any) { return data.name }

// Good
function parse(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name
  }
  throw new Error('Invalid data')
}
```

## Single Responsibility

- Every function, component, and module must have **one reason to change**.
- If a function does two things, split it into two functions.
- If a component handles layout AND business logic, extract the logic.

## DRY (Don't Repeat Yourself)

- If logic is duplicated in 2+ places, **abstract it into a shared function/component**.
- Before abstracting, **ask the user** which pattern to follow (utility function, composable, HOC, render prop, etc.).

## CSS Units

- **Never use `px`.** Always use `rem`.
- Proportion: **10px = 1rem** (i.e., `1rem = 10px` base).

```css
/* Bad */
padding: 16px;
font-size: 14px;

/* Good */
padding: 1.6rem;
font-size: 1.4rem;
```

## SOLID Principles

| Principle | Rule |
|-----------|------|
| **S** — Single Responsibility | One class/function = one job |
| **O** — Open/Closed | Open for extension, closed for modification |
| **L** — Liskov Substitution | Subtypes must be substitutable for base types |
| **I** — Interface Segregation | Small, focused interfaces over fat ones |
| **D** — Dependency Inversion | Depend on abstractions, not concretions |

## Object Calisthenics

1. **One level of indentation** per method — extract inner blocks into named methods.
2. **Don't use the ELSE keyword** — use early returns or strategy pattern.
3. **Wrap all primitives and strings** — use value objects / branded types.
4. **First class collections** — wrap arrays in objects with behavior.
5. **One dot per line** — avoid chaining (`a.b.c.d`), break into named variables.
6. **Don't abbreviate** — use full names (`button` not `btn`, `message` not `msg`).
7. **Keep all entities small** — files under 100 lines, classes under 50 lines.
8. **No classes with more than two instance variables** — decompose if more.
9. **No getters/setters** — tell objects what to do, don't ask for their state.

> Note: Rules 7-9 are aspirational. Apply judgment — don't create artificial splits that hurt readability. The goal is small, focused units.

## Conventions

- **No emojis** in UI — use `lucide-svelte` for icons (web app) or inline SVGs (SDK)
- **Semantic commits**: `feat(scope):`, `fix(scope):`, `docs(scope):`, etc.
- **BEM CSS naming**: `.block__element--modifier`
- **i18n**: All user-facing strings must support en-US and pt-BR
```

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/general.md && wc -l .claude/rules/general.md`
Expected: file exists, ~115 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/general.md
git commit -m "docs(harness): add .claude/rules/general.md"
```

---

### Task 2: Create `.claude/rules/frontend.md`

**Files:**
- Create: `.claude/rules/frontend.md`

**Interfaces:**
- Consumes: none.
- Produces: `.claude/rules/frontend.md`, referenced by root `CLAUDE.md` and by
  `frontend-builder.md` in Task 8.

- [ ] **Step 1: Write the file**

```markdown
# Frontend Rules (apps/web)

> Before writing any code, read `.claude/rules/general.md` first.

## Tech Stack

- **SvelteKit 2** with `@sveltejs/adapter-auto`
- **Svelte 5** with runes (`$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`, `Snippet`)
- **TypeScript 5** (strict, `verbatimModuleSyntax`, `moduleResolution: bundler`)
- **Vite 5** (port 5173, `host: true`)
- **@babyclothes/design-system** (workspace dependency)
- **@auth/sveltekit** for Google OAuth
- **zod** for validation schemas

## Commands

```bash
yarn workspace @babyclothes/web dev          # Dev server
yarn workspace @babyclothes/web build        # Production build
yarn workspace @babyclothes/web check        # TypeScript check (svelte-check)
yarn workspace @babyclothes/web test         # Unit tests (vitest)
yarn workspace @babyclothes/web test:e2e     # E2E tests (playwright)
yarn workspace @babyclothes/web storybook    # Storybook on port 6006
```

## Directory Structure (Clean Architecture)

```
src/lib/
├── domain/             # Entities, value objects, repository interfaces
│   ├── item/           # Item, Category, Condition, ClothingSize
│   ├── child/          # Child, GrowthRecord, ClothingSize
│   ├── chat/           # Message, AgentResponse, ChatSession
│   └── user/           # User
├── application/        # Use cases (CreateItem, AddMeasurement, SendMessage)
├── infrastructure/     # HTTP/SSE repository implementations
├── presentation/
│   ├── components/     # 12 page-level components
│   └── shell/          # TopBar, BottomNav
├── i18n/               # en.json, pt.json, locale store
└── mocks/              # Typed mock data (data.ts)
```

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/login` | `routes/login/+page.svelte` | Google OAuth sign-in |
| `/register` | `routes/register/+page.svelte` | PF/PJ registration (post-login) |
| `/catalog` | `routes/catalog/+page.svelte` | Product listing with filters |
| `/catalog/[id]` | `routes/catalog/[id]/+page.svelte` | Item detail |
| `/chat` | `routes/chat/+page.svelte` | AI assistant (SSE streaming) |
| `/child` | `routes/child/+page.svelte` | Children list with growth charts |
| `/child/register` | `routes/child/register/+page.svelte` | Register new child |
| `/child/[id]` | `routes/child/[id]/+page.svelte` | Child detail + growth history |
| `/notifications` | `routes/notifications/+page.svelte` | Notification center |
| `/sell` | `routes/sell/+page.svelte` | 2-step listing form |
| `/profile` | `routes/profile/+page.svelte` | Profile + language switcher |

## Svelte 5 Conventions

- Use `$props()` for component props with TypeScript types inline
- Use `$derived()` / `$derived.by()` for computed values
- Use `$state()` for local mutable state
- Use `$effect()` for side effects (not for derived values)
- Use `$bindable()` for two-way binding props
- Use `Snippet` type for render snippets passed as props
- Use `{#snippet name()}...{/snippet}` to define snippets
- Use `{@render name()}` to render snippets

## Component Props Pattern

```svelte
<script lang="ts">
  let {
    label,
    variant = 'default',
    onclick,
  }: {
    label: string
    variant?: 'default' | 'primary'
    onclick?: () => void
  } = $props()
</script>
```

## CSS Conventions

- CSS custom properties from `@babyclothes/design-system/tokens.css`
- Component-scoped `<style>` blocks
- Mobile-first responsive design

## i18n

- Translation files: `src/lib/i18n/en.json` and `pt.json`
- Use `$t('key')` for translations
- Use `$t('key', { var: value })` for interpolation (`{{var}}` syntax)
- Locale persisted in `localStorage`, auto-detected from browser
- Toggle in Profile page

## Icons

- **NO emojis** — use `lucide-svelte` package for all icons
- Import: `import { IconName } from 'lucide-svelte'`

## Testing

- **Unit**: Vitest with `@testing-library/svelte`
- **E2E**: Playwright (planned)
- Run: `yarn workspace @babyclothes/web test`

## Storybook

- Config: `.storybook/` directory
- Stories: `stories/` directory
- Run: `yarn workspace @babyclothes/web storybook`
```

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/frontend.md && grep -c "BEM naming" .claude/rules/frontend.md`
Expected: file exists, grep returns `0` (the generic BEM bullet was dropped — it now
lives only in `general.md`).

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/frontend.md
git commit -m "docs(harness): add .claude/rules/frontend.md"
```

---

### Task 3: Create `.claude/rules/design-system.md`

**Files:**
- Create: `.claude/rules/design-system.md`

**Interfaces:**
- Consumes: none.
- Produces: `.claude/rules/design-system.md`, referenced by root `CLAUDE.md` and by
  `frontend-builder.md` in Task 8.

- [ ] **Step 1: Write the file**

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

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/design-system.md`
Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/design-system.md
git commit -m "docs(harness): add .claude/rules/design-system.md"
```

---

### Task 4: Create `.claude/rules/backend.md`

**Files:**
- Create: `.claude/rules/backend.md`

**Interfaces:**
- Consumes: none.
- Produces: `.claude/rules/backend.md`, referenced by root `CLAUDE.md`, by
  `backend-builder.md` (Task 10), and by `backend-reviewer.md` (Task 9).

- [ ] **Step 1: Write the file**

```markdown
# Backend Rules (apps/api)

> Before writing any code, read `.claude/rules/general.md` first.

## Tech Stack

- **Elixir ~> 1.17** with **OTP**
- **Plug + Bandit** (HTTP server, port 4000)
- **Ecto + Postgrex** (PostgreSQL)
- **Oban** (background jobs)
- **gRPC** (client to agents service)
- **JOSE** (JWT authentication)
- **Finch** (HTTP client)
- **ExAWS + ExAWS.S3** (S3 file storage)

## Commands (Docker First)

All commands run inside Docker containers. See `.claude/rules/infra.md` for the full list.

```bash
yarn api:migrate     # mix ecto.migrate (inside container)
yarn api:credo       # mix credo (inside container)
yarn test:api        # mix test (inside container)
```

## Directory Structure

```
lib/
├── api/
│   ├── application.ex    # OTP Application
│   ├── router.ex         # Plug router
│   ├── endpoint.ex       # Plug endpoint
│   ├── repo.ex           # Ecto repo
│   └── ...               # Contexts, schemas, controllers
config/
├── config.exs            # Base config
├── dev.exs               # Dev config
├── test.exs              # Test config
├── prod.exs              # Prod config
└── runtime.exs            # Runtime config (env vars)
test/
├── test_helper.exs
└── support/              # Test factories (ex_machina)
```

## Dependencies

| Dep | Purpose |
|-----|---------|
| `plug` | HTTP middleware |
| `bandit` | HTTP server |
| `ecto_sql` + `postgrex` | Database |
| `oban` | Background jobs |
| `grpc` + `protobuf` | gRPC client to agents |
| `jose` | JWT auth |
| `finch` | HTTP client |
| `ex_aws` + `ex_aws_s3` | S3 storage |
| `jason` | JSON encoding |
| `credo` | Linting (dev/test) |
| `ex_machina` | Test factories |

## Architecture: DDD + Contexts

Follow Domain-Driven Design. Business logic lives in **context modules** (`lib/api/context_name/`), not in controllers or schemas.

```
lib/api/
├── accounts/          # Context: user management
│   ├── user.ex        # Ecto schema
│   ├── accounts.ex    # Context module (public API)
│   └── ...            # Value objects, changesets
├── catalog/           # Context: items/listings
│   ├── item.ex
│   └── catalog.ex
├── messaging/         # Context: chat/notifications
│   └── ...
└── growth/            # Context: AI growth prediction
    └── ...
```

### Context Rules

- Each context has one public module (e.g., `Api.Accounts`) exposing the API
- Contexts do NOT call each other's Repo queries directly — use the public API
- Controllers only delegate to contexts — no business logic in controllers
- Schemas define structure, changesets validate, contexts orchestrate

## Processes & Concurrency

- **GenServer** only for mutable state (caches, counters, connection pools) — never for trivial operations
- **Supervisors** for fault tolerance — use `let it crash` philosophy
- **Task / Task.Supervisor** for fire-and-forget async work
- **Named processes** via `Registry` when dynamic processes need lookup
- **Oban** for reliable background jobs (email, S3 cleanup, AI predictions)
- **cast** (async) when response not needed; **call** (sync) when it is

## Pattern Matching & Errors

- Prefer pattern matching over `if/else`
- Return `{:ok, value}` / `{:error, reason}` tuples
- Use `with` for chaining fallible operations
- No excessive `rescue` — prefer functional error handling

```elixir
# Good
def get_user(id) do
  case Repo.get(User, id) do
    nil -> {:error, :not_found}
    user -> {:ok, user}
  end
end

# Good — chaining with `with`
def register_user(attrs) do
  with {:ok, user} <- Accounts.create_user(attrs),
       {:ok, _token} <- Tokens.generate(user) do
    {:ok, user}
  end
end
```

## Database (Ecto)

- **Always use changesets** for validation before persisting
- **No N+1 queries** — use `preload` or explicit joins
- **Repo.transaction** for operations that must be atomic
- **Migrations are immutable** — never modify an applied migration
- **No business logic in changesets** — changesets validate, contexts orchestrate

```elixir
# Good — changeset with validation
def changeset(user, attrs) do
  user
  |> cast(attrs, [:name, :email])
  |> validate_required([:name, :email])
  |> validate_format(:email, ~r/@/)
  |> unique_constraint(:email)
end
```

## Performance

- `Stream` for large collections; `Enum` for small/medium
- `cast` (async) when response not needed; `call` when it is
- `ETS` for high-performance in-memory cache
- No blocking calls in critical processes
- Use `Repo.all` with pagination — never load unbounded result sets

## Tests

- **ExUnit** with high coverage
- **Mox** for behaviour-based mocks (no global mocks)
- **ExMachina** factories for test data
- Integration tests with real DB via `Ecto.Adapters.SQL.Sandbox`
- Test contexts (not controllers) for business logic coverage

```elixir
# Factory example
def insert_user(attrs \\ %{}) do
  :user
  |> build(attrs)
  |> Repo.insert!()
end
```

## Code Quality

- **Credo** must pass (no warnings) — run `yarn api:credo`
- **Dialyxir** typespec check passes
- `@moduledoc` on all public modules
- `@doc` on all public functions
- `@spec` on all public functions

```elixir
defmodule Api.Accounts do
  @moduledoc "Context for user account management."

  @spec get_user(integer()) :: {:ok, User.t()} | {:error, :not_found}
  def get_user(id) do
    # ...
  end
end
```

## Security

- **No sensitive data in logs** (passwords, tokens, CPF)
- **JWT via JOSE/Joken** for authentication
- **External input always validated** and sanitized (never trust client)
- **Rate limiting** on critical routes (login, register, password reset)
- **CORS** configured for web origin only
- **SQL injection prevention** — always use Ecto query syntax, never raw SQL strings

## API Documentation

- **Swagger/OpenAPI spec** updated for every new/changed endpoint
- Request/response schemas documented
- Error responses documented with status codes
```

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/backend.md && grep -c "^## Environment Variables" .claude/rules/backend.md`
Expected: file exists, grep returns `0` (env vars moved to `infra.md`, Task 6).

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/backend.md
git commit -m "docs(harness): add .claude/rules/backend.md"
```

---

### Task 5: Create `.claude/rules/agents.md`

**Files:**
- Create: `.claude/rules/agents.md`

**Interfaces:**
- Consumes: none.
- Produces: `.claude/rules/agents.md`, referenced by root `CLAUDE.md`.

- [ ] **Step 1: Write the file**

```markdown
# Agents Rules (apps/agents)

> Before writing any code, read `.claude/rules/general.md` first.

## Tech Stack

- **TypeScript 5** (strict, ES2022 target)
- **LangGraph** (`@langchain/langgraph`) — agent orchestration
- **Anthropic SDK** (`@anthropic-ai/sdk`, `@langchain/anthropic`) — LLM
- **gRPC** (`@grpc/grpc-js`, `@grpc/proto-loader`) — server interface
- **tsx** — dev runner
- **Vitest** — testing

## Commands

```bash
yarn workspace @babyclothes/agents dev      # Dev with tsx watch
yarn workspace @babyclothes/agents build    # Compile to dist/
yarn workspace @babyclothes/agents start    # Run compiled output
yarn workspace @babyclothes/agents test     # Run tests
```

## Structure

```
src/
└── index.ts          # gRPC server entry point (stub)
proto/
└── agent.proto       # gRPC contract (shared with API)
```

## gRPC Services

Defined in `proto/agent.proto`:

| Service | Type | Description |
|---------|------|-------------|
| `Chat` | Server streaming | AI conversation with streaming responses |
| `PredictGrowth` | Unary | Predict next clothing size and timeline |

## Current Status

**Stub implementation** — returns hardcoded responses. LangGraph integration is planned.

## Conventions

- Follow LangGraph patterns for agent graphs
- Use TypeScript strict mode
- gRPC contract changes require updating `proto/agent.proto` (shared with API)
```

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/agents.md`
Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/agents.md
git commit -m "docs(harness): add .claude/rules/agents.md"
```

---

### Task 6: Create `.claude/rules/infra.md`

**Files:**
- Create: `.claude/rules/infra.md`

**Interfaces:**
- Consumes: none.
- Produces: `.claude/rules/infra.md`, referenced by root `CLAUDE.md`,
  `.claude/rules/design-system.md` (Task 3), and `.claude/rules/backend.md` (Task 4).

- [ ] **Step 1: Write the file**

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
```

- [ ] **Step 2: Verify**

Run: `test -f .claude/rules/infra.md`
Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/infra.md
git commit -m "docs(harness): add .claude/rules/infra.md"
```

---

### Task 7: Rewrite root `CLAUDE.md` and delete the four legacy rule files

**Files:**
- Modify: `CLAUDE.md` (full rewrite)
- Delete: `RULES.md`
- Delete: `apps/web/CLAUDE.md`
- Delete: `apps/agents/CLAUDE.md`
- Delete: `apps/api/CLAUDE.md`

**Interfaces:**
- Consumes: all six files created in Tasks 1–6 (linked from the new `CLAUDE.md`).
- Produces: the final root `CLAUDE.md`, which is the only `CLAUDE.md` left in the repo
  (except `apps/regrow/RULES.md`/`README.md`, out of scope — see design spec).

- [ ] **Step 1: Overwrite `CLAUDE.md` with**

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

- [ ] **Step 2: Delete the four legacy files**

```bash
git rm RULES.md apps/web/CLAUDE.md apps/agents/CLAUDE.md apps/api/CLAUDE.md
```

- [ ] **Step 3: Verify**

Run: `git status --short` and confirm `CLAUDE.md` shows modified, the four files show
deleted, and no other file changed unexpectedly.

Run: `grep -rln "RULES.md" --include="*.md" . 2>/dev/null | grep -v node_modules | grep -v "docs/superpowers/specs" | grep -v "docs/superpowers/plans" | grep -v "apps/regrow"`
Expected: empty output (no remaining references to the deleted `RULES.md` outside the
spec/plan docs and the untouched `apps/regrow`).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(harness): rewrite root CLAUDE.md as an index, remove legacy per-app CLAUDE.md and RULES.md"
```

---

### Task 8: Update `.claude/agents/frontend-builder.md` references

**Files:**
- Modify: `.claude/agents/frontend-builder.md`

**Interfaces:**
- Consumes: `.claude/rules/general.md`, `.claude/rules/frontend.md`,
  `.claude/rules/design-system.md` (Tasks 1–3) — this task only updates the paths
  this agent tells itself to read; no behavioral change otherwise.

- [ ] **Step 1: Update the "Order of operations" block**

Find:
```
0. ORIENT   → read RULES.md + relevant CLAUDE.md + the spec/task
```

Replace with:
```
0. ORIENT   → read .claude/rules/general.md + relevant .claude/rules/*.md + the spec/task
```

- [ ] **Step 2: Update the ORIENT section body**

Find:
```
1. Read `RULES.md` at the repo root. It overrides your defaults. Non-negotiables:
   - **CSS units: never `px`, always `rem`, base `10px = 1rem`** (so `16px → 1.6rem`).
     Mocks are in `px` — you MUST convert. `12px → 1.2rem`, `14px → 1.4rem`, etc.
   - **Never `any`** — use `unknown` + narrowing / Zod / type guards.
   - Single Responsibility, SOLID, DRY (ask before inventing an abstraction).
   - Object Calisthenics: early returns over `else`, small units, **don't abbreviate**.
2. Read the closest `CLAUDE.md` (`apps/web/CLAUDE.md` or `packages/design-system`):
```

Replace with:
```
1. Read `.claude/rules/general.md` at the repo root. It overrides your defaults.
   Non-negotiables:
   - **CSS units: never `px`, always `rem`, base `10px = 1rem`** (so `16px → 1.6rem`).
     Mocks are in `px` — you MUST convert. `12px → 1.2rem`, `14px → 1.4rem`, etc.
   - **Never `any`** — use `unknown` + narrowing / Zod / type guards.
   - Single Responsibility, SOLID, DRY (ask before inventing an abstraction).
   - Object Calisthenics: early returns over `else`, small units, **don't abbreviate**.
2. Read `.claude/rules/frontend.md` and `.claude/rules/design-system.md`:
```

- [ ] **Step 3: Update the Pass 1 review checklist**

Find:
```
- [ ] RULES.md: no `px` (all `rem`, 10px=1rem), no `any`, single responsibility, no abbreviations.
```

Replace with:
```
- [ ] general.md rules: no `px` (all `rem`, 10px=1rem), no `any`, single responsibility, no abbreviations.
```

- [ ] **Step 4: Verify**

Run: `grep -n "RULES.md\|apps/web/CLAUDE.md" .claude/agents/frontend-builder.md`
Expected: empty output.

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/frontend-builder.md
git commit -m "docs(harness): point frontend-builder at .claude/rules instead of RULES.md/CLAUDE.md"
```

---

### Task 9: Add frontmatter to `.claude/agents/backend-reviewer.md`

**Files:**
- Modify: `.claude/agents/backend-reviewer.md`

**Interfaces:**
- Produces: `backend-reviewer` becomes a validly-registered subagent (`name` +
  `description` in frontmatter) — it currently has none and is not selectable via the
  Agent tool.

- [ ] **Step 1: Insert frontmatter at the very top of the file**

Find (the current first line of the file):
```
# Backend Reviewer Agent
```

Replace with:
```
---
name: backend-reviewer
description: >-
  Use for a standalone Elixir/OTP code-quality review against this repo's backend
  rules (apps/api) — structure, processes, Ecto, security, testing, docs. Reports
  violations with file:line and severity; does not write or edit code.
model: sonnet
---

# Backend Reviewer Agent
```

Everything else in the file (the review checklist, output format) stays unchanged.

- [ ] **Step 2: Verify**

Run: `head -8 .claude/agents/backend-reviewer.md`
Expected: shows the `---`-delimited frontmatter block with `name: backend-reviewer`
and a `description:` field, followed by the original `# Backend Reviewer Agent`
heading.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/backend-reviewer.md
git commit -m "fix(harness): add missing frontmatter to backend-reviewer agent"
```

---

### Task 10: Create `.claude/agents/backend-builder.md`

**Files:**
- Create: `.claude/agents/backend-builder.md`

**Interfaces:**
- Consumes: `.claude/rules/general.md`, `.claude/rules/backend.md`,
  `.claude/rules/infra.md` (Tasks 1, 4, 6) — referenced by path inside the agent's
  ORIENT step.
- Produces: a new `backend-builder` subagent, registered via frontmatter, usable via
  the Agent tool for implementing `apps/api` code with TDD.

- [ ] **Step 1: Write the file**

```markdown
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

# Backend Builder

You implement backend code for the BabyClothes monorepo (Elixir + Plug/Bandit + Ecto
in `apps/api`). You are careful, test-first, and you never claim done without
evidence. Working code without proof is not done.

You produce **small, verified increments**. You do not narrate options — you act,
then show evidence.

---

## Order of operations (do NOT skip or reorder)

```
0. ORIENT   → read .claude/rules/general.md + .claude/rules/backend.md + .claude/rules/infra.md + the spec/task
1. REUSE    → check for an existing context/schema BEFORE creating a new one
2. TDD      → red → green → refactor, one behavior at a time
3. FIX-LOOP → mix credo + mix dialyzer on every changed file until clean
4. VERIFY   → credo + dialyzer + mix test + migration check
5. REVIEW×2 → two independent self-review passes; fix findings each time
6. REPORT   → summary + evidence; only now is the task "done"
```

If any step reveals a problem, go back — never push forward on a broken step.

---

## 0. ORIENT — read the rules first (mandatory, before any code)

1. Read `.claude/rules/general.md` at the repo root. It overrides your defaults.
   Non-negotiables:
   - **Docker First** — every command runs inside a container, never on the host.
   - **Never `any`** doesn't apply to Elixir directly, but the same discipline
     applies: never pattern-match on a raw, unvalidated map — cast/validate through a
     changeset first.
   - Single Responsibility, SOLID, DRY (ask before inventing an abstraction).
   - Object Calisthenics: early returns over `else`, small units, **don't abbreviate**.
2. Read `.claude/rules/backend.md`:
   - **DDD & Contexts** — business logic in context modules (`Api.ContextName`), not
     controllers or schemas. Contexts expose a public API — no cross-context `Repo`
     queries. Controllers delegate only.
   - **Processes & Concurrency** — `GenServer` for mutable state only, `Supervisor`
     for fault tolerance, `Task`/`Task.Supervisor` for fire-and-forget, `Oban` for
     reliable background jobs, `cast` when no response needed, `call` when there is.
   - **Pattern Matching & Errors** — prefer pattern matching over `if/else`, return
     `{:ok, value}` / `{:error, reason}`, `with` for chaining, no excessive `rescue`.
   - **Database (Ecto)** — changesets always validate before persist, no N+1 (use
     `preload`/joins), `Repo.transaction` for atomic multi-step ops, migrations are
     immutable once applied, no business logic in changesets.
   - **Code Quality** — Credo passes with no warnings, Dialyzer passes, `@moduledoc`
     on every public module, `@doc` + `@spec` on every public function.
3. Read `.claude/rules/infra.md` for the Docker Compose service names, ports, and env
   vars you may need (`api`, `postgres`, `GRPC_AGENT_URL`, etc.).
4. Read the spec/task fully before touching code. If a spec block's "BEFORE" does not
   match the current file, STOP and report — do not guess.

## 1. REUSE — check for an existing context/schema before creating one

Creating a duplicate context or schema is a defect. Before writing ANY new context:

1. Search existing contexts: `ls apps/api/lib/api` and
   `grep -ri "<name or purpose>" apps/api/lib/api`.
2. Decision tree:
   - An existing context already owns this data → extend its public API with a new
     function. Never reach into its schema/`Repo` from another context.
   - Truly new domain → create a new context module (`Api.ContextName`) with its own
     schema(s), changeset(s), and a single public module exposing the API.
3. **Blast-radius scan** before changing a shared context's public function
   signature: `grep -rn "Api.ContextName" apps/api/lib apps/api/test`. If used by
   more than one caller, the change must be additive (new function or new optional
   arg with a default) and every caller must be re-verified.

## 2. TDD — test first, always

Follow red → green → refactor. If you write implementation before a failing test,
delete it and start over.

- **RED**: write ONE minimal failing ExUnit test against the context's public API.
  Use `ExMachina` factories (`apps/api/test/support`) for test data and rely on
  `Ecto.Adapters.SQL.Sandbox` for DB isolation. Run it inside Docker and **watch it
  fail for the right reason**:
  `docker compose exec -T api mix test <path>`
- **GREEN**: minimal changeset/context function to pass. No extra fields/branches
  (YAGNI).
- **REFACTOR**: clean up while green.
- Repeat per behavior. Cover: the happy path, changeset validation failures, the
  `{:error, :not_found}` / not-authorized paths, and any boundary the spec calls out.
- Use `Mox` for behaviour-based mocks (e.g. the gRPC client to `apps/agents`) — never
  a global/manual mock.

## 3. FIX-LOOP — Credo + Dialyzer on every finished file (mandatory)

**Whenever you finish writing or editing a `.ex`/`.exs` file, before moving on**, run:

```bash
docker compose exec -T api mix credo <path>
docker compose exec -T api mix dialyzer
```

Fix every finding, then re-run until both are clean for that file. Do this for
**each** changed file — a task is not ready for review while any changed file still
has Credo or Dialyzer findings.

## 4. VERIFY — evidence, not assumptions

Run all of these inside Docker and paste the real output:

1. `yarn api:credo` (0 warnings).
2. `yarn test:api` (all green, output pristine).
3. `docker compose exec -T api mix dialyzer` (0 new warnings).
4. If a migration was added: `yarn api:migrate` applies cleanly against the dev DB.
5. For a new/changed endpoint: exercise it directly, e.g.
   `docker compose exec -T api curl -s localhost:4000/api/<route>` (or the
   project's existing test client) — do not trust the unit tests alone for
   integration-level wiring (router → controller → context).

## 5. REVIEW ×2 — two self-review passes before closing

After VERIFY passes, review your own diff **twice**, each pass fixing what it finds.

**Pass 1 — Correctness & rules** (from `.claude/rules/backend.md`):
- [ ] TDD honored: a failing test preceded each behavior; tests exercise the real
      context, not mocks of the code under test.
- [ ] Business logic lives in context modules; controllers only delegate.
- [ ] Contexts don't call another context's `Repo` directly.
- [ ] Pattern matching over `if/else`; `{:ok, _}`/`{:error, _}` returns; `with` for
      chains; no excessive `rescue`.
- [ ] Changesets validate before persist; no N+1 (checked for missing `preload`);
      `Repo.transaction` used for atomic multi-step writes; no business logic in
      changesets.
- [ ] `GenServer` only for mutable state; `cast`/`call` chosen correctly.
- [ ] `@moduledoc`/`@doc`/`@spec` present on every public module/function touched.
- [ ] No sensitive data (passwords, tokens, CPF) logged.
- [ ] Migrations are additive/immutable — no edit to an already-applied migration.
- [ ] Swagger/OpenAPI updated for any new/changed endpoint.

**Pass 2 — Fidelity, robustness & artifacts:**
- [ ] No debug artifacts: grep for `IO.inspect`, `IO.puts`, `TODO`.
- [ ] No unrelated changes; diff is minimal and focused.
- [ ] Rate limiting / auth boundary respected on any new critical route.
- [ ] Error responses documented with status codes.
- [ ] If a shared context changed, every other consumer found in the blast-radius
      scan (step 1) was re-verified against the new signature.

Only when both passes are clean is the task closeable.

## 6. REPORT — how to close

Report concisely:
- What changed (files) and why.
- Evidence: `mix credo`, `mix test`, `mix dialyzer` output, and (for endpoints) the
  request/response you exercised.
- Any decision you deferred (e.g. an ambiguous error code) — flag it, do not decide
  unilaterally on outward-facing/ambiguous choices.
- If a shared context changed, list the other consumers you re-verified.

---

## Hard stops

- No production code without a failing test first.
- No new context/schema without searching for an existing owner first.
- No closing a task while Credo, Dialyzer, or `mix test` are failing, or you have not
  exercised a new/changed endpoint directly.
- Never edit `apps/web`, `packages/design-system`, or `apps/agents` unless the task
  explicitly says so.
```

- [ ] **Step 2: Verify**

Run: `head -8 .claude/agents/backend-builder.md`
Expected: shows the `---`-delimited frontmatter with `name: backend-builder`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/backend-builder.md
git commit -m "feat(harness): add backend-builder TDD agent"
```

---

### Task 11: Create `.claude/agents/quality-reviewer.md`

**Files:**
- Create: `.claude/agents/quality-reviewer.md`

**Interfaces:**
- Consumes: `.claude/rules/*.md` (all six files, Tasks 1–6) — referenced inside the
  agent's cross-check step.
- Produces: a new `quality-reviewer` subagent, report-only (frontmatter restricts
  tools to `Read, Grep, Glob, Bash` — no `Edit`, `Write`, or `Agent`).

- [ ] **Step 1: Write the file**

```markdown
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

# Quality Reviewer

You check a finished implementation against the spec that was supposed to drive it.
You are independent: you do not trust the builder agents' self-review, you verify
everything yourself. You never edit code and you never invoke another agent — your
only output is a report.

---

## Process

### 1. Ingest the spec

- If given a file path, read it in full.
- If given pasted text, use it as-is.
- Extract an explicit checklist of acceptance criteria / Definition of Done items.
  If the spec has no explicit DoD section, derive one from its "what" statements and
  **say so in the report** — mark those items as inferred, not written.

### 2. Inspect the diff

- `git status`, `git diff` (or `git diff <base>...HEAD` if a base ref was given), and
  `git log` for the branch's commits.
- Confirm which files changed and whether that set matches the spec's stated scope.
- Flag any out-of-scope file touched. Always diff the **full** commit — never trust a
  summary of "what changed" from a report; read the actual diff.

### 3. Run verification commands

Run whatever is relevant to what changed and capture the real output — never assert a
command passed without having run it in this pass:

- Frontend/design-system touched: `docker compose exec -T web yarn workspace @babyclothes/web check`,
  `yarn workspace @babyclothes/web test --run`, `yarn workspace @babyclothes/design-system test --run`,
  `yarn lint:web`, `yarn lint:ds`, `yarn stylelint:web`, `yarn stylelint:ds`.
- Backend touched: `yarn api:credo`, `yarn test:api`.
- Agents touched: `docker compose exec -T agents yarn test`.

### 4. Cross-check rule compliance

Read the `.claude/rules/*.md` files for the domains touched and check the diff
against them directly:

- `general.md` — CSS units (`rem` only), no `any`, SRP/DRY, semantic commits.
- `frontend.md` / `design-system.md` — Svelte 5 runes only, BEM, i18n key parity
  between `en.json`/`pt.json`, design-system component reused (not duplicated),
  tokens used over raw hex.
- `backend.md` — DDD context boundaries respected, no cross-context `Repo` calls,
  changesets validate, `@moduledoc`/`@doc`/`@spec` present.
- `agents.md` — gRPC contract (`proto/agent.proto`) updated if the interface changed.

Do not simply trust that the builder agent's own self-review passed — re-derive each
finding from the diff yourself.

### 5. Produce the report

Format:

```
## Spec: <name/path>

### Acceptance criteria
- [PASS|FAIL|PARTIAL] <criterion 1> — <evidence: file:line, test name, or command output>
- [PASS|FAIL|PARTIAL] <criterion 2> — <evidence>
...

### Rule compliance
- <violation, file:line, which rule file> (or "None found")
...

### Verdict: READY TO MERGE | NOT READY

<if NOT READY: prioritized punch list of exactly what's missing/broken, most
important first>
```

---

## Hard stops

- Never edit a file. Never run a command that mutates the working tree (no `git
  commit`, `git checkout .`, `git add`, package installs).
- Never invoke another agent — you report findings, the user decides what happens
  next.
- Never mark a criterion PASS without a concrete piece of evidence (a file/line, a
  command's real output, or a specific test name) attached to it.
```

- [ ] **Step 2: Verify**

Run: `head -10 .claude/agents/quality-reviewer.md`
Expected: shows frontmatter with `name: quality-reviewer` and
`tools: Read, Grep, Glob, Bash` (no `Edit`/`Write`/`Agent` present).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/quality-reviewer.md
git commit -m "feat(harness): add quality-reviewer spec-compliance agent"
```

---

### Task 12: Final verification pass

**Files:** none (verification only, no file changes expected).

- [ ] **Step 1: Confirm no dangling references to deleted files**

Run:
```bash
grep -rln "RULES\.md\|apps/web/CLAUDE\.md\|apps/agents/CLAUDE\.md\|apps/api/CLAUDE\.md" \
  --include="*.md" . 2>/dev/null \
  | grep -v node_modules | grep -v /deps/ | grep -v /_build/ \
  | grep -v "docs/superpowers/specs/2026-08-12-claude-harness-reorg-design.md" \
  | grep -v "docs/superpowers/plans/2026-08-12-claude-harness-reorg.md" \
  | grep -v "apps/regrow/"
```
Expected: empty output.

- [ ] **Step 2: Confirm the final `.claude` layout**

Run: `find .claude/rules .claude/agents -type f | sort`
Expected:
```
.claude/agents/backend-builder.md
.claude/agents/backend-reviewer.md
.claude/agents/frontend-builder.md
.claude/agents/quality-reviewer.md
.claude/rules/agents.md
.claude/rules/backend.md
.claude/rules/design-system.md
.claude/rules/frontend.md
.claude/rules/general.md
.claude/rules/infra.md
```

- [ ] **Step 3: Confirm all four agent files have valid frontmatter**

Run: `for f in .claude/agents/*.md; do echo "== $f =="; head -1 "$f"; done`
Expected: every file's first line is `---` (the frontmatter delimiter).

- [ ] **Step 4: Confirm root CLAUDE.md links resolve**

Run:
```bash
grep -oE '\.claude/rules/[a-z-]+\.md' CLAUDE.md | sort -u | while read f; do test -f "$f" && echo "OK: $f" || echo "MISSING: $f"; done
```
Expected: every line printed as `OK:`, none as `MISSING:`.

- [ ] **Step 5: Report**

Summarize: files created/deleted, commits made, and confirmation that all four
verification checks above passed. No further commit needed for this task (it's
read-only).
