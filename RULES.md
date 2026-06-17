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
