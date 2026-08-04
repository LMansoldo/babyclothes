# ReGrow Landing — Coding Rules

Trimmed, project-specific copy of the monorepo root `RULES.md`, scoped to this
standalone frontend project. Read before writing any code.

## Docker First

All dev/build/test/check commands run inside this project's own Docker Compose
stack (see `docker-compose.yml`), independent of the `babyclothes` monorepo's stack.

```bash
docker compose up              # postgres + app
docker compose exec app npm run build
docker compose exec app npm run test
docker compose exec app npm run check
docker compose exec app npm run prisma:migrate
```

## Type Safety

Never use `any`. Use `unknown` with runtime type guards, narrowed before property access.

## CSS Units

Never use `px`. Always use `rem`. **This project's proportion is `20px = 1rem`**
(`html { font-size: 125%; }`, browser default 16px × 1.25 = 20px) — matching the
copied `@babyclothes/design-system` tokens, which were authored against that base.
This deliberately differs from the root monorepo `RULES.md`'s stated `10px = 1rem`;
using 10px here would render every copied token at half its intended size.

## Single Responsibility / DRY / SOLID / Object Calisthenics

Same rules as the monorepo root `RULES.md`: one reason to change per unit, no
duplicated logic across 2+ places, small focused files, one level of
indentation, no `else` where an early return works, don't abbreviate names.

## Conventions

- **No emojis** in UI.
- **BEM CSS naming**: `.block__element--modifier`.
- **i18n**: every user-facing string goes through `svelte-i18n`'s `$t()`, for
  both `pt` and `en`.
