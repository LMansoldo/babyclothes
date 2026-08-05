# ReGrow Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution mode for this plan specifically:** each task below is implemented by a fresh Haiku subagent, then reviewed by a Sonnet subagent against (a) this plan's own "Definition of done" for the task, (b) the design doc's fidelity principle, (c) the mock HTML at `LP melhorada com novas specs/BabyClothes Landing.dc.html`, and (d) the pasted product spec's copy tables. If the review finds a mismatch, the task is sent back to a fresh Haiku subagent with the specific mismatch called out — it is not silently "fixed" by the reviewer.

**Goal:** Build the ReGrow landing page as a standalone SvelteKit project at `apps/regrow/`, faithfully porting the approved mock's visual design and the product spec's bilingual copy, with a working waitlist form backed by Prisma + Postgres.

**Architecture:** Isolated npm project (not a Yarn workspace member) with its own Docker Compose stack (Postgres on 5433). SvelteKit 2 + Svelte 5, SSR, `[[lang]]` route group for pt/en via `svelte-i18n`, SvelteKit Form Actions + Prisma for the waitlist lead, design-system CSS tokens copied verbatim (they already match the mock's Lato font and `#FF3CAC` pink), local one-off components for the mock's shimmer CTA / editorial layout since those don't exist in the shared design system yet.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript 5 (strict), `svelte-i18n` 4.x, Prisma 6.x + `@prisma/client` 6.x, `@sveltejs/adapter-node`, Vitest + `@testing-library/svelte` + `@testing-library/jest-dom`, Playwright, `sharp` (build-time WebP conversion), Docker Compose (own Postgres 16).

**Source documents (read before starting any task):**
- Design doc: `docs/superpowers/specs/2026-08-03-regrow-landing-page-design.md` (especially §1.1 Fidelity principle)
- Mock: `LP melhorada com novas specs/BabyClothes Landing.dc.html`
- Product spec: the full pasted spec in the design doc's originating conversation — copy tables are reproduced verbatim in Task 6 of this plan, so you do not need to re-find the original pasted spec.

## Global Constraints

These apply to every task below; do not repeat them per-task, but do not violate them either.

1. **Copy is verbatim.** Every user-facing string comes from the locale JSON files created in Task 6. Never hardcode a translated string directly in a `.svelte` file — always `$t('key')`.
2. **No emojis in UI.** The project's `CLAUDE.md` states "No emojis in UI" and this overrides the pasted product spec, which has one inconsistency: its §5.4 feedback table has `"Você está na lista! Avisaremos assim que abrirmos o acesso."` (no emoji) but its §6.4 sample JSON has `"success_title": "Você está na lista! 🎉"` (with emoji). Use the **emoji-free** wording. This is already reflected in Task 6's JSON content — do not add the emoji back.
3. **Rem base is 20px, not 10px.** The root `RULES.md` states "10px = 1rem", but the design-system tokens this project copies (see Task 3) were built assuming **1rem = 20px** — confirmed by `typography.css`'s own comment ("base 1rem = 20px") and by `apps/web/src/app.postcss`'s `html { font-size: 125%; /* 1rem = 20px */ }`. This project's copied `RULES.md` (Task 1) corrects this to 20px so the copied tokens render at their intended physical size. **Every px→rem conversion in this plan divides by 20**, not 10.
4. **Brand rename:** `[NOME]`/`[NAME]`/`BabyClothes` → **ReGrow** everywhere (wordmark, meta title/description, OG site name, JSON-LD `name`).
5. **No `any`.** Narrow `unknown` with type guards, per the copied `RULES.md`.
6. **CSS units:** `rem` only, never `px`, in every `<style>` block (SVG element `width`/`height` attributes are not CSS and stay as plain numbers, matching the mock).
7. **BEM class naming**: `.block__element--modifier`.
8. **Package manager is npm**, not Yarn — this project is intentionally isolated from the monorepo's Yarn workspaces.
9. **Every task's Svelte component must pass through the Svelte MCP autofixer** (`mcp__svelte__svelte-autofixer`) before being considered done — call it on the component source and address every issue it reports.

---

## Task 1: Project scaffolding

**Files:**
- Create: `apps/regrow/package.json`
- Create: `apps/regrow/tsconfig.json`
- Create: `apps/regrow/svelte.config.js`
- Create: `apps/regrow/vite.config.ts`
- Create: `apps/regrow/vitest.config.ts`
- Create: `apps/regrow/eslint.config.js`
- Create: `apps/regrow/.prettierrc`
- Create: `apps/regrow/.stylelintrc.json`
- Create: `apps/regrow/.gitignore`
- Create: `apps/regrow/.env.example`
- Create: `apps/regrow/RULES.md`
- Create: `apps/regrow/README.md`
- Create: `apps/regrow/src/test-setup.ts`

**Interfaces:**
- Produces: an `npm run <script>` surface (`dev`, `build`, `preview`, `check`, `test`, `test:e2e`, `lint`, `lint:fix`, `format`, `stylelint`, `images:convert`, `prisma:generate`, `prisma:migrate`) that every later task's own steps invoke by name.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "regrow-landing",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "stylelint": "stylelint \"src/**/*.{css,postcss}\"",
    "images:convert": "node scripts/convert-images.mjs",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "^6.19.0",
    "svelte-i18n": "^4.0.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@sveltejs/adapter-node": "^5.2.4",
    "@sveltejs/kit": "^2.7.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/svelte": "^5.2.0",
    "@typescript-eslint/eslint-plugin": "^8.58.0",
    "@typescript-eslint/parser": "^8.58.0",
    "eslint": "^9.39.4",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-svelte": "^2.46.0",
    "jsdom": "^29.1.1",
    "prettier": "^3.8.1",
    "prisma": "^6.19.0",
    "sharp": "^0.33.5",
    "stylelint": "^17.6.0",
    "stylelint-config-standard": "^40.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 3: Create `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ out: 'build' }),
    alias: {
      $lib: './src/lib',
    },
  },
};
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: ['VITE_', 'PUBLIC_'],
  server: {
    host: true,
    port: 5180,
  },
});
```

- [ ] **Step 5: Create `vitest.config.ts`**

**Correction (discovered during Task 8 execution):** this must include the `@sveltejs/vite-plugin-svelte` plugin and `resolve.conditions: ['browser']` — without them, Vite has no loader for `.svelte` files at all, and any test that imports a `.svelte` component fails with a generic `vite:import-analysis` "invalid JS syntax" error (Vite tries to parse the file's HTML-like markup as plain JavaScript). `apps/web`'s vitest config (which this step was originally copied from) never hit this because none of its tests import a `.svelte` file directly — `packages/design-system`'s vitest config is the correct reference to follow instead, since it does test `.svelte` components:

```ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    conditions: ['browser'],
    alias: {
      $lib: resolve(__dirname, './src/lib'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 6: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom';
import { initI18n } from './lib/i18n';
import { waitLocale } from 'svelte-i18n';

await initI18n('pt');
await waitLocale();
```

(This will fail to resolve `./lib/i18n` until Task 6 exists — that is expected; Task 1 only scaffolds, it does not run tests yet. Do not `npm test` until Task 6 is done.)

- [ ] **Step 7: Create `eslint.config.js`** (copied from `apps/web/eslint.config.js` verbatim)

```js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', '.svelte-kit/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/\\d+px/]",
          message: 'Avoid px in JS/TS. Use rem (1rem = 20px, html { font-size: 125% }).',
        },
      ],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-console': 'warn',
    },
  },
  ...sveltePlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.svelte'],
  })),
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/\\d+px/]",
          message: 'Avoid px in JS/TS. Use rem (1rem = 20px, html { font-size: 125% }).',
        },
      ],
      'no-console': 'warn',
    },
  },
  prettierConfig,
];
```

- [ ] **Step 8: Create `.prettierrc`** (copied from repo root verbatim)

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

- [ ] **Step 9: Create `.stylelintrc.json`**

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "unit-disallowed-list": ["px"]
  },
  "ignoreFiles": ["src/lib/tokens/*.css", "node_modules/**"]
}
```

- [ ] **Step 10: Create `.gitignore`**

```
node_modules
build
.svelte-kit
.env
.env.*
!.env.example
dist
*.log
.DS_Store
prisma/generated
```

- [ ] **Step 11: Create `.env.example`**

```
DATABASE_URL="postgresql://regrow:regrow@localhost:5433/regrow_db"
PUBLIC_SITE_URL="http://localhost:5180"
```

- [ ] **Step 12: Create `RULES.md`**

```markdown
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
```

- [ ] **Step 13: Create `README.md`**

```markdown
# ReGrow — Landing Page

Standalone SvelteKit project for the ReGrow waitlist landing page. Isolated
from the `babyclothes` monorepo (own `package.json`, own Docker Compose stack,
own Postgres instance on port 5433).

## Local development

\`\`\`bash
cp .env.example .env
docker compose up
docker compose exec app npm run prisma:migrate
\`\`\`

App runs at http://localhost:5180 (`/pt` or `/en`).

See `RULES.md` for coding conventions and `docs/` (in the parent monorepo,
`docs/superpowers/specs/2026-08-03-regrow-landing-page-design.md` and
`docs/superpowers/plans/2026-08-03-regrow-landing-page.md`) for the design and
implementation plan this project was built from.
```

- [ ] **Step 14: Commit**

```bash
cd apps/regrow
git add package.json tsconfig.json svelte.config.js vite.config.ts vitest.config.ts eslint.config.js .prettierrc .stylelintrc.json .gitignore .env.example RULES.md README.md src/test-setup.ts
git commit -m "chore(regrow): scaffold standalone SvelteKit project"
```

Do **not** run `npm install` yet — later tasks add `prisma/schema.prisma` and `src/lib/i18n` that `test-setup.ts` depends on. Task 6 is the first task where `npm install && npm test` should be run.

---

## Task 2: Docker Compose + Dockerfile

**Files:**
- Create: `apps/regrow/Dockerfile`
- Create: `apps/regrow/docker-compose.yml`

**Interfaces:**
- Consumes: `package.json` scripts from Task 1 (`npm run dev`).
- Produces: `postgres` service reachable at `localhost:5433` (host) / `postgres:5432` (container network) for Task 4's Prisma setup.

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 5180
CMD ["npm", "run", "dev", "--", "--host", "--port", "5180"]
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
name: regrow

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: regrow
      POSTGRES_PASSWORD: regrow
      POSTGRES_DB: regrow_db
    ports:
      - "5433:5432"
    volumes:
      - regrow_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U regrow"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5180:5180"
    env_file: .env
    environment:
      DATABASE_URL: postgresql://regrow:regrow@postgres:5432/regrow_db
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./src:/app/src
      - ./static:/app/static
      - ./prisma:/app/prisma

volumes:
  regrow_postgres_data:
```

- [ ] **Step 3: Verify the Postgres service starts**

Run: `cd apps/regrow && docker compose up -d postgres`
Expected: `docker compose ps` shows the `postgres` service as `healthy`.

- [ ] **Step 4: Tear down and commit**

```bash
docker compose down
git add Dockerfile docker-compose.yml
git commit -m "chore(regrow): add Docker Compose stack (own Postgres on 5433)"
```

---

## Task 3: Design tokens + global CSS + app.html

**Files:**
- Create: `apps/regrow/src/lib/tokens/primitives.css`
- Create: `apps/regrow/src/lib/tokens/semantic.css`
- Create: `apps/regrow/src/lib/tokens/typography.css`
- Create: `apps/regrow/src/lib/tokens/layout.css`
- Create: `apps/regrow/src/lib/tokens/themes.css`
- Create: `apps/regrow/src/lib/tokens/tokens.css`
- Create: `apps/regrow/src/app.postcss`
- Create: `apps/regrow/src/app.html`
- Create: `apps/regrow/static/favicon.png` (copy)

**Interfaces:**
- Produces: every CSS custom property used by every later component task (`--pk`, `--font-body`, `--ld`, `--space-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--surface-*`, `--border-*`, `--gutter-*`, `--container-*`, `--bp-*`).

- [ ] **Step 1: Copy the 5 token files verbatim from the design system**

```bash
cp /Users/lucasmansoldo/Projects/babyclothes/packages/design-system/src/tokens/primitives.css apps/regrow/src/lib/tokens/primitives.css
cp /Users/lucasmansoldo/Projects/babyclothes/packages/design-system/src/tokens/semantic.css apps/regrow/src/lib/tokens/semantic.css
cp /Users/lucasmansoldo/Projects/babyclothes/packages/design-system/src/tokens/typography.css apps/regrow/src/lib/tokens/typography.css
cp /Users/lucasmansoldo/Projects/babyclothes/packages/design-system/src/tokens/layout.css apps/regrow/src/lib/tokens/layout.css
cp /Users/lucasmansoldo/Projects/babyclothes/packages/design-system/src/tokens/themes.css apps/regrow/src/lib/tokens/themes.css
```

Do not edit these 5 files. If a value looks wrong, that's a question for the human, not something to "fix" here — the copy must stay byte-identical to the source so future re-syncs are a trivial diff.

- [ ] **Step 2: Create `tokens.css` (aggregator, mirrors the design-system's own aggregator)**

```css
@import './primitives.css';
@import './semantic.css';
@import './typography.css';
@import './layout.css';
@import './themes.css';
```

- [ ] **Step 3: Create `src/app.postcss`**

```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
@import './lib/tokens/tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 125%; /* 1rem = 20px — see RULES.md */
  scroll-behavior: smooth;
}

