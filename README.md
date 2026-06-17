# BabyClothes

A C2C marketplace for buying and selling baby clothes, powered by a growth prediction AI agent that anticipates when your baby will outgrow their current size.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2, Svelte 5 (runes), TypeScript 5 |
| UI Library | Custom SDK (`packages/ui`) with 19 reusable components |
| Styling | CSS custom properties, BEM naming, design tokens |
| Icons | lucide-svelte |
| i18n | Custom JSON-based (en-US, pt-BR) with Svelte stores |
| Monorepo | Yarn 4 workspaces |
| Testing | Vitest, Playwright (planned) |
| Storybook | Component documentation and visual testing |

## Project Structure

```
babyclothes/
├── apps/
│   ├── web/          # SvelteKit frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── domain/          # Entities, value objects, repository interfaces
│   │   │   │   ├── application/     # Use cases
│   │   │   │   ├── infrastructure/  # HTTP/SSE repository implementations
│   │   │   │   ├── presentation/
│   │   │   │   │   ├── components/  # 12 page-level components
│   │   │   │   │   └── shell/       # TopBar, BottomNav
│   │   │   │   ├── i18n/            # en.json, pt.json, locale store
│   │   │   │   └── mocks/           # Typed mock data
│   │   │   └── routes/              # 10 SvelteKit routes
│   │   └── stories/                 # Storybook stories
│   ├── api/          # Elixir API (stub)
│   └── agents/       # LangGraph AI agents (stub)
├── packages/
│   └── ui/           # Shared component library (19 components)
│       └── src/lib/components/
│           ├── Button, Badge, Input, Avatar, Spinner, Toast  # Primitives
│           ├── FilterBar, Card, ChatInput, Carousel, ItemList, Modal  # Composite
│           └── GrowthChart, NotificationCard, ChatBubble, etc.  # Shared
├── proto/            # gRPC contract definitions
└── docker/           # Dockerfiles
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Google OAuth sign-in screen |
| `/catalog` | Product listing with category filters and search |
| `/catalog/[id]` | Item detail with seller info and contact |
| `/chat` | AI assistant conversation with SSE streaming |
| `/child` | Children list with growth charts |
| `/child/register` | Register a new child (name, birthdate, measurements) |
| `/child/[id]` | Child detail with growth history and size predictions |
| `/notifications` | Notification center with read/unread states |
| `/sell` | 2-step listing form (info + photos/price) |
| `/profile` | User profile, settings, language switcher |

## Internationalization

All UI labels support **en-US** and **pt-BR** via a custom i18n system:

- Translation files: `apps/web/src/lib/i18n/en.json` and `pt.json`
- Locale store with `localStorage` persistence
- `$t('key')` reactive function with `{{variable}}` interpolation
- Browser language auto-detection
- Manual toggle in Profile page

## UI Components (packages/ui)

19 components built with Svelte 5 runes:

**Primitives:** Button, Badge, Input, Avatar, Spinner, Toast, FilterBar

**Composite:** Card, ChatInput, Carousel, ItemList, Modal

**Domain-specific:** GrowthChart, NotificationCard, ChatBubble, ItemCard, ItemForm, ChildSelector, CategoryTabNav, AuthScreen, ChatHeader

All components use CSS custom properties for theming:
- `--pk` (pink), `--bk` (black), `--wh` (white)
- `--of2`, `--of3` (off-white variants)
- `--ld` (Londrina Solid), `--sr` (Sriracha), `--vd` (Vidaloka) — display fonts
- `--gr` (Inter) — body font

## Getting Started

```bash
# Install dependencies
yarn install

# Start dev server
yarn workspace @babyclothes/web dev

# Run Storybook
yarn workspace @babyclothes/web storybook

# Type check
yarn workspace @babyclothes/web check

# Build
yarn workspace @babyclothes/web build

# Run tests
yarn workspace @babyclothes/web test
```

## Architecture

Clean Architecture with 4 layers:

1. **Domain** — Entity types, value objects, repository interfaces, Zod schemas
2. **Application** — Use cases (CreateItem, AddMeasurement, SendMessage, etc.)
3. **Infrastructure** — HTTP and SSE repository implementations
4. **Presentation** — SvelteKit routes, components, shell (TopBar/BottomNav)

## AI Agent Features

The marketplace includes an AI growth agent that:
- Predicts when a baby will outgrow their current clothing size
- Recommends next sizes based on growth curves
- Provides personalized shopping suggestions
- Streams responses via SSE (Server-Sent Events)

## License

Private — All rights reserved.
