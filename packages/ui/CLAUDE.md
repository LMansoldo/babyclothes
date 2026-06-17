# packages/ui — Shared Component Library

## Overview

`@babyclothes/ui` — Svelte 5 component library consumed by `apps/web` as a workspace dependency.

## Tech Stack

- **Svelte 5** with runes (peer dependency)
- **TypeScript 5** (strict, `verbatimModuleSyntax`)
- **svelte-package** for building (`@sveltejs/package`)
- **Vitest** for unit tests
- **Storybook 8** for documentation

## Commands

```bash
yarn workspace @babyclothes/ui build        # Build to dist/
yarn workspace @babyclothes/ui check        # TypeScript check
yarn workspace @babyclothes/ui test         # Unit tests
yarn workspace @babyclothes/ui storybook    # Storybook on port 6006
```

## Exports

```json
{
  ".": { "types": "./dist/index.d.ts", "svelte": "./dist/index.js" },
  "./tokens.css": "./src/lib/tokens/tokens.css"
}
```

## Component Structure

Each component follows this pattern:

```
src/lib/components/ComponentName/
├── ComponentName.svelte      # Component implementation
├── ComponentName.test.ts     # Unit tests (optional)
└── index.ts                  # Re-export: export { default as ComponentName } from './ComponentName.svelte'
```

## Barrel Export

`src/lib/index.ts` uses **named exports** (not default):

```ts
export { Button } from './components/Button/index.js';
export { Badge } from './components/Badge/index.js';
// ...
```

## Components (12)

### Primitives (7)

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | `label`, `variant`, `size`, `disabled`, `onclick` | Primary action button |
| `Badge` | `label`, `variant`, `size` | Status/category badge |
| `Input` | `label`, `placeholder`, `value`, `type`, `error` | Form input with label |
| `Avatar` | `src`, `alt`, `size`, `fallback` | User avatar with fallback |
| `Spinner` | `size`, `color` | Loading indicator |
| `Toast` | `message`, `variant`, `visible` | Feedback notification |
| `FilterBar` | `label`, `options`, `selected`, `onselect`, `onDark` | Category filter pills |

### Composite (5)

| Component | Props | Description |
|-----------|-------|-------------|
| `Card` | `padding`, `shadow`, `onclick` | Generic card container |
| `ChatInput` | `placeholder`, `onsend` | Message input with send button |
| `Carousel` | `items`, `arrows`, `dots` | Image/content carousel |
| `ItemList` | `items`, `columns`, `gap` | Grid layout for item cards |
| `Modal` | `open`, `title`, `onclose` | Dialog overlay |

## CSS Conventions

- All components use CSS custom properties from `tokens.css`
- BEM naming: `.bc-block__element--modifier`
- Scoped `<style>` blocks
- Design tokens: `--pk`, `--bk`, `--wh`, `--of2`, `--of3`, `--gr`, `--ld`, `--sr`, `--vd`

## Icons

- **NO lucide-svelte** (not a dependency of this package)
- Use inline SVGs for icons in SDK components
- The `apps/web` app uses `lucide-svelte` directly

## Props Pattern

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    variant = 'default',
    children,
  }: {
    label: string
    variant?: 'default' | 'primary'
    children?: Snippet
  } = $props()
</script>
```

## Adding a New Component

1. Create `src/lib/components/NewComponent/NewComponent.svelte`
2. Create `src/lib/components/NewComponent/index.ts` with named export
3. Add export to `src/lib/index.ts`
4. Create `NewComponent.test.ts` (optional)
5. Create Storybook story in `apps/web/stories/`
6. Run `yarn workspace @babyclothes/ui build` to verify
