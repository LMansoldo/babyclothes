# Design System Alignment — Spec

**Data:** 2026-06-29  
**Escopo:** `packages/design-system` · correção de divergências com o mock `BabyClothes Design System.dc.html`  
**Abordagem:** Opção A — corrigir apenas as divergências visuais; não reescrever código que já está correto.  
**Pós-alinhamento:** migrar `apps/web` para importar de `packages/design-system` e remover `packages/ui`.

---

## 1. Referência

Mock: `BabyClothes architecture diagrams/BabyClothes Design System.dc.html`  
Arquivo de tokens: `packages/design-system/src/tokens/tokens.css`

---

## 2. Correções por arquivo

### 2.1 `src/tokens/tokens.css`

| Variável | Atual | Correto |
|---|---|---|
| `--color-glass` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.15)` |

---

### 2.2 `src/primitives/Avatar/Avatar.svelte`

| Item | Atual | Correto |
|---|---|---|
| `pk` gradient end | `#A855F7` | `#B03EFF` |
| `of` background | `var(--color-bg-2)` sólido | `linear-gradient(135deg,#D1D5DB,#9CA3AF)` |
| `of` color | `var(--color-gray)` | `#fff` |
| Online border-width | `0.15rem` | `2px` |
| Verified size | `36% × 36%` relativo | `1.1rem × 1.1rem` absoluto |

---

### 2.3 `src/primitives/Badge/Badge.svelte`

