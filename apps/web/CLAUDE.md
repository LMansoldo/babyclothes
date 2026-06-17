# apps/web — SvelteKit Frontend

> **Before writing any code, read `RULES.md` at the project root.**

## Tech Stack

- **SvelteKit 2** with `@sveltejs/adapter-auto`
- **Svelte 5** with runes (`$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`, `Snippet`)
- **TypeScript 5** (strict, `verbatimModuleSyntax`, `moduleResolution: bundler`)
- **Vite 5** (port 5173, `host: true`)
- **@babyclothes/ui** (workspace dependency)
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

- CSS custom properties from `@babyclothes/ui/tokens.css`
- BEM naming: `.block__element--modifier`
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
