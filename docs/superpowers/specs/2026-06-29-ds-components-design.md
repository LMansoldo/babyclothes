# Design System — 24 Missing Components Spec

> **Date**: 2026-06-29
> **Status**: Draft (awaiting review)
> **Context**: Cross-referenced `BabyClothes Mocks.dc.html` (12 screens) against `packages/design-system/src/` (22 existing components). These 24 components exist in the mock but not yet in the design system.

---

## Architecture Decision

**Approach**: Build primitives → composites → patterns, in that order. Each layer depends only on the layer below it.

| Layer | Count | Description |
|-------|-------|-------------|
| Primitives | 8 | Atomic, reusable building blocks. No domain knowledge. |
| Composites | 10 | Molecules composing primitives. Some domain awareness. |
| Patterns | 6 | Domain-specific organisms. Used directly by routes. |

**Tech**: Svelte 5 (`$props()`, `$derived()`, `$bindable()`, Snippets for slots), TypeScript inline types, BEM CSS naming, CSS custom properties from `tokens.css`.

**Font rules**: Display/headings = `--sr` (Cormorant Garamond), Logo = `--ld` (Londrina Solid), Body/labels/buttons = `--font-lato` (Lato). No emojis — use inline SVGs.

---

## Component Catalog

### Primitives (8)

| # | Component | Priority | Mock screens | Key variants |
|---|-----------|----------|-------------|--------------|
| 1 | ProgressBar | High | /child/[id], /sell | pink-gradient, gray, with-label |
| 2 | IconButton | High | /catalog/[id], /child/register, /sell, /login | back, close, fav, share |
| 3 | Chip | High | /catalog, /catalog/[id], /sell | size, condition, gender, category |
| 4 | Toggle | High | /profile | binary switch, chip-toggle |
| 5 | DotIndicator | Medium | /catalog/[id], /catalog | horizontal dots (carousel) |
| 6 | CountBadge | Medium | /profile, /notifications | numeric badge |
| 7 | ProfileBadge | Medium | /profile | role, status, account-type |
| 8 | PriceDisplay | High | /catalog, /catalog/[id] | default, with-old-price |

### Composites (10)

| # | Component | Priority | Mock screens | Composes |
|---|-----------|----------|-------------|----------|
| 9 | SearchBar | High | /catalog | Input + IconButton |
| 10 | ImageGallery | High | /catalog/[id] | DotIndicator + IconButton |
| 11 | SellerRow | High | /catalog/[id] | Avatar + ProfileBadge |
| 12 | PhotoUploader | High | /sell | grid slots + dashed borders |
| 13 | ChildMiniCard | High | /child, /chat | Avatar + Chip + ProgressBar |
| 14 | FormField | High | /child/register, /sell | label + Input + error/suffix |
| 15 | LanguageToggle | Medium | /profile | Chip × 2 (PT-BR / EN) |
| 16 | ActionBar | Medium | /catalog/[id] | IconButton × 3 (back, fav, share) |
| 17 | FilterChipGroup | Medium | /catalog | Chip × N |
| 18 | ChildSelectorChips | Medium | /chat | ChildMiniCard × N + add |

### Patterns (6)

| # | Component | Priority | Mock screens | Composes |
|---|-----------|----------|-------------|----------|
| 19 | LoginCard | High | /login | glass card + Button + terms |
| 20 | RegistrationTypeSelector | High | /login (step registro) | selectable cards PF/PJ |
| 21 | ChildRegistrationForm | High | /child/register | FormField × N + Button |
| 22 | SellFlowForm | High | /sell | ProgressBar + Chip + PhotoUploader + FormField |
| 23 | SettingsList | Medium | /profile | rows + Toggle + CountBadge |
| 24 | MeasurementHistory | Medium | /child/[id] | list rows + add button |

---

## Layer 1 — Primitives

### 1. ProgressBar

**Path**: `packages/design-system/src/primitives/ProgressBar/`

```ts
let {
  value = 0,            // 0–100
  max = 100,
  variant = 'pink',     // 'pink' | 'gray' | 'dark'
  showLabel = false,
  labelFormat,          // (value, max) => string — defaults to "{value}%"
  ariaLabel,
  ariaValueText,        // e.g., "Passo 1 de 2"
  height = 6,           // px, for the bar track
  animated = true,      // CSS transition on width
}: {
  value?: number
  max?: number
  variant?: 'pink' | 'gray' | 'dark'
  showLabel?: boolean
  labelFormat?: (value: number, max: number) => string
  ariaLabel?: string
  ariaValueText?: string
  height?: number
  animated?: boolean
} = $props()
```

**States**: 0%, partial (e.g., 50%, 68%), complete (100%), indeterminate (animated shimmer for loading — future variant).

**Visual variants**:
| Variant | Fill | Track | Usage |
|---------|------|-------|-------|
| `pink` | `linear-gradient(90deg, #FF3CAC, #B03EFF)` | `#F3F4F6` | Growth prediction, sell progress |
| `gray` | `#D1D5DB` | `#F3F4F6` | Secondary indicators (`/child` M→G 32% gray) |
| `dark` | `var(--bk)` | `#F3F4F6` | Sell step progress (Step 1 of 2) |

**Responsive**: Full width of container. Height adapts via prop (6px default, 4px compact).

**Accessibility**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` for step labels.

**CSS tokens**: `--pk`, `--color-pk-purple`, `--bk`, `--gr`

**Usage**:
```svelte
<!-- Growth prediction progress -->
<ProgressBar value={68} variant="pink" showLabel />

<!-- Sell step indicator -->
<ProgressBar value={50} variant="dark" ariaValueText="Passo 1 de 2" />
<ProgressBar value={100} variant="dark" ariaValueText="Passo 2 de 2" />
```

---

### 2. IconButton

**Path**: `packages/design-system/src/primitives/IconButton/`

```ts
let {
  icon,                 // 'back' | 'close' | 'fav' | 'share' | custom Snippet
  variant = 'glass',    // 'glass' | 'ghost' | 'dark'
  size = 32,            // 32 (standard) | 28 (compact)
  active = false,       // for fav — filled state
  ariaLabel,
  onclick,
}: {
  icon: 'back' | 'close' | 'fav' | 'share' | Snippet
  variant?: 'glass' | 'ghost' | 'dark'
  size?: 32 | 28
  active?: boolean
  ariaLabel?: string
  onclick?: () => void
} = $props()
```

**Built-in SVGs**: Back (arrow-left), Close (X), Fav (heart — outline + filled), Share (share icon). Each rendered as inline SVG. Custom icons passed via Snippet.

**States**: default, hover (scale 1.05 or bg shift), active (fav filled = `var(--pk)` fill), focus-visible (2px pink outline ring), disabled (35% opacity, `pointer-events: none`).

**Visual variants**:
| Variant | Background | Border | Usage |
|---------|-----------|--------|-------|
| `glass` | `rgba(255,255,255,0.85)` | none | Product detail (back/fav/share) |
| `ghost` | transparent | none | Header back buttons |
| `dark` | `rgba(0,0,0,0.06)` | none | On light backgrounds |

**Responsive**: Fixed size circle (32px or 28px). No resize.

**Accessibility**: `<button>` with `aria-label` (required prop or derived from icon name). Focus ring `box-shadow: 0 0 0 2px var(--pk)`.

**CSS tokens**: `--pk`, `--bk`, `--wh`, `--glass`

**Usage**:
```svelte
<!-- Product detail action bar -->
<IconButton icon="back" onclick={goBack} ariaLabel="Voltar" />
<IconButton icon="fav" active={isFavorited} onclick={toggleFav} ariaLabel="Favoritar" />
<IconButton icon="share" onclick={share} ariaLabel="Compartilhar" />

