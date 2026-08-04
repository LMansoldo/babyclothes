# ReGrow Landing Page — Design

**Date:** 2026-08-03
**Status:** Approved for planning

## 1. Summary

Build a standalone landing page for **ReGrow** (rebrand of the original `[NAME]` product spec) as a new, isolated project at `apps/regrow/`. It captures waitlist leads (name, phone, email, interest) via SvelteKit Form Actions + Prisma + Postgres, is fully bilingual (pt-BR default / en), and follows the visual language of the approved mock at `LP melhorada com novas specs/BabyClothes Landing.dc.html` (Lato font, `#FF3CAC` brand pink, pill shimmer CTA, editorial "how it works" steps, floating product card).

This is **not** a new Yarn workspace inside the `babyclothes` monorepo. It's a separate project living under `apps/` for convenience of colocated source control, but with its own `package.json`, lockfile, Docker Compose stack, and Postgres instance — fully decoupled from the existing Elixir API / `apps/web` / `apps/agents` stack.

## 2. Non-goals

- No real infrastructure provisioning. Terraform files (`infra/*.tf`) are written per spec but never `apply`'d — no Hostinger credentials, domain, or VPS exist yet.
- No integration with the existing `babyclothes` marketplace, its API, its auth, or its Postgres instance.
- No backporting of the shimmer CTA button into the shared `packages/design-system` — it stays local to this project as a one-off pattern.

## 3. Project structure

```
apps/regrow/
  RULES.md                     # trimmed copy of root RULES.md, frontend-only sections
  README.md
  docker-compose.yml           # postgres (5433) + regrow app container
  Dockerfile
  package.json                 # SvelteKit 2 + Svelte 5, npm, own deps
  svelte.config.js             # @sveltejs/adapter-node
  tsconfig.json
  .env.example                 # DATABASE_URL, PUBLIC_SITE_URL
  .gitignore                   # .env, terraform.tfvars, node_modules, build
  prisma/
    schema.prisma              # Lead model
  src/
    app.html                   # font preload/preconnect, resource hints
    lib/
      i18n/
        index.ts
        locales/
          pt.json
          en.json
      tokens/                  # verbatim copy of design-system tokens
        primitives.css
        semantic.css
        typography.css
        layout.css
        themes.css
        tokens.css              # @import aggregator, copied as-is
      server/
        db.ts                  # PrismaClient singleton
      components/
        LandingTopbar.svelte    # adapted copy from design-system, rebranded
        Hero.svelte
        WaitlistCta.svelte      # shimmer pill button, shared by hero + form + topbar CTA
        HowItWorks.svelte
        AppPreview.svelte
        WaitlistForm.svelte
        Footer.svelte
        LanguageToggle.svelte
    routes/
      [[lang]]/
        +layout.server.ts       # locale resolution/redirect
        +layout.svelte          # svelte-i18n init, meta tags, JSON-LD
        +page.svelte             # composes all sections
        +page.server.ts          # `waitlist` form action
      sitemap.xml/
        +server.ts
  static/
    robots.txt
    images/
      hero-desktop.webp / hero-desktop.png (fallback)
      hero-mobile.webp / hero-mobile.png
      screen-winter.webp / screen-winter.png
      screen-party.webp / screen-party.png
      screen-size.webp / screen-size.png
  infra/
    main.tf
    variables.tf
    outputs.tf
  tests/
    unit/                       # vitest: locale redirect, form validation, i18n keys parity
    e2e/                        # playwright: submit waitlist happy path (pt + en)
```

## 4. Design system reuse

The design-system tokens already match the mock's visual language:

- `--pk` (`#FF3CAC`) is the mock's brand pink exactly.
- `--font-body` / `--ld` / `--vd` already alias to `--font-lato` (`'Lato', sans-serif`), matching the mock's Google Font.

Because `apps/regrow` is isolated (no `workspace:*` resolution possible), tokens are **copied verbatim** from `packages/design-system/src/tokens/*.css` into `apps/regrow/src/lib/tokens/`. No values are changed. Any future divergence between the two token sets is an explicit, separate decision — not silent drift introduced by this project.

`LandingTopbar.svelte` (currently WIP, uncommitted, in `packages/design-system/src/patterns/LandingTopbar/`) is copied into `apps/regrow/src/lib/components/LandingTopbar.svelte` and adapted:
- `brandName` default changes from `BabyClothes` to `ReGrow`.
- Nav links trimmed to just "Como funciona" / "How it works" anchor, per the mock.
- CTA button swapped to use the shared local `WaitlistCta.svelte` instead of its own `.landing-topbar__btn-cta` styling, so the shimmer/pill treatment is consistent between topbar and hero.
- Keeps using tokens exclusively (`--pk`, `--ld`, `--glass`, `--shadow-*`) — no hardcoded colors/px.

`WaitlistCta.svelte` (new, local-only) implements the mock's shimmer pill button: `--pk` background, pill radius (`--radius-pill`), glow shadow, animated shimmer sweep (`@keyframes shimmer`), arrow icon (inline SVG, matching mock — no `lucide-svelte` dependency added just for this since the project doesn't otherwise depend on it). Respects `prefers-reduced-motion` (shimmer animation disabled).

## 5. Routing & i18n

