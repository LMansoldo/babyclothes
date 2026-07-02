# ProductTray Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a ProductTray composite component for the design system and integrate ImageGallery + ProductTray into the `/catalog/[id]` product detail page.

**Architecture:** ProductTray is a full-width white tray with rounded top corners that overlays the ImageGallery component. It shares Card's props (minus image/size) and adds product-specific badges (condition, sizeLabel, genderLabel). The seller row is built inline (not reusing SellerRow) for consistent styling on white background.

**Tech Stack:** Svelte 5 (runes), BEM CSS, TypeScript, Vitest, Storybook

## Global Constraints

- CSS: always `rem`, never `px` (10px = 1rem base)
- BEM naming: `.block__element--modifier`
- No emojis — use inline SVGs for icons
- Svelte 5 runes only (`$props`, `$state`, `$effect`)
- i18n: all user-facing strings via `$t()` (en-US + pt-BR)
- Files under 100 lines per RULES.md
- Docker first for all commands

---

### Task 1: Create ProductTray.svelte Component

**Files:**
- Create: `packages/design-system/src/composites/ProductTray/ProductTray.svelte`
- Create: `packages/design-system/src/composites/ProductTray/index.ts`

**Interfaces:**
- Produces: `ProductTray` component with props consumed by catalog page (Task 4)

- [ ] **Step 1: Create ProductTray.svelte**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    detail,
    price,
    oldPrice,
    condition,
    sizeLabel,
    genderLabel,
    sellerName,
    sellerAvatar,
    sellerListings,
    verified = false,
    onContact,
    onBuy,
    onSellerClick,
    children,
  }: {
    title: string
    detail?: string
    price?: string
    oldPrice?: string
    condition?: string
    sizeLabel?: string
    genderLabel?: string
    sellerName?: string
    sellerAvatar?: string
    sellerListings?: string
    verified?: boolean
    onContact?: () => void
    onBuy?: () => void
    onSellerClick?: () => void
    children?: Snippet
  } = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && onSellerClick) onSellerClick()
  }
</script>