<!-- Custom icon via Snippet -->
<IconButton icon={myCustomSvgSnippet} variant="dark" ariaLabel="Menu" />
```

---

### 3. Chip

**Path**: `packages/design-system/src/primitives/Chip/`

```ts
let {
  label,
  variant = 'neutral',  // 'neutral' | 'size' | 'condition' | 'gender' | 'category' | 'selected'
  selected = false,
  size = 'md',          // 'sm' | 'md'
  disabled = false,
  prefixIcon,           // optional Snippet
  onclick,
  ariaLabel,
}: {
  label: string
  variant?: 'neutral' | 'size' | 'condition' | 'gender' | 'category' | 'selected'
  selected?: boolean
  size?: 'sm' | 'md'
  disabled?: boolean
  prefixIcon?: Snippet
  onclick?: () => void
  ariaLabel?: string
} = $props()
```

**States**: default, hover (bg shift), selected (pink bg + pink text or dark bg + white text), disabled (35% opacity, no pointer), focus-visible (2px ring).

**Visual variants**:
| Variant | Default bg | Selected bg | Text color | Usage |
|---------|-----------|-------------|------------|-------|
| `neutral` | `#F3F4F6` | n/a | `var(--bk)` | Generic tag |
| `size` | `#F3F4F6` | `var(--bk)` (black) | white (sel) | M, P, G, GG, RN |
| `condition` | based on value | based on value | contextual | Novo (black bg), Seminovo (`--pk3` bg, pink text), Usado (`#F3F4F6`, gray text) |
| `gender` | `#F3F4F6` | `var(--bk)` | white (sel) | Menina, Menino, Unissex |
| `category` | `#F3F4F6` | `var(--pk3)` + pink border | pink text (sel) | Bodies, Macacão, etc. |
| `selected` | `var(--pk3)` | `var(--pk3)` + 2px `var(--pk)` border | pink | Generic selected state |

**Responsive**: Inline flex. Wraps in group context. `sm` = 0.5rem padding, `md` = 0.65rem padding.

**Accessibility**: If `onclick` provided, renders as `<button>`. Otherwise `<span>`. When button: `role` + `aria-pressed` for toggle behavior. Focus ring on keyboard nav.

**CSS tokens**: `--pk`, `--pk3`, `--bk`, `--wh`, `--gr`

**Usage**:
```svelte
<!-- Size chips in filter bar -->
<Chip variant="size" label="M" selected={true} onclick={toggle} />
<Chip variant="size" label="G" />

<!-- Condition badge on product card -->
<Chip variant="condition" label="Novo" />
<Chip variant="condition" label="Seminovo" />

<!-- Gender filter chip -->
<Chip variant="gender" label="Menina" selected={true} />

<!-- Category chip (sell form step 1) -->
<Chip variant="category" label="Bodies" selected={true} />
```

---

### 4. Toggle

**Path**: `packages/design-system/src/primitives/Toggle/`

```ts
let {
  checked = false,
  disabled = false,
  size = 'md',          // 'sm' | 'md'
  variant = 'switch',   // 'switch' | 'chip'
  onLabel,              // label when checked (chip variant)
  offLabel,             // label when unchecked (chip variant)
  ariaLabel,
  onchange,             // (checked: boolean) => void
}: {
  checked?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'switch' | 'chip'
  onLabel?: string
  offLabel?: string
  ariaLabel?: string
  onchange?: (checked: boolean) => void
} = $props()
```

**States**: unchecked, checked, disabled (35% opacity), focus-visible (pink ring).

**Visual variants**:
| Variant | Appearance | Usage |
|---------|-----------|-------|
| `switch` | iOS-style toggle: track `#D1D5DB` → `var(--pk)` when checked, white knob slides right | Generic on/off (Notification settings) |
| `chip` | Two side-by-side chips (onLabel / offLabel). Selected = `var(--bk)` bg + white text, unselected = `#F3F4F6` | Language toggle (PT-BR / EN) |

**Responsive**: Inline-block. Switch track: `sm` = 32×18px, `md` = 44×24px. Chip: inherits Chip component sizing.

**Accessibility**: `role="switch"`, `aria-checked`, `aria-label`. Click/Space to toggle.

**CSS tokens**: `--pk`, `--bk`, `--wh`, `--gr`

**Usage**:
```svelte
<!-- iOS-style switch -->
<Toggle variant="switch" checked={notificationsEnabled} onchange={toggleNotifs} ariaLabel="Notificações" />

<!-- Language chip toggle (profile) -->
<Toggle variant="chip" onLabel="PT-BR" offLabel="EN" checked={lang === 'pt'} onchange={setLang} />
```

---

### 5. DotIndicator

**Path**: `packages/design-system/src/primitives/DotIndicator/`

```ts
let {
  total,
  current = 0,
  variant = 'light',    // 'light' | 'dark'
  size = 6,             // dot diameter in px
  gap = 6,              // gap between dots in px
}: {
  total: number
  current?: number
  variant?: 'light' | 'dark'
  size?: number
  gap?: number
} = $props()
```

**States**: Each dot is `current`, `inactive`, or (for >10 items) scaled down at edges.

**Visual**:
| Variant | Active dot | Inactive dot |
|---------|-----------|--------------|
| `light` | `var(--wh)` | `rgba(255,255,255,0.35)` |
| `dark` | `var(--bk)` | `#D1D5DB` |

Active dot optionally slightly larger (e.g., 8px vs 6px) and/or with ring.

**Responsive**: Horizontal flex, centered. Dots overflow hidden if >10 by showing 5 visible + ellipsis logic.

**Accessibility**: `role="tablist"`-style if interactive (swipe-to-change). In static use, `aria-hidden="true"` (decorative). Parent carousel should provide SR-visible position text.