- `svelte-i18n`, registered locales `pt` and `en`, `fallbackLocale: 'pt'`.
- `src/routes/[[lang]]/+layout.server.ts`: no `lang` param → redirect based on `Accept-Language` header (`pt*` → `/pt`, else `/en`); invalid `lang` (not `pt`/`en`) → redirect to `/pt`.
- `+layout.svelte`: initializes i18n locale from `data.lang`, sets `<html lang>`, renders canonical/hreflang/OG/Twitter/JSON-LD meta tags (all per source spec §6.8), renders `LandingTopbar` and `Footer` around the page slot.
- Every visible string goes through `$t()` — no hardcoded copy. `pt.json`/`en.json` populated verbatim from the source spec's string tables (hero, how, preview, form, footer, meta), with brand name `[NOME]`/`[NAME]` replaced by **ReGrow** throughout, including `form.error_duplicate` (added to both locale files, not in the original catalogue: pt *"Esse e-mail já está na lista."* / en *"This email is already on the list."*).
- Unit test asserts `pt.json` and `en.json` have identical key sets (prevents catalogue drift).

## 6. Sections

| Section | Component | Content source |
|---|---|---|
| Hero | `Hero.svelte` | Spec §5.1. `Hero_Desktop.png`/`Hero_Mobile.png` via `<picture>` + `srcset`, `fetchpriority="high"`, no lazy-load (LCP element). Trust chips + floating product card ported from the mock. CTA = `WaitlistCta.svelte` anchored to `#waitlist`. |
| How It Works | `HowItWorks.svelte` | Spec §5.2. 3 alternating rows (mock's 01/02/03 editorial layout) using `Screen_Winter.png`, `Screen_party.png`, `Screen_Size.png`, `loading="lazy"`. |
| App Preview | `AppPreview.svelte` | Spec §5.3. Phone-frame mockup reusing one of the how-it-works screenshots (no dedicated asset supplied) with translated caption. |
| Waitlist | `WaitlistForm.svelte` + `+page.server.ts` | Spec §5.4 fields/options/messages, §6.7 form flow. |
| Footer | `Footer.svelte` + `LanguageToggle.svelte` | Spec §5.5. Brand, privacy/terms links (placeholder routes, not built), email contact, Instagram link, copyright, `PT | EN` toggle swapping the `[lang]` URL segment. |

Reveal-on-scroll (`.reveal` + `IntersectionObserver`) applied to How It Works, App Preview, and Waitlist sections per spec §6.6, gated on `prefers-reduced-motion`.

## 7. Data layer

- `prisma/schema.prisma`: `Lead` model exactly per source spec §6.2 (`id`, `nome`, `telefone`, `email @unique`, `interesse`, `locale @default("pt")`, `createdAt @default(now())`).
- `src/lib/server/db.ts`: single `PrismaClient` instance, imported by `+page.server.ts` — avoids connection-pool exhaustion in SSR per spec's best-practice note.
- `+page.server.ts` `waitlist` action: reads `FormData`, validates required fields + email format via a local type guard (per root `RULES.md` — no `any`, narrow `unknown` explicitly), calls `prisma.lead.create`, maps Prisma `P2002` → `fail(409, { errorKey: 'form.error_duplicate' })`, other errors → `fail(500, { errorKey: 'form.error_server' })`, success → `{ success: true }`. Locale comes from `params.lang`.
- `+page.svelte` / `WaitlistForm.svelte`: `use:enhance`, loading state on submit, field values preserved on validation error, confirmation view (no redirect) on success, `role="alert"` on error messages.

## 8. SEO & performance

- Per source spec §6.8: `<link rel="canonical">`, `hreflang` (`pt-BR`, `en`, `x-default`), OG + Twitter Card tags, `WebSite` JSON-LD with `JoinAction` targeting `#waitlist`.
- `src/routes/sitemap.xml/+server.ts` and `static/robots.txt` exactly per spec.
- All 5 mock PNGs converted to WebP at setup time (`<picture>` with PNG fallback), `width`/`height` set on every `<img>` to prevent CLS.
- Targets: Lighthouse ≥ 90 (Performance/Accessibility/SEO), LCP < 2.5s, CLS < 0.1, INP < 200ms.

## 9. Infrastructure (written, not applied)

`infra/main.tf`, `variables.tf`, `outputs.tf` transcribed from source spec §6.3 (Hostinger VPS provider, `null_resource` remote-exec for Postgres/Node/PM2 setup, DNS A records, `db_url` output). No `terraform init`/`apply` run — no credentials exist. `.env.example` documents `DATABASE_URL` shape for later real provisioning.

## 10. Local development

- Own `docker-compose.yml`: `postgres` (image `postgres:16-alpine`, port `5433:5432`, db `regrow_db`, user `regrow`) + `app` service (SvelteKit dev server, port to be chosen to avoid clashing with the main monorepo's `5173` — e.g. `5180`).
- `RULES.md` copied from repo root, trimmed to sections that apply to a frontend-only TypeScript/Svelte project: Docker First (rephrased for this project's own compose file), Type Safety, Single Responsibility, DRY, CSS Units (`rem`), SOLID, Object Calisthenics. Elixir/Ecto/backend sections dropped.

## 11. Testing

Mirrors `apps/web` conventions (Vitest + Playwright, TDD):
- Unit: locale redirect/fallback logic, form action validation (required fields, email regex, duplicate-email path via mocked Prisma), i18n key-set parity between `pt.json`/`en.json`.
- E2E (Playwright): submit waitlist form happy path in both `/pt` and `/en`, assert confirmation state and no page reload (JS-enabled path) — plus one no-JS form submission test to verify the SSR fallback works.

## 12. Open items deferred to future work

- Actual Terraform apply / VPS provisioning / domain / TLS.
- Real OG images (`og-image-pt.jpg`, `og-image-en.jpg`) — placeholder/neutral image used until brand assets exist.
- Analytics wiring (GA4/Plausible) — spec §6.11 notes it, not part of this build.
- Privacy Policy / Terms of Use pages (footer links point to routes that don't exist yet).
