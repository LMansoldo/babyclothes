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