**CSS tokens**: `--wh`, `--bk`, `--gr`

**Usage**:
```svelte
<!-- Product image gallery dots -->
<DotIndicator total={4} current={photoIndex} variant="light" />

<!-- Compact usage -->
<DotIndicator total={3} current={0} variant="dark" size={4} gap={4} />
```

---

### 6. CountBadge

**Path**: `packages/design-system/src/primitives/CountBadge/

```ts
let {
  count,
  max = 99,             // numbers above show "{max}+"
  variant = 'dark',     // 'dark' | 'pink' | 'gray'
  size = 'sm',          // 'sm' | 'md'
}: {
  count: number
  max?: number
  variant?: 'dark' | 'pink' | 'gray'
  size?: 'sm' | 'md'
} = $props()
```

**States**: 0 (hidden or gray "0"), 1–N (display number), overflow (>max shows "99+").

**Visual**: Small pill/badge with colored bg and white text.
| Variant | Bg | Usage |
|---------|-----|-------|
| `dark` | `var(--bk)` | "5" in Meus anúncios |
| `pink` | `var(--pk)` | Unread notification count "2" |
| `gray` | `#6B7280` | Inactive counts |

**Sizes**: `sm` = 16px height (0.55rem font), `md` = 20px height (0.65rem font).

**Accessibility**: `aria-label="{count} items"`. Decorative when count=0.

**CSS tokens**: `--pk`, `--bk`, `--wh`

**Usage**:
```svelte
<CountBadge count={5} variant="dark" />   <!-- "5" -->
<CountBadge count={2} variant="pink" />   <!-- "2" -->
<CountBadge count={150} max={99} />       <!-- "99+" -->
```

---

### 7. ProfileBadge

**Path**: `packages/design-system/src/primitives/ProfileBadge/`

```ts
let {
  label,
  variant = 'role',     // 'role' | 'account-type' | 'status'
  status,               // for variant='status': 'online' | 'offline'
}: {
  label: string
  variant?: 'role' | 'account-type' | 'status'
  status?: 'online' | 'offline'
} = $props()
```

**States**: default only (static display badge).

**Visual variants**:
| Variant | Style | Example |
|---------|-------|---------|
| `role` | `var(--pk3)` bg, `var(--pk)` text, 0.6rem font | "Vendedora" |
| `account-type` | `#F3F4F6` bg, `var(--bk)` text | "PF" |
| `status` | depends on `status`: online = green dot + `#ECFDF5` bg, offline = gray dot + `#F3F4F6` bg | "Online" |

Online dot: 6px green `#10B981` circle before label text.

**Responsive**: Inline flex. Fits within a row alongside other badges.

**Accessibility**: `status` variant: `aria-label="{label}, {status}"`. Decorative otherwise.

**CSS tokens**: `--pk`, `--pk3`, `--bk`, `--gr`

**Usage**:
```svelte
<ProfileBadge label="PF" variant="account-type" />
<ProfileBadge label="Vendedora" variant="role" />
<ProfileBadge label="Online" variant="status" status="online" />
```

---

### 8. PriceDisplay

**Path**: `packages/design-system/src/primitives/PriceDisplay/`

```ts
let {
  price,                // number in reais (e.g., 32.00)
  oldPrice,             // optional strikethrough price
  currency = 'BRL',
  locale = 'pt-BR',
  size = 'md',          // 'sm' | 'md' | 'lg'
  color = 'default',    // 'default' (black) | 'pink' (--pk)
}: {
  price: number
  oldPrice?: number
  currency?: string
  locale?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'pink'
} = $props()
```

**States**: default, with old price (shows strikethrough).

**Visual**: Formatted via `Intl.NumberFormat(locale, { style: 'currency', currency })`. Price in Lato 900 weight. Old price in Lato, `--gr2` color, `text-decoration: line-through`, smaller font (0.65rem vs 1rem).

**Sizes**: `sm` = 0.85rem price, `md` = 1rem price, `lg` = 1.25rem price.

**Accessibility**: `<p>` or `<span>`. Old price gets `aria-label="Preço original: R$55,00"`. SR announces "Preço atual: R$32,00. Preço original: R$55,00."

**CSS tokens**: `--pk`, `--bk`, `--gr2`, `--font-lato`

**Usage**:
```svelte
<PriceDisplay price={32.00} oldPrice={55.00} />  <!-- R$32,00 with strikethrough R$55,00 -->
<PriceDisplay price={32.00} color="pink" />       <!-- Pink price only -->
<PriceDisplay price={32.00} size="sm" />           <!-- Compact for card grids -->
```

---

## Layer 2 — Composites

### 9. SearchBar

**Path**: `packages/design-system/src/composites/SearchBar/`

```ts
let {
  placeholder = 'Buscar no catálogo...',
  value = '',
  ariaLabel = 'Buscar itens',
  debounceMs = 300,
  oninput,              // (value: string) => void — debounced
  onsubmit,             // (value: string) => void — on Enter
}: {
  placeholder?: string
  value?: string
  ariaLabel?: string
  debounceMs?: number
  oninput?: (value: string) => void
  onsubmit?: (value: string) => void
} = $props()
```

**States**: empty, focused (bg shift to `#E5E7EB`), with text, disabled.

**Visual**: Pill-shaped (`border-radius: 99rem`), bg `#F3F4F6`, focus-within bg `#E5E7EB`. Search icon (magnifying glass SVG) on the left, clear button (X IconButton variant="ghost" size=28) on the right when text present.

**Responsive**: Full width of container, max-width 40rem. At narrow widths (<360px), placeholder text truncates.

**Accessibility**: `<input type="search">` with `aria-label`. Clear button has `aria-label="Limpar busca"`. `role="search"` on wrapper.

**CSS tokens**: `--bk`, `--gr`, `--font-lato`, `--radius-pill`

**Usage**:
```svelte
<SearchBar placeholder="Buscar no catálogo..." oninput={handleSearch} />
<SearchBar value={query} debounceMs={500} oninput={debouncedSearch} />
```

---

### 10. ImageGallery

**Path**: `packages/design-system/src/composites/ImageGallery/`

```ts
let {
  images,               // string[] — URLs
  initialIndex = 0,
  height = 240,         // px
  showActions = true,   // back/fav/share overlay buttons
  showDots = true,
  onBack,
  onFav,
  onShare,
  isFavorited = false,
}: {
  images: string[]
  initialIndex?: number
  height?: number
  showActions?: boolean
  showDots?: boolean
  onBack?: () => void
  onFav?: () => void
  onShare?: () => void
  isFavorited?: boolean
} = $props()
```

**States**: loading (gradient bg placeholder), loaded, empty (no images — gradient bg with icon), swipe transition between images.

