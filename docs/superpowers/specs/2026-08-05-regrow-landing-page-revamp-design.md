# ReGrow Landing Page Revamp — Design Spec

**Date:** 2026-08-05
**App:** `apps/regrow` (SvelteKit 2 + Svelte 5)
**Scope:** Hero, "Como funciona", and AppPreview → "O que há de bom?" sections. No changes to `LandingTopbar`, `Footer`, or the waitlist form's fields.

> **Note on precision:** every section below is specified at implementation-level detail (exact spacing, colors as design-system tokens, breakpoints, copy in both locales) so it can be handed straight to an implementation plan without further interpretation.

---

## 0. Global conventions used throughout this spec

- **Root font-size is 125% (`1rem = 20px`)** outside `@media` blocks, but **`1rem = 16px` inside `@media` conditions** (see `apps/regrow/src/lib/tokens/layout.css` comment). All px→rem conversions below respect this: values used in a plain CSS rule are converted at 20px/rem, values used inside a `@media (...)` query are converted at 16px/rem.
- All colors reference tokens from `apps/regrow/src/lib/tokens/*.css` (a local copy of `packages/design-system/src/tokens/*.css`). No new hex values are introduced except where explicitly called out as a new token.
- Existing breakpoints (reuse, don't invent new ones): `--bp-medium: 40rem` (640px), `--bp-large: 64rem` (1024px).
- Only font currently loaded app-wide is **Lato** (`@import url('.../Lato:wght@300;400;700;900')` in `app.postcss`). Any serif font is a **new addition** — flagged explicitly where relevant.

---

## Decisions & Assumptions (resolved without a reply — flag if wrong)

These were ambiguous or under-specified in the request. Each was resolved with a documented default; correct any of them before implementation planning starts.

1. **Hero product cards: 3 total** (1 featured "With Actions" + 2 "With Old Price"), not more. "mais cards" was read as "more than the current 1", not a specific higher count.
2. **Hero card collage is desktop-only** (hidden `< 64rem`), matching the current single floating card's existing behavior. Not asked to make it work on mobile.
3. **"Como funciona" keeps its 3-numbered-item visual structure** (number badge + title + description), just without the phone screenshots and without the alternating 2-column layout — collapses to a single responsive row/stack of 3 text blocks. (Alternative was one flowing paragraph — rejected because the 3 clauses in the request map too cleanly to 3 distinct capabilities to flatten them.)
4. **"O que há de bom?" keeps the numbered pink-gradient circles from the original request** (digits 1/2/3 in page-background color, pink gradient fill), rather than switching to per-feature SVG icons in varied colors as shown in the pasted template. The template's icons (moon/lotus/note/dots) are illustrative of a different product (Calm) and don't map to our 3 items; the **layout mechanics** of the template (40/60 split, item spacing, icon-circle-then-text-block pattern, CTA below the list) are adopted, but the **icon treatment stays numbered + monochrome pink** as literally requested earlier in this conversation.
5. **A CTA button is added below the feature list** ("Cadastre-se para economizar", reusing the existing `WaitlistCta` component, `href="#waitlist"`) — this is new relative to the original ask, but explicitly present in the pasted template and reinforces conversion right before the actual form section. Flag if you'd rather not duplicate the CTA here.
6. **The phone mockup stays a CSS-drawn frame** (dark rounded rect + shadow, same technique already used in this codebase) with the template's shadow-offset and slight rotation added, **not** a photorealistic device PNG — no such asset exists in `apps/regrow/static/images`, and sourcing/generating one is outside this spec's scope.
7. **Serif heading font**: the template asks for "similar to Playfair Display". This app currently loads only Lato. Proposal: add **Playfair Display** as a second Google Fonts import, scoped to this one heading only (`font-family: 'Playfair Display', serif`), not adopted as a new design-system token. Flag if you'd rather approximate with existing Lato at a heavier weight instead of adding a new font dependency.
8. **Mobile breakpoint for the new section**: template says `≤768px`; converted to this project's existing `--bp-medium: 40rem` (640px) breakpoint instead of introducing a one-off 768px/48rem breakpoint, for consistency with the rest of the page.
9. **"O que há de bom?" section title stays in Portuguese** as literally requested earlier ("O que há de bom?"), not translated to "What do you get?" — the pasted template's English title was the source template's own copy, not a translation instruction. English locale gets "What's good?".
10. Existing floating-card mock copy in `Hero.svelte` is hardcoded PT text that bypasses `$t()` entirely (a pre-existing gap vs. the project's i18n rule). Since the hero cards are being rebuilt from scratch here, their new mock copy goes through `$t()` properly in both locales.

---

## 1. Hero

### 1.1 Copy removed
- `hero__subheadline` paragraph and its `hero.subheadline` i18n key (both locales) — deleted entirely.
- `hero__chips` block (all 3 trust pills: "Lista de espera aberta", "100% grátis", "IA conversacional") and their i18n keys — deleted entirely.

### 1.2 CTA → inline email capture
Replace the `<WaitlistCta label={$t('hero.cta')} href="#waitlist" variant="hero" />` call with an inline form:

```svelte
<form class="hero__quick-signup" onsubmit={handleQuickSignup}>
  <input
    type="email"
    name="email"
    required
    placeholder={$t('hero.email_placeholder')}
    class="hero__quick-signup-input"
    bind:value={quickEmail}
  />
  <button type="submit" class="hero__quick-signup-button">
    {$t('hero.email_cta')}
  </button>
</form>
```

- **Behavior:** `handleQuickSignup` calls `event.preventDefault()`, writes `quickEmail` into a new shared store `waitlistEmail` (`apps/regrow/src/lib/stores/waitlist-email.ts`, `export const waitlistEmail = writable('')`), then scrolls smoothly to `#waitlist` (`document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })` — respects `prefers-reduced-motion` the same way the existing `IntersectionObserver` reveal logic does, i.e. skip smooth behavior if reduced motion is preferred).
- **`WaitlistForm.svelte` change:** email `<input>`'s `value` becomes `form?.values?.email ?? $waitlistEmail`, so a successful quick-signup pre-fills the real form field. Import `waitlistEmail` from the new store and subscribe via `$waitlistEmail`.
- **Layout (`hero__quick-signup`):** `display: flex; gap: 0.5rem;` row, input `flex: 1`. Below `40rem` (inside `@media`, so 40rem @16px = 640px) stacks to `flex-direction: column`.
- **Input style:** reuses the existing form input look — `background: var(--surface-sunken); border: 0.075rem solid var(--border-default); border-radius: var(--radius-pill); padding: 0.85rem 1.2rem; font-size: 0.85rem;` (pill-shaped to match the button, unlike the rectangular inputs in the real waitlist form further down — this one sits over a photo background and needs the softer pill treatment).
- **Button:** same visual treatment as the current `.waitlist-cta--hero` (pill, `var(--pk)` background, shimmer), reused via `<WaitlistCta type="submit" variant="hero" label={$t('hero.email_cta')} />` **inside** the form instead of hand-rolled markup — reuse over rebuild.
- **New i18n keys** (`hero.email_placeholder`, `hero.email_cta`):
  - pt: `"email_placeholder": "Seu melhor e-mail"`, `"email_cta": "Cadastre-se para economizar"`
  - en: `"email_placeholder": "Your best email"`, `"email_cta": "Sign up and save"`

### 1.3 Background photo
No change — `hero__image`, `hero__scrim` (both gradients) stay exactly as implemented today.

### 1.4 Product card collage (replaces the single floating card)
Remove the entire `.hero__floating-card` block (markup + styles) and replace with 3 real `ItemCard` instances from `@babyclothes/design-system`, imported into `Hero.svelte`.

**Featured card** ("With Actions" configuration):
```svelte
<ItemCard
  title={$t('hero.card1_title')}
  price={34}
  clothingSize={$t('hero.card1_size')}
  conditionLabel={$t('hero.condition_seminovo')}
  photoUrl="/images/hero-card-1.jpg"
  sellerName={$t('hero.card1_seller')}
  sellerVerifiedLabel={$t('hero.verified_label')}
  paymentEnabled={true}
  contactLabel={$t('hero.contact_label')}
  buyLabel={$t('hero.buy_label')}
/>
```

**Two secondary cards** ("With Old Price" configuration, no seller row, no actions):
```svelte
<ItemCard
  title={$t('hero.card2_title')}
  price={22}
  oldPrice={39}
  clothingSize={$t('hero.card2_size')}
  conditionLabel={$t('hero.condition_seminovo')}
  photoUrl="/images/hero-card-2.jpg"
/>
<ItemCard
  title={$t('hero.card3_title')}
  price={45}
  oldPrice={68}
  clothingSize={$t('hero.card3_size')}
  conditionLabel={$t('hero.condition_seminovo')}
  photoUrl="/images/hero-card-3.jpg"
/>
```

All three cards use `conditionLabel={$t('hero.condition_seminovo')}` → pt: `"Seminovo"`, en: `"Pre-loved"` (matches the existing `hero.floating_card_badge` value already used for the old card — that key is removed, this replaces it).

**New i18n keys** (`hero.*`), pt / en:
| Key | pt | en |
|---|---|---|
| `card1_title` | Body inverno manga longa | Long-sleeve winter bodysuit |
| `card1_size` | M · 6-9 meses | M · 6-9 months |
| `card1_seller` | Ana Silva | Ana Silva |
| `card2_title` | Macacão listrado | Striped overalls |
| `card2_size` | P · 3-6 meses | S · 3-6 months |
| `card3_title` | Vestido florido | Floral dress |
| `card3_size` | G · 9-12 meses | L · 9-12 months |
| `verified_label` | Verificada | Verified |
| `contact_label` | Contatar | Contact |
| `buy_label` | Comprar | Buy |
| `condition_seminovo` | Seminovo | Pre-loved |

Photo assets `hero-card-1.jpg`, `hero-card-2.jpg`, `hero-card-3.jpg` don't exist yet in `apps/regrow/static/images` — need to be sourced/added as part of implementation (out of scope for this spec; use any royalty-free placeholder in the meantime, `ItemCard` already falls back to `/placeholder.png` if `photoUrl` is omitted).

**Layout — desktop only (`≥ 64rem`):**
- Container `.hero__card-collage`: `position: absolute; right: clamp(0.8rem, 7vw, 4.5rem); bottom: 2.6rem; z-index: 3;` (same anchor point as today's single card).
- Featured card: `width: 13rem`, no rotation, `z-index: 3`.
- Secondary card A: `width: 9.5rem`, positioned `top: -3rem; left: -4rem;` relative to the featured card, `transform: rotate(-6deg); z-index: 2;`.
- Secondary card B: `width: 9.5rem`, positioned `top: -1.5rem; right: -3.5rem;` relative to the featured card, `transform: rotate(5deg); z-index: 1;`.
- All 3 cards keep `ItemCard`'s own `box-shadow` (`--shadow-sm`) plus an extra `box-shadow: 0 1.2rem 3rem rgba(0,0,0,.17)` wrapper shadow to match the current floating card's elevation.
- `@media (max-width: 64rem)`: `.hero__card-collage { display: none; }` (same as current `.hero__floating-card` rule).

---

## 2. Como funciona (repurposed: process → product description)

### 2.1 Semantic change
This section stops being "3 steps of a user flow" and becomes "what the app does" — 3 capabilities, no screenshots, no phone frames.

### 2.2 New copy
| | title (pt) | desc (pt) | title (en) | desc (en) |
|---|---|---|---|---|
| 1 | Encontra roupas de brechó | Busca peças em brechós e lojas parceiras com preços competitivos para o seu bebê. | Finds thrift clothes | Searches partner thrift stores and shops for competitive prices for your baby. |
| 2 | Monta o enxoval ideal | Monta o enxoval completo de acordo com o tempo de gestação, sem faltar nem sobrar nada. | Builds the ideal layette | Builds the complete layette based on how far along your pregnancy is — nothing missing, nothing wasted. |
| 3 | Prevê a próxima troca de tamanho | Acompanha o crescimento da criança e avisa quando está na hora de trocar de tamanho. | Predicts the next size change | Tracks your child's growth and tells you when it's time to size up. |

Header eyebrow (`how.title`) stays "Como funciona" / "How it works". Main heading (`how.subtitle_line1` + `how.subtitle_line2`) changes from "Simples como conversar / com uma amiga" to a description-oriented line:
- pt: "Um assistente pessoal / para o enxoval do seu bebê"
- en: "A personal assistant / for your baby's wardrobe"

`step1_alt`, `step2_alt`, `step3_alt` i18n keys are deleted (no more images to caption).

### 2.3 Layout change
Remove: `.how__row` / `.how__row--reversed` 2-column grid, `.how__phone` / `.how__phone-image` (the phone frame + `<img>`), the `reversed` field in the `steps` array, the `image`/`altKey` fields.

Replace with a single responsive row of 3 text blocks:
- `.how__grid`: `display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(2rem, 5vw, 3.5rem);` on `≥ 64rem`.
- Below `64rem` (inside `@media`, 64rem@16px = 1024px): `grid-template-columns: 1fr` (stacked), each item's `.how__number` shrinks from `clamp(5rem, 12vw, 7.5rem)` to a smaller fixed `3rem` since it no longer needs to visually balance an adjacent phone image.
- Each `.how__text` item keeps its existing number-badge treatment (`--pk` at `opacity: .055`, oversized background numeral) — this part of the current CSS is untouched, just no longer paired with a sibling `.how__phone`.
- Text alignment: centered on all breakpoints (previously left-aligned to pair with the image; centered reads better as a 3-up feature grid).

---

## 3. "O que há de bom?" (replaces AppPreview's "Veja o app em ação")

Adopts the two-column template layout supplied, adapted to this project's tokens/content per the Decisions section above.

### 3.1 Layout — general
- Container: `max-width: 50rem` (~1000px @20px/rem), centered (`margin-inline: auto`), background `var(--surface-raised)` (white — same as today's `.preview` section background), vertical padding `4rem` (`--space-16`) — same as `clamp(4rem, 9vw, 6.4rem)` pattern used by every other section, for consistency, rather than a flat 4rem. So: `padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);` (reuses the exact pattern from `.how` / `.waitlist`).
- Two columns, `display: flex; align-items: center; gap: clamp(2rem, 6vw, 4rem);` on `≥ 64rem`. Stack vertically (`flex-direction: column`) below `64rem` (mockup first, then list).

### 3.2 Left column — phone mockup (~40% width)
- `flex: 0 0 40%` on desktop; `max-width: 17.5rem` (280px@20px/rem), centered, on mobile.
- Reuses the existing CSS phone-frame technique (`background: var(--surface-inverse); border-radius: 2rem; padding: 0.4rem;`) around the `screen-party.png` screenshot (kept, per default in Decisions #6 — no new PNG asset).
- New: `box-shadow: 0.6rem 1rem 3rem rgba(0,0,0,.22);` (offset down-and-right per the template, vs. the current centered `0 1.4rem 3.5rem`) and `transform: rotate(-2deg);`.
- No caption below the phone anymore (`preview.caption` i18n key removed — its content is superseded by the feature list).

### 3.3 Right column — heading + feature list + CTA (~60% width)
- `flex: 1` on desktop.
- **Heading** (`preview.list_title`, pt: "O que há de bom?", en: "What's good?"): `font-family: 'Playfair Display', serif` (new import, see Decisions #7), `font-size: 1.8rem` (~36px@20px/rem), `color: var(--text-primary)` (`#111111` ≈ requested `#2a2a2a`, reusing the existing token rather than a near-duplicate one-off hex), `margin-bottom: 2rem` (~40px@20px/rem).
- **Feature list**, `display: flex; flex-direction: column; gap: 1.4rem;` (~28px@20px/rem). 3 items (see Decisions #4 — not 4):

  | # | title (pt) | text (pt) | title (en) | text (en) |
  |---|---|---|---|---|
  | 1 | Previsibilidade | O assistente prevê o crescimento das crianças para que você possa se planejar e conseguir as melhores peças. | Predictability | The assistant predicts your child's growth so you can plan ahead and get the best pieces. |
  | 2 | Busca inteligente | As peças ideais são pesquisadas em lojas e brechós parceiros que não estão catalogados em sites de busca. | Smart search | The ideal pieces are sourced from partner shops and thrift stores that aren't listed on search engines. |
  | 3 | Economia e qualidade | Apenas itens de bom estado com um bom preço são retornados, sem surpresas negativas. | Savings and quality | Only well-kept items at a good price are shown — no bad surprises. |

  Each item: `display: flex; align-items: flex-start; gap: 0.8rem;` (~16px@20px/rem).
  - **Icon circle**: `width: 2rem; height: 2rem;` (40px@20px/rem), `border-radius: 50%; flex-shrink: 0;`, `background: linear-gradient(135deg, var(--pk), var(--pk2));` (pink gradient, per the original request — not per-item varied colors). Contains the item's number (`1`/`2`/`3`), `color: var(--surface-base)` (`#F8F5F2`, the page background color, per the original request), `font-weight: 900; font-size: 0.85rem;`, centered (`display: flex; align-items: center; justify-content: center;`).
  - **Text block**: title `font-weight: 700; font-size: 0.9rem;` (~18px@20px/rem), `color: var(--text-primary)`; description `font-weight: 400; font-size: 0.7rem;` (~14px@20px/rem), `color: var(--text-secondary)` (`#374151`, close enough to the requested `#666` to reuse the existing token instead of a new near-duplicate), `line-height: 1.5;`.
- **CTA below the list** (see Decisions #5): `<WaitlistCta label={$t('hero.email_cta')} href="#waitlist" variant="hero" />` (reuses the same "Cadastre-se para economizar" copy as the hero quick-signup, and the same `variant="hero"` pill styling — no new button variant needed), wrapped in a container with `margin-top: 2rem` (~40px@20px/rem), centered on mobile / left-aligned on desktop (matches "centralizado abaixo das features" from the template, applied consistently across breakpoints since the column itself is full-width either way).

### 3.4 Responsive (`< 64rem`, inside `@media` so 64rem@16px = 1024px — reusing the project's existing `--bp-large`, not introducing the template's one-off 768px)
- Columns stack: phone mockup first, feature list + CTA below.
- Phone mockup: centered, `max-width: 17.5rem`.
- Heading and feature list: centered text (`text-align: center`), icon+text rows switch to `flex-direction: column; align-items: center;` so the circle sits above its text block.
- CTA: centered (already default).

### 3.5 Component identity
The Svelte component file stays `AppPreview.svelte` (no rename) to avoid unrelated import/test churn — only its internal markup, styles, and the section id/heading change.

---

## 4. Files touched

| File | Change |
|---|---|
| `apps/regrow/src/lib/components/Hero.svelte` | Remove subheadline + chips; replace CTA with inline email form; replace floating card with 3× `ItemCard` collage |
| `apps/regrow/src/lib/components/HowItWorks.svelte` | Remove phone images/2-col layout; collapse `steps` to text-only 3-up grid |
| `apps/regrow/src/lib/components/AppPreview.svelte` | Rework into 2-column "O que há de bom?" layout with feature list + CTA |
| `apps/regrow/src/lib/components/WaitlistForm.svelte` | Read `waitlistEmail` store as the email field's default value |
| `apps/regrow/src/lib/stores/waitlist-email.ts` | **New** — shared writable store for hero quick-signup → form prefill |
| `apps/regrow/src/lib/i18n/locales/pt.json`, `en.json` | Add/remove keys per sections 1–3 above |
| `apps/regrow/src/app.postcss` | Add Playfair Display Google Fonts import (see Decision #7) |
| `apps/regrow/static/images/hero-card-{1,2,3}.jpg` | **New assets needed** — not produced by this spec |
| `apps/regrow/src/lib/components/Hero.test.ts`, `HowItWorks.test.ts`, `AppPreview.test.ts`, `WaitlistForm.test.ts` | Updated during implementation to match new markup/copy (TDD — not detailed here, left to the implementation plan) |

Design-system package (`packages/design-system`) itself is **not modified** — `ItemCard` is used as-is via existing props (`oldPrice`, `paymentEnabled`, etc.), no new variant/story required.
