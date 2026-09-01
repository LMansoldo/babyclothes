# ReGrow Landing Page Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the ReGrow landing page's Hero, "Como funciona", and AppPreview sections per `docs/superpowers/specs/2026-08-05-regrow-landing-page-revamp-design.md`: an inline email-capture CTA in the Hero that prefills the real waitlist form, a multi-card product collage using the shared `ItemCard` pattern, a "Como funciona" section repurposed from process-steps to a product description, and an AppPreview section repurposed into "O que há de bom?" with a feature list and CTA.

**Architecture:** `apps/regrow` is a standalone SvelteKit 2 + Svelte 5 app (own copy of design tokens, own components, not currently wired to `@babyclothes/design-system`). This plan adds a single new cross-workspace dependency (`ItemCard` from the shared design system) and one new shared store (`waitlistEmail`) that couples the Hero's quick-signup input to the real `WaitlistForm` further down the page. Everything else is component-local markup/CSS/i18n changes.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes: `$props`, `$state`, `$derived`), `svelte-i18n`, Vitest + `@testing-library/svelte`, Yarn 4 (PnP) workspaces.

## Global Constraints

- **CSS units:** `apps/regrow` sets `html { font-size: 125% }`, so **`1rem = 20px`** in plain CSS rules — but **`1rem = 16px` inside `@media` conditions** (browser default; CSS custom properties don't work in media queries). Every value below is already converted — don't re-derive from a 10px-base assumption.
- **No new hex colors.** Every color below is an existing token from `apps/regrow/src/lib/tokens/*.css` (`--pk`, `--pk2`, `--surface-base`, `--surface-raised`, `--surface-sunken`, `--surface-inverse`, `--text-primary`, `--text-secondary`, `--border-default`, `--radius-pill`, `--transition-fast`).
- **BEM naming** (`.block__element--modifier`) for all new CSS classes, matching the existing files.
- **i18n:** every user-facing string added or changed must get both a `pt` and an `en` entry in `apps/regrow/src/lib/i18n/locales/{pt,en}.json`. The two files must always have exactly the same set of keys.
- **No emojis** anywhere.
- Run all commands for this app directly via `yarn workspace regrow-landing <script>` from the repo root (`apps/regrow` has no Docker Compose service of its own — see `docker-compose.yml`, which only defines `postgres`/`api`/`agents`/`web`).
- Test locale defaults to `pt` (see `apps/regrow/src/test-setup.ts`), so `render(Component)` in a test renders Portuguese copy — assert on the literal `pt.json` strings, matching every existing test in this app.
- A design-only refinement made during planning (not spelled out at this granularity in the spec): the "Como funciona" number badge, which used to be absolutely positioned over a paired phone image, is centered above its title in Task 5 below now that the section is a centered 3-up grid with no adjacent image — the visual treatment (`--pk` at low opacity, oversized numeral) is unchanged, only its positioning is adapted from absolute-over-image to static-above-title.

---

## Task 1: `waitlistEmail` shared store

**Files:**
- Create: `apps/regrow/src/lib/stores/waitlist-email.ts`
- Test: `apps/regrow/src/lib/stores/waitlist-email.test.ts`

**Interfaces:**
- Produces: `waitlistEmail: Writable<string>` (from `svelte/store`), initial value `''`. Later tasks import it as `import { waitlistEmail } from '$lib/stores/waitlist-email'`.

- [ ] **Step 1: Write the failing test**

Create `apps/regrow/src/lib/stores/waitlist-email.test.ts`:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { waitlistEmail } from './waitlist-email';

describe('waitlistEmail store', () => {
  afterEach(() => {
    waitlistEmail.set('');
  });

  it('starts as an empty string', () => {
    expect(get(waitlistEmail)).toBe('');
  });

  it('holds whatever value is set on it', () => {
    waitlistEmail.set('ana@example.com');
    expect(get(waitlistEmail)).toBe('ana@example.com');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn workspace regrow-landing vitest run src/lib/stores/waitlist-email.test.ts`
Expected: FAIL — `Cannot find module './waitlist-email'`

- [ ] **Step 3: Write the minimal implementation**

Create `apps/regrow/src/lib/stores/waitlist-email.ts`:

```ts
import { writable } from 'svelte/store'

export const waitlistEmail = writable('')
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn workspace regrow-landing vitest run src/lib/stores/waitlist-email.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/regrow/src/lib/stores/waitlist-email.ts apps/regrow/src/lib/stores/waitlist-email.test.ts
git commit -m "feat(regrow): add waitlistEmail shared store"
```

---

## Task 2: `WaitlistForm` prefills email from the store

**Files:**
- Modify: `apps/regrow/src/lib/components/WaitlistForm.svelte`
- Test: `apps/regrow/src/lib/components/WaitlistForm.test.ts`

**Interfaces:**
- Consumes: `waitlistEmail` (Task 1).

- [ ] **Step 1: Write the failing tests**

In `apps/regrow/src/lib/components/WaitlistForm.test.ts`, add `afterEach` and `waitlistEmail` imports, and 2 new tests. Full resulting file:

```ts
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistForm from './WaitlistForm.svelte';
import { waitlistEmail } from '../stores/waitlist-email';

describe('WaitlistForm', () => {
  afterEach(() => {
    waitlistEmail.set('');
  });

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

  it('pre-fills the email field from the waitlistEmail store when there is no prior submission', () => {
    waitlistEmail.set('ana@example.com');
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
  });

  it('prefers a previously submitted email over the waitlistEmail store value', () => {
    waitlistEmail.set('store@example.com');
    render(WaitlistForm, {
      props: { form: { errorKey: 'form.error_email', values: { email: 'bad-input' } } },
    });
    expect(screen.getByLabelText('E-mail')).toHaveValue('bad-input');
  });
});
```

- [ ] **Step 2: Run the tests to verify the 2 new ones fail**

Run: `yarn workspace regrow-landing vitest run src/lib/components/WaitlistForm.test.ts`
Expected: 5 PASS, 2 FAIL (email field has no value from the store yet)

- [ ] **Step 3: Implement the prefill**

In `apps/regrow/src/lib/components/WaitlistForm.svelte`, add the store import after the existing `WaitlistCta` import (line 4):

```svelte
  import WaitlistCta from './WaitlistCta.svelte'
  import { waitlistEmail } from '../stores/waitlist-email'
```

Then change the email input's `value` (originally `value={form?.values?.email ?? ''}`, around line 82) to:

```svelte
        value={form?.values?.email ?? $waitlistEmail}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn workspace regrow-landing vitest run src/lib/components/WaitlistForm.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/regrow/src/lib/components/WaitlistForm.svelte apps/regrow/src/lib/components/WaitlistForm.test.ts
git commit -m "feat(regrow): prefill waitlist form email from waitlistEmail store"
```

---

## Task 3: Hero — remove subheadline/chips, add inline quick-signup CTA

**Files:**
- Modify: `apps/regrow/src/lib/components/Hero.svelte`
- Test: `apps/regrow/src/lib/components/Hero.test.ts`
- Modify: `apps/regrow/src/lib/i18n/locales/pt.json`, `apps/regrow/src/lib/i18n/locales/en.json`

**Interfaces:**
- Consumes: `waitlistEmail` (Task 1), existing `WaitlistCta` component.
- Produces: `scrollToWaitlist()` (local helper inside `Hero.svelte`, reused by Task 4 in the same file).

This task leaves the existing single `.hero__floating-card` untouched — it's replaced in Task 4. Only the copy column (`.hero__copy`) changes here.

- [ ] **Step 1: Update the i18n locale files**

In `apps/regrow/src/lib/i18n/locales/pt.json`, replace the `"hero"` block with:

```json
  "hero": {
    "headline": "Achadinhos com o match perfeito",
    "headline_line1": "Achadinhos com o",
    "headline_line2": "match perfeito",
    "email_placeholder": "Seu melhor e-mail",
    "email_cta": "Cadastre-se para economizar"
  },
```

(This removes `subheadline`, `cta`, `trust_chip_open`, `trust_chip_free`, `trust_chip_ai`, and `floating_card_badge` — `floating_card_badge` is re-added with a new name in Task 4. `headline`/`headline_line1`/`headline_line2` are unchanged.)

In `apps/regrow/src/lib/i18n/locales/en.json`, replace the `"hero"` block with:

```json
  "hero": {
    "headline": "The perfect match for every little outfit",
    "headline_line1": "The perfect match",
    "headline_line2": "for every little outfit",
    "email_placeholder": "Your best email",
    "email_cta": "Sign up and save"
  },
```

- [ ] **Step 2: Update `Hero.test.ts` — remove obsolete tests, add new ones**

Replace the full contents of `apps/regrow/src/lib/components/Hero.test.ts` with:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Hero from './Hero.svelte';
import { waitlistEmail } from '../stores/waitlist-email';

describe('Hero', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    waitlistEmail.set('');
  });

  it('renders the translated headline', () => {
    render(Hero);
    expect(screen.getByText('Achadinhos com o')).toBeInTheDocument();
    expect(screen.getByText('match perfeito')).toBeInTheDocument();
  });

  it('does not render a sub-headline anymore', () => {
    render(Hero);
    expect(
      screen.queryByText(
        'O assistente gratuito que encontra roupinhas e acessórios acompanhando todo o crescimento dos nossos pequenos',
      ),
    ).toBeNull();
  });

  it('does not render the trust chips anymore', () => {
    render(Hero);
    expect(screen.queryByText('Lista de espera aberta')).toBeNull();
    expect(screen.queryByText('100% grátis')).toBeNull();
    expect(screen.queryByText('IA conversacional')).toBeNull();
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

  it('renders an email input and a submit button with the quick-signup copy', () => {
    render(Hero);
    expect(screen.getByPlaceholderText('Seu melhor e-mail')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cadastre-se para economizar' }),
    ).toBeInTheDocument();
  });

  it('writes the typed email into the waitlistEmail store and scrolls to #waitlist on submit', async () => {
    render(Hero);

    const waitlistSection = document.createElement('section');
    waitlistSection.id = 'waitlist';
    const scrollSpy = vi.fn();
    waitlistSection.scrollIntoView = scrollSpy;
    document.body.appendChild(waitlistSection);

    const input = screen.getByPlaceholderText('Seu melhor e-mail');
    await fireEvent.input(input, { target: { value: 'ana@example.com' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Cadastre-se para economizar' }));

    expect(get(waitlistEmail)).toBe('ana@example.com');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(waitlistSection);
  });
});
```

(Note: the old "renders the floating card badge" test is intentionally dropped here — it covers markup this task doesn't touch and gets rewritten in Task 4.)

- [ ] **Step 3: Run the tests to verify the new/changed ones fail**

Run: `yarn workspace regrow-landing vitest run src/lib/components/Hero.test.ts`
Expected: FAIL on the sub-headline/chips-removed assertions and the quick-signup assertions (markup not changed yet).

- [ ] **Step 4: Implement the Hero copy-column changes**

In `apps/regrow/src/lib/components/Hero.svelte`, replace the `<script>` block (lines 1–4) with:

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
  import { waitlistEmail } from '../stores/waitlist-email'

  let quickEmail = $state('')

  function scrollToWaitlist() {
    const target = document.getElementById('waitlist')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function handleQuickSignup(event: SubmitEvent) {
    event.preventDefault()
    waitlistEmail.set(quickEmail)
    scrollToWaitlist()
  }
</script>
```

Replace the `.hero__copy` block (originally lines 26–44: the `hero__chips` div, the `h1`, the subheadline `p`, and the `WaitlistCta` call) with:

```svelte
    <div class="hero__copy">
      <h1 class="hero__headline">
        {$t('hero.headline_line1')}<br />
        <em class="hero__headline-accent">{$t('hero.headline_line2')}</em>
      </h1>

      <form class="hero__quick-signup" onsubmit={handleQuickSignup}>
        <input
          type="email"
          name="email"
          required
          placeholder={$t('hero.email_placeholder')}
          class="hero__quick-signup-input"
          bind:value={quickEmail}
        />
        <WaitlistCta type="submit" variant="hero" label={$t('hero.email_cta')} />
      </form>
    </div>
```

- [ ] **Step 5: Update the Hero styles**

In the `<style>` block, delete these rule sets entirely (they styled markup that no longer exists): `.hero__chips`, `.hero__chip`, `.hero__chip--live`, `.hero__chip-dot`, `.hero__subheadline`.

Add these new rule sets (place them after `.hero__headline-accent` and before `.hero__floating-card`):

```css
  .hero__quick-signup {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .hero__quick-signup-input {
    flex: 1;
    min-width: 0;
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-primary);
    background: var(--surface-sunken);
    border: 0.075rem solid var(--border-default);
    border-radius: var(--radius-pill);
    padding: 0.85rem 1.2rem;
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .hero__quick-signup-input:focus {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.09);
    background: var(--surface-raised);
  }

  @media (max-width: 40rem) {
    .hero__quick-signup {
      flex-direction: column;
    }
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `yarn workspace regrow-landing vitest run src/lib/components/Hero.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 7: Commit**

```bash
git add apps/regrow/src/lib/components/Hero.svelte apps/regrow/src/lib/components/Hero.test.ts apps/regrow/src/lib/i18n/locales/pt.json apps/regrow/src/lib/i18n/locales/en.json
git commit -m "feat(regrow): replace hero subheadline/chips with inline quick-signup CTA"
```

---

## Task 4: Hero — replace the floating card with a 3-card `ItemCard` collage

**Files:**
- Modify: `apps/regrow/package.json` (new dependency)
- Modify: `apps/regrow/src/lib/components/Hero.svelte`
- Test: `apps/regrow/src/lib/components/Hero.test.ts`
- Modify: `apps/regrow/src/lib/i18n/locales/pt.json`, `apps/regrow/src/lib/i18n/locales/en.json`

**Interfaces:**
- Consumes: `ItemCard` from `@babyclothes/design-system` (props: `title`, `price`, `oldPrice?`, `clothingSize`, `conditionLabel`, `photoUrl?`, `sellerName?`, `sellerVerifiedLabel?`, `paymentEnabled?`, `contactLabel?`, `buyLabel?`, `onclick?`, `onFavorite?`, `onContact?`, `onBuy?`, `onSellerClick?`); `scrollToWaitlist()` from Task 3 (same file).

- [ ] **Step 1: Add the design-system workspace dependency**

`apps/regrow` currently has zero dependency on `@babyclothes/design-system` (it has its own local copy of design tokens and no cross-workspace imports). Add it:

Run from the repo root: `yarn workspace regrow-landing add @babyclothes/design-system@workspace:*`

Expected: `apps/regrow/package.json` gets a new `"@babyclothes/design-system": "workspace:*"` entry under `"dependencies"`, and `yarn.lock` is updated. Verify with:

Run: `git diff apps/regrow/package.json`
Expected: one new dependency line.

- [ ] **Step 2: Update the i18n locale files**

In `apps/regrow/src/lib/i18n/locales/pt.json`, extend the `"hero"` block (from Task 3) to add the new keys — full resulting block:

```json
  "hero": {
    "headline": "Achadinhos com o match perfeito",
    "headline_line1": "Achadinhos com o",
    "headline_line2": "match perfeito",
    "email_placeholder": "Seu melhor e-mail",
    "email_cta": "Cadastre-se para economizar",
    "condition_seminovo": "Seminovo",
    "verified_label": "Verificada",
    "contact_label": "Contatar",
    "buy_label": "Comprar",
    "card1_title": "Body inverno manga longa",
    "card1_size": "M · 6-9 meses",
    "card1_seller": "Ana Silva",
    "card2_title": "Macacão listrado",
    "card2_size": "P · 3-6 meses",
    "card3_title": "Vestido florido",
    "card3_size": "G · 9-12 meses"
  },
```

In `apps/regrow/src/lib/i18n/locales/en.json`, same keys, full resulting block:

```json
  "hero": {
    "headline": "The perfect match for every little outfit",
    "headline_line1": "The perfect match",
    "headline_line2": "for every little outfit",
    "email_placeholder": "Your best email",
    "email_cta": "Sign up and save",
    "condition_seminovo": "Pre-loved",
    "verified_label": "Verified",
    "contact_label": "Contact",
    "buy_label": "Buy",
    "card1_title": "Long-sleeve winter bodysuit",
    "card1_size": "M · 6-9 months",
    "card1_seller": "Ana Silva",
    "card2_title": "Striped overalls",
    "card2_size": "S · 3-6 months",
    "card3_title": "Floral dress",
    "card3_size": "L · 9-12 months"
  },
```

- [ ] **Step 3: Update `Hero.test.ts`**

Add these 4 tests to the `describe('Hero', ...)` block from Task 3 (append after the last test, before the closing `});`), and remove none — they're additive:

```ts

  it('renders 3 product cards, all marked with the Seminovo condition', () => {
    render(Hero);
    expect(screen.getAllByText('Seminovo')).toHaveLength(3);
  });

  it('renders the featured card with contact and buy actions', () => {
    render(Hero);
    expect(screen.getByRole('button', { name: 'Contatar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comprar' })).toBeInTheDocument();
  });

  it('renders old prices on the two secondary cards', () => {
    render(Hero);
    expect(screen.getByText('R$ 39,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 68,00')).toBeInTheDocument();
  });

  it('scrolls to #waitlist when the buy button on the featured card is clicked', async () => {
    render(Hero);

    const waitlistSection = document.createElement('section');
    waitlistSection.id = 'waitlist';
    const scrollSpy = vi.fn();
    waitlistSection.scrollIntoView = scrollSpy;
    document.body.appendChild(waitlistSection);

    await fireEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(waitlistSection);
  });
```

- [ ] **Step 4: Run the tests to verify the 4 new ones fail**

Run: `yarn workspace regrow-landing vitest run src/lib/components/Hero.test.ts`
Expected: 7 PASS (from Task 3), 4 FAIL (no cards yet)

- [ ] **Step 5: Implement the card collage**

In `apps/regrow/src/lib/components/Hero.svelte`, add the `ItemCard` import to the script block, after the `waitlistEmail` import:

```svelte
  import { waitlistEmail } from '../stores/waitlist-email'
  import { ItemCard } from '@babyclothes/design-system'
```

Replace the entire `.hero__floating-card` block (the `<div class="hero__floating-card">...</div>` element, originally lines 47–64) with:

```svelte
  <div class="hero__card-collage">
    <div class="hero__card-collage-secondary hero__card-collage-secondary--a">
      <ItemCard
        title={$t('hero.card2_title')}
        price={22}
        oldPrice={39}
        clothingSize={$t('hero.card2_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        onclick={scrollToWaitlist}
      />
    </div>
    <div class="hero__card-collage-secondary hero__card-collage-secondary--b">
      <ItemCard
        title={$t('hero.card3_title')}
        price={45}
        oldPrice={68}
        clothingSize={$t('hero.card3_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        onclick={scrollToWaitlist}
      />
    </div>
    <div class="hero__card-collage-featured">
      <ItemCard
        title={$t('hero.card1_title')}
        price={34}
        clothingSize={$t('hero.card1_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        sellerName={$t('hero.card1_seller')}
        sellerVerifiedLabel={$t('hero.verified_label')}
        paymentEnabled={true}
        contactLabel={$t('hero.contact_label')}
        buyLabel={$t('hero.buy_label')}
        onclick={scrollToWaitlist}
        onFavorite={scrollToWaitlist}
        onContact={scrollToWaitlist}
        onBuy={scrollToWaitlist}
        onSellerClick={scrollToWaitlist}
      />
    </div>
  </div>
```

- [ ] **Step 6: Update the Hero styles**

Delete these rule sets entirely (they styled the removed single floating card): `.hero__floating-card`, `.hero__floating-card-image`, `.hero__floating-card-badge`, `.hero__floating-card-favorite`, `.hero__floating-card-title`, `.hero__floating-card-meta`, `.hero__floating-card-price-row`, `.hero__floating-card-price`, `.hero__floating-card-price-old`.

Keep the final `@media (max-width: 64rem) { .hero__floating-card { display: none; } }` rule but rename the selector — replace it with:

```css
  @media (max-width: 64rem) {
    .hero__card-collage {
      display: none;
    }
  }
```

Add these new rule sets (place them where `.hero__floating-card` used to be, before that final media query):

```css
  .hero__card-collage {
    position: absolute;
    right: clamp(0.8rem, 7vw, 4.5rem);
    bottom: 2.6rem;
    z-index: 3;
  }

  .hero__card-collage :global(.item-card) {
    box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.17);
  }

  .hero__card-collage-featured {
    position: relative;
    width: 13rem;
    z-index: 3;
  }

  .hero__card-collage-secondary {
    position: absolute;
    width: 9.5rem;
  }

  .hero__card-collage-secondary--a {
    top: -3rem;
    left: -4rem;
    transform: rotate(-6deg);
    z-index: 2;
  }

  .hero__card-collage-secondary--b {
    top: -1.5rem;
    right: -3.5rem;
    transform: rotate(5deg);
    z-index: 1;
  }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `yarn workspace regrow-landing vitest run src/lib/components/Hero.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 8: Type-check (new cross-workspace import)**

Run: `yarn workspace regrow-landing check`
Expected: no errors. This is the step that verifies the new `@babyclothes/design-system` dependency actually resolves under Yarn PnP.

- [ ] **Step 9: Commit**

```bash
git add apps/regrow/package.json yarn.lock apps/regrow/src/lib/components/Hero.svelte apps/regrow/src/lib/components/Hero.test.ts apps/regrow/src/lib/i18n/locales/pt.json apps/regrow/src/lib/i18n/locales/en.json
git commit -m "feat(regrow): replace hero floating card with 3-card ItemCard collage"
```

---

## Task 5: "Como funciona" — repurpose from process steps to product description

**Files:**
- Modify: `apps/regrow/src/lib/components/HowItWorks.svelte`
- Test: `apps/regrow/src/lib/components/HowItWorks.test.ts`
- Modify: `apps/regrow/src/lib/i18n/locales/pt.json`, `apps/regrow/src/lib/i18n/locales/en.json`

**Interfaces:** none new — this task is self-contained.

- [ ] **Step 1: Update the i18n locale files**

In `apps/regrow/src/lib/i18n/locales/pt.json`, replace the `"how"` block with:

```json
  "how": {
    "title": "Como funciona",
    "subtitle_line1": "Um assistente pessoal",
    "subtitle_line2": "para o enxoval do seu bebê",
    "step1_title": "Encontra roupas de brechó",
    "step1_desc": "Busca peças em brechós e lojas parceiras com preços competitivos para o seu bebê.",
    "step2_title": "Monta o enxoval ideal",
    "step2_desc": "Monta o enxoval completo de acordo com o tempo de gestação, sem faltar nem sobrar nada.",
    "step3_title": "Prevê a próxima troca de tamanho",
    "step3_desc": "Acompanha o crescimento da criança e avisa quando está na hora de trocar de tamanho."
  },
```

(This removes `step1_alt`, `step2_alt`, `step3_alt` — no more images to caption.)

In `apps/regrow/src/lib/i18n/locales/en.json`, replace the `"how"` block with:

```json
  "how": {
    "title": "How it works",
    "subtitle_line1": "A personal assistant",
    "subtitle_line2": "for your baby's wardrobe",
    "step1_title": "Finds thrift clothes",
    "step1_desc": "Searches partner thrift stores and shops for competitive prices for your baby.",
    "step2_title": "Builds the ideal layette",
    "step2_desc": "Builds the complete layette based on how far along your pregnancy is — nothing missing, nothing wasted.",
    "step3_title": "Predicts the next size change",
    "step3_desc": "Tracks your child's growth and tells you when it's time to size up."
  },
```

- [ ] **Step 2: Replace `HowItWorks.test.ts`**

Replace the full contents of `apps/regrow/src/lib/components/HowItWorks.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks', () => {
  it('has id="como-funciona" so the topbar nav link resolves', () => {
    const { container } = render(HowItWorks);
    expect(container.querySelector('#como-funciona')).not.toBeNull();
  });

  it('renders all 3 capability titles and descriptions', () => {
    render(HowItWorks);
    expect(screen.getByText('Encontra roupas de brechó')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Busca peças em brechós e lojas parceiras com preços competitivos para o seu bebê.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Monta o enxoval ideal')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Monta o enxoval completo de acordo com o tempo de gestação, sem faltar nem sobrar nada.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Prevê a próxima troca de tamanho')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Acompanha o crescimento da criança e avisa quando está na hora de trocar de tamanho.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render any step screenshots anymore', () => {
    render(HowItWorks);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('renders the translated two-line heading', () => {
    render(HowItWorks);
    expect(screen.getByText('Um assistente pessoal')).toBeInTheDocument();
    expect(screen.getByText('para o enxoval do seu bebê')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `yarn workspace regrow-landing vitest run src/lib/components/HowItWorks.test.ts`
Expected: FAIL (old copy/images still present)

- [ ] **Step 4: Rewrite `HowItWorks.svelte`**

Replace the full contents of `apps/regrow/src/lib/components/HowItWorks.svelte` with:

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'

  const steps = [
    { number: '01', titleKey: 'how.step1_title', descKey: 'how.step1_desc' },
    { number: '02', titleKey: 'how.step2_title', descKey: 'how.step2_desc' },
    { number: '03', titleKey: 'how.step3_title', descKey: 'how.step3_desc' },
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
      <h2 class="how__title"><span>{$t('how.subtitle_line1')}</span><br /><span>{$t('how.subtitle_line2')}</span></h2>
    </div>

    <div class="how__grid">
      {#each steps as step (step.number)}
        <div class="how__item">
          <span class="how__number" aria-hidden="true">{step.number}</span>
          <h3 class="how__step-title">{$t(step.titleKey)}</h3>
          <p class="how__step-desc">{$t(step.descKey)}</p>
        </div>
      {/each}
    </div>
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

  .how__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(2rem, 5vw, 3.5rem);
  }

  .how__item {
    text-align: center;
  }

  .how__number {
    display: block;
    font-size: clamp(5rem, 8vw, 7.5rem);
    font-weight: 900;
    line-height: 1;
    color: var(--pk);
    opacity: 0.055;
    user-select: none;
    margin-bottom: -2.5rem;
  }

  .how__step-title {
    font-size: clamp(1.2rem, 2.4vw, 1.5rem);
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
    margin-inline: auto;
  }

  @media (max-width: 64rem) {
    .how__grid {
      grid-template-columns: 1fr;
      gap: clamp(2.4rem, 8vw, 3.5rem);
    }
  }
</style>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn workspace regrow-landing vitest run src/lib/components/HowItWorks.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/regrow/src/lib/components/HowItWorks.svelte apps/regrow/src/lib/components/HowItWorks.test.ts apps/regrow/src/lib/i18n/locales/pt.json apps/regrow/src/lib/i18n/locales/en.json
git commit -m "feat(regrow): repurpose Como funciona into a 3-capability product description"
```

---

## Task 6: AppPreview → "O que há de bom?"

**Files:**
- Modify: `apps/regrow/src/lib/components/AppPreview.svelte`
- Test: `apps/regrow/src/lib/components/AppPreview.test.ts`
- Modify: `apps/regrow/src/lib/i18n/locales/pt.json`, `apps/regrow/src/lib/i18n/locales/en.json`
- Modify: `apps/regrow/src/app.postcss` (new font import)

**Interfaces:**
- Consumes: existing `WaitlistCta` component, `hero.email_cta` i18n key (Task 3).

- [ ] **Step 1: Update the i18n locale files**

In `apps/regrow/src/lib/i18n/locales/pt.json`, replace the `"preview"` block with:

```json
  "preview": {
    "list_title": "O que há de bom?",
    "image_alt": "Roupas sugeridas em uma conversa no app",
    "item1_title": "Previsibilidade",
    "item1_text": "O assistente prevê o crescimento das crianças para que você possa se planejar e conseguir as melhores peças.",
    "item2_title": "Busca inteligente",
    "item2_text": "As peças ideais são pesquisadas em lojas e brechós parceiros que não estão catalogados em sites de busca.",
    "item3_title": "Economia e qualidade",
    "item3_text": "Apenas itens de bom estado com um bom preço são retornados, sem surpresas negativas."
  },
```

(This removes `title` and `caption`.)

In `apps/regrow/src/lib/i18n/locales/en.json`, replace the `"preview"` block with:

```json
  "preview": {
    "list_title": "What's good?",
    "image_alt": "Suggested outfits shown inside an app conversation",
    "item1_title": "Predictability",
    "item1_text": "The assistant predicts your child's growth so you can plan ahead and get the best pieces.",
    "item2_title": "Smart search",
    "item2_text": "The ideal pieces are sourced from partner shops and thrift stores that aren't listed on search engines.",
    "item3_title": "Savings and quality",
    "item3_text": "Only well-kept items at a good price are shown — no bad surprises."
  },
```

- [ ] **Step 2: Replace `AppPreview.test.ts`**

Replace the full contents of `apps/regrow/src/lib/components/AppPreview.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppPreview from './AppPreview.svelte';

describe('AppPreview', () => {
  it('no longer renders the old "Veja o app em ação" title or caption', () => {
    render(AppPreview);
    expect(screen.queryByText('Veja o app em ação')).toBeNull();
    expect(screen.queryByText('Cards de produto renderizados direto na conversa')).toBeNull();
  });

  it('renders the "O que há de bom?" heading', () => {
    render(AppPreview);
    expect(screen.getByText('O que há de bom?')).toBeInTheDocument();
  });

  it('renders one lazy-loaded preview image', () => {
    render(AppPreview);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', '/images/screen-party.png');
  });

  it('renders the 3 feature items with their titles and texts', () => {
    render(AppPreview);
    expect(screen.getByText('Previsibilidade')).toBeInTheDocument();
    expect(
      screen.getByText(
        'O assistente prevê o crescimento das crianças para que você possa se planejar e conseguir as melhores peças.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Busca inteligente')).toBeInTheDocument();
    expect(
      screen.getByText(
        'As peças ideais são pesquisadas em lojas e brechós parceiros que não estão catalogados em sites de busca.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Economia e qualidade')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Apenas itens de bom estado com um bom preço são retornados, sem surpresas negativas.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a CTA linking to #waitlist below the feature list', () => {
    render(AppPreview);
    const cta = screen.getByRole('link', { name: 'Cadastre-se para economizar' });
    expect(cta).toHaveAttribute('href', '#waitlist');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `yarn workspace regrow-landing vitest run src/lib/components/AppPreview.test.ts`
Expected: FAIL (old markup still present)

- [ ] **Step 4: Rewrite `AppPreview.svelte`**

Replace the full contents of `apps/regrow/src/lib/components/AppPreview.svelte` with:

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'

  const features = [
    { number: '1', titleKey: 'preview.item1_title', textKey: 'preview.item1_text' },
    { number: '2', titleKey: 'preview.item2_title', textKey: 'preview.item2_text' },
    { number: '3', titleKey: 'preview.item3_title', textKey: 'preview.item3_text' },
  ] as const
</script>

<section class="preview">
  <div class="preview__inner">
    <div class="preview__phone">
      <img
        src="/images/screen-party.png"
        alt={$t('preview.image_alt')}
        loading="lazy"
        decoding="async"
        width="340"
        height="580"
        class="preview__phone-image"
      />
    </div>

    <div class="preview__content">
      <h2 class="preview__title">{$t('preview.list_title')}</h2>
      <ul class="preview__list">
        {#each features as feature (feature.number)}
          <li class="preview__item">
            <span class="preview__item-number" aria-hidden="true">{feature.number}</span>
            <div class="preview__item-body">
              <h3 class="preview__item-title">{$t(feature.titleKey)}</h3>
              <p class="preview__item-text">{$t(feature.textKey)}</p>
            </div>
          </li>
        {/each}
      </ul>
      <div class="preview__cta">
        <WaitlistCta label={$t('hero.email_cta')} href="#waitlist" variant="hero" />
      </div>
    </div>
  </div>
</section>

<style>
  .preview {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .preview__inner {
    max-width: 50rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: clamp(2rem, 6vw, 4rem);
  }

  .preview__phone {
    flex: 0 0 40%;
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0.6rem 1rem 3rem rgba(0, 0, 0, 0.22);
    transform: rotate(-2deg);
  }

  .preview__phone-image {
    display: block;
    width: 100%;
    height: clamp(23rem, 42vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  .preview__content {
    flex: 1;
  }

  .preview__title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 2rem;
  }

  .preview__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .preview__item {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .preview__item-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--pk), var(--pk2));
    color: var(--surface-base);
    font-weight: 900;
    font-size: 0.85rem;
  }

  .preview__item-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
  }

  .preview__item-text {
    font-size: 0.7rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .preview__cta {
    margin-top: 2rem;
  }

  @media (max-width: 64rem) {
    .preview__inner {
      flex-direction: column;
    }

    .preview__phone {
      flex: none;
      max-width: 17.5rem;
      margin: 0 auto;
    }

    .preview__title {
      text-align: center;
    }

    .preview__item {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .preview__cta {
      display: flex;
      justify-content: center;
    }
  }
</style>
```

- [ ] **Step 5: Add the Playfair Display font import**

In `apps/regrow/src/app.postcss`, change the first line (currently `@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');`) to add a second import right after it:

```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
@import url('./lib/tokens/tokens.css');
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `yarn workspace regrow-landing vitest run src/lib/components/AppPreview.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 7: Commit**

```bash
git add apps/regrow/src/lib/components/AppPreview.svelte apps/regrow/src/lib/components/AppPreview.test.ts apps/regrow/src/lib/i18n/locales/pt.json apps/regrow/src/lib/i18n/locales/en.json apps/regrow/src/app.postcss
git commit -m "feat(regrow): rework AppPreview into 'O que há de bom?' feature list"
```

---

## Task 7: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full regrow test suite**

Run: `yarn workspace regrow-landing test`
Expected: all tests pass (no regressions in `Footer.test.ts`, `LandingTopbar.test.ts`, `LanguageToggle.test.ts`, `locales.test.ts`, route tests, etc. — none of those files were touched, but `locales.test.ts` may assert on the full key set of both locale files, so it's worth confirming it still passes after 4 rounds of key edits).

- [ ] **Step 2: Type-check**

Run: `yarn workspace regrow-landing check`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `yarn workspace regrow-landing lint`
Expected: no errors.

- [ ] **Step 4: Stylelint**

Run: `yarn workspace regrow-landing stylelint`
Expected: no errors.

- [ ] **Step 5: Build**

Run: `yarn workspace regrow-landing build`
Expected: build succeeds — this is what actually proves the new `@babyclothes/design-system` import resolves correctly under Yarn PnP in a production build, not just in Vitest.

- [ ] **Step 6: Manual check in the browser**

Run: `yarn workspace regrow-landing dev`, open the printed local URL, and verify:
- Hero: no subheadline, no pills, email input + "Cadastre-se para economizar" button, 3 overlapping product cards (desktop width only) all showing "Seminovo" and the featured one showing "Contatar"/"Comprar".
- Typing an email in the hero input and submitting scrolls down to the waitlist form with that email already filled in.
- "Como funciona": 3 centered text items, no phone screenshots.
- "O que há de bom?": phone screenshot + 3-item numbered list + CTA button, no leftover "Veja o app em ação" title.
- Switch to `/en` and spot-check the same sections in English.

- [ ] **Step 7: Commit (only if any of the above required fixes)**

```bash
git add -A
git commit -m "fix(regrow): address issues found in full verification pass"
```

(Skip this step entirely if step 1–6 required no changes.)

---

## Self-Review Notes

- **Spec coverage:** Hero copy removal (Task 3) ✓, inline email CTA + store prefill (Tasks 1–3) ✓, 3-card collage with correct `ItemCard` prop configurations and `Seminovo` condition (Task 4) ✓, "Como funciona" repurposed to 3 capabilities (Task 5) ✓, "O que há de bom?" 2-column layout with numbered circles + CTA (Task 6) ✓. Asset gaps flagged in the spec (`hero-card-*.jpg` photos, no device-mockup PNG) are intentionally left as-is per the spec's own Decisions section — not re-litigated here.
- **Placeholder scan:** no TBD/TODO; every code block is complete, runnable code.
- **Type consistency:** `waitlistEmail` (Task 1) is imported with the same name and path (`$lib/stores/waitlist-email` from Svelte files, `../stores/waitlist-email` from same-directory test files) everywhere it's consumed (Tasks 2, 3). `scrollToWaitlist()` is defined once in Task 3 and referenced by name only within the same file in Task 4 (no cross-file signature to drift).

---

**Plan complete and saved to `docs/superpowers/plans/2026-08-05-regrow-landing-page-revamp.md`.**