**Visual**: 
- Gradient bg behind images: `linear-gradient(160deg, #0F0F0F, #1A0814, #0A0A1A)`
- Image `object-fit: cover`, full width
- Action bar: 3 IconButtons (back left, fav + share right) — glass variant
- DotIndicator centered at bottom edge
- Content card below has 16px top border-radius overlap

**Responsive**: Image height adapts via prop. At narrow widths, action buttons stay 32px with adequate touch targets (minimum 44px interactive area via padding).

**Swipe**: Touch swipe left/right to change image. CSS `scroll-snap-type: x mandatory` on wrapper, `scroll-snap-align: center` on each image.

**Accessibility**: `aria-roledescription="carousel"`, each image has `aria-roledescription="slide"` and `aria-label="Foto {index+1} de {total}"`. Action buttons have individual `aria-label`s.

**CSS tokens**: `--bk`, `--wh`, `--pk`, `--glass`

**Usage**:
```svelte
<ImageGallery
  images={product.photos}
  onBack={goBack}
  onFav={toggleFavorite}
  onShare={openShare}
  isFavorited={isFav}
/>
```

---

### 11. SellerRow

**Path**: `packages/design-system/src/composites/SellerRow/`

```ts
let {
  name,
  avatar,               // URL string
  verified = false,
  listingCount,         // number of active listings
  listingLabel,         // e.g., "anúncios" (i18n)
  verifiedLabel,        // "Verificada" (i18n)
  onclick,              // navigate to seller profile
}: {
  name: string
  avatar: string
  verified?: boolean
  listingCount?: number
  listingLabel?: string
  verifiedLabel?: string
  onclick?: () => void
} = $props()
```

**States**: default (with avatar), without avatar (initial-based Avatar fallback), without listing count.

**Visual**: Horizontal row: Avatar (32px gradient circle) + name (Lato 700, white) + verified badge SVG (pink checkmark) + listing count (Lato, `--gr2`). Chevron icon on the far right. Top border `rgba(255,255,255,0.06)`.

When `onclick` provided, entire row is clickable (`cursor: pointer`, hover bg shift).

**Responsive**: Single row, flexible. Listing count truncates on very narrow widths.

**Accessibility**: `<button>` if interactive, with `aria-label="Perfil de {name}, {listingCount} {listingLabel}. {verified ? verifiedLabel : ''}"`. Verified SVG has `aria-hidden="true"`.

**CSS tokens**: `--wh`, `--gr2`, `--pk`, `--font-lato`

**Usage**:
```svelte
<SellerRow
  name="Maria Silva"
  avatar="/avatars/maria.jpg"
  verified={true}
  listingCount={12}
  listingLabel="anúncios"
  verifiedLabel="Verificada"
  onclick={goToSellerProfile}
/>
```

---

### 12. PhotoUploader

**Path**: `packages/design-system/src/composites/PhotoUploader/`

```ts
let {
  photos = [],          // { id, url, file }[]
  maxPhotos = 4,
  gridCols = 4,         // 3 | 4
  onAdd,                // () => void — triggers file picker
  onRemove,             // (id: string) => void
}: {
  photos?: { id: string; url?: string; file?: File }[]
  maxPhotos?: number
  gridCols?: 3 | 4
  onAdd?: () => void
  onRemove?: (id: string) => void
} = $props()
```

**States**: empty (all dashed slots), partial (some filled + some dashed), full (all slots filled, no dashed), uploading (overlay spinner on pending slots).

**Visual**: 
- CSS Grid of `gridCols` columns (mock: 4×4)
- Filled slots: image as bg `object-fit: cover`, `border-radius: 0.75rem`
- Empty slots: dashed border `1.5px dashed #D1D5DB`, `border-radius: 0.75rem`, plus icon centered
- Gradient placeholder for first 2 slots (mock: `linear-gradient(135deg, rgba(255,60,172,0.15), rgba(176,62,255,0.15))`)
- Remove button (X IconButton size=28) at top-right of each filled slot

**Responsive**: Grid adapts — on narrow screens (<360px), use 3 columns. Gap: 0.5rem between cells.

**Accessibility**: Each slot is `<button>` with `aria-label="Adicionar foto {index+1}"` or photo preview with `aria-label="Foto {index+1}. Remover?"`. File input is hidden, triggered by Add button.

**CSS tokens**: `--pk`, `--color-pk-purple`, `--gr`, `--radius-md`

**Usage**:
```svelte
<PhotoUploader
  photos={formData.photos}
  maxPhotos={4}
  onAdd={openFilePicker}
  onRemove={removePhoto}
/>
```

---

### 13. ChildMiniCard

**Path**: `packages/design-system/src/composites/ChildMiniCard/`

```ts
let {
  name,
  age,                  // formatted string: "8 meses"
  size,                 // current clothing size: "M"
  avatarUrl,            // optional photo URL
  progress,             // 0–100 for growth progress
  progressLabel,         // e.g., "M → G"
  selected = false,
  sizeLabel,            // "Tamanho M" (i18n)
  onclick,
}: {
  name: string
  age: string
  size: string
  avatarUrl?: string
  progress?: number
  progressLabel?: string
  selected?: boolean
  sizeLabel?: string
  onclick?: () => void
} = $props()
```

**States**: default, selected (pink bg `var(--pk3)` + pink border 2px + shadow), with/without progress bar.

**Visual variants**:

**Compact** (chat selector): Horizontal chip. Gradient Avatar 28px + name + size badge. Selected = pink bg + border.

**Full** (child list): Vertical card. Avatar 48px gradient circle + name/age + SizeBadge + mini ProgressBar below.

**Responsive**: Compact variant is inline flex (wraps in group). Full variant is fixed width card (~10rem).

**Accessibility**: `<button>` with `aria-label="{name}, {age}, {sizeLabel}, {progressLabel} {progress}%"`. `aria-pressed={selected}` when in selector mode.

**CSS tokens**: `--pk`, `--pk3`, `--bk`, `--wh`, `--gr`, `--font-lato`

**Usage**:
```svelte
<!-- Chat child selector -->
<ChildMiniCard name="Sofia" age="8 meses" size="M" selected={true} onclick={select} />

<!-- Child list card -->
<ChildMiniCard name="Sofia" age="8 meses" size="M" progress={68} progressLabel="M → G" />
```

---

### 14. FormField

**Path**: `packages/design-system/src/composites/FormField/`