<div class="product-tray">
  <div class="product-tray__header">
    <span class="product-tray__title">{title}</span>
    {#if condition || sizeLabel || genderLabel}
      <div class="product-tray__badges">
        {#if condition}
          <span
            class="product-tray__badge"
            class:product-tray__badge--new={condition === 'Novo'}
            class:product-tray__badge--semi={condition === 'Seminovo'}
            class:product-tray__badge--used={condition === 'Usado'}
          >
            {condition}
          </span>
        {/if}
        {#if sizeLabel}
          <span class="product-tray__badge product-tray__badge--neutral">{sizeLabel}</span>
        {/if}
        {#if genderLabel}
          <span class="product-tray__badge product-tray__badge--neutral">{genderLabel}</span>
        {/if}
      </div>
    {/if}
  </div>

  {#if detail}
    <span class="product-tray__detail">{detail}</span>
  {/if}

  {#if price}
    <div class="product-tray__price">
      <span class="product-tray__price-current">{price}</span>
      {#if oldPrice}
        <span class="product-tray__price-old">{oldPrice}</span>
      {/if}
    </div>
  {/if}

  {#if sellerName}
    <div
      class="product-tray__seller"
      onclick={onSellerClick}
      role={onSellerClick ? 'button' : undefined}
      tabindex={onSellerClick ? 0 : undefined}
      onkeydown={onSellerClick ? handleKeydown : undefined}
    >
      <div class="product-tray__seller-left">
        {#if sellerAvatar}
          <img src={sellerAvatar} alt={sellerName} class="product-tray__seller-avatar" />
        {:else}
          <div class="product-tray__seller-avatar product-tray__seller-avatar--empty"></div>
        {/if}
        <div class="product-tray__seller-info">
          <span class="product-tray__seller-name">
            {sellerName}
            {#if verified}
              <svg class="product-tray__seller-verified" width="14" height="14" viewBox="0 0 24 24" fill="#FF3CAC" stroke="#FF3CAC" stroke-width="2">
                <circle cx="12" cy="12" r="10" fill="#FF3CAC" stroke="none"/>
                <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {/if}
          </span>
          {#if sellerListings}
            <span class="product-tray__seller-meta">{sellerListings} anuncios</span>
          {/if}
        </div>
      </div>
      <svg class="product-tray__seller-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  {/if}

  {#if children}
    {@render children()}
  {/if}

  {#if onContact || onBuy}
    <div class="product-tray__actions">
      {#if onContact}
        <button type="button" class="product-tray__button product-tray__button--ghost" onclick={onContact}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Contatar
        </button>
      {/if}
      {#if onBuy}
        <button type="button" class="product-tray__button product-tray__button--primary" onclick={onBuy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Comprar
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .product-tray {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 1.6rem 1.6rem 0 0;
    margin-top: -1.6rem;
    padding: 1.8rem 1.8rem 8rem;
    position: relative;
    z-index: 1;
  }

  .product-tray__header {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .product-tray__title {
    font-family: var(--font-lato);
    font-size: 1.05rem;
    font-weight: 700;
    color: #111;
  }

  .product-tray__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .product-tray__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 99rem;
    font-family: var(--font-lato);
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;
  }

  .product-tray__badge--new {
    background: #111;
    color: #fff;
  }

  .product-tray__badge--semi {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .product-tray__badge--used {
    background: #F3F4F6;
    color: #374151;
  }

  .product-tray__badge--neutral {
    background: #F3F4F6;
    color: #374151;
  }

  .product-tray__detail {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    color: #9CA3AF;
    margin-top: 0.2rem;
  }

  .product-tray__price {
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
    margin-top: 0.8rem;
  }

  .product-tray__price-current {
    font-family: var(--font-lato);
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF3CAC;
  }

  .product-tray__price-old {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    color: #9CA3AF;
    text-decoration: line-through;
  }

  .product-tray__seller {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 0;
    border-top: 1px solid #F3F4F6;
    border-bottom: 1px solid #F3F4F6;
    margin-top: 1.2rem;
    cursor: pointer;
    background: none;
    border-left: none;
    border-right: none;
    width: 100%;
    text-align: left;
  }

  .product-tray__seller:hover {
    background: #FAFAFA;
  }

  .product-tray__seller-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .product-tray__seller-avatar {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    position: relative;
  }

  .product-tray__seller-avatar--empty {
    background: #F3F4F6;
    border-radius: 50%;
  }

  .product-tray__seller-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .product-tray__seller-name {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    font-weight: 700;
    color: #111;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .product-tray__seller-verified {
    flex-shrink: 0;
  }

  .product-tray__seller-meta {
    font-family: var(--font-lato);
    font-size: 0.68rem;
    color: #9CA3AF;
  }

  .product-tray__seller-chevron {
    color: #9CA3AF;
    flex-shrink: 0;
  }

  .product-tray__actions {
    display: flex;
    gap: 0.8rem;
    margin-top: 1.6rem;
  }

  .product-tray__button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 1.2rem;
    border: none;
    border-radius: 1rem;
    font-family: var(--font-lato);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .product-tray__button--ghost {
    background: #F3F4F6;
    color: #111;
  }

  .product-tray__button--ghost:hover {
    background: #E5E7EB;
  }

  .product-tray__button--primary {
    background: #FF3CAC;
    color: #fff;
    box-shadow: 0 0.3rem 1rem rgba(255, 60, 172, 0.3);
  }

  .product-tray__button--primary:hover {
    opacity: 0.9;
  }
</style>
```

- [ ] **Step 2: Create barrel export**

Create `packages/design-system/src/composites/ProductTray/index.ts`:

```ts
export { default as ProductTray } from './ProductTray.svelte'
```

- [ ] **Step 3: Verify file exists**

Run: `ls -la packages/design-system/src/composites/ProductTray/`
Expected: 2 files (ProductTray.svelte, index.ts)

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/composites/ProductTray/
git commit -m "feat(ds): add ProductTray composite component"
```

---

### Task 2: Add Design System Barrel Export

**Files:**
- Modify: `packages/design-system/src/index.ts`

**Interfaces:**
- Consumes: `ProductTray` from Task 1
- Produces: Exported `ProductTray` for external consumers

- [ ] **Step 1: Read current barrel export**

Read `packages/design-system/src/index.ts` to understand existing exports.

- [ ] **Step 2: Add ProductTray export**

Add to the composites exports section:

```ts
export { ProductTray } from './composites/ProductTray/index.js'
```

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/index.ts
git commit -m "feat(ds): export ProductTray from design system barrel"
```

---

### Task 3: Add i18n Keys

**Files:**
- Modify: `apps/web/src/lib/i18n/en.json`
- Modify: `apps/web/src/lib/i18n/pt.json`

**Interfaces:**
- Produces: i18n keys for product detail page strings

- [ ] **Step 1: Read current i18n files**

Read both `apps/web/src/lib/i18n/en.json` and `apps/web/src/lib/i18n/pt.json`.

- [ ] **Step 2: Add English keys**

Add to `en.json`:

```json
{
  "product": {
    "contact": "Contact",
    "buy": "Buy",
    "back": "Back",
    "favorite": "Favorite",
    "share": "Share",
    "listings": "{{count}} listings",
    "verified": "Verified",
    "noImages": "No photos available",
    "photo": "Photo {{current}} of {{total}}"
  }
}
```

- [ ] **Step 3: Add Portuguese keys**

Add to `pt.json`:

```json
{
  "product": {
    "contact": "Contatar",
    "buy": "Comprar",
    "back": "Voltar",
    "favorite": "Favoritar",
    "share": "Compartilhar",
    "listings": "{{count}} anuncios",
    "verified": "Verificado",
    "noImages": "Nenhuma foto disponivel",
    "photo": "Foto {{current}} de {{total}}"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/i18n/
git commit -m "feat(i18n): add product detail page translations"
```

---

### Task 4: Integrate into Catalog Page

**Files:**
- Modify: `apps/web/src/routes/catalog/[id]/+page.svelte`

**Interfaces:**
- Consumes: `ImageGallery` (existing), `ProductTray` (Task 1), i18n keys (Task 3)

- [ ] **Step 1: Read current page**

Read `apps/web/src/routes/catalog/[id]/+page.svelte` to understand current structure.

- [ ] **Step 2: Implement product detail page**

Replace or refactor the page to use `ImageGallery` + `ProductTray`:

```svelte
<script lang="ts">
  import { ImageGallery } from '@babyclothes/design-system'
  import { ProductTray } from '@babyclothes/design-system'
  import { BottomNav } from '@babyclothes/design-system'
  import { t } from '$lib/i18n'

  // Mock data - replace with actual API call
  const product = $state({
    title: 'Body Manga Longa',
    detail: 'Algodao organico - Tam 68',
    price: 'R$ 45,90',
    oldPrice: 'R$ 89,90',
    condition: 'Seminovo',
    sizeLabel: 'Tamanho M',
    genderLabel: 'Menina',
    images: [
      '/images/product-1.jpg',
      '/images/product-2.jpg',
      '/images/product-3.jpg',
    ],
    seller: {
      name: 'Maria Silva',
      avatar: '/images/avatar.jpg',
      listings: '12',
      verified: true,
    },
  })

  function handleBack() {
    history.back()
  }

  function handleFavorite() {
    // TODO: implement favorite toggle
  }

  function handleShare() {
    // TODO: implement share
  }

  function handleContact() {
    // TODO: implement contact seller
  }

  function handleBuy() {
    // TODO: implement buy flow
  }

  function handleSellerClick() {
    // TODO: navigate to seller profile
  }
</script>

<div class="product-page">
  <ImageGallery
    images={product.images}
    onBack={handleBack}
    onFav={handleFavorite}
    onShare={handleShare}
    isFavorited={false}
  />

  <ProductTray
    title={product.title}
    detail={product.detail}
    price={product.price}
    oldPrice={product.oldPrice}
    condition={product.condition}
    sizeLabel={product.sizeLabel}
    genderLabel={product.genderLabel}
    sellerName={product.seller.name}
    sellerAvatar={product.seller.avatar}
    sellerListings={product.seller.listings}
    verified={product.seller.verified}
    onContact={handleContact}
    onBuy={handleBuy}
    onSellerClick={handleSellerClick}
  />

  <BottomNav active="catalog" />
</div>

<style>
  .product-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #000;
  }
</style>
```

- [ ] **Step 3: Verify integration**

Run: `yarn check:web` (inside Docker)
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/catalog/[id]/
git commit -m "feat(web): integrate ImageGallery + ProductTray in catalog detail page"
```

---

### Task 5: Add ProductTray Stories

**Files:**
- Create: `packages/design-system/src/composites/ProductTray/ProductTray.stories.ts`

**Interfaces:**
- Consumes: `ProductTray` from Task 1

- [ ] **Step 1: Create stories file**

```ts
import type { Meta, StoryObj } from '@storybook/svelte'
import ProductTray from './ProductTray.svelte'

const meta: Meta<ProductTray> = {
  title: 'Composites/ProductTray',
  component: ProductTray,
  tags: ['autodocs'],
  argTypes: {
    condition: {
      control: 'select',
      options: ['Novo', 'Seminovo', 'Usado'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Body Manga Longa',
    detail: 'Algodao organico - Tam 68',
    price: 'R$ 45,90',
    oldPrice: 'R$ 89,90',
    condition: 'Seminovo',
    sizeLabel: 'Tamanho M',
    genderLabel: 'Menina',
    sellerName: 'Maria Silva',
    sellerListings: '12',
    verified: true,
  },
}

export const NewItem: Story = {
  args: {
    title: 'Sapatinho de Bebe',
    price: 'R$ 35,00',
    condition: 'Novo',
    sizeLabel: 'Tamanho P',
    genderLabel: 'Unissex',
  },
}

export const NoDiscount: Story = {
  args: {
    title: 'Macaquinho Jeans',
    detail: 'Jeans elastico',
    price: 'R$ 65,00',
    condition: 'Usado',
    sizeLabel: 'Tamanho G',
    genderLabel: 'Menino',
  },
}

export const WithActions: Story = {
  args: {
    title: 'Vestido Floral',
    detail: 'Algodao estampado',
    price: 'R$ 55,00',
    oldPrice: 'R$ 95,00',
    condition: 'Seminovo',
    sellerName: 'Ana Santos',
    sellerListings: '8',
    verified: true,
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/design-system/src/composites/ProductTray/ProductTray.stories.ts
git commit -m "docs(ds): add ProductTray Storybook stories"
```

---

### Task 6: Add ProductTray Tests

**Files:**
- Create: `packages/design-system/src/composites/ProductTray/ProductTray.test.ts`

**Interfaces:**
- Consumes: `ProductTray` from Task 1

- [ ] **Step 1: Create test file**

```ts
import { render, screen } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import ProductTray from './ProductTray.svelte'

describe('ProductTray', () => {
  it('renders title', () => {
    render(ProductTray, { props: { title: 'Test Product' } })
    expect(screen.getByText('Test Product')).toBeTruthy()
  })

  it('renders price in pink', () => {
    render(ProductTray, { props: { title: 'Test', price: 'R$ 50,00' } })
    const price = screen.getByText('R$ 50,00')
    expect(price).toBeTruthy()
  })

  it('renders old price with line-through', () => {
    render(ProductTray, {
      props: { title: 'Test', price: 'R$ 50,00', oldPrice: 'R$ 80,00' },
    })
    expect(screen.getByText('R$ 80,00')).toBeTruthy()
  })

  it('renders condition badge', () => {
    render(ProductTray, { props: { title: 'Test', condition: 'Seminovo' } })
    expect(screen.getByText('Seminovo')).toBeTruthy()
  })

  it('renders size and gender badges', () => {
    render(ProductTray, {
      props: { title: 'Test', sizeLabel: 'Tamanho M', genderLabel: 'Menina' },
    })
    expect(screen.getByText('Tamanho M')).toBeTruthy()
    expect(screen.getByText('Menina')).toBeTruthy()
  })

  it('renders seller info', () => {
    render(ProductTray, {
      props: {
        title: 'Test',
        sellerName: 'Maria',
        sellerListings: '12',
        verified: true,
      },
    })
    expect(screen.getByText('Maria')).toBeTruthy()
    expect(screen.getByText('12 anuncios')).toBeTruthy()
  })

  it('calls onContact when contact button clicked', async () => {
    const onContact = vi.fn()
    render(ProductTray, {
      props: { title: 'Test', onContact },
    })
    const button = screen.getByText('Contatar')
    button.click()
    expect(onContact).toHaveBeenCalled()
  })

  it('calls onBuy when buy button clicked', async () => {
    const onBuy = vi.fn()
    render(ProductTray, {
      props: { title: 'Test', onBuy },
    })
    const button = screen.getByText('Comprar')
    button.click()
    expect(onBuy).toHaveBeenCalled()
  })

  it('calls onSellerClick when seller row clicked', async () => {
    const onSellerClick = vi.fn()
    render(ProductTray, {
      props: { title: 'Test', sellerName: 'Maria', onSellerClick },
    })
    const sellerRow = screen.getByRole('button', { name: /Maria/i })
    sellerRow.click()
    expect(onSellerClick).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests**

Run: `yarn test:ui` (inside Docker)
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/composites/ProductTray/ProductTray.test.ts
git commit -m "test(ds): add ProductTray unit tests"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-02-product-tray.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