body {
  background: var(--surface-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.4rem;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: var(--pk);
}

::selection {
  background: var(--brand-subtle);
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 4: Create `src/app.html`**

**Correction (discovered during Task 17 execution):** the source spec's own example code sets `<html lang>` per-locale by rendering `<svelte:head><html lang={htmlLang}></html></svelte:head>` inside `+layout.svelte`. That is **not** a supported Svelte/SvelteKit pattern — it caused a hydration crash (`setAttribute is not a function`) in every real browser that wiped the entire document body, including the waitlist form, the first time the full page tree was rendered end-to-end (Task 17). The correct, documented approach is a `%lang%` placeholder in `app.html` filled in per-request by `src/hooks.server.ts`'s `transformPageChunk` — do not use the `<html>`-inside-`<svelte:head>` pattern anywhere in this project.

```html
<!doctype html>
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 5: Create `src/hooks.server.ts`**

```ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.params.lang === 'en' ? 'en' : 'pt-BR';

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
};
```

Task 11's `+layout.svelte` does **not** need to (and must not) set `<html lang>` itself — this hook is the only place that does. Task 11's `htmlLang`/`ogLocale` derived values are still needed there for `og:locale` and the hreflang links, just not for an `<html>` element inside `<svelte:head>`.

- [ ] **Step 6: Add a placeholder favicon**

```bash
mkdir -p apps/regrow/static
cp /Users/lucasmansoldo/Projects/babyclothes/apps/web/static/favicon.png apps/regrow/static/favicon.png 2>/dev/null || true
```

If that source file doesn't exist, skip this sub-step and leave a note in the commit message — a missing favicon is not a blocker for this task.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tokens src/app.postcss src/app.html src/hooks.server.ts static/favicon.png
git commit -m "feat(regrow): copy design-system tokens, add global CSS and app.html"
```

---

## Task 4: Copy image assets + WebP conversion

**Files:**
- Create: `apps/regrow/static/images/hero-desktop.png` (copy)
- Create: `apps/regrow/static/images/hero-mobile.png` (copy)
- Create: `apps/regrow/static/images/screen-winter.png` (copy)
- Create: `apps/regrow/static/images/screen-party.png` (copy)
- Create: `apps/regrow/static/images/screen-size.png` (copy)
- Create: `apps/regrow/scripts/convert-images.mjs`
- Create (generated by the script, then committed): `apps/regrow/static/images/*.webp` (5 files)

**Interfaces:**
- Produces: `/images/hero-desktop.{png,webp}`, `/images/hero-mobile.{png,webp}`, `/images/screen-winter.{png,webp}`, `/images/screen-party.{png,webp}`, `/images/screen-size.{png,webp}` — the exact paths Task 12 (Hero) and Task 13 (How It Works) reference in `<picture>` elements.

- [ ] **Step 1: Copy the 5 PNGs, renaming to kebab-case**

```bash
mkdir -p apps/regrow/static/images
cp "LP melhorada com novas specs/images/Hero_Desktop.png" apps/regrow/static/images/hero-desktop.png
cp "LP melhorada com novas specs/images/Hero_Mobile.png" apps/regrow/static/images/hero-mobile.png
cp "LP melhorada com novas specs/images/Screen_Winter.png" apps/regrow/static/images/screen-winter.png
cp "LP melhorada com novas specs/images/Screen_party.png" apps/regrow/static/images/screen-party.png
cp "LP melhorada com novas specs/images/Screen_Size.png" apps/regrow/static/images/screen-size.png
```

Run these from the monorepo root (`/Users/lucasmansoldo/Projects/babyclothes`), since the source path is relative to there.

- [ ] **Step 2: Create `scripts/convert-images.mjs`**

```js
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

const IMAGES_DIR = new URL('../static/images/', import.meta.url).pathname;

async function convertAll() {
  const files = await readdir(IMAGES_DIR);
  const pngFiles = files.filter((file) => extname(file).toLowerCase() === '.png');

  for (const file of pngFiles) {
    const inputPath = join(IMAGES_DIR, file);
    const outputPath = join(IMAGES_DIR, `${basename(file, '.png')}.webp`);
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    console.log(`converted ${file} -> ${basename(outputPath)}`);
  }
}

convertAll();
```

- [ ] **Step 3: Install dependencies and run the conversion**

Run: `cd apps/regrow && npm install && npm run images:convert`
Expected: console output listing 5 `converted ...` lines, and `static/images/` now contains 5 `.png` + 5 `.webp` files (10 total).

- [ ] **Step 4: Verify file count**

Run: `ls apps/regrow/static/images | wc -l`
Expected: `10`

- [ ] **Step 5: Commit**

```bash
git add static/images scripts/convert-images.mjs package-lock.json
git commit -m "feat(regrow): add mock image assets and WebP conversion script"
```

---

## Task 5: Prisma schema + client singleton

**Files:**
- Create: `apps/regrow/prisma/schema.prisma`
- Create: `apps/regrow/src/lib/server/db.ts`

**Interfaces:**
- Produces: `prisma` (a `PrismaClient` instance) importable from `$lib/server/db`, and a `Lead` Prisma model with fields `id, nome, telefone, email, interesse, locale, createdAt` — this exact field set is what Task 16's form action writes.

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lead {
  id        Int      @id @default(autoincrement())
  nome      String
  telefone  String
  email     String   @unique
  interesse String
  locale    String   @default("pt")
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Create `src/lib/server/db.ts`**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Generate the Prisma client**

Run: `cp .env.example .env && npx prisma generate`
Expected: `Generated Prisma Client` success message, `node_modules/.prisma/client` populated.

- [ ] **Step 4: Run the migration against the local Postgres**

Run: `docker compose up -d postgres && npx prisma migrate dev --name init`
Expected: migration succeeds, `prisma/migrations/<timestamp>_init/migration.sql` is created containing a `CREATE TABLE "Lead"` statement.

- [ ] **Step 5: Commit**

```bash
git add prisma src/lib/server/db.ts .gitignore
git commit -m "feat(regrow): add Prisma Lead model and PrismaClient singleton"
```

(No dedicated unit test for `db.ts` — it's a 5-line singleton with nothing to assert; it's exercised indirectly by Task 16's mocked-Prisma tests.)

---

## Task 6: i18n module + locale JSON files

**Files:**
- Create: `apps/regrow/src/lib/i18n/index.ts`
- Create: `apps/regrow/src/lib/i18n/locales/pt.json`
- Create: `apps/regrow/src/lib/i18n/locales/en.json`
- Test: `apps/regrow/src/lib/i18n/locales.test.ts`

**Interfaces:**
- Produces: `initI18n(locale: 'pt' | 'en'): Promise<void>`, and re-exports `t`, `locale`, `waitLocale`, `isLoading` from `svelte-i18n` — every component task after this one imports `{ t }` from `$lib/i18n` (or directly from `svelte-i18n`, both work identically since this module just registers + re-exports) and calls `$t('some.key')`.

- [ ] **Step 1: Create `src/lib/i18n/locales/pt.json`** (verbatim from the product spec's pt-BR catalogue, brand replaced with ReGrow, `form.error_duplicate` added per the spec's own note in §6.2, emoji dropped per Global Constraint #2)

```json
{
  "hero": {
    "headline": "Achadinhos com o match perfeito",
    "subheadline": "O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos",
    "cta": "Quero entrar na lista"
  },
  "how": {
    "title": "Como funciona",
    "step1_title": "Conta o que precisa",
    "step1_desc": "Fala com o assistente em linguagem natural",
    "step2_title": "Recebe sugestões",
    "step2_desc": "Cards com fotos, preços e onde comprar",
    "step3_title": "Salva e volta quando quiser",
    "step3_desc": "O app lembra de você e do seu filho"
  },
  "preview": {
    "title": "Veja o app em ação",
    "caption": "Cards de produto renderizados direto na conversa"
  },
  "form": {
    "title": "Entre na lista de espera",
    "name": "Nome completo",
    "phone": "Telefone",
    "email": "E-mail",
    "interest_label": "O que você mais busca?",
    "interest_placeholder": "Selecione uma opção",
    "interest_clothes": "Encontrar roupas infantis",
    "interest_accessories": "Acessórios para bebê",
    "interest_growth": "Acompanhar o crescimento do meu filho",
    "interest_all": "Tudo isso",
    "submit": "Quero entrar na lista de espera",
    "submitting": "Entrando na lista...",
    "success_title": "Você está na lista!",
    "success_body": "Avisaremos assim que abrirmos o acesso.",
    "error_required": "Preencha todos os campos obrigatórios.",
    "error_email": "E-mail inválido.",
    "error_duplicate": "Esse e-mail já está na lista.",
    "error_server": "Algo deu errado. Tenta de novo?"
  },
  "footer": {
    "privacy": "Política de Privacidade",
    "terms": "Termos de Uso",
    "contact": "contato@regrow.com.br",
    "instagram": "Instagram",
    "lang_toggle": "EN"
  },
  "meta": {
    "title": "ReGrow — Achadinhos com o match perfeito",
    "description": "O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos. Entre na lista de espera."
  }
}
```

- [ ] **Step 2: Create `src/lib/i18n/locales/en.json`** (verbatim from the product spec's en catalogue, same additions/fixes as pt.json)

```json
{
  "hero": {
    "headline": "The perfect match for every little outfit",
    "subheadline": "The free assistant that finds clothes and accessories as your little one grows",
    "cta": "Join the waitlist"
  },
  "how": {
    "title": "How it works",
    "step1_title": "Tell us what you need",
    "step1_desc": "Chat with the assistant in plain language",
    "step2_title": "Get suggestions",
    "step2_desc": "Cards with photos, prices and where to buy",
    "step3_title": "Save and come back anytime",
    "step3_desc": "The app remembers you and your child"
  },
  "preview": {
    "title": "See the app in action",
    "caption": "Product cards rendered right inside the conversation"
  },
  "form": {
    "title": "Join the waitlist",
    "name": "Full name",
    "phone": "Phone number",
    "email": "Email",
    "interest_label": "What are you looking for?",
    "interest_placeholder": "Select an option",
    "interest_clothes": "Find baby clothes",
    "interest_accessories": "Baby accessories",
    "interest_growth": "Track my child's growth",
    "interest_all": "All of the above",
    "submit": "Join the waitlist",
    "submitting": "Joining the list...",
    "success_title": "You're on the list!",
    "success_body": "We'll let you know as soon as we open access.",
    "error_required": "Please fill in all required fields.",
    "error_email": "Invalid email address.",
    "error_duplicate": "This email is already on the list.",
    "error_server": "Something went wrong. Want to try again?"
  },
  "footer": {
    "privacy": "Privacy Policy",
    "terms": "Terms of Use",
    "contact": "contato@regrow.com.br",
    "instagram": "Instagram",
    "lang_toggle": "PT"
  },
  "meta": {
    "title": "ReGrow — The perfect match for every little outfit",
    "description": "The free assistant that finds clothes and accessories as your little one grows. Join the waitlist."
  }
}
```

- [ ] **Step 3: Create `src/lib/i18n/index.ts`**

**Correction (discovered during Task 17 execution):** `register()`'s loader is inherently async — even wrapping an already-imported object in `Promise.resolve()` doesn't resolve until the next microtask. Task 11's `+layout.svelte` calls `initI18n()` synchronously and unawaited, and `<svelte:head>`'s `$t()` calls run in the same tick, so a `register()`-based dictionary wasn't guaranteed to be populated yet — this caused an intermittent 500 ("Cannot format a message without first setting the initial locale") on a server's very first request after boot. Both locale files are small and always needed (this is a fully bilingual site, nothing lazy-loads per visitor), so populate the dictionary synchronously with `addMessages()` instead:

```ts
import { init, addMessages } from 'svelte-i18n';
import pt from './locales/pt.json';
import en from './locales/en.json';

addMessages('pt', pt);
addMessages('en', en);

export function initI18n(initialLocale: 'pt' | 'en') {
  return init({
    fallbackLocale: 'pt',
    initialLocale,
  });
}

export { t, locale, waitLocale, isLoading } from 'svelte-i18n';
```

- [ ] **Step 4: Write the key-parity test — `src/lib/i18n/locales.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import pt from './locales/pt.json';
import en from './locales/en.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      return collectKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe('i18n locale catalogues', () => {
  it('pt and en expose the exact same set of keys', () => {
    expect(collectKeys(pt).sort()).toEqual(collectKeys(en).sort());
  });

  it('neither catalogue contains an emoji in any string value', () => {
    const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const allValues = [...collectKeys(pt), ...collectKeys(en)].map((key) => {
      const source = key in flatten(pt) ? flatten(pt) : flatten(en);
      return source[key];
    });
    for (const value of allValues) {
      expect(emojiPattern.test(String(value))).toBe(false);
    }
  });
});

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      return { ...acc, ...flatten(value as Record<string, unknown>, path) };
    }
    return { ...acc, [path]: value };
  }, {});
}
```

- [ ] **Step 5: Run the test**

Run: `npm test -- locales.test.ts`
Expected: `PASS`, 2 tests passing. (This is the first task where `npm test` should work end-to-end — `test-setup.ts` from Task 1 can now resolve `./lib/i18n`.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n
git commit -m "feat(regrow): add svelte-i18n setup and pt/en locale catalogues"
```

---

## Task 7: Locale routing (`+layout.server.ts`)

**Files:**
- Create: `apps/regrow/src/routes/[[lang]]/locale-resolution.ts`
- Create: `apps/regrow/src/routes/[[lang]]/+layout.server.ts`
- Test: `apps/regrow/src/routes/[[lang]]/locale-resolution.test.ts`

**Interfaces:**
- Consumes: nothing beyond `@sveltejs/kit`.
- Produces: `SupportedLocale` type (`'pt' | 'en'`), `isSupportedLocale(value: string): value is SupportedLocale`, `preferredLocaleFromHeader(acceptLanguage: string): SupportedLocale` — Task 11's `+layout.svelte` consumes `data.lang: SupportedLocale` from this load function's return value.

- [ ] **Step 1: Write the failing test — `locale-resolution.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { isSupportedLocale, preferredLocaleFromHeader } from './locale-resolution';

describe('isSupportedLocale', () => {
  it('accepts pt and en', () => {
    expect(isSupportedLocale('pt')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('rejects any other value', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
    expect(isSupportedLocale('PT')).toBe(false);
  });
});

describe('preferredLocaleFromHeader', () => {
  it('returns pt when Accept-Language starts with pt', () => {
    expect(preferredLocaleFromHeader('pt-BR,pt;q=0.9')).toBe('pt');
    expect(preferredLocaleFromHeader('pt')).toBe('pt');
  });

  it('returns en for anything not starting with pt, including empty', () => {
    expect(preferredLocaleFromHeader('en-US,en;q=0.9')).toBe('en');
    expect(preferredLocaleFromHeader('fr-FR')).toBe('en');
    expect(preferredLocaleFromHeader('')).toBe('en');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- locale-resolution.test.ts`
Expected: FAIL — `Cannot find module './locale-resolution'`.

- [ ] **Step 3: Implement `locale-resolution.ts`**

```ts
export const SUPPORTED_LOCALES = ['pt', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function preferredLocaleFromHeader(acceptLanguage: string): SupportedLocale {
  return acceptLanguage.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- locale-resolution.test.ts`
Expected: PASS, 4 tests passing.

- [ ] **Step 5: Create `+layout.server.ts`**

```ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isSupportedLocale, preferredLocaleFromHeader } from './locale-resolution';

export const load: LayoutServerLoad = ({ params, request }) => {
  const { lang } = params;

  if (!lang) {
    const preferred = preferredLocaleFromHeader(request.headers.get('accept-language') ?? '');
    throw redirect(302, `/${preferred}`);
  }

  if (!isSupportedLocale(lang)) {
    throw redirect(302, '/pt');
  }

  return { lang };
};
```

(This file has no dedicated test — it's a 10-line adapter around the pure functions already tested above, and SvelteKit's `redirect`/`params`/`request` are framework machinery, not something worth mocking here. It's exercised end-to-end by Task 19's Playwright tests.)

- [ ] **Step 6: Commit**

```bash
git add src/routes/\[\[lang\]\]/locale-resolution.ts src/routes/\[\[lang\]\]/locale-resolution.test.ts src/routes/\[\[lang\]\]/+layout.server.ts
git commit -m "feat(regrow): add [[lang]] locale resolution and redirect logic"
```

---

## Task 8: `WaitlistCta.svelte` — the mock's shimmer pill button

**Files:**
- Create: `apps/regrow/src/lib/components/WaitlistCta.svelte`
- Test: `apps/regrow/src/lib/components/WaitlistCta.test.ts`

**Interfaces:**
- Produces: `WaitlistCta` Svelte component with props `{ label: string; href?: string; type?: 'button' | 'submit'; onclick?: () => void; variant?: 'hero' | 'form' | 'topbar' }` (default `variant = 'hero'`). Renders an `<a>` when `href` is set, otherwise a `<button>`. Task 9 (topbar), Task 12 (hero), and Task 16 (form submit) all import and use this component.

This ports the mock's 3 concrete CTA instances (lines 41, 73–77, 209–212 of `BabyClothes Landing.dc.html`):
- Hero (`variant="hero"`): `padding: 22px 56px; font-size: 19px` → `1.1rem 2.8rem; 0.95rem`, has the arrow SVG icon, has the shimmer sweep, box-shadow `0 10px 36px rgba(255,60,172,.35)` → `0 0.5rem 1.8rem`, hover shadow `0 16px 44px rgba(255,60,172,.45)` → `0 0.8rem 2.2rem`.
- Form submit (`variant="form"`): `padding: 17px 0; font-size: 17px; width: 100%` → `0.85rem 0; 0.85rem`, no icon, has the shimmer sweep, box-shadow `0 8px 28px rgba(255,60,172,.3)` → `0 0.4rem 1.4rem`.
- Topbar (`variant="topbar"`): `padding: 9px 20px; font-size: 14px` → `0.45rem 1rem; 0.7rem`, no icon, **no shimmer** (the mock's topbar CTA has no shimmer span), box-shadow `0 4px 16px rgba(255,60,172,.3)` → `0.2rem 0.8rem`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistCta from './WaitlistCta.svelte';

describe('WaitlistCta', () => {
  it('renders as a link when href is provided', () => {
    render(WaitlistCta, { props: { label: 'Quero entrar na lista', href: '#waitlist' } });
    const link = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(link).toHaveAttribute('href', '#waitlist');
  });

  it('renders as a submit button when no href is provided', () => {
    render(WaitlistCta, {
      props: { label: 'Quero entrar na lista de espera', type: 'submit', variant: 'form' },
    });
    const button = screen.getByRole('button', { name: 'Quero entrar na lista de espera' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('shows the arrow icon only for the hero variant', () => {
    const { container } = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'hero' },
    });
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('omits the arrow icon for the topbar variant', () => {
    const { container } = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'topbar' },
    });
    expect(container.querySelector('svg')).toBeNull();
  });

  it('omits the shimmer element for the topbar variant but includes it for hero', () => {
    const topbar = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'topbar' },
    });
    expect(topbar.container.querySelector('.waitlist-cta__shimmer')).toBeNull();
    topbar.unmount();

    const hero = render(WaitlistCta, {
      props: { label: 'CTA', href: '#waitlist', variant: 'hero' },
    });
    expect(hero.container.querySelector('.waitlist-cta__shimmer')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- WaitlistCta.test.ts`
Expected: FAIL — `Failed to resolve import "./WaitlistCta.svelte"`.

- [ ] **Step 3: Implement `WaitlistCta.svelte`**

```svelte
<script lang="ts">
  let {
    label,
    href,
    type = 'button',
    onclick,
    variant = 'hero',
  }: {
    label: string
    href?: string
    type?: 'button' | 'submit'
    onclick?: () => void
    variant?: 'hero' | 'form' | 'topbar'
  } = $props()

  const hasShimmer = $derived(variant !== 'topbar')
  const hasIcon = $derived(variant === 'hero')
</script>

{#if href}
  <a {href} class="waitlist-cta waitlist-cta--{variant}">
    {label}
    {#if hasIcon}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    {/if}
    {#if hasShimmer}
      <span class="waitlist-cta__shimmer" aria-hidden="true"></span>
    {/if}
  </a>
{:else}
  <button {type} {onclick} class="waitlist-cta waitlist-cta--{variant}">
    {label}
    {#if hasShimmer}
      <span class="waitlist-cta__shimmer" aria-hidden="true"></span>
    {/if}
  </button>
{/if}

<style>
  .waitlist-cta {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--text-inverse);
    background: var(--pk);
    border: none;
    border-radius: var(--radius-pill);
    text-decoration: none;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .waitlist-cta:hover {
    background: var(--pk2);
    transform: translateY(-0.1rem);
  }

  .waitlist-cta--hero {
    padding: 1.1rem 2.8rem;
    font-size: 0.95rem;
    box-shadow: 0 0.5rem 1.8rem rgba(255, 60, 172, 0.35);
  }

  .waitlist-cta--hero:hover {
    box-shadow: 0 0.8rem 2.2rem rgba(255, 60, 172, 0.45);
  }

  .waitlist-cta--form {
    width: 100%;
    padding: 0.85rem 0;
    font-size: 0.85rem;
    box-shadow: 0 0.4rem 1.4rem rgba(255, 60, 172, 0.3);
  }

  .waitlist-cta--topbar {
    padding: 0.45rem 1rem;
    font-size: 0.7rem;
    box-shadow: 0 0.2rem 0.8rem rgba(255, 60, 172, 0.3);
  }

  .waitlist-cta__shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
    animation: waitlist-cta-shimmer 2.4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes waitlist-cta-shimmer {
    from {
      transform: translateX(-160%);
    }
    to {
      transform: translateX(160%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .waitlist-cta__shimmer {
      animation: none;
      display: none;
    }
  }
</style>
```

- [ ] **Step 4: Run the Svelte MCP autofixer**

Call `mcp__svelte__svelte-autofixer` on the file content above. Fix every issue it reports, then re-run it until it reports none.

- [ ] **Step 5: Run the test**

Run: `npm test -- WaitlistCta.test.ts`
Expected: PASS, 5 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/WaitlistCta.svelte src/lib/components/WaitlistCta.test.ts
git commit -m "feat(regrow): add WaitlistCta shimmer pill button component"
```

---

## Task 9: `LandingTopbar.svelte` (adapted from design-system, rebranded)

**Files:**
- Create: `apps/regrow/src/lib/components/LandingTopbar.svelte`
- Test: `apps/regrow/src/lib/components/LandingTopbar.test.ts`

**Interfaces:**
- Consumes: `WaitlistCta` from Task 8 (`variant="topbar"`), `t` from `$lib/i18n`.
- Produces: `LandingTopbar` component with **no props** (fully self-contained: brand wordmark, one nav anchor, one CTA anchor). Task 11 (`+layout.svelte`) renders `<LandingTopbar />` with no props.

Per the design doc §4: this is **not** a 1:1 copy of `packages/design-system/src/patterns/LandingTopbar/LandingTopbar.svelte` — that component has a login link and a generic CTA aimed at `/register`, which don't apply here (ReGrow is pre-launch, there is no login/register yet). The nav is trimmed to just the "how it works" anchor and the CTA points to `#waitlist`, per the mock's own topbar (lines 33–43 of the mock) minus its "Entrar" login link.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LandingTopbar from './LandingTopbar.svelte';

describe('LandingTopbar', () => {
  it('renders the ReGrow wordmark as two segments', () => {
    render(LandingTopbar);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('renders a "Como funciona" nav link pointing to #como-funciona', () => {
    render(LandingTopbar);
    const link = screen.getByRole('link', { name: 'Como funciona' });
    expect(link).toHaveAttribute('href', '#como-funciona');
  });

  it('renders the waitlist CTA link pointing to #waitlist', () => {
    render(LandingTopbar);
    const cta = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });

  it('does not render a login link', () => {
    render(LandingTopbar);
    expect(screen.queryByText(/entrar$/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- LandingTopbar.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `LandingTopbar.svelte`**

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
</script>

<header class="landing-topbar">
  <nav class="landing-topbar__bar">
    <a href="#top" class="landing-topbar__brand">Re<span class="landing-topbar__brand-accent">Grow</span></a>
    <div class="landing-topbar__nav">
      <a class="landing-topbar__link" href="#como-funciona">{$t('how.title')}</a>
    </div>
    <WaitlistCta label={$t('hero.cta')} href="#waitlist" variant="topbar" />
  </nav>
</header>

<style>
  .landing-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0.7rem clamp(1rem, 4vw, 2.4rem);
    background: rgba(248, 245, 242, 0.72);
    backdrop-filter: blur(1rem) saturate(180%);
    -webkit-backdrop-filter: blur(1rem) saturate(180%);
    border-bottom: 0.05rem solid rgba(10, 10, 10, 0.06);
    box-shadow: 0 0.2rem 1.2rem rgba(10, 10, 10, 0.04);
  }

  .landing-topbar__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 62rem;
    margin: 0 auto;
  }

  .landing-topbar__brand {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    text-decoration: none;
  }

  .landing-topbar__brand-accent {
    color: var(--pk);
  }

  .landing-topbar__nav {
    display: flex;
    align-items: center;
    gap: 1.6rem;
  }

  @media (max-width: 40rem) {
    .landing-topbar__nav {
      display: none;
    }
  }

  .landing-topbar__link {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .landing-topbar__link:hover {
    color: var(--pk);
  }
</style>
```

- [ ] **Step 4: Run the Svelte MCP autofixer** on the component, fix all issues.

- [ ] **Step 5: Run the test**

Run: `npm test -- LandingTopbar.test.ts`
Expected: PASS, 4 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/LandingTopbar.svelte src/lib/components/LandingTopbar.test.ts
git commit -m "feat(regrow): add LandingTopbar adapted for ReGrow (no login, waitlist-only CTA)"
```

---

## Task 10: `Footer.svelte` + `LanguageToggle.svelte`

**Files:**
- Create: `apps/regrow/src/lib/components/Footer.svelte`
- Create: `apps/regrow/src/lib/components/LanguageToggle.svelte`
- Test: `apps/regrow/src/lib/components/Footer.test.ts`
- Test: `apps/regrow/src/lib/components/LanguageToggle.test.ts`

**Interfaces:**
- Consumes: `t` from `$lib/i18n`, `page` from `$app/stores`.
- Produces: `Footer` (no props — self-contained, renders `<LanguageToggle />` internally), `LanguageToggle` (no props). Task 11 renders `<Footer />`.

The mock's footer (lines 230–239) only has brand + privacy + terms + copyright. The product spec §5.5 requires more: contact email, Instagram, language selector. Per the design doc's fidelity principle, this is a spec requirement not covered by the mock's literal HTML — extend using the mock's established footer visual style (same font sizes/spacing/colors) rather than inventing a new look. **The contact email (`contato@regrow.com.br`) and Instagram handle used here are placeholders** — flag this explicitly in the PR/commit, they are not real values.

- [ ] **Step 1: Write the failing test — `Footer.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
  it('renders the ReGrow wordmark', () => {
    render(Footer);
    expect(screen.getByText('Re')).toBeInTheDocument();
    expect(screen.getByText('Grow')).toBeInTheDocument();
  });

  it('renders privacy and terms links', () => {
    render(Footer);
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
      'href',
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/terms');
  });

  it('renders a mailto contact link', () => {
    render(Footer);
    const contact = screen.getByRole('link', { name: 'contato@regrow.com.br' });
    expect(contact).toHaveAttribute('href', 'mailto:contato@regrow.com.br');
  });

  it('renders an Instagram link', () => {
    render(Footer);
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://instagram.com/regrowapp',
    );
  });

  it('renders the copyright line with the current year range starting at 2026', () => {
    render(Footer);
    expect(screen.getByText(/© 2026 ReGrow/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- Footer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the failing test — `LanguageToggle.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/stores', () => {
  const { readable } = require('svelte/store');
  return {
    page: readable({ url: new URL('http://localhost:5180/pt'), params: { lang: 'pt' } }),
  };
});

import LanguageToggle from './LanguageToggle.svelte';

describe('LanguageToggle', () => {
  it('links to the /en equivalent of the current /pt path', () => {
    render(LanguageToggle);
    const link = screen.getByRole('link', { name: 'EN' });
    expect(link).toHaveAttribute('href', '/en');
    expect(link).toHaveAttribute('hreflang', 'en');
  });
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `npm test -- LanguageToggle.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement `LanguageToggle.svelte`**

```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import { t } from '$lib/i18n'

  const currentLang = $derived($page.params.lang ?? 'pt')
  const otherLang = $derived(currentLang === 'pt' ? 'en' : 'pt')
  const otherPath = $derived($page.url.pathname.replace(`/${currentLang}`, `/${otherLang}`))
</script>

<a href={otherPath} hreflang={otherLang} class="language-toggle">{$t('footer.lang_toggle')}</a>

<style>
  .language-toggle {
    font-size: 0.675rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .language-toggle:hover {
    color: var(--pk);
  }
</style>
```

- [ ] **Step 6: Implement `Footer.svelte`**

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import LanguageToggle from './LanguageToggle.svelte'
</script>

<footer class="footer">
  <div class="footer__row">
    <a href="#top" class="footer__brand">Re<span class="footer__brand-accent">Grow</span></a>
    <div class="footer__links">
      <a href="/privacy" class="footer__link">{$t('footer.privacy')}</a>
      <a href="/terms" class="footer__link">{$t('footer.terms')}</a>
      <a href="mailto:contato@regrow.com.br" class="footer__link">{$t('footer.contact')}</a>
      <a
        href="https://instagram.com/regrowapp"
        class="footer__link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {$t('footer.instagram')}
      </a>
      <LanguageToggle />
    </div>
    <p class="footer__copyright">© 2026 ReGrow</p>
  </div>
</footer>

<style>
  .footer {
    padding: 1.6rem clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
    border-top: 0.05rem solid var(--border-default);
  }

  .footer__row {
    max-width: 58rem;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .footer__brand {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    text-decoration: none;
  }

  .footer__brand-accent {
    color: var(--pk);
  }

  .footer__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.3rem;
  }

  .footer__link {
    font-size: 0.675rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .footer__link:hover {
    color: var(--pk);
  }

  .footer__copyright {
    font-size: 0.675rem;
    color: var(--text-tertiary);
  }
</style>
```

- [ ] **Step 7: Run the Svelte MCP autofixer** on both components, fix all issues.

- [ ] **Step 8: Run both tests**

Run: `npm test -- Footer.test.ts LanguageToggle.test.ts`
Expected: PASS, 6 tests passing total.

- [ ] **Step 9: Commit**

```bash
git add src/lib/components/Footer.svelte src/lib/components/Footer.test.ts src/lib/components/LanguageToggle.svelte src/lib/components/LanguageToggle.test.ts
git commit -m "feat(regrow): add Footer and LanguageToggle (spec §5.5 — contact/Instagram are placeholders)"
```

---

## Task 11: Root layout — `+layout.svelte` (SEO meta, JSON-LD, Topbar + Footer composition)

**Files:**
- Create: `apps/regrow/src/routes/[[lang]]/+layout.svelte`

**Interfaces:**
- Consumes: `data.lang: SupportedLocale` from Task 7's `+layout.server.ts`; `LandingTopbar` from Task 9; `Footer` from Task 10; `initI18n`, `t` from `$lib/i18n`.
- Produces: renders `<LandingTopbar />`, `{@render children()}`, `<Footer />` — every route under `[[lang]]` (just `+page.svelte` in this project) renders inside this shell.

- [ ] **Step 1: Implement `+layout.svelte`**

```svelte
<script lang="ts">
  import { initI18n, t } from '$lib/i18n'
  import LandingTopbar from '$lib/components/LandingTopbar.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import '../../app.postcss'
  import type { LayoutData } from './$types'

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props()

  const htmlLang = $derived(data.lang === 'pt' ? 'pt-BR' : 'en')

  // Initialize synchronously on every component instantiation so SSR (a
  // fresh instance per request) has a locale set before <svelte:head>'s
  // $t() calls run — SvelteKit does not guarantee the <html> child is
  // evaluated before <title> within <svelte:head>, so an $effect or a
  // $derived alone is not reliably early enough for SSR.
  initI18n(data.lang)

  // Re-run whenever data.lang changes so client-side locale switches
  // (e.g. via the LanguageToggle's <a href>) actually update $t() output.
  // This layout instance is reused across /pt <-> /en navigation — a
  // param-only navigation does not remount the component, so without this
  // effect the line above only ever runs once, with the first-load locale.
  //
  // svelte-i18n has an internal side effect that sets
  // document.documentElement.lang to whatever locale code was passed to
  // initI18n() — i.e. the bare 'pt', not the BCP-47 'pt-BR' this app uses
  // everywhere else (hreflang, og:locale). That side effect fires
  // synchronously inside initI18n(), so re-asserting the correct value
  // right after it — inside the same effect, not a separate one — always
  // runs last and wins.
  $effect(() => {
    initI18n(data.lang)
    document.documentElement.lang = htmlLang
  })

  const ogLocale = $derived(htmlLang.replace('-', '_'))
  const canonicalBase = 'https://regrow.com.br'
  const canonicalUrl = $derived(`${canonicalBase}/${data.lang}`)
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ReGrow',
      url: canonicalBase,
      description: $t('meta.description'),
      inLanguage: htmlLang,
      potentialAction: {
        '@type': 'JoinAction',
        target: `${canonicalUrl}#waitlist`,
      },
    }),
  )
</script>

<svelte:head>
  <title>{$t('meta.title')}</title>
  <meta name="description" content={$t('meta.description')} />

  <link rel="canonical" href={canonicalUrl} />

  <link rel="alternate" hreflang="pt-BR" href="{canonicalBase}/pt" />
  <link rel="alternate" hreflang="en" href="{canonicalBase}/en" />
  <link rel="alternate" hreflang="x-default" href="{canonicalBase}/pt" />

  <meta property="og:title" content={$t('meta.title')} />
  <meta property="og:description" content={$t('meta.description')} />
  <meta property="og:image" content="{canonicalBase}/og-image-{data.lang}.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content={ogLocale} />
  <meta property="og:site_name" content="ReGrow" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={$t('meta.title')} />
  <meta name="twitter:description" content={$t('meta.description')} />
  <meta name="twitter:image" content="{canonicalBase}/og-image-{data.lang}.jpg" />

  <meta name="robots" content="index, follow" />

  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<LandingTopbar />
{@render children()}
<Footer />
```

`data.lang` typed as `SupportedLocale` requires `./$types` to pick it up from Task 7's `+layout.server.ts` return type automatically — no manual type import needed beyond what's shown.

- [ ] **Step 2: Run the Svelte MCP autofixer** on this file, fix all issues (this file has no dedicated unit test — SSR meta tag output is verified in Task 19's Playwright tests, which check the rendered `<title>` and `<html lang>` per locale).

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev` then visit `http://localhost:5180/pt` in a browser.
Expected: page loads (will be mostly blank until Task 17 adds the page body — that's fine, this step is only checking the layout shell doesn't crash), topbar and footer render, `<title>` reads "ReGrow — Achadinhos com o match perfeito", view-source shows `<html lang="pt-BR">`.

- [ ] **Step 4: Commit**

```bash
git add src/routes/\[\[lang\]\]/+layout.svelte
git commit -m "feat(regrow): add root layout with SEO meta, hreflang, OG tags and JSON-LD"
```

---

## Task 12: `Hero.svelte`

**Files:**
- Create: `apps/regrow/src/lib/components/Hero.svelte`
- Test: `apps/regrow/src/lib/components/Hero.test.ts`

**Interfaces:**
- Consumes: `t` from `$lib/i18n`, `WaitlistCta` from Task 8.
- Produces: `Hero` component, no props. Task 17 renders `<Hero />` as the first section of `+page.svelte`.

Ports the mock's hero section (lines 49–96): full-bleed hero image, gradient overlays, trust chips, headline with pink accent on "match perfeito"/"perfect match", sub-headline, shimmer CTA, floating product card.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero', () => {
  it('renders the translated headline', () => {
    render(Hero);
    expect(screen.getByText('Achadinhos com o')).toBeInTheDocument();
    expect(screen.getByText('match perfeito')).toBeInTheDocument();
  });

  it('renders the translated sub-headline', () => {
    render(Hero);
    expect(
      screen.getByText(
        'O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos',
      ),
    ).toBeInTheDocument();
  });

  it('renders the CTA anchored to #waitlist', () => {
    render(Hero);
    const cta = screen.getByRole('link', { name: 'Quero entrar na lista' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });

  it('renders the hero image with fetchpriority high and no lazy loading', () => {
    render(Hero);
    const img = screen.getByAltText('Achadinhos com o match perfeito');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  it('sets explicit width and height on the hero image to prevent CLS', () => {
    render(Hero);
    const img = screen.getByAltText('Achadinhos com o match perfeito');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
  });

  it('renders all 3 trust chips from the mock', () => {
    render(Hero);
    expect(screen.getByText('Lista de espera aberta')).toBeInTheDocument();
    expect(screen.getByText('100% grátis')).toBeInTheDocument();
    expect(screen.getByText('IA conversacional')).toBeInTheDocument();
  });

  it('renders the floating card badge', () => {
    render(Hero);
    expect(screen.getByText('Seminovo')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- Hero.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Add two-line headline keys to both locale files**

The pt headline `"Achadinhos com o match perfeito"` and the en headline `"The perfect match for every little outfit"` don't share a common split point, so the headline can't be broken into two `<span>`/`<em>` lines by slicing the single `hero.headline` string in JS. Add two new keys to **both** locale files from Task 6 instead (keep the existing `hero.headline` key too — it's still used for the image `alt` text below).

Also add 4 more keys the mock's hero section needs that aren't in the base catalogue: the 3 trust chips (mock lines 58-63 of `BabyClothes Landing.dc.html` — "Lista de espera aberta" / "100% grátis" / "IA conversacional", each a distinct string, not a reuse of `hero.cta`) and the floating card's "Seminovo" badge (mock line 84). Skipping these was a defect caught in this task's review the first time this plan was executed — don't repeat it.

In `src/lib/i18n/locales/pt.json`, inside the `"hero"` object, add:

```json
"headline_line1": "Achadinhos com o",
"headline_line2": "match perfeito",
"trust_chip_open": "Lista de espera aberta",
"trust_chip_free": "100% grátis",
"trust_chip_ai": "IA conversacional",
"floating_card_badge": "Seminovo"
```

In `src/lib/i18n/locales/en.json`, inside the `"hero"` object, add:

```json
"headline_line1": "The perfect match",
"headline_line2": "for every little outfit",
"trust_chip_open": "Waitlist open",
"trust_chip_free": "100% free",
"trust_chip_ai": "Conversational AI",
"floating_card_badge": "Pre-loved"
```

Run: `npm test -- locales.test.ts`
Expected: PASS — key parity still holds since both files got the same six new keys.

- [ ] **Step 4: Implement `Hero.svelte`**

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
</script>

<section id="top" class="hero">
  <picture>
    <source srcset="/images/hero-mobile.webp" media="(max-width: 40rem)" type="image/webp" />
    <source srcset="/images/hero-desktop.webp" type="image/webp" />
    <img
      src="/images/hero-desktop.png"
      srcset="/images/hero-mobile.png 640w, /images/hero-desktop.png 1200w"
      sizes="(max-width: 40rem) 100vw, 50vw"
      alt={$t('hero.headline')}
      width="1200"
      height="800"
      fetchpriority="high"
      decoding="async"
      class="hero__image"
    />
  </picture>
  <div class="hero__scrim hero__scrim--horizontal"></div>
  <div class="hero__scrim hero__scrim--vertical"></div>

  <div class="hero__content">
    <div class="hero__copy">
      <div class="hero__chips">
        <span class="hero__chip hero__chip--live">
          <span class="hero__chip-dot"></span>
          {$t('hero.trust_chip_open')}
        </span>
        <span class="hero__chip">{$t('hero.trust_chip_free')}</span>
        <span class="hero__chip">{$t('hero.trust_chip_ai')}</span>
      </div>

      <h1 class="hero__headline">
        {$t('hero.headline_line1')}<br />
        <em class="hero__headline-accent">{$t('hero.headline_line2')}</em>
      </h1>

      <p class="hero__subheadline">{$t('hero.subheadline')}</p>

      <WaitlistCta label={$t('hero.cta')} href="#waitlist" variant="hero" />
    </div>
  </div>

  <div class="hero__floating-card">
    <div class="hero__floating-card-image">
      <span class="hero__floating-card-badge">{$t('hero.floating_card_badge')}</span>
      <span class="hero__floating-card-favorite" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF3CAC" stroke-width="2.2">
          <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
          />
        </svg>
      </span>
    </div>
    <p class="hero__floating-card-title">Body inverno manga longa</p>
    <p class="hero__floating-card-meta">M · 6-9 meses · Menina</p>
    <div class="hero__floating-card-price-row">
      <span class="hero__floating-card-price">R$ 34,00</span>
      <span class="hero__floating-card-price-old">R$ 59,00</span>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    min-height: 36rem;
    display: flex;
    align-items: center;
    padding: 7rem 0 5rem;
  }

  .hero__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    z-index: 0;
  }

  .hero__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero__scrim--horizontal {
    background: linear-gradient(
      to right,
      rgba(248, 245, 242, 1) 0%,
      rgba(248, 245, 242, 0.97) 30%,
      rgba(248, 245, 242, 0.72) 55%,
      rgba(248, 245, 242, 0.15) 78%,
      transparent 100%
    );
  }

  .hero__scrim--vertical {
    background: linear-gradient(
      to bottom,
      rgba(248, 245, 242, 0.6) 0%,
      transparent 18%,
      transparent 72%,
      rgba(248, 245, 242, 0.9) 100%
    );
  }

  .hero__content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 62rem;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 3.6rem);
  }

  .hero__copy {
    max-width: 30rem;
  }

  .hero__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
  }

  .hero__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.88);
    border: 0.05rem solid var(--border-default);
    border-radius: var(--radius-pill);
  }

  .hero__chip--live {
    font-weight: 700;
    letter-spacing: 0.01em;
    border-color: rgba(255, 60, 172, 0.22);
  }

  .hero__chip-dot {
    width: 0.35rem;
    height: 0.35rem;
    border-radius: 50%;
    background: var(--pk);
  }

  .hero__headline {
    font-size: clamp(2.5rem, 6.4vw, 4.2rem);
    font-weight: 900;
    line-height: 1.01;
    letter-spacing: -0.032em;
    color: var(--text-primary);
    margin-bottom: 1.1rem;
  }

  .hero__headline-accent {
    font-style: normal;
    color: var(--pk);
  }

  .hero__subheadline {
    font-size: clamp(0.9rem, 1.7vw, 1.1rem);
    line-height: 1.55;
    color: var(--text-secondary);
    max-width: 25rem;
    margin-bottom: 2rem;
    font-weight: 300;
  }

  .hero__floating-card {
    position: absolute;
    right: clamp(0.8rem, 7vw, 4.5rem);
    bottom: 2.6rem;
    z-index: 3;
    width: 11.5rem;
    background: var(--surface-raised);
    border-radius: 1rem;
    padding: 0.7rem;
    box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.17);
  }

  .hero__floating-card-image {
    position: relative;
    height: 4.7rem;
    border-radius: 0.65rem;
    background: linear-gradient(135deg, #c3d6ff 0%, #aeeef0 100%);
    margin-bottom: 0.65rem;
  }

  .hero__floating-card-badge {
    position: absolute;
    top: 0.45rem;
    left: 0.45rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.55rem;
    font-weight: 700;
    color: var(--pk);
    background: var(--brand-subtle);
    border-radius: var(--radius-pill);
  }

  .hero__floating-card-favorite {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    width: 1.35rem;
    height: 1.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-raised);
    border-radius: 50%;
    box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.1);
  }

  .hero__floating-card-title {
    font-size: 0.675rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.15rem;
    letter-spacing: -0.01em;
  }

  .hero__floating-card-meta {
    font-size: 0.575rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .hero__floating-card-price-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .hero__floating-card-price {
    font-size: 0.95rem;
    font-weight: 900;
    color: var(--pk);
  }

  .hero__floating-card-price-old {
    font-size: 0.575rem;
    color: var(--text-tertiary);
    text-decoration: line-through;
  }

  @media (max-width: 64rem) {
    .hero__floating-card {
      display: none;
    }
  }
</style>
```

- [ ] **Step 5: Run the Svelte MCP autofixer** on the component, fix all issues.

- [ ] **Step 6: Run the test**

Run: `npm test -- Hero.test.ts locales.test.ts`
Expected: PASS, all tests passing.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/Hero.svelte src/lib/components/Hero.test.ts src/lib/i18n/locales/pt.json src/lib/i18n/locales/en.json
git commit -m "feat(regrow): add Hero section with mock's trust chips, headline, floating card"
```

---

## Task 13: `HowItWorks.svelte`

**Files:**
- Create: `apps/regrow/src/lib/components/HowItWorks.svelte`
- Test: `apps/regrow/src/lib/components/HowItWorks.test.ts`

**Interfaces:**
- Consumes: `t` from `$lib/i18n`.
- Produces: `HowItWorks` component, no props, `id="como-funciona"` on its root `<section>` (this is what `LandingTopbar`'s nav link from Task 9 anchors to). Task 17 renders `<HowItWorks />`.

Ports the mock's "Como funciona" section (lines 98–152): 3 alternating rows, giant faded step numbers, phone-frame screenshots.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks', () => {
  it('has id="como-funciona" so the topbar nav link resolves', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelector('#como-funciona')).not.toBeNull();
  });

  it('renders all 3 step titles and descriptions', () => {
    render(HowItWorks);
    expect(screen.getByText('Conta o que precisa')).toBeInTheDocument();
    expect(screen.getByText('Fala com o assistente em linguagem natural')).toBeInTheDocument();
    expect(screen.getByText('Recebe sugestões')).toBeInTheDocument();
    expect(screen.getByText('Cards com fotos, preços e onde comprar')).toBeInTheDocument();
    expect(screen.getByText('Salva e volta quando quiser')).toBeInTheDocument();
    expect(screen.getByText('O app lembra de você e do seu filho')).toBeInTheDocument();
  });

  it('renders 3 step images, each lazy-loaded, with translated alt text', () => {
    render(HowItWorks);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    for (const img of images) {
      expect(img).toHaveAttribute('loading', 'lazy');
    }
    expect(screen.getByAltText('Pedindo bodies de inverno para a Sofia')).toBeInTheDocument();
    expect(screen.getByAltText('Sugestões de roupas de festa')).toBeInTheDocument();
    expect(screen.getByAltText('Sugestões por tamanho e fase')).toBeInTheDocument();
  });

  it('renders the translated two-line subtitle', () => {
    render(HowItWorks);
    expect(screen.getByText('Simples como conversar')).toBeInTheDocument();
    expect(screen.getByText('com uma amiga')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- HowItWorks.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Add the section subtitle and step image alt-text keys to both locale files**

The mock hardcodes the section's h2 ("Simples como conversar<br />com uma amiga") and each step image's `alt` text directly in Portuguese — neither is in the base catalogue from Task 6. Per Global Constraint #1 (copy is verbatim, always via `$t()`) and the a11y requirement that every `<img>` `alt` must be translated, both need locale keys. Add to **both** `pt.json` and `en.json`, inside the `"how"` object:

In `src/lib/i18n/locales/pt.json`:

```json
"subtitle_line1": "Simples como conversar",
"subtitle_line2": "com uma amiga",
"step1_alt": "Pedindo bodies de inverno para a Sofia",
"step2_alt": "Sugestões de roupas de festa",
"step3_alt": "Sugestões por tamanho e fase"
```

In `src/lib/i18n/locales/en.json`:

```json
"subtitle_line1": "As simple as chatting",
"subtitle_line2": "with a friend",
"step1_alt": "Asking for winter bodysuits for Sofia",
"step2_alt": "Party outfit suggestions",
"step3_alt": "Suggestions by size and stage"
```

Run: `npm test -- locales.test.ts`
Expected: PASS — key parity still holds since both files got the same 5 new keys.

- [ ] **Step 4: Implement `HowItWorks.svelte`**

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'

  const steps = [
    {
      number: '01',
      titleKey: 'how.step1_title',
      descKey: 'how.step1_desc',
      altKey: 'how.step1_alt',
      image: 'screen-winter',
      reversed: false,
    },
    {
      number: '02',
      titleKey: 'how.step2_title',
      descKey: 'how.step2_desc',
      altKey: 'how.step2_alt',
      image: 'screen-party',
      reversed: true,
    },
    {
      number: '03',
      titleKey: 'how.step3_title',
      descKey: 'how.step3_desc',
      altKey: 'how.step3_alt',
      image: 'screen-size',
      reversed: false,
    },
  ] as const
</script>

<section id="como-funciona" class="how">
  <div class="how__lines" aria-hidden="true">
    <div class="how__line how__line--left"></div>
    <div class="how__line how__line--right"></div>
  </div>

  <div class="how__inner">
    <div class="how__header">
      <p class="how__eyebrow">{$t('how.title')}</p>
      <h2 class="how__title">{$t('how.subtitle_line1')}<br />{$t('how.subtitle_line2')}</h2>
    </div>

    {#each steps as step (step.number)}
      <div class="how__row" class:how__row--reversed={step.reversed}>
        <div class="how__text">
          <span class="how__number" aria-hidden="true">{step.number}</span>
          <h3 class="how__step-title">{$t(step.titleKey)}</h3>
          <p class="how__step-desc">{$t(step.descKey)}</p>
        </div>
        <div class="how__phone">
          <img
            src="/images/{step.image}.png"
            alt={$t(step.altKey)}
            loading="lazy"
            decoding="async"
            width="340"
            height="580"
            class="how__phone-image"
          />
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .how {
    position: relative;
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: linear-gradient(180deg, #ffffff 0%, #fdf0f7 60%, #fceaf5 100%);
    overflow: hidden;
  }

  .how__lines {
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .how__line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0.05rem;
    background: rgba(255, 60, 172, 0.07);
  }

  .how__line--left {
    left: 33%;
  }

  .how__line--right {
    left: 66%;
  }

  .how__inner {
    position: relative;
    max-width: 58rem;
    margin: 0 auto;
  }

  .how__header {
    text-align: center;
    max-width: 28rem;
    margin: 0 auto clamp(3rem, 7vw, 5rem);
  }

  .how__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 0.6rem;
  }

  .how__title {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.025em;
    line-height: 1.07;
    color: var(--text-primary);
  }

  .how__row {
    display: grid;
    grid-template-columns: 1fr 17rem;
    gap: clamp(1.8rem, 6vw, 4.8rem);
    align-items: center;
    margin-bottom: clamp(3.2rem, 8vw, 5.5rem);
  }

  .how__row--reversed {
    grid-template-columns: 17rem 1fr;
  }

  .how__row--reversed .how__text {
    order: 2;
  }

  .how__row--reversed .how__phone {
    order: 1;
  }

  .how__text {
    position: relative;
    padding-left: 0.7rem;
  }

  .how__number {
    position: absolute;
    top: -1.4rem;
    left: -0.2rem;
    font-size: clamp(5rem, 12vw, 7.5rem);
    font-weight: 900;
    line-height: 1;
    color: var(--pk);
    opacity: 0.055;
    user-select: none;
  }

  .how__step-title {
    font-size: clamp(1.4rem, 3.2vw, 2rem);
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.08;
    color: var(--text-primary);
    margin-bottom: 0.7rem;
  }

  .how__step-desc {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    line-height: 1.6;
    color: var(--text-secondary);
    font-weight: 300;
    max-width: 23rem;
  }

  .how__phone {
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0 1.4rem 3.5rem rgba(0, 0, 0, 0.22);
  }

  .how__phone-image {
    display: block;
    width: 100%;
    height: clamp(23rem, 52vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  @media (max-width: 64rem) {
    .how__row,
    .how__row--reversed {
      grid-template-columns: 1fr;
    }

    .how__row--reversed .how__text,
    .how__row--reversed .how__phone {
      order: unset;
    }
  }
</style>
```

- [ ] **Step 5: Run the Svelte MCP autofixer** on the component, fix all issues.

- [ ] **Step 6: Run the test**

Run: `npm test -- HowItWorks.test.ts locales.test.ts`
Expected: PASS, 4 tests in HowItWorks.test.ts + 2 in locales.test.ts, all passing.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/HowItWorks.svelte src/lib/components/HowItWorks.test.ts src/lib/i18n/locales/pt.json src/lib/i18n/locales/en.json
git commit -m "feat(regrow): add HowItWorks section with 3 alternating editorial rows"
```

---

## Task 14: `AppPreview.svelte`

**Files:**
- Create: `apps/regrow/src/lib/components/AppPreview.svelte`
- Test: `apps/regrow/src/lib/components/AppPreview.test.ts`

**Interfaces:**
- Consumes: `t` from `$lib/i18n`.
- Produces: `AppPreview` component, no props. Task 17 renders `<AppPreview />` between `HowItWorks` and the waitlist section.

There is no dedicated mock section or screenshot asset for "App Preview" (design doc §6/§12 flags this explicitly as a gap the mock doesn't cover). Reuse `screen-party.png` (the mock's most "chat + product card" -like screenshot) in the same phone-frame visual language established by `HowItWorks.svelte` (Task 13), centered, single column, smaller — this is a deliberate, explicitly-flagged extrapolation, not an invented new visual style.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppPreview from './AppPreview.svelte';

describe('AppPreview', () => {
  it('renders the translated title and caption', () => {
    render(AppPreview);
    expect(screen.getByText('Veja o app em ação')).toBeInTheDocument();
    expect(
      screen.getByText('Cards de produto renderizados direto na conversa'),
    ).toBeInTheDocument();
  });

  it('renders one lazy-loaded preview image', () => {
    render(AppPreview);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', '/images/screen-party.png');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- AppPreview.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `AppPreview.svelte`**

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
</script>

<section class="preview">
  <div class="preview__inner">
    <p class="preview__eyebrow">{$t('preview.title')}</p>
    <div class="preview__phone">
      <img
        src="/images/screen-party.png"
        alt={$t('preview.caption')}
        loading="lazy"
        decoding="async"
        width="340"
        height="580"
        class="preview__phone-image"
      />
    </div>
    <p class="preview__caption">{$t('preview.caption')}</p>
  </div>
</section>

<style>
  .preview {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .preview__inner {
    max-width: 28rem;
    margin: 0 auto;
    text-align: center;
  }

  .preview__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 1.5rem;
  }

  .preview__phone {
    display: inline-block;
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0 1.4rem 3.5rem rgba(0, 0, 0, 0.22);
    margin-bottom: 1.5rem;
  }

  .preview__phone-image {
    display: block;
    width: 17rem;
    height: clamp(23rem, 52vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  .preview__caption {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 300;
  }
</style>
```

- [ ] **Step 4: Run the Svelte MCP autofixer** on the component, fix all issues.

- [ ] **Step 5: Run the test**

Run: `npm test -- AppPreview.test.ts`
Expected: PASS, 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/AppPreview.svelte src/lib/components/AppPreview.test.ts
git commit -m "feat(regrow): add AppPreview section (screenshot asset gap flagged, reuses HowItWorks phone frame)"
```

---

## Task 15: Waitlist validation module

**Files:**
- Create: `apps/regrow/src/routes/[[lang]]/waitlist-validation.ts`
- Test: `apps/regrow/src/routes/[[lang]]/waitlist-validation.test.ts`

**Interfaces:**
- Produces: `type WaitlistFormValues = { nome: string; telefone: string; email: string; interesse: string }`, `readFormValues(data: FormData): Partial<WaitlistFormValues>`, `isCompleteWaitlistForm(values: Partial<WaitlistFormValues>): values is WaitlistFormValues`, `EMAIL_REGEX: RegExp`, `hasPrismaErrorCode(error: unknown, code: string): boolean`. Task 16's `+page.server.ts` imports all of these.

This is pulled out of `+page.server.ts` into its own plain module specifically so it's unit-testable without SvelteKit's action machinery, and because SvelteKit restricts which names `+page.server.ts` may export (only `load`, `actions`, and a few reserved config exports) — extra helper exports there would be an invalid-export build error.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import {
  readFormValues,
  isCompleteWaitlistForm,
  EMAIL_REGEX,
  hasPrismaErrorCode,
} from './waitlist-validation';

function formDataFrom(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

describe('readFormValues', () => {
  it('reads and trims all 4 fields', () => {
    const data = formDataFrom({
      nome: '  Maria  ',
      telefone: ' 11999999999 ',
      email: ' maria@example.com ',
      interesse: 'roupas',
    });
    expect(readFormValues(data)).toEqual({
      nome: 'Maria',
      telefone: '11999999999',
      email: 'maria@example.com',
      interesse: 'roupas',
    });
  });

  it('returns undefined for missing fields', () => {
    const data = formDataFrom({ nome: 'Maria' });
    const result = readFormValues(data);
    expect(result.nome).toBe('Maria');
    expect(result.telefone).toBeUndefined();
  });
});

describe('isCompleteWaitlistForm', () => {
  it('returns true when all 4 fields are present and non-empty', () => {
    expect(
      isCompleteWaitlistForm({
        nome: 'Maria',
        telefone: '119999999',
        email: 'a@b.com',
        interesse: 'roupas',
      }),
    ).toBe(true);
  });

  it('returns false when any field is missing', () => {
    expect(isCompleteWaitlistForm({ nome: 'Maria' })).toBe(false);
    expect(isCompleteWaitlistForm({})).toBe(false);
  });
});

describe('EMAIL_REGEX', () => {
  it('accepts a well-formed email', () => {
    expect(EMAIL_REGEX.test('maria@example.com')).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(EMAIL_REGEX.test('not-an-email')).toBe(false);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
  });
});

describe('hasPrismaErrorCode', () => {
  it('returns true when the error has the matching code', () => {
    expect(hasPrismaErrorCode({ code: 'P2002' }, 'P2002')).toBe(true);
  });

  it('returns false for a different code, a plain Error, or a non-object', () => {
    expect(hasPrismaErrorCode({ code: 'P2000' }, 'P2002')).toBe(false);
    expect(hasPrismaErrorCode(new Error('boom'), 'P2002')).toBe(false);
    expect(hasPrismaErrorCode('P2002', 'P2002')).toBe(false);
    expect(hasPrismaErrorCode(null, 'P2002')).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- waitlist-validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `waitlist-validation.ts`**

```ts
export interface WaitlistFormValues {
  nome: string;
  telefone: string;
  email: string;
  interesse: string;
}

export function readFormValues(data: FormData): Partial<WaitlistFormValues> {
  return {
    nome: data.get('nome')?.toString().trim() || undefined,
    telefone: data.get('telefone')?.toString().trim() || undefined,
    email: data.get('email')?.toString().trim() || undefined,
    interesse: data.get('interesse')?.toString().trim() || undefined,
  };
}

export function isCompleteWaitlistForm(
  values: Partial<WaitlistFormValues>,
): values is WaitlistFormValues {
  return Boolean(values.nome && values.telefone && values.email && values.interesse);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === code
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- waitlist-validation.test.ts`
Expected: PASS, 9 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/routes/\[\[lang\]\]/waitlist-validation.ts src/routes/\[\[lang\]\]/waitlist-validation.test.ts
git commit -m "feat(regrow): add waitlist form validation helpers"
```

---

## Task 16: `WaitlistForm.svelte` + `+page.server.ts` waitlist action

**Files:**
- Create: `apps/regrow/src/lib/components/WaitlistForm.svelte`
- Create: `apps/regrow/src/routes/[[lang]]/+page.server.ts`
- Test: `apps/regrow/src/lib/components/WaitlistForm.test.ts`
- Test: `apps/regrow/src/routes/[[lang]]/page.server.test.ts` (note: **not** `+page.server.test.ts` — SvelteKit reserves any `+`-prefixed filename inside `src/routes/` for its own route-file conventions; a `+`-prefixed test file breaks `svelte-kit sync` and `vite build` outright. Its own import of the real route file, `./+page.server`, is unaffected — only the test file's own name needed the `+` dropped.)

**Interfaces:**
- Consumes: `readFormValues`, `isCompleteWaitlistForm`, `EMAIL_REGEX`, `hasPrismaErrorCode` from Task 15; `prisma` from Task 5's `$lib/server/db`; `WaitlistCta` from Task 8; `t` from `$lib/i18n`.
- Produces: `WaitlistForm` component with props `{ form: { success?: boolean; errorKey?: string; values?: Record<string, string> } | null }`; `actions.waitlist` SvelteKit form action. Task 17 renders `<WaitlistForm {form} />` inside a `<section id="waitlist">`.

- [ ] **Step 1: Write the failing test for `+page.server.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();
vi.mock('$lib/server/db', () => ({
  prisma: { lead: { create: (...args: unknown[]) => createMock(...args) } },
}));

import { actions } from './+page.server';

function requestWith(entries: Record<string, string>): Request {
  const body = new URLSearchParams(entries);
  return new Request('http://localhost/pt', { method: 'POST', body });
}

describe('waitlist action', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns a 400 with error_required when a field is missing', async () => {
    const event = {
      request: requestWith({ nome: 'Maria' }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result?.status).toBe(400);
    expect(result?.data).toMatchObject({ errorKey: 'form.error_required' });
  });

  it('returns a 400 with error_email when the email is malformed', async () => {
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'not-an-email',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result?.status).toBe(400);
    expect(result?.data).toMatchObject({ errorKey: 'form.error_email' });
  });

  it('creates a lead and returns success on valid input', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result).toEqual({ success: true });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
        locale: 'pt',
      },
    });
  });

  it('returns a 409 with error_duplicate on a Prisma P2002 unique-constraint error', async () => {
    createMock.mockRejectedValue({ code: 'P2002' });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result?.status).toBe(409);
    expect(result?.data).toMatchObject({ errorKey: 'form.error_duplicate' });
  });

  it('returns a 500 with error_server on any other database error', async () => {
    createMock.mockRejectedValue(new Error('connection refused'));
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: { lang: 'pt' },
    } as never;
    const result = await actions.waitlist(event);
    expect(result?.status).toBe(500);
    expect(result?.data).toMatchObject({ errorKey: 'form.error_server' });
  });

  it('defaults locale to pt when params.lang is absent', async () => {
    createMock.mockResolvedValue({ id: 1 });
    const event = {
      request: requestWith({
        nome: 'Maria',
        telefone: '11999999999',
        email: 'maria@example.com',
        interesse: 'roupas',
      }),
      params: {},
    } as never;
    await actions.waitlist(event);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ locale: 'pt' }) }),
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- page.server.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `+page.server.ts`**

```ts
import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { Actions } from './$types';
import {
  readFormValues,
  isCompleteWaitlistForm,
  EMAIL_REGEX,
  hasPrismaErrorCode,
} from './waitlist-validation';

export const actions = {
  waitlist: async ({ request, params }) => {
    const data = await request.formData();
    const values = readFormValues(data);
    const locale = params.lang ?? 'pt';

    if (!isCompleteWaitlistForm(values)) {
      return fail(400, { errorKey: 'form.error_required', values });
    }

    if (!EMAIL_REGEX.test(values.email)) {
      return fail(400, { errorKey: 'form.error_email', values });
    }

    try {
      await prisma.lead.create({
        data: { ...values, locale },
      });
      return { success: true };
    } catch (error) {
      if (hasPrismaErrorCode(error, 'P2002')) {
        return fail(409, { errorKey: 'form.error_duplicate', values });
      }
      console.error(error);
      return fail(500, { errorKey: 'form.error_server' });
    }
  },
} satisfies Actions;
```

- [ ] **Step 4: Run the `+page.server.ts` test**

Run: `npm test -- page.server.test.ts`
Expected: PASS, 6 tests passing.

- [ ] **Step 5: Write the failing test for `WaitlistForm.svelte`**

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistForm from './WaitlistForm.svelte';

describe('WaitlistForm', () => {
  it('renders all 4 fields with translated labels when there is no prior submission', () => {
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('O que você mais busca?')).toBeInTheDocument();
  });

  it('renders the 4 interest options with the exact spec values', () => {
    render(WaitlistForm, { props: { form: null } });
    const select = screen.getByLabelText('O que você mais busca?') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => option.value);
    expect(values).toEqual(['', 'roupas', 'acessorios', 'crescimento', 'tudo']);
  });

  it('shows the error message with role=alert when form.errorKey is set', () => {
    render(WaitlistForm, {
      props: { form: { errorKey: 'form.error_required', values: {} } },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Preencha todos os campos obrigatórios.',
    );
  });

  it('preserves submitted field values after a validation error', () => {
    render(WaitlistForm, {
      props: {
        form: {
          errorKey: 'form.error_email',
          values: { nome: 'Maria', telefone: '119999', email: 'bad', interesse: 'roupas' },
        },
      },
    });
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Maria');
  });

  it('shows the success confirmation instead of the form when form.success is true', () => {
    render(WaitlistForm, { props: { form: { success: true } } });
    expect(screen.getByText('Você está na lista!')).toBeInTheDocument();
    expect(screen.getByText('Avisaremos assim que abrirmos o acesso.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome completo')).toBeNull();
  });
});
```

- [ ] **Step 6: Run it to confirm it fails**

Run: `npm test -- WaitlistForm.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `WaitlistForm.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'

  let {
    form,
  }: {
    form: { success?: boolean; errorKey?: string; values?: Record<string, string> } | null
  } = $props()

  let loading = $state(false)
</script>

{#if form?.success}
  <div class="waitlist-form__confirmation">
    <div class="waitlist-form__confirmation-icon">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h3 class="waitlist-form__confirmation-title">{$t('form.success_title')}</h3>
    <p class="waitlist-form__confirmation-body">{$t('form.success_body')}</p>
  </div>
{:else}
  <form
    method="POST"
    action="?/waitlist"
    class="waitlist-form"
    use:enhance={() => {
      loading = true
      return async ({ update }) => {
        await update()
        loading = false
      }
    }}
  >
    {#if form?.errorKey}
      <p class="waitlist-form__error" role="alert">{$t(form.errorKey)}</p>
    {/if}

    <div class="waitlist-form__field">
      <label for="nome" class="waitlist-form__label">{$t('form.name')}</label>
      <input
        id="nome"
        name="nome"
        type="text"
        required
        value={form?.values?.nome ?? ''}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field">
      <label for="telefone" class="waitlist-form__label">{$t('form.phone')}</label>
      <input
        id="telefone"
        name="telefone"
        type="tel"
        required
        value={form?.values?.telefone ?? ''}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field">
      <label for="email" class="waitlist-form__label">{$t('form.email')}</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={form?.values?.email ?? ''}
        class="waitlist-form__input"
      />
    </div>

    <div class="waitlist-form__field waitlist-form__field--select">
      <label for="interesse" class="waitlist-form__label">{$t('form.interest_label')}</label>
      <select id="interesse" name="interesse" required class="waitlist-form__select">
        <option value="" disabled selected={!form?.values?.interesse}>
          {$t('form.interest_placeholder')}
        </option>
        <option value="roupas" selected={form?.values?.interesse === 'roupas'}>
          {$t('form.interest_clothes')}
        </option>
        <option value="acessorios" selected={form?.values?.interesse === 'acessorios'}>
          {$t('form.interest_accessories')}
        </option>
        <option value="crescimento" selected={form?.values?.interesse === 'crescimento'}>
          {$t('form.interest_growth')}
        </option>
        <option value="tudo" selected={form?.values?.interesse === 'tudo'}>
          {$t('form.interest_all')}
        </option>
      </select>
    </div>

    <WaitlistCta
      label={loading ? $t('form.submitting') : $t('form.submit')}
      type="submit"
      variant="form"
    />
  </form>
{/if}

<style>
  .waitlist-form__field {
    margin-bottom: 0.9rem;
  }

  .waitlist-form__field--select {
    margin-bottom: 1.3rem;
  }

  .waitlist-form__label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 0.35rem;
  }

  .waitlist-form__input,
  .waitlist-form__select {
    width: 100%;
    padding: 0.65rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--text-primary);
    background: var(--surface-sunken);
    border: 0.075rem solid var(--border-default);
    border-radius: 0.5rem;
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .waitlist-form__select {
    padding-right: 2.1rem;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23374151' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }

  .waitlist-form__input:focus,
  .waitlist-form__select:focus {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.09);
    background: var(--surface-raised);
  }

  .waitlist-form__error {
    margin-bottom: 0.9rem;
    color: var(--feedback-error-text);
    font-size: 0.7rem;
  }

  .waitlist-form__confirmation {
    text-align: center;
    padding: 1.4rem 0.4rem;
  }

  .waitlist-form__confirmation-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
    background: var(--brand-subtle);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pk);
  }

  .waitlist-form__confirmation-title {
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .waitlist-form__confirmation-body {
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--text-secondary);
    font-weight: 300;
  }
</style>
```

- [ ] **Step 8: Run the Svelte MCP autofixer** on the component, fix all issues.

- [ ] **Step 9: Run the test**

Run: `npm test -- WaitlistForm.test.ts`
Expected: PASS, 5 tests passing.

- [ ] **Step 10: Commit**

```bash
git add src/lib/components/WaitlistForm.svelte src/lib/components/WaitlistForm.test.ts src/routes/\[\[lang\]\]/+page.server.ts src/routes/\[\[lang\]\]/page.server.test.ts
git commit -m "feat(regrow): add WaitlistForm component and waitlist form action"
```

---

## Task 17: `+page.svelte` — page composition + reveal-on-scroll

**Files:**
- Create: `apps/regrow/src/routes/[[lang]]/+page.svelte`

**Interfaces:**
- Consumes: `Hero` (Task 12), `HowItWorks` (Task 13), `AppPreview` (Task 14), `WaitlistForm` (Task 16), `t` from `$lib/i18n`, `ActionData` from `./$types`.
- Produces: the composed page. This is the terminal consumer — nothing depends on it.

- [ ] **Step 1: Add the waitlist section's eyebrow and stats-strip keys to both locale files**

The mock hardcodes the waitlist section's eyebrow ("Acesso antecipado") and its 3-stat strip (mock lines 158, 168-179 of `BabyClothes Landing.dc.html`) directly in Portuguese — none of these are in the base catalogue from Task 6. Same class of defect as Tasks 12/13 (hardcoded pt-only copy that would leak onto the English page) — add locale keys instead. Add to **both** `pt.json` and `en.json`, inside the `"form"` object:

In `src/lib/i18n/locales/pt.json`:

```json
"eyebrow": "Acesso antecipado",
"stat_free_value": "Grátis",
"stat_free_label": "pra sempre",
"stat_ai_value": "IA",
"stat_ai_label": "conversacional",
"stat_spam_value": "0",
"stat_spam_label": "spam"
```

In `src/lib/i18n/locales/en.json`:

```json
"eyebrow": "Early access",
"stat_free_value": "Free",
"stat_free_label": "forever",
"stat_ai_value": "AI",
"stat_ai_label": "conversational",
"stat_spam_value": "0",
"stat_spam_label": "spam"
```

Run: `npm test -- locales.test.ts`
Expected: PASS — key parity still holds since both files got the same 7 new keys.

- [ ] **Step 2: Implement `+page.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '$lib/i18n'
  import Hero from '$lib/components/Hero.svelte'
  import HowItWorks from '$lib/components/HowItWorks.svelte'
  import AppPreview from '$lib/components/AppPreview.svelte'
  import WaitlistForm from '$lib/components/WaitlistForm.svelte'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
            observer.unobserve(entry.target)
          }
        }),
      { threshold: 0.15 },
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  })
</script>

<Hero />
<HowItWorks />
<div class="reveal">
  <AppPreview />
</div>

<section id="waitlist" class="waitlist reveal">
  <div class="waitlist__inner">
    <div class="waitlist__header">
      <p class="waitlist__eyebrow">{$t('form.eyebrow')}</p>
      <h2 class="waitlist__title">{$t('form.title')}</h2>
    </div>

    <div class="waitlist__card">
      <div class="waitlist__stats">
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_free_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_free_label')}</p>
        </div>
        <div class="waitlist__stat-divider"></div>
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_ai_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_ai_label')}</p>
        </div>
        <div class="waitlist__stat-divider"></div>
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_spam_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_spam_label')}</p>
        </div>
      </div>

      <div class="waitlist__form-wrap">
        <WaitlistForm {form} />
      </div>
    </div>
  </div>
</section>

<style>
  /* Correction (discovered during Task 17 execution): the reveal-on-scroll
     opacity:0 base style must not apply unconditionally — the
     prefers-reduced-motion early-return in onMount below skips creating
     the IntersectionObserver, so .reveal--visible would never get added,
     leaving AppPreview and the whole waitlist section invisible forever
     for a reduced-motion user. Gate the hide/reveal rules to the
     no-preference case so the default (no JS, or reduced motion) is
     fully visible.

     Second correction (discovered later, reported by the user as "the
     form never appears"): both `.reveal` and `.reveal--visible` must be
     :global. Svelte appends its own scoping class to a plain scoped
     selector, so `.reveal { opacity: 0 }` compiles to effective
     specificity (0,2,0) — .reveal plus the scoping hash — while an
     unscoped `:global(.reveal--visible) { opacity: 1 }` stays at
     (0,1,0). (0,2,0) beats (0,1,0) regardless of source order, so the
     "visible" override never won even though the IntersectionObserver
     correctly added the class at runtime — the whole waitlist section
     (and AppPreview) stayed invisible forever for every
     prefers-reduced-motion: no-preference user (i.e. almost everyone),
     while still occupying its layout space. Making `.reveal` itself
     :global too gives both rules matching specificity so source order
     decides the winner as intended. */
  @media (prefers-reduced-motion: no-preference) {
    :global(.reveal) {
      opacity: 0;
      transform: translateY(1rem);
      transition:
        opacity 0.5s ease-out,
        transform 0.5s ease-out;
    }

    :global(.reveal--visible) {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .waitlist {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .waitlist__inner {
    max-width: 27rem;
    margin: 0 auto;
  }

  .waitlist__header {
    text-align: center;
    margin-bottom: 1.8rem;
  }

  .waitlist__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 0.6rem;
  }

  .waitlist__title {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.025em;
    line-height: 1.07;
    color: var(--text-primary);
  }

  .waitlist__card {
    background: var(--surface-raised);
    border: 0.075rem solid var(--border-default);
    border-radius: 1.2rem;
    box-shadow: 0 1rem 3.2rem rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .waitlist__stats {
    display: flex;
    background: #fdf0f7;
    padding: 0.9rem 1.4rem;
  }

  .waitlist__stat {
    flex: 1;
    text-align: center;
  }

  .waitlist__stat-value {
    font-size: 1rem;
    font-weight: 900;
    color: var(--pk);
    letter-spacing: -0.02em;
  }

  .waitlist__stat-label {
    font-size: 0.575rem;
    color: var(--text-secondary);
    margin-top: 0.1rem;
  }

  .waitlist__stat-divider {
    width: 0.05rem;
    background: rgba(255, 60, 172, 0.15);
  }

  .waitlist__form-wrap {
    padding: 1.6rem 1.8rem;
  }
</style>
```

- [ ] **Step 3: Run the Svelte MCP autofixer** on this file, fix all issues.

- [ ] **Step 4: Manual smoke check**

Run: `docker compose up -d` (from `apps/regrow`), then visit `http://localhost:5180/pt`.
Expected: full page renders top-to-bottom (Hero → How It Works → App Preview → Waitlist form → Footer), submitting the waitlist form with valid data shows the success confirmation, resubmitting the same email shows the duplicate-email error.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all tests from Tasks 6–16 PASS, including the locale parity test with the 7 new `form.*` keys from Step 1.

- [ ] **Step 6: Commit**

```bash
git add src/routes/\[\[lang\]\]/+page.svelte src/lib/i18n/locales/pt.json src/lib/i18n/locales/en.json
git commit -m "feat(regrow): compose landing page sections with reveal-on-scroll"
```

---

## Task 18: `sitemap.xml` + `robots.txt`

**Files:**
- Create: `apps/regrow/src/routes/sitemap.xml/+server.ts`
- Create: `apps/regrow/static/robots.txt`
- Test: `apps/regrow/src/routes/sitemap.xml/sitemap.test.ts`

**Interfaces:**
- Produces: `GET` request handler at `/sitemap.xml`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { GET } from './+server';

describe('GET /sitemap.xml', () => {
  it('returns XML content-type', async () => {
    const response = GET();
    expect(response.headers.get('content-type')).toBe('application/xml');
  });

  it('includes both /pt and /en URLs with hreflang alternates', async () => {
    const response = GET();
    const body = await response.text();
    expect(body).toContain('<loc>https://regrow.com.br/pt</loc>');
    expect(body).toContain('<loc>https://regrow.com.br/en</loc>');
    expect(body).toContain('hreflang="x-default"');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- sitemap.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `+server.ts`**

```ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const base = 'https://regrow.com.br';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${base}/pt</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${base}/pt"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/pt"/>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/en</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${base}/pt"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/pt"/>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
```

- [ ] **Step 4: Create `static/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://regrow.com.br/sitemap.xml
```

- [ ] **Step 5: Run the test**

Run: `npm test -- sitemap.test.ts`
Expected: PASS, 2 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/routes/sitemap.xml static/robots.txt
git commit -m "feat(regrow): add sitemap.xml and robots.txt"
```

---

## Task 19: Playwright end-to-end tests

**Files:**
- Create: `apps/regrow/playwright.config.ts`
- Create: `apps/regrow/tests/e2e/waitlist.spec.ts`

**Interfaces:**
- Consumes: the full running app (`npm run dev` or `npm run preview`), a reachable Postgres.

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 5180,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5180',
  },
});
```

- [ ] **Step 2: Write `tests/e2e/waitlist.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('redirects / to /pt by default', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/pt$/);
});

test('submits the waitlist form in pt-BR and shows the confirmation', async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  await page.goto('/pt');
  await expect(page).toHaveTitle('ReGrow — Achadinhos com o match perfeito');

  await page.getByLabel('Nome completo').fill('Maria Teste');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('E-mail').fill(uniqueEmail);
  await page.getByLabel('O que você mais busca?').selectOption('roupas');
  await page.getByRole('button', { name: 'Quero entrar na lista de espera' }).click();

  await expect(page.getByText('Você está na lista!')).toBeVisible();
});

test('submits the waitlist form in en and shows the confirmation', async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}-en@example.com`;
  await page.goto('/en');
  await expect(page).toHaveTitle('ReGrow — The perfect match for every little outfit');

  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Phone number').fill('11999999999');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('What are you looking for?').selectOption('roupas');
  await page.getByRole('button', { name: 'Join the waitlist' }).click();

  await expect(page.getByText("You're on the list!")).toBeVisible();
});

test('shows a friendly error without JavaScript (SSR form fallback)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/pt');

  await page.getByLabel('Nome completo').fill('Maria Sem JS');
  await page.getByLabel('Telefone').fill('11999999999');
  await page.getByLabel('E-mail').fill('invalido');
  await page.getByLabel('O que você mais busca?').selectOption('roupas');
  await page.getByRole('button', { name: 'Quero entrar na lista de espera' }).click();

  await expect(page.getByRole('alert')).toHaveText('E-mail inválido.');
  await context.close();
});
```

- [ ] **Step 3: Run the e2e suite**

Run: `docker compose up -d postgres && npm run test:e2e`
Expected: all 4 tests PASS. (First run needs `npx playwright install --with-deps chromium` if browsers aren't yet installed.)

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e
git commit -m "test(regrow): add Playwright e2e coverage for the waitlist happy path (pt/en, no-JS fallback)"
```

---

## Task 20: Terraform IaC files (written only, never applied)

**Files:**
- Create: `apps/regrow/infra/variables.tf`
- Create: `apps/regrow/infra/main.tf`
- Create: `apps/regrow/infra/outputs.tf`
- Create: `apps/regrow/infra/.gitignore`

**Interfaces:** none — these files are not wired into any build/deploy pipeline in this plan. Per the design doc §2/§9: written for later use, never `terraform init`/`apply`'d.

- [ ] **Step 1: Create `infra/variables.tf`**

```hcl
variable "hostinger_api_token" {
  description = "Hostinger API token"
  type        = string
  sensitive   = true
}

variable "vps_hostname" {
  description = "VPS hostname"
  type        = string
  default     = "regrow-landing"
}

variable "ssh_public_key" {
  description = "Public SSH key for VPS access"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL user password"
  type        = string
  sensitive   = true
}
```

- [ ] **Step 2: Create `infra/main.tf`**

```hcl
terraform {
  required_providers {
    hostinger = {
      source  = "hostinger/hostinger"
      version = "~> 1.0"
    }
  }
}

provider "hostinger" {
  api_token = var.hostinger_api_token
}

resource "hostinger_vps" "landing" {
  plan     = "KVM 2"
  os       = "ubuntu_24_04"
  hostname = var.vps_hostname
  region   = "br"

  ssh_keys = [var.ssh_public_key]
}

resource "null_resource" "setup" {
  depends_on = [hostinger_vps.landing]

  connection {
    type        = "ssh"
    host        = hostinger_vps.landing.ip_address
    user        = "root"
    private_key = file("~/.ssh/id_rsa")
  }

  provisioner "remote-exec" {
    inline = [
      "apt-get update -y && apt-get upgrade -y",
      "apt-get install -y postgresql postgresql-contrib nodejs npm",
      "npm install -g pm2",
      "sudo -u postgres psql -c \"CREATE USER regrow WITH PASSWORD '${var.db_password}';\"",
      "sudo -u postgres psql -c \"CREATE DATABASE regrow_db OWNER regrow;\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE regrow_db TO regrow;\"",
      "systemctl enable postgresql",
      "systemctl start postgresql",
    ]
  }
}

resource "hostinger_dns_zone" "landing_a" {
  depends_on = [hostinger_vps.landing]

  domain = "regrow.com.br"
  type   = "A"
  name   = "@"
  value  = hostinger_vps.landing.ip_address
  ttl    = 300
}

resource "hostinger_dns_zone" "landing_www" {
  depends_on = [hostinger_vps.landing]

  domain = "regrow.com.br"
  type   = "A"
  name   = "www"
  value  = hostinger_vps.landing.ip_address
  ttl    = 300
}
```

- [ ] **Step 3: Create `infra/outputs.tf`**

```hcl
output "vps_ip" {
  description = "VPS public IP"
  value       = hostinger_vps.landing.ip_address
}

output "db_url" {
  description = "DATABASE_URL for the application .env"
  value       = "postgresql://regrow:${var.db_password}@localhost:5432/regrow_db"
  sensitive   = true
}
```

- [ ] **Step 4: Create `infra/.gitignore`**

```
terraform.tfvars
.terraform/
*.tfstate
*.tfstate.backup
```

- [ ] **Step 5: Do not run `terraform init` or `terraform apply`.** There are no Hostinger credentials, domain, or SSH key configured — running either would fail or, worse, prompt for real secrets. This task is transcription only.

- [ ] **Step 6: Commit**

```bash
git add infra
git commit -m "docs(regrow): add Terraform IaC (written per spec, not applied — no credentials yet)"
```

---

## Task 21: Final polish pass

**Files:** none created; this task audits and fixes across everything already committed.

- [ ] **Step 1: Run the full check suite**

Run (from `apps/regrow`):
```bash
npm run check
npm run lint
npm run stylelint
npm test
```
Expected: all 4 commands exit 0. Fix any failures — do not skip or suppress them.

- [ ] **Step 2: Re-run the Svelte MCP autofixer across every `.svelte` file** created in Tasks 8–17 one more time, in case cross-component changes introduced new issues. Fix anything it reports.

- [ ] **Step 3: Diff against the mock, section by section**

Open `LP melhorada com novas specs/BabyClothes Landing.dc.html` side by side with the running app at `http://localhost:5180/pt`. For each section (topbar, hero, how-it-works, app preview, waitlist, footer), confirm: same copy (adjusted only for the ReGrow rename), same color (`#FF3CAC`), same font (Lato), same relative spacing/proportions, same CTA shimmer behavior. Note any drift in the commit message for this task — do not silently leave it unfixed.

- [ ] **Step 4: Verify the no-emoji rule held**

Run: `grep -rn "🎉\|✨\|👶\|💗" apps/regrow/src`
Expected: no matches.

- [ ] **Step 5: Verify no stray `px` in CSS**

Run: `grep -rEn "[0-9]+px" apps/regrow/src --include="*.svelte" --include="*.postcss" | grep -v "stroke-width\|width=\"[0-9]\|height=\"[0-9]"`
Expected: no matches (the `grep -v` clause excludes SVG element attributes, which are legitimately numeric, not CSS px).

- [ ] **Step 6: Confirm the two documented placeholders are still clearly marked**

Run: `grep -rn "regrowapp\|contato@regrow.com.br" apps/regrow/src`
Expected: matches in `Footer.svelte`/`Footer.test.ts` — confirm the commit history (Task 10) already flags these as placeholders; no action needed if so.

- [ ] **Step 7: Update `apps/regrow/README.md`** with a short "Known gaps" section:

```markdown
## Known gaps (tracked, not blocking)

- Footer contact email and Instagram handle are placeholders (`contato@regrow.com.br`, `instagram.com/regrowapp`) — replace with real values before launch.
- App Preview section reuses a How It Works screenshot; there's no dedicated asset for it yet.
- OG images (`og-image-pt.jpg`, `og-image-en.jpg`) referenced in meta tags don't exist yet — social share previews will 404 until added.
- `infra/*.tf` is written but never applied — no real VPS/domain/DNS exists.
- Privacy Policy and Terms of Use pages are linked from the footer but not built.
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(regrow): final polish pass — lint/check/test green, mock-fidelity audit, known gaps documented"
```