```ts
let {
  label,
  name,
  type = 'text',        // 'text' | 'date' | 'number' | 'textarea'
  value = '',
  placeholder = '',
  required = false,
  disabled = false,
  error,                // error message string or undefined
  hint,                 // helper text below input
  suffix,               // unit suffix displayed inside/after input (e.g., "g", "cm", "R$")
  prefix,               // unit prefix (e.g., "R$")
  inputmode,            // 'text' | 'numeric' | 'decimal' | 'email'
  oninput,              // (value: string) => void
}: {
  label: string
  name: string
  type?: 'text' | 'date' | 'number' | 'textarea'
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  suffix?: string
  prefix?: string
  inputmode?: 'text' | 'numeric' | 'decimal' | 'email'
  oninput?: (value: string) => void
} = $props()
```

**States**: default, focused, filled, error (red border + error message), disabled (35% opacity), required (asterisk on label).

**Visual**: 
- Label: Lato 700, `--bk`, 0.75rem, uppercase tracking 0.05em
- Input: Lato, `--bk`, bg `#F3F4F6`, `border-radius: 0.75rem`, padding 0.75rem, border 1.5px transparent → `#D1D5DB` on focus
- Error state: border `#EF4444`, error text 0.6rem `#EF4444` below
- Suffix: positioned right inside input (e.g., "g" after weight, "cm" after height)
- Prefix: positioned left inside input (e.g., "R$" before price)

**Responsive**: Full width of form container. Min-width 16rem. Textarea has min-height 5rem.

**Accessibility**: `<label>` linked via `for={name}`. Error connected via `aria-describedby`. Required indicated by both asterisk and `aria-required`.

**CSS tokens**: `--bk`, `--gr`, `--font-lato`, `--radius-md`

**Usage**:
```svelte
<FormField label="Nome" name="name" bind:value={name} required />
<FormField label="Peso ao nascer" name="weight" type="number" suffix="g" inputmode="decimal" />
<FormField label="Altura ao nascer" name="height" type="number" suffix="cm" inputmode="decimal" />
<FormField label="Preço" name="price" type="number" prefix="R$" inputmode="decimal" />
<FormField label="Descrição" name="description" type="textarea" />
<FormField label="Email" name="email" type="text" error="Email inválido" />
```

---

### 15. LanguageToggle

**Path**: `packages/design-system/src/composites/LanguageToggle/`

```ts
let {
  current,              // 'pt' | 'en'
  labels = { pt: 'PT-BR', en: 'EN' },
  onchange,             // (lang: 'pt' | 'en') => void
}: {
  current: 'pt' | 'en'
  labels?: { pt: string; en: string }
  onchange?: (lang: 'pt' | 'en') => void
} = $props()
```

**States**: PT-BR selected, EN selected.

**Visual**: Two Chip components side by side. Selected = `var(--bk)` bg + white text. Unselected = `#F3F4F6` bg + gray text. 2px gap between them.

This is a thin composition over the Toggle primitive (chip variant) but domain-specific enough for i18n to be a composite.

**Accessibility**: `role="radiogroup"` with two `role="radio"` children, `aria-checked` per option. Keyboard: arrow keys switch.

**CSS tokens**: `--bk`, `--wh`, `--gr`, `--font-lato`

**Usage**:
```svelte
<LanguageToggle current="pt" onchange={switchLang} />
```

---

### 16. ActionBar

**Path**: `packages/design-system/src/composites/ActionBar/

```ts
let {
  showBack = true,
  showFav = true,
  showShare = true,
  isFavorited = false,
  onBack,
  onFav,
  onShare,
}: {
  showBack?: boolean
  showFav?: boolean
  showShare?: boolean
  isFavorited?: boolean
  onBack?: () => void
  onFav?: () => void
  onShare?: () => void
} = $props()
```

**States**: Each button can be shown/hidden. Fav has filled/outline state.

**Visual**: Horizontal row of IconButton (glass variant, 32px). Back on left, fav + share on right. Positioned absolute within parent (ImageGallery). When fewer than 3 visible, remaining align accordingly (e.g., only back = back left, fav right).

**Responsive**: Always 32px buttons. At narrow widths, buttons maintain at least 44px touch target via invisible padding.

**Accessibility**: Each button has individual `aria-label`. Group wrapped in `<nav aria-label="Ações do produto">`.

**CSS tokens**: `--glass`, `--pk`, `--wh`

**Usage**:
```svelte
<!-- Full action bar in product detail -->
<ActionBar
  onBack={goBack}
  onFav={toggleFav}
  onShare={share}
  isFavorited={isFav}
/>

<!-- Minimal — only back -->
<ActionBar showFav={false} showShare={false} onBack={goBack} />
```

---

### 17. FilterChipGroup

**Path**: `packages/design-system/src/composites/FilterChipGroup/`

```ts
let {
  label,                // group label for SR (e.g., "Tamanho", "Gênero")
  items,                // { value: string; label: string; selected: boolean }[]
  variant = 'size',     // 'size' | 'gender' | 'category' | 'condition'
  multiselect = false,  // allow multiple selection
  onchange,             // (selectedValues: string[]) => void
}: {
  label: string
  items: { value: string; label: string; selected: boolean }[]
  variant?: 'size' | 'gender' | 'category' | 'condition'
  multiselect?: boolean
  onchange?: (selectedValues: string[]) => void
} = $props()
```

**States**: All unselected, some selected, all selected. In multiselect mode, multiple can be selected. In single-select mode, selecting one deselects others.

**Visual**: Horizontal row of Chip components with gap 0.5rem. Wraps to next line if overflow.

**Responsive**: `display: flex; flex-wrap: wrap; gap: 0.5rem`. Scrolls horizontally if needed (with `overflow-x: auto` and hidden scrollbar) on narrow screens.

**Accessibility**: `role="group"` with `aria-label={label}`. Each chip: `role="checkbox"` if multiselect, `role="radio"` if single-select. Keyboard: Tab to group, arrows to navigate chips, Space to toggle.

**CSS tokens**: Inherited from Chip component.

**Usage**:
```svelte
<!-- Size filter (single select) -->
<FilterChipGroup
  label="Tamanho"
  items={[{ value: 'M', label: 'M', selected: true }, { value: 'G', label: 'G' }]}
  variant="size"
/>

<!-- Gender filter (multi select) -->
<FilterChipGroup
  label="Gênero"
  items={[{ value: 'F', label: 'Menina', selected: true }]}
  variant="gender"
  multiselect
/>
```

---

### 18. ChildSelectorChips

**Path**: `packages/design-system/src/composites/ChildSelectorChips/`

```ts
let {
  children,             // { id, name, age, size, avatarUrl }[]
  selectedId,           // currently selected child id
  onSelect,             // (id: string) => void
  onAdd,                // () => void — navigate to /child/register
  addLabel,             // "+" or i18n label
}: {
  children: { id: string; name: string; age: string; size: string; avatarUrl?: string }[]
  selectedId?: string
  onSelect?: (id: string) => void
  onAdd?: () => void
  addLabel?: string
} = $props()
```

**States**: One child selected, add button visible.

**Visual**: Horizontal row of ChildMiniCard (compact variant) + "+" add button at the end. Add button: 28px circle, `#F3F4F6` bg, `+` icon in `--gr`, `border-radius: 50%`. Wraps within chat header area.