| Item | Atual | Correto |
|---|---|---|
| `text-transform` | `uppercase` | remover |
| `letter-spacing` | `0.07em` | remover |
| Font-size sm | `0.54rem` | `0.65rem` |
| Font-size md | `0.62rem` | `0.75rem` |
| Font-size lg | `0.72rem` | `0.85rem` |
| Padding sm | `0.2rem 0.6rem` | `0.2rem 0.5rem` |
| Padding md | `0.3rem 0.8rem` | `0.25rem 0.6rem` |
| Padding lg | `0.4rem 1rem` | `0.3rem 0.75rem` |
| `pk-soft` bg | `--color-pink-soft` (#FFD6EE) | `--color-pk-soft` (#FFE8F5) |
| `neutral` bg | `var(--color-bg-2)` (#ECEAE6) | `#F3F4F6` |
| `neutral` color | `var(--color-black)` | `#374151` |
| `amber` color | `#B45309` | `#92400E` |

---

### 2.4 `src/primitives/Button/Button.svelte`

| Item | Atual | Correto |
|---|---|---|
| `secondary` bg | `var(--color-white)` | `#F3F4F6` |
| `secondary` border | `0.15rem solid var(--color-black)` | nenhuma |
| `ghost` border | `0.15rem solid rgba(10,10,10,.2)` | `1.5px solid #111` |
| `ghost-pk` border | `0.15rem solid var(--color-pink-light)` | `1.5px solid var(--color-pink)` |
| `ghost-inv` border-opacity | `rgba(255,255,255,.35)` | `rgba(255,255,255,.4)` |
| `md` padding horizontal | `1rem` | `1.1rem` |
| Spinner size | `1.4rem × 1.4rem` | `14px × 14px` |
| gap | `0.8rem` | `0.5rem` |

---

### 2.5 `src/primitives/FilterBar/FilterBar.svelte`

Esta é a maior revisão. O chip padrão passa de outline para filled.

| Item | Atual | Correto |
|---|---|---|
| Chip default unselected bg | `transparent` | `#F3F4F6` |
| Chip default unselected color | `var(--color-black)` | `#374151` |
| Chip default unselected border | `0.15rem solid var(--color-black)` | nenhuma |
| Chip default selected bg | `var(--color-black)` | `#111` (ok, manter) |
| Padding md | `0.8rem 1.8rem` | `0.35rem 0.75rem` |
| Font-size md | `0.72rem` | `0.8rem` |
| Gap | `0.8rem` | `0.5rem` |
| `text-transform` | `uppercase` | remover |
| `letter-spacing` | `0.05em` | remover |
| `pk` unselected bg | `transparent` | `#FFE8F5` |
| `pk` unselected color | `var(--color-pink)` | `#FF3CAC` |
| `pk` unselected border | `0.15rem solid var(--color-pink)` | nenhuma |
| `on-dark` unselected bg | `rgba(255,255,255,0.35)` | `rgba(255,255,255,.15)` |
| `on-dark` unselected color | `var(--color-white)` | `rgba(255,255,255,.85)` |
| Count badge bg | `var(--color-bg-2)` | `#E5E7EB` |
| Count badge color | `var(--color-black)` | `#6B7280` |
| Count badge min-width | `1.8rem` | remover (só padding) |
| Count badge height | `1.8rem` | remover |

---

### 2.6 `src/primitives/Input/Input.svelte`

| Item | Atual | Correto |
|---|---|---|
| Border default | `rgba(0,0,0,.12)` | `#D1D5DB` |
| Label color | `var(--color-black)` | `#374151` |
| Feedback font-size | `0.78rem` | `0.7rem` |

---

### 2.7 `src/primitives/Spinner/Spinner.svelte`

✅ Correto — sem alterações.

---

### 2.8 `src/primitives/Toast/Toast.svelte`

| Item | Atual | Correto |
|---|---|---|
| Title font-size | `0.78rem` | `0.8rem` |
| Message font-size | `0.82rem` | `0.75rem` |
| Close button | círculo com `background: rgba(0,0,0,.06)` | sem background (só o ícone X) |

---

### 2.9 `src/composites/Card/Card.svelte`

| Item | Atual | Correto |
|---|---|---|
| Condition "Novo" | bg verde semi-transparente + borda | `bg:#111; color:#fff; border-radius:99rem; sem borda` |
| Condition "Seminovo" | `rgba(255,214,238,0.6)` + borda rosa | `bg:#FFE8F5; color:#FF3CAC; border-radius:99rem; sem borda` |
| Condition "Usado" | cinza semi-transparente + borda | `bg:#F3F4F6; color:#374151; border-radius:99rem; sem borda` |
| Condition font-size | `0.5rem` uppercase | `0.65rem` normal case |
| Título (sm/md/lg) | `0.72rem` (todos) | `0.8rem / 0.85rem / 0.9rem` |
| Detalhe (sm/md/lg) | `0.65rem` (todos) | `0.7rem / 0.72rem / 0.75rem` |
| Preço (sm/md/lg) | `0.85rem` (todos) | `1rem / 1.05rem / 1.1rem` |
| Detalhe font-size | `0.65rem` | `0.7rem` (sm), `0.72rem` (md), `0.75rem` (lg) |

---

### 2.10 `src/composites/ChatInput/ChatInput.svelte`

| Item | Atual | Correto |
|---|---|---|
| Chip bg | `rgba(255,214,238,0.3)` | `#FFE8F5` |
| Chip border | `rgba(255,110,199,0.3)` | `1.5px solid #FFD0ED` |
| Chip text-transform | `uppercase` + letter-spacing | normal |
| Add button bg | `var(--color-white)` | `#F3F4F6` |
| Add button border | `0.1rem solid #EDE9E4` | nenhuma |
| Textarea border | nenhuma | `1.5px solid #D1D5DB` |
| Textarea border-radius | `var(--r-sm)` | `1.25rem` |

---

### 2.11 `src/composites/Modal/Modal.svelte`

| Item | Atual | Correto |
|---|---|---|
| `danger` border | `0.15rem solid #DC2626` | `1.5px solid #FEE2E2` |
| `pk` border | `0.15rem solid var(--color-pink-light)` | `1.5px solid #FFD0ED` |
| Icon size | `3.2rem × 3.2rem` | `2rem × 2rem` |
| Title font-size | `0.9rem` | `1rem` |

---

### 2.12 `src/patterns/ChatBubble/ChatBubble.svelte`

**Prioridade alta — font-size está 50% maior que o mock.**

| Item | Atual | Correto |
|---|---|---|
| Font-size (base) | `1.3rem` | `0.875rem` |
| Padding | `1rem 1.4rem` | `0.75rem 1rem` |
| Agent bubble bg | `var(--glass)` (0.52 opacidade) | `rgba(255,255,255,.12)` |
| Agent bubble border | `var(--glass-brd)` (0.75 opacidade) | `rgba(255,255,255,.15)` |
| Timestamp size | `1rem` | `0.62rem` |
| Timestamp color (agent) | `var(--gr)` cinza | `rgba(255,255,255,.4)` |
| Timestamp color (user) | `var(--gr)` | `#9CA3AF` |
| System bubble bg | `rgba(255,60,172,0.08)` | `rgba(255,232,245,.12)` |
| System bubble border | `rgba(255,60,172,0.2)` | `rgba(255,60,172,.3)` |
| System bubble color | `var(--pk)` | `#FF85CC` |

---

### 2.13 `src/patterns/ItemCard/ItemCard.svelte`

| Item | Atual | Correto |
|---|---|---|
| Border | `rgba(0,0,0,0.06)` quase invisível | `1.5px solid #EDE9E4` |
| Border-radius | `var(--radius-md)` (0.75rem) | `1.25rem` |
| Foto height | `aspect-ratio: 1` | `height: 200px` |
| Fav button size | `3.2rem × 3.2rem` | `2rem × 2rem` |
| Title font-size | `0.82rem` | `1rem` |
| Price font-size | `0.9rem` | `1.25rem` |
| OldPrice | prop existe, não renderiza | renderizar com `font-size:0.8rem; color:#9CA3AF; text-decoration:line-through` |
| Seller row | sem border-bottom | adicionar `border-bottom:1px solid #F3F4F6` |
| Seller listings | não renderiza | exibir `{sellerListings} anúncios` em `0.7rem color:#9CA3AF` |
| Seller avatar gradient | `#7b2ff7` | `#B03EFF` |
| Seller verified | texto label → | ícone dot rosa + checkmark SVG |
| Action font-family | `var(--ld)` Londrina | `var(--font-lato)` |
| Action border-radius | `0.8rem` | `0.5rem` |
| Buy button box-shadow | nenhuma | `0 4px 12px rgba(255,60,172,.28)` |

---

### 2.14 `src/patterns/GrowthChart/GrowthChart.svelte`

| Item | Atual | Correto |
|---|---|---|
| Container bg | `var(--glass)` (0.52) | `rgba(255,255,255,.75)` |
| Container border | `var(--glass-brd)` (rgba branco) | `1.5px solid #EDE9E4` |
| Container border-radius | `var(--r)` (0.75rem) | `1.5rem` |
| Size "current" block | glass box `border-radius:1rem` | caixa `3.25rem × 3.25rem; border-radius:0.75rem; bg:#111` |
| Size "next" block | glass box pk-soft | caixa `3.25rem × 3.25rem; border-radius:0.75rem; bg:linear-gradient(135deg,#FF3CAC,#B03EFF)` |
| Days counter | não renderiza | exibir "em aprox. X dias" com `1.25rem font-weight:900` |
| Progress border-radius | `0.3rem` | `99rem` |
| Progress gradient purple | `#7b2ff7` | `#B03EFF` |
| Timeline | dots grandes `3.6rem` | linha horizontal com pontos `0.55rem`/`0.7rem` conectados |
| CTA border-radius | `1rem` | `0.75rem` |
| CTA background | `var(--pk)` sólido | `linear-gradient(135deg,#FF3CAC,#B03EFF)` |
| CTA width | não definido | `width: 100%` |
| Description font | `var(--sr)` italic | `font-family:var(--font-lato); font-size:0.78rem; não italic` |

---

### 2.15 `src/patterns/NotificationCard/NotificationCard.svelte`

| Item | Atual | Correto |
|---|---|---|
| Layout | timeAgo/dot na coluna direita | timeAgo abaixo do body; dot ao lado do título |
| Unread bg | `var(--color-pink-soft)` (#FFD6EE) | `#FFF9FC` |
| Icon | ponto colorido pequeno | círculo `2.5rem × 2.5rem` com ícone SVG |
| Icon unread bg | dot colorido | `#FFE8F5` |
| Icon read bg | dot cinza | `#F3F4F6` |
| Body font | `var(--font-body)` Cormorant | `var(--font-lato)` |
| Body font-size | `0.78rem` | `0.75rem` |
| Body overflow | `nowrap + ellipsis` | multi-line, `line-height:1.5` |
| Body color | `var(--color-gray)` | `#6B7280` |
| TimeAgo position | coluna direita | abaixo do body |
| TimeAgo font-size | `0.62rem` | `0.65rem` |
| Unread dot position | coluna direita | inline ao lado do título |

---

### 2.16 `src/patterns/BottomNav/BottomNav.svelte`

| Item | Atual | Correto |
|---|---|---|
| Background | `rgba(255,255,255,0.38)` | `rgba(255,255,255,.88)` |
| Backdrop-filter | `blur(2.4rem) saturate(170%)` | `blur(12px)` |
| Label text-transform | `uppercase` | remover |
| Label letter-spacing | `0.07em` | remover |

---

### 2.17 `src/patterns/TopBar/TopBar.svelte`

| Item | Atual | Correto |
|---|---|---|
| Background | `rgba(255,255,255,0.38)` | `rgba(255,255,255,.88)` |
| Backdrop-filter | `var(--glass-blur)` | `blur(12px)` |
| Logo font-size | `1.5rem` | `0.82rem` |
| Search bg | `rgba(255,255,255,0.38)` + glass | `#F3F4F6` sólido |
| Search border | glass border | nenhuma |
| "Chat IA" border-radius | `var(--r-sm)` (0.375rem) | `99rem` pill |
| "Chat IA" border | `var(--glass-line)` | `1.5px solid #D1D5DB` |
| "Publicar" border-radius | `var(--r-sm)` | `99rem` pill |

---

## 3. Componentes sem divergências ou fora do mock

Sem alterações necessárias: **Spinner**, **Carousel**, **ItemList**, **PageHeader**, **EmptyState**, **CategoryTabNav**, **ChatHeader**.

> Carousel, ItemList, PageHeader, EmptyState, CategoryTabNav e ChatHeader não estão documentados no mock HTML — mantêm implementação atual.

---

## 4. Migração `apps/web` → `packages/design-system`

Após corrigir todos os componentes acima:

1. Instalar `@babyclothes/design-system` como dependência em `apps/web/package.json`
2. Atualizar todos os imports em `apps/web/src/` de `@babyclothes/ui` para `@babyclothes/design-system`
3. Importar `tokens.css` e `brand.css` no `apps/web/src/app.postcss` ou `app.html`
4. Remover `packages/ui` do monorepo (pasta + entrada em `package.json` raiz)
5. Verificar que `apps/web` compila e os componentes renderizam corretamente

---

## 5. Critério de conclusão

- Todos os componentes listados nas seções 2.x visualmente idênticos ao mock
- `apps/web` importa somente de `@babyclothes/design-system`
- `packages/ui` removido
- `yarn build` sem erros
