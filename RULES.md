# Coding Rules

Mandatory rules for all code in this monorepo. Read this file before writing any code.

## Docker First

All dev, build, test, and preview commands **must run inside Docker containers**. Never run workspace commands directly on the host.

```bash
# Dev (all services: postgres + api + agents + web)
yarn dev

# Build
yarn build           # all workspaces
yarn build:ui        # just ui
yarn build:web       # just web

# Preview
yarn preview

# Test
yarn test            # all
yarn test:web        # just web
yarn test:ui         # just ui
yarn test:agents     # just agents
yarn test:api        # just api (mix test)

# Type check
yarn check           # all
yarn check:web       # just web
yarn check:ui        # just ui

# API
yarn api:migrate     # mix ecto.migrate
yarn api:credo       # mix credo

# Lint
yarn lint            # all workspaces
yarn lint:ui         # just ui
yarn lint:web        # just web
yarn lint:fix        # auto-fix all

# Format
yarn format          # prettier --write all workspaces

# Stylelint
yarn stylelint       # all workspaces
yarn stylelint:ui    # just ui
yarn stylelint:web   # just web

# Logs
yarn logs            # all services
yarn logs:web        # just web
yarn logs:api        # just api
yarn logs:agents     # just agents
```

**Exception:** Storybook runs locally (not in containers):
```bash
yarn storybook:ui
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

## Backend (Elixir/OTP)

Additional rules for `apps/api`. See also `.claude/agents/backend-reviewer.md`.

### DDD & Contexts

- Business logic in context modules (`Api.ContextName`), not controllers or schemas
- Contexts expose a public API — no cross-context Repo queries
- Controllers delegate only — zero business logic
- Schemas define structure, changesets validate, contexts orchestrate

### Processes & Concurrency

- GenServer for mutable state only — never for trivial operations
- Supervisors for fault tolerance (`let it crash`)
- Task/Task.Supervisor for fire-and-forget async
- Oban for reliable background jobs (email, S3, AI)
- `cast` when response not needed, `call` when it is

### Pattern Matching & Errors

- Pattern matching preferred over `if/else`
- Return `{:ok, value}` / `{:error, reason}`
- `with` for chaining fallible operations
- No excessive `rescue` — functional error handling

### Database (Ecto)

- Changesets always validate before persist
- No N+1 queries — use `preload` or joins
- `Repo.transaction` for atomic multi-step operations
- Migrations are immutable once applied
- No business logic in changesets

### Performance

- `Stream` for large collections, `Enum` for small/medium
- `ETS` for high-performance in-memory cache
- No blocking calls in critical processes
- Always paginate queries — never load unbounded result sets

### Code Quality

- Credo passes (no warnings) — run `yarn api:credo`
- Dialyxir typespec check passes
- `@moduledoc` on all public modules
- `@doc` on all public functions
- `@spec` on all public functions

### Security

- No sensitive data in logs (passwords, tokens, CPF)
- JWT via JOSE/Joken
- External input validated and sanitized
- Rate limiting on critical routes
- SQL injection prevention — Ecto queries only, never raw strings

### API Documentation

- Swagger/OpenAPI spec updated for new/changed endpoints
- Request/response schemas documented
- Error responses documented with status codes