**Responsive**: `display: flex; gap: 0.5rem; overflow-x: auto`. No visible scrollbar. Add button always visible, even during scroll.

**Accessibility**: `role="listbox"` with `aria-label="Selecionar criança"`. Each child chip: `role="option"`, `aria-selected`. Add button: `aria-label="Adicionar criança"`.

**CSS tokens**: `--pk`, `--pk3`, `--bk`, `--gr`, `--font-lato`

**Usage**:
```svelte
<ChildSelectorChips
  children={[
    { id: '1', name: 'Sofia', age: '8 meses', size: 'M' },
    { id: '2', name: 'Mateus', age: '2 anos', size: 'G' },
  ]}
  selectedId="1"
  onSelect={switchChild}
  onAdd={goToRegister}
/>
```

---

## Layer 3 — Patterns

### 19. LoginCard

**Path**: Placement in `apps/web/src/lib/presentation/components/` (auth domain).

```ts
let {
  onGoogleLogin,        // () => void
  onDevLogin,           // () => void — bypass auth for dev
  onNavigateTerms,      // () => void
  onNavigatePrivacy,    // () => void
  isLoading = false,
  error,                // error message string
  heading = 'Bem-vinda',
  tagline,              // optional subtitle
  googleLabel = 'Entrar com Google',
  devLabel = 'Entrar sem autenticação (dev)',
  termsPrefix = 'Ao entrar, você concorda com nossos',
  termsLabel = 'Termos de Uso',
  privacyLabel = 'Política de Privacidade',
}: {
  onGoogleLogin: () => void
  onDevLogin?: () => void
  onNavigateTerms?: () => void
  onNavigatePrivacy?: () => void
  isLoading?: boolean
  error?: string
  heading?: string
  tagline?: string
  googleLabel?: string
  devLabel?: string
  termsPrefix?: string
  termsLabel?: string
  privacyLabel?: string
} = $props()
```

**States**: default, loading (Google button shows Spinner), error (error text below Google button).

**Visual**:
- Glass card: `background: var(--glass)`, `backdrop-filter: var(--glass-blur)`, `border: 1px solid var(--glass-brd)`, `box-shadow: var(--glass-shadow)`, `border-radius: 1rem`
- Logo "BabyClothes" in `--ld` font, 1.6rem
- Heading in `--sr` (Cormorant Garamond), 1.9rem, weight 300
- Optional tagline in Lato, `--gr2`
- Google button: white bg, 1.5px `#D1D5DB` border, `border-radius: 0.625rem` (10px), Lato 700
- Dev login link: Lato, `--pk`, centered, smaller
- Footer: "Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade" in Lato 0.65rem, `--gr2`

**Responsive**: Card max-width 24rem, centered vertically and horizontally. Padding 2rem. At narrow widths (<360px), padding reduces to 1.25rem. Card width becomes fluid (calc(100% - 2rem)).

**Accessibility**: Proper heading hierarchy (h1 for logo or heading). Google button has `aria-label`. Links have proper href or onclick with `role="link"`.

**CSS tokens**: `--glass`, `--glass-blur`, `--glass-brd`, `--glass-shadow`, `--ld`, `--sr`, `--pk`, `--bk`, `--gr2`, `--font-lato`

**Usage**:
```svelte
<LoginCard
  onGoogleLogin={signInWithGoogle}
  onDevLogin={import.meta.env.DEV ? devSignIn : undefined}
  onNavigateTerms={() => goto('/terms')}
  onNavigatePrivacy={() => goto('/privacy')}
  isLoading={authLoading}
  error={authError}
/>
```

---

### 20. RegistrationTypeSelector

**Path**: `apps/web/src/lib/presentation/components/` (auth domain). Already partially exists as `RegistrationForm.svelte` but extracted here as the PF/PJ card selector.

```ts
let {
  selectedType,         // 'pf' | 'pj'
  onSelect,             // (type: 'pf' | 'pj') => void
  pfLabel = 'Pessoa Física',
  pfDescription = 'Para comprar e vender como pessoa física',
  pjLabel = 'Pessoa Jurídica',
  pjDescription = 'Para lojas e vendedores profissionais',
}: {
  selectedType?: 'pf' | 'pj'
  onSelect?: (type: 'pf' | 'pj') => void
  pfLabel?: string
  pfDescription?: string
  pjLabel?: string
  pjDescription?: string
} = $props()
```

**States**: PF selected, PJ selected, none selected.

**Visual**:
- Two selectable cards in horizontal layout
- PF card: icon-left (Person SVG in 40px `#FFE8F5` circle), text-center (label + description), checkmark-right (18px `var(--pk)` circle with white check)
- PJ card: same layout, icon in `#ECEAE6` circle
- Selected state: 2px `var(--pk)` border, `box-shadow: 0 0 0 4px rgba(255,60,172,0.12)`
- Unselected: 1.5px `#EDE9E4` border, no shadow

**Responsive**: Horizontal layout with `gap: 0.75rem`. At narrow widths (<360px), cards stack vertically.

**Accessibility**: `role="radiogroup"` with two `role="radio"` children. Arrow keys to switch. Each card gets `aria-label="{label}, {description}"`.

**CSS tokens**: `--pk`, `--pk3`, `--of2`, `--bk`, `--gr`, `--sr`, `--font-lato`

**Usage**:
```svelte
<RegistrationTypeSelector selectedType="pf" onSelect={setType} />
```

---

### 21. ChildRegistrationForm

**Path**: `apps/web/src/lib/presentation/components/` (child domain).

```ts
let {
  onsubmit,             // (data: ChildFormData) => void
  isLoading = false,
  error,
  heading = 'Nova criança',
  submitLabel = 'Cadastrar criança',
}: {
  onsubmit?: (data: ChildFormData) => void
  isLoading?: boolean
  error?: string
  heading?: string
  submitLabel?: string
} = $props()

// Internal type
type ChildFormData = {
  name: string
  birthDate: string
  birthWeight: number   // grams
  birthHeight: number   // cm
  document?: string     // optional
}
```

**States**: empty form, partially filled, submitting (button spinner), validation error (per-field errors), submission error (form-level error message).

**Visual**:
- Heading in `--sr` (Cormorant Garamond), 1.35rem
- FormField components: Nome, Data de nascimento (type="date"), Peso ao nascer (suffix="g"), Altura ao nascer (suffix="cm"), Documento (optional, no suffix)
- Submit button: full width, pink gradient (`linear-gradient(135deg, #FF3CAC, #B03EFF)`), white text, Lato 700, `border-radius: 0.75rem`, padding 0.75rem

**Validation**:
- Name: required, min 2 chars
- Birth date: required, must be in the past, child must be < 18 years
- Birth weight: required, 500–8000g range
- Birth height: required, 20–80cm range
- Document: optional, CPF format validation

**Responsive**: Full width, max-width 28rem. Fields stack vertically with 1rem gap.

**Accessibility**: `<form>` with `aria-label`. Each field has error message linked via `aria-describedby`. Submit button disabled during loading.

**CSS tokens**: `--pk`, `--color-pk-purple`, `--sr`, `--bk`, `--gr`, `--font-lato`

**Usage**:
```svelte
<ChildRegistrationForm
  onsubmit={handleRegister}
  isLoading={submitting}
  error={serverError}
/>
```

---

### 22. SellFlowForm

**Path**: `apps/web/src/lib/presentation/components/` (sell domain). Note: Existing `ItemForm.svelte` covers some of this; this spec defines the complete 2-step flow.

```ts
let {
  step = 1,             // 1 | 2
  onStepComplete,       // (step: 1 | 2) => void — called when Continue clicked
  onSubmit,             // (data: SellFormData) => void — final submission
  isLoading = false,
  error,
  categories,           // { value: string; label: string }[]
  sizes,                // string[]
  conditions,           // string[]
  genders,              // string[]
}: {
  step?: 1 | 2
  onStepComplete?: (step: 1 | 2) => void
  onSubmit?: (data: SellFormData) => void
  isLoading?: boolean
  error?: string
  categories: { value: string; label: string }[]
  sizes: string[]
  conditions: string[]
  genders: string[]
} = $props()

type SellFormData = {
  title: string
  category: string
  size: string
  condition: string
  gender: string
  photos: { id: string; file: File }[]
  price: number
  description: string
}
```

**States**: Step 1 (info), Step 2 (photos + price + description), submitting, validation error.

**Visual:**

**Step 1** ("Passo 1 de 2"):
- ProgressBar 50% with dark variant, label "Passo 1 de 2" above
- FormField: Título (text input)
- FilterChipGroup: Categoria (category variant, single select)
- FilterChipGroup: Tamanho (size variant, single select)
- FilterChipGroup: Condição (condition variant, single select)
- FilterChipGroup: Gênero (gender variant, single select)
- Continue button: black bg, white text, full width, `border-radius: 0.75rem`, Lato 700

**Step 2** ("Passo 2 de 2"):
- ProgressBar 100% with dark variant, label "Passo 2 de 2" above
- PhotoUploader: 4 slots, 4 columns
- FormField: Preço (prefix="R$", type="number")
- FormField: Descrição (type="textarea", optional)
- Submit button: pink gradient, white text, full width, label "Publicar anúncio"

**Validation (step 1)**: All fields required.
**Validation (step 2)**: At least 1 photo required. Price required, > 0.

**Responsive**: Full width form, max-width 32rem. At narrow widths, FilterChipGroups wrap to multiple rows.

**Accessibility**: Multi-step form with `aria-label="Criar anúncio"`. Progress announced with `aria-valuetext`. Each step is wrapped in `<fieldset>` with `<legend>` (visually hidden). Error summary at top if validation fails.

**CSS tokens**: `--pk`, `--bk`, `--wh`, `--gr`, `--font-lato`

**Usage**:
```svelte
<SellFlowForm
  step={currentStep}
  categories={categoryOptions}
  sizes={['RN', 'P', 'M', 'G', 'GG']}
  conditions={['Novo', 'Seminovo', 'Usado']}
  genders={['Menina', 'Menino', 'Unissex']}
  onStepComplete={handleStepComplete}
  onSubmit={handlePublish}
/>
```

---

### 23. SettingsList

**Path**: `apps/web/src/lib/presentation/components/` (profile domain).

```ts
let {
  items,                // SettingsItem[]
}: {
  items: SettingsItem[]
} = $props()

type SettingsItem =
  | { type: 'link'; label: string; href?: string; count?: number; onclick?: () => void }
  | { type: 'toggle'; label: string; checked: boolean; onchange: (checked: boolean) => void }
  | { type: 'language'; label: string; currentLang: 'pt' | 'en'; onchange: (lang: 'pt' | 'en') => void }
  | { type: 'action'; label: string; variant: 'default' | 'danger'; onclick: () => void }
```

**States**: Each item type has its own states:
- link: default, with count badge, without count
- toggle: on/off
- language: PT-BR selected / EN selected
- action: default, danger (red text)

**Visual**: Vertical list of rows, each with:
- Left: label (Lato, `--bk`, 0.85rem)
- Right: depends on type:
  - link: chevron SVG + optional CountBadge
  - toggle: Toggle component (switch variant)
  - language: LanguageToggle component
  - action (danger): red text only, no chevron

Each row: padding 1rem vertical, bottom border `1px solid #F3F4F6`. Last item has no border.

**Responsive**: Full width, min touch target 44px per row.

**Accessibility**: Each row is a `<button>` (link/action) or contains interactive controls (toggle/language). Link rows: `aria-label="{label}, {count} items"` when count present. Danger action: red text passes 4.5:1 contrast on `#F8F5F2` bg.

**CSS tokens**: `--bk`, `--pk`, `--gr`, `--font-lato`

**Usage**:
```svelte
<SettingsList items={[
  { type: 'link', label: 'Meus anúncios', href: '/profile/listings', count: 5 },
  { type: 'language', label: 'Idioma', currentLang: 'pt', onchange: setLang },
  { type: 'toggle', label: 'Notificações', checked: true, onchange: toggleNotifs },
  { type: 'link', label: 'Ajuda', href: '/help' },
  { type: 'action', label: 'Sair da conta', variant: 'danger', onclick: logout },
]} />
```

---

### 24. MeasurementHistory

**Path**: `apps/web/src/lib/presentation/components/` (child domain).

```ts
let {
  childId,
  measurements,         // Measurement[]
  onAdd,                // () => void — navigate to add measurement
  addLabel = 'Adicionar',
  onViewAll,            // () => void
}: {
  childId: string
  measurements: Measurement[]
  onAdd?: () => void
  addLabel?: string
  onViewAll?: () => void
} = $props()

type Measurement = {
  date: string          // ISO date
  formattedDate: string // e.g., "Jun 2026"
  age: string           // e.g., "8 meses"
  weight: string        // e.g., "8.2 kg"
  height: string        // e.g., "68 cm"
  size: string          // e.g., "M"
}
```

**States**: empty (no measurements — EmptyState), with data (list of rows), loading (Spinner).

**Visual**:
- Section header: "Medidas" in `--sr` (Cormorant), 1.1rem, + Add button (text link, `--pk`) on right
- List rows: each shows date + age left, weight/height center, SizeBadge right
- Row styling: subtle bottom border `1px solid #F3F4F6`, Lato font
- Size badge: Chip with variant="size", selected style (dark bg, white text)

**Date grouping**: If multiple measurements exist, group by month/year with a subtle divider label (e.g., "Junho 2026", "Maio 2026").

**Responsive**: Full width. On narrow screens, weight + height stack vertically within row.

**Accessibility**: `<ul>` with `<li>` items. Each row: `aria-label="{date}: {weight}, {height}, tamanho {size}"`. Add button is standard `<button>`.

**CSS tokens**: `--sr`, `--pk`, `--bk`, `--gr`, `--font-lato`

**Usage**:
```svelte
<MeasurementHistory
  childId="1"
  measurements={[
    { date: '2026-06-01', formattedDate: 'Jun 2026', age: '8 meses', weight: '8.2 kg', height: '68 cm', size: 'M' },
    { date: '2026-05-01', formattedDate: 'Mai 2026', age: '7 meses', weight: '7.8 kg', height: '65 cm', size: 'P' },
  ]}
  onAdd={goToAddMeasurement}
/>
```

---

## Implementation Sequence

Build order respects the dependency chain. Primitives must be built first since composites compose them.

### Phase 1 — Primitives (Critical Path)
**Order**: Chip → ProgressBar → IconButton → PriceDisplay → Toggle → DotIndicator → CountBadge → ProfileBadge

- Chip is the most depended-on primitive (used by FilterChipGroup, ChildMiniCard, MeasurementHistory, and directly by routes)
- ProgressBar is needed for GrowthChart (existing), ChildMiniCard, SellFlowForm
- IconButton is needed by ImageGallery, ActionBar, SearchBar

### Phase 2 — Composites
**Order**: FormField → FilterChipGroup → SearchBar → SellerRow → ChildMiniCard → LanguageToggle → ActionBar → ImageGallery → PhotoUploader → ChildSelectorChips

- FormField is the foundation for all form patterns
- FilterChipGroup depends on Chip
- ImageGallery depends on DotIndicator + IconButton + ActionBar

### Phase 3 — Patterns
**Order**: LoginCard → RegistrationTypeSelector → ChildRegistrationForm → SellFlowForm → SettingsList → MeasurementHistory

- LoginCard and RegistrationTypeSelector are independent
- ChildRegistrationForm depends on FormField
- SellFlowForm depends on ProgressBar + FilterChipGroup + PhotoUploader + FormField
- SettingsList depends on Toggle + LanguageToggle + CountBadge
- MeasurementHistory depends on Chip + EmptyState (already in DS)

### Phase 4 — Integration & Cleanup
- Wire components into their respective routes (`/login`, `/catalog/[id]`, `/child`, `/child/register`, `/child/[id]`, `/chat`, `/sell`, `/profile`)
- Remove duplicate components in `apps/web/src/lib/presentation/components/` that were migrated to DS
- Update `packages/design-system/src/index.ts` barrel exports for all new components
- Add Storybook stories for each new component
- Add unit tests for primitives and composites (not patterns, which are integration tested)

---

## Cross-Cutting Concerns

### i18n

All user-facing strings must be wrapped in `$t()` or passed as props with defaults. Component pattern:

```ts
let {
  label,           // REQUIRED: caller passes $t('key')
  ariaLabel,       // REQUIRED: caller passes $t('key')
} = $props()
```

The DS does NOT import i18n directly — callers are responsible for providing translated strings. This keeps the DS framework-agnostic.

### Accessibility Checklist (per component)

- [ ] All interactive elements are `<button>`, `<input>`, or have `role` + keyboard handlers
- [ ] All icons/images have `aria-hidden="true"` or `aria-label`
- [ ] Focus order is logical and visible (`:focus-visible` ring using `var(--pk)`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Touch targets are minimum 44×44px (Apple HIG) — achieved via padding on smaller buttons
- [ ] Forms have proper `<label>` + `<input>` associations and error messaging via `aria-describedby`

### testing

- **Primitives**: Unit tests via Vitest + `@testing-library/svelte`. Test each prop combination, state transition, and accessibility attributes.
- **Composites**: Unit + integration tests. Verify composition of primitives works correctly.
- **Patterns**: Page-level integration tests in `apps/web` (already set up with existing test infrastructure).

### CSS Conventions

- BEM naming: `.block__element--modifier`
- All colors via CSS custom properties (`var(--pk)`, not `#FF3CAC`)
- Glass morphism uses the token system: `--glass`, `--glass-blur`, `--glass-brd`, `--glass-shadow`
- No hardcoded `px` values for spacing that should scale — use rem
- Gradient definition: `linear-gradient(135deg, #FF3CAC, #B03EFF)` is consistent across all components

---

## Dependencies Between Components

```
Chip ──────────────► FilterChipGroup ──────► SellFlowForm
                   ► ChildMiniCard ────────► ChildSelectorChips
                   ► MeasurementHistory

ProgressBar ───────► ChildMiniCard
                   ► SellFlowForm
                   ► (existing: GrowthChart)

IconButton ────────► ActionBar ─────────────► ImageGallery
                   ► SearchBar
                   ► ImageGallery

DotIndicator ──────► ImageGallery

Toggle ────────────► LanguageToggle ────────► SettingsList
                   ► SettingsList

CountBadge ────────► SettingsList

FormField ─────────► ChildRegistrationForm
                   ► SellFlowForm

PriceDisplay ──────► (used directly in routes)

PhotoUploader ─────► SellFlowForm

ProfileBadge ──────► (used directly in routes)
                   ► SellerRow

Avatar (existing) ─► SellerRow
                   ► ChildMiniCard

Button (existing) ─► LoginCard
                   ► ChildRegistrationForm
                   ► SellFlowForm
```

---

## Spec Self-Review

- **Placeholder scan**: No TBDs or TODOs. All 24 components have complete prop interfaces, state definitions, visual descriptions, and usage examples.
- **Internal consistency**: All components reference tokens defined in `tokens.css`. All type patterns match existing DS conventions (inline TypeScript, `$props()`, Snippets for slots).
- **Scope check**: This is a large spec but is correctly decomposed into 24 discrete components. Each is independently buildable. No component spans more than one responsibility.
- **Ambiguity check**: Prop names are explicit. Variant values are string unions (not booleans that could be misinterpreted). State transitions are well-defined.

After review and approval, the next step is to invoke the writing-plans skill to create a detailed implementation plan for these 24 components.
