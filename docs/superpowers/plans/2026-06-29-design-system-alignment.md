# Design System Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir todas as divergências visuais entre `packages/design-system` e o mock `BabyClothes Design System.dc.html`, depois migrar `apps/web` para usar o design-system e remover `packages/ui`.

**Architecture:** Correções diretas nos arquivos `.svelte` existentes — sem criar novos componentes. Mudanças são majoritariamente CSS (sem quebrar testes existentes que validam apenas class names). Mudanças estruturais de template (ItemCard, NotificationCard, GrowthChart) exigem atualização de testes.

**Tech Stack:** Svelte 5, TypeScript, Vitest, @testing-library/svelte, Yarn 4 workspaces (PnP)

## Global Constraints

- Não criar novos componentes — só corrigir os existentes
- Não adicionar emojis
- Não alterar lógica de negócio — apenas visual (CSS + template mínimo)
- Testes rodam com: `yarn workspace @babyclothes/design-system test` (requer Docker) ou `cd packages/design-system && yarn test` (local)
- Commit semântico após cada task: `fix(ds): ...`
- Spec: `docs/superpowers/specs/2026-06-29-design-system-alignment-design.md`

---

## Arquivos Modificados

| Arquivo | Tipo de mudança |
|---|---|
| `packages/design-system/src/tokens/tokens.css` | CSS — `--color-glass` |
| `packages/design-system/src/primitives/Avatar/Avatar.svelte` | CSS — gradiente, fill `of` |
| `packages/design-system/src/primitives/Badge/Badge.svelte` | CSS — tamanhos, cores, uppercase |
| `packages/design-system/src/primitives/Button/Button.svelte` | CSS — `secondary`, `ghost`, spinner |
| `packages/design-system/src/primitives/FilterBar/FilterBar.svelte` | CSS — chips filled vs outline |
| `packages/design-system/src/primitives/Input/Input.svelte` | CSS — border, label color, feedback size |
| `packages/design-system/src/primitives/Toast/Toast.svelte` | CSS — font sizes, close button |
| `packages/design-system/src/composites/Card/Card.svelte` | CSS — condition badges, font sizes |
| `packages/design-system/src/composites/ChatInput/ChatInput.svelte` | CSS — chips, textarea, add button |
| `packages/design-system/src/composites/Modal/Modal.svelte` | CSS — borders, icon size, title |
| `packages/design-system/src/patterns/ChatBubble/ChatBubble.svelte` | CSS — font-size crítico, glass bg |
| `packages/design-system/src/patterns/ItemCard/ItemCard.svelte` | Template + CSS — oldPrice, seller row |
| `packages/design-system/src/patterns/GrowthChart/GrowthChart.svelte` | Template + CSS — timeline, size blocks |
| `packages/design-system/src/patterns/NotificationCard/NotificationCard.svelte` | Template + CSS — layout, icon |
| `packages/design-system/src/patterns/BottomNav/BottomNav.svelte` | CSS — glass bg, label |
| `packages/design-system/src/patterns/TopBar/TopBar.svelte` | CSS — glass, logo, buttons, search |
| `apps/web/src/app.postcss` | Trocar import de UI para DS |
| `apps/web/package.json` | Trocar dep `@babyclothes/ui` → `@babyclothes/design-system` |
| `apps/web/src/lib/presentation/components/ItemCard.svelte` | Trocar import |
| `apps/web/src/routes/chat/+page.svelte` | Trocar import |
| `apps/web/src/routes/catalog/+page.svelte` | Trocar import |
| `package.json` (raiz) | Remover workspace `packages/ui` |
| `packages/ui/` (pasta inteira) | Deletar |

---

### Task 1: Corrigir token `--color-glass`

**Files:**
- Modify: `packages/design-system/src/tokens/tokens.css:30`

**Interfaces:**
- Produz: `--color-glass: rgba(255,255,255,0.15)` — consumido por Card, BottomNav, TopBar e qualquer componente que usa esta variável

- [ ] **Step 1: Aplicar correção**

Em `packages/design-system/src/tokens/tokens.css`, linha 30, trocar:
```css
--color-glass:      rgba(255, 255, 255, 0.1);
```
por:
```css
--color-glass:      rgba(255, 255, 255, 0.15);
```

- [ ] **Step 2: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam (nenhum testa valores CSS diretamente).

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/tokens/tokens.css
git commit -m "fix(ds): correct --color-glass opacity to 0.15"
```

---

### Task 2: Corrigir Avatar e Badge

**Files:**
- Modify: `packages/design-system/src/primitives/Avatar/Avatar.svelte`
- Modify: `packages/design-system/src/primitives/Badge/Badge.svelte`
- Test: `packages/design-system/src/primitives/Avatar/Avatar.test.ts`
- Test: `packages/design-system/src/primitives/Badge/Badge.test.ts`

**Interfaces:**
- Produz: Avatar com gradiente `#FF3CAC → #B03EFF` (pk), fill `of` com gradiente cinza + texto branco
- Produz: Badge com font-sizes e cores corretos do mock, sem uppercase

- [ ] **Step 1: Corrigir Avatar.svelte — CSS**

No bloco `<style>` de `packages/design-system/src/primitives/Avatar/Avatar.svelte`:

Trocar `.avatar--pk .avatar__initials`:
```css
.avatar--pk .avatar__initials {
  background: linear-gradient(135deg, var(--color-pink) 0%, #B03EFF 100%);
}
```

Trocar `.avatar--of .avatar__initials`:
```css
.avatar--of .avatar__initials {
  background: linear-gradient(135deg, #D1D5DB, #9CA3AF);
  color: #fff;
}
```

Trocar `.avatar__online-ring` border:
```css
.avatar__online-ring {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28%;
  height: 28%;
  min-width: 0.5rem;
  min-height: 0.5rem;
  background: #22C55E;
  border-radius: 50%;
  border: 2px solid var(--color-white);
}
```

Trocar `.avatar__verified` para usar tamanho absoluto:
```css
.avatar__verified {
  position: absolute;
  bottom: -0.1rem;
  right: -0.1rem;
  width: 1.1rem;
  height: 1.1rem;
  background: var(--color-pink);
  border-radius: 50%;
  border: 2px solid var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  line-height: 1;
}
```

- [ ] **Step 2: Corrigir Badge.svelte — CSS**

No bloco `<style>` de `packages/design-system/src/primitives/Badge/Badge.svelte`:

Remover `text-transform: uppercase;` e `letter-spacing: .07em;` do `.badge`.

Trocar os tamanhos:
```css
.badge--sm { font-size: .65rem; padding: 0.2rem 0.5rem; }
.badge--md { font-size: .75rem; padding: 0.25rem 0.6rem; }
.badge--lg { font-size: .85rem; padding: 0.3rem 0.75rem; }
```

Trocar `.badge--pk-soft`:
```css
.badge--pk-soft {
  background: var(--color-pk-soft);
  color: var(--color-pink);
}
```
(remover a linha `border`)

Trocar `.badge--neutral`:
```css
.badge--neutral {
  background: #F3F4F6;
  color: #374151;
}
```
(remover a linha `border`)

Trocar cor do amber no `.badge--amber`:
```css
.badge--amber {
  background: #FEF3C7;
  color: #92400E;
}
```
(remover a linha `border`)

- [ ] **Step 3: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/primitives/Avatar/Avatar.svelte \
        packages/design-system/src/primitives/Badge/Badge.svelte
git commit -m "fix(ds): align Avatar and Badge to mock"
```

---

### Task 3: Corrigir Button e FilterBar

**Files:**
- Modify: `packages/design-system/src/primitives/Button/Button.svelte`
- Modify: `packages/design-system/src/primitives/FilterBar/FilterBar.svelte`

**Interfaces:**
- Produz: Button com `secondary` filled cinza, bordas ghost sólidas, spinner de 14px
- Produz: FilterBar com chips preenchidos, sem outline, sem uppercase

- [ ] **Step 1: Corrigir Button.svelte — CSS**

No bloco `<style>` de `packages/design-system/src/primitives/Button/Button.svelte`:

Trocar o gap base:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-lato);
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--transition-base), opacity var(--transition-base), box-shadow var(--transition-base);
  white-space: nowrap;
}
```

Trocar `.btn--md`:
```css
.btn--md {
  padding: 0.6rem 1.1rem;
  font-size: 0.875rem;
}
```

Trocar `.btn--secondary`:
```css
.btn--secondary {
  background: #F3F4F6;
  color: var(--color-black);
}
```

Trocar `.btn--ghost`:
```css
.btn--ghost {
  background: transparent;
  color: var(--color-black);
  border: 1.5px solid #111;
}
```

Trocar `.btn--ghost-pk`:
```css
.btn--ghost-pk {
  background: transparent;
  color: var(--color-pink);
  border: 1.5px solid var(--color-pink);
}
```

Trocar `.btn--ghost-inv`:
```css
.btn--ghost-inv {
  background: transparent;
  color: var(--color-white);
  border: 1.5px solid rgba(255, 255, 255, .4);
}
```

Trocar `.btn__spinner` para usar px:
```css
.btn__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid;
  border-radius: 50%;
  animation: bc-spin .6s linear infinite;
  flex-shrink: 0;
}
```

- [ ] **Step 2: Corrigir FilterBar.svelte — CSS**

Substituir o bloco `<style>` completo de `packages/design-system/src/primitives/FilterBar/FilterBar.svelte` pelo seguinte (preserve a lógica de `.filter-bar__label` e `.filter-bar__chip-label`):

```css
.filter-bar {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0.2rem;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #F3F4F6;
  color: #374151;
  border: none;
  font-family: var(--font-lato);
  font-weight: 700;
  border-radius: var(--radius-pill);
  cursor: pointer;
  white-space: nowrap;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  transition:
    background var(--transition-base),
    color var(--transition-base);
}

.filter-bar__chip:hover {
  background: #E5E7EB;
}

.filter-bar__chip[data-selected] {
  background: #111;
  color: #fff;
}

.filter-bar__chip[data-selected]:hover {
  background: var(--color-black-2);
}

/* ── Variant: pk ─────────────────────────────── */
.filter-bar--pk .filter-bar__chip {
  background: #FFE8F5;
  color: #FF3CAC;
}

.filter-bar--pk .filter-bar__chip:hover {
  background: #FFD0ED;
}

.filter-bar--pk .filter-bar__chip[data-selected] {
  background: var(--color-pink);
  color: #fff;
}

.filter-bar--pk .filter-bar__chip[data-selected]:hover {
  background: var(--color-pink-light);
}

/* ── Variant: on-dark ─────────────────────────── */
.filter-bar--on-dark .filter-bar__chip {
  background: rgba(255, 255, 255, .15);
  color: rgba(255, 255, 255, .85);
}

.filter-bar--on-dark .filter-bar__chip:hover {
  background: rgba(255, 255, 255, .22);
}

.filter-bar--on-dark .filter-bar__chip[data-selected] {
  background: #fff;
  color: #111;
}

/* ── Count badge ─────────────────────────────── */
.filter-bar__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35rem;
  border-radius: var(--radius-pill);
  background: #E5E7EB;
  color: #6B7280;
  font-size: 0.62rem;
  font-weight: 700;
  font-family: var(--font-lato);
  line-height: 1.4;
}

.filter-bar__chip[data-selected] .filter-bar__count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.filter-bar--pk .filter-bar__count {
  background: #FFD0ED;
  color: var(--color-pink);
}

.filter-bar--pk .filter-bar__chip[data-selected] .filter-bar__count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.filter-bar--on-dark .filter-bar__count {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, .85);
}

.filter-bar--on-dark .filter-bar__chip[data-selected] .filter-bar__count {
  background: rgba(0, 0, 0, 0.12);
  color: #111;
}

/* ── Label ────────────────────────────────────── */
.filter-bar__label {
  font-family: var(--font-lato);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-black);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 0.4rem;
}

.filter-bar--on-dark .filter-bar__label {
  color: #fff;
}

.filter-bar__chip-label {
  font-family: var(--font-lato);
}

/* ── Size sm ─────────────────────────────────── */
.filter-bar--sm .filter-bar__chip {
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
}
```

- [ ] **Step 3: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/primitives/Button/Button.svelte \
        packages/design-system/src/primitives/FilterBar/FilterBar.svelte
git commit -m "fix(ds): align Button and FilterBar to mock"
```

---

### Task 4: Corrigir Input e Toast

**Files:**
- Modify: `packages/design-system/src/primitives/Input/Input.svelte`
- Modify: `packages/design-system/src/primitives/Toast/Toast.svelte`

**Interfaces:**
- Produz: Input com borda `#D1D5DB`, label `#374151`, feedback `0.7rem`
- Produz: Toast com title `0.8rem`, message `0.75rem`, close button sem background

- [ ] **Step 1: Corrigir Input.svelte — CSS**

No bloco `<style>` de `packages/design-system/src/primitives/Input/Input.svelte`:

Trocar `.input-wrapper`:
```css
.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--color-white);
  border: 1.5px solid #D1D5DB;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
```

Trocar `.input-label` color:
```css
.input-label {
  font-family: var(--font-lato);
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
}
```

Trocar `.input-feedback` font-size:
```css
.input-feedback {
  font-family: var(--font-lato);
  font-size: .7rem;
}
```

- [ ] **Step 2: Corrigir Toast.svelte — CSS**

No bloco `<style>` de `packages/design-system/src/primitives/Toast/Toast.svelte`:

Trocar `.toast__title` font-size:
```css
.toast__title {
  font-family: var(--font-lato);
  font-size: .8rem;
  font-weight: 700;
  color: var(--color-black);
}
```

Trocar `.toast__message` font-size:
```css
.toast__message {
  font-family: var(--font-lato);
  font-size: .75rem;
  color: var(--color-black);
  line-height: 1.4;
}
```

Trocar `.toast__close` — remover background circle:
```css
.toast__close {
  align-self: flex-start;
  margin: 0.8rem 0.8rem 0 0;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--color-gray);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color var(--transition-base);
}

.toast__close:hover {
  color: var(--color-black);
}
```

- [ ] **Step 3: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/primitives/Input/Input.svelte \
        packages/design-system/src/primitives/Toast/Toast.svelte
git commit -m "fix(ds): align Input and Toast to mock"
```

---

### Task 5: Corrigir Card, ChatInput e Modal

**Files:**
- Modify: `packages/design-system/src/composites/Card/Card.svelte`
- Modify: `packages/design-system/src/composites/ChatInput/ChatInput.svelte`
- Modify: `packages/design-system/src/composites/Modal/Modal.svelte`

**Interfaces:**
- Produz: Card com condition badges como pill preto/rosa-suave/cinza, font sizes corretos
- Produz: ChatInput com chips `#FFE8F5`, textarea com borda, add button `#F3F4F6`
- Produz: Modal com danger border claro, pk border `#FFD0ED`, icon `2rem`

- [ ] **Step 1: Corrigir Card.svelte — condition badges e font sizes**

No bloco `<style>`, trocar as três variantes de condition:
```css
.card__condition {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-family: var(--font-lato);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 99rem;
  line-height: 1.3;
  white-space: nowrap;
}

.card__condition--new {
  background: #111;
  color: #fff;
}

.card__condition--semi {
  background: #FFE8F5;
  color: #FF3CAC;
}

.card__condition--used {
  background: #F3F4F6;
  color: #374151;
}
```

Trocar font sizes por variante de tamanho (sm/md/lg). Adicionar ou editar os seletores específicos por tamanho:
```css
.card--sm .card__title { font-size: 0.8rem; }
.card--md .card__title { font-size: 0.85rem; }
.card--lg .card__title { font-size: 0.9rem; }

.card--sm .card__detail { font-size: 0.7rem; }
.card--md .card__detail { font-size: 0.72rem; }
.card--lg .card__detail { font-size: 0.75rem; }

.card--sm .card__price { font-size: 1rem; }
.card--md .card__price { font-size: 1.05rem; }
.card--lg .card__price { font-size: 1.1rem; }
```

Remover o `.card__title`, `.card__detail` e `.card__price` que definem font-size genérico (só manter as propriedades não relacionadas a font-size neles).

- [ ] **Step 2: Corrigir ChatInput.svelte — chips, textarea, add button**

No bloco `<style>`:

Trocar `.chat-input__chip`:
```css
.chat-input__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border: 1.5px solid #FFD0ED;
  background: #FFE8F5;
  color: var(--pk);
  font-family: var(--font-lato);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 99.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.chat-input__chip:hover {
  background: #FFD0ED;
  border-color: var(--pk);
}
```

Trocar `.chat-input__textarea` — adicionar borda:
```css
.chat-input__textarea {
  flex: 1;
  border: 1.5px solid #D1D5DB;
  border-radius: 1.25rem;
  outline: none;
  background: transparent;
  padding: 0.65rem 1rem;
  font-family: var(--font-lato);
  font-size: 0.875rem;
  color: var(--bk);
  resize: none;
  min-height: 2.75rem;
  max-height: 12rem;
  line-height: 1.4;
}

.chat-input__textarea::placeholder {
  color: var(--gr);
}
```

Trocar `.chat-input__add-btn`:
```css
.chat-input__add-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: none;
  background: #F3F4F6;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  margin-bottom: 0.3rem;
}

.chat-input__add-btn:hover {
  background: #E5E7EB;
  color: var(--pk);
}
```

- [ ] **Step 3: Corrigir Modal.svelte — bordas e icon size**

No bloco `<style>`:

Trocar `.modal--danger`:
```css
.modal--danger {
  border: 1.5px solid #FEE2E2;
}
```

Trocar `.modal--pk`:
```css
.modal--pk {
  border: 1.5px solid #FFD0ED;
  box-shadow: 0 8px 32px rgba(255, 60, 172, .12);
}
```

Trocar `.modal__icon` para `2rem`:
```css
.modal__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

Trocar `.modal__title` font-size:
```css
.modal__title {
  flex: 1;
  font-family: var(--font-lato);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
  min-width: 0;
}
```

- [ ] **Step 4: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/composites/Card/Card.svelte \
        packages/design-system/src/composites/ChatInput/ChatInput.svelte \
        packages/design-system/src/composites/Modal/Modal.svelte
git commit -m "fix(ds): align Card, ChatInput, and Modal to mock"
```

---

### Task 6: Corrigir ChatBubble

**Files:**
- Modify: `packages/design-system/src/patterns/ChatBubble/ChatBubble.svelte`

**Interfaces:**
- Produz: ChatBubble com font-size `0.875rem`, agent glass correto (`rgba(255,255,255,.12)`), timestamps corretos

- [ ] **Step 1: Corrigir ChatBubble.svelte — CSS completo**

Substituir o bloco `<style>` completo por:
```css
.chat-bubble {
  padding: 0.75rem 1rem;
  font-family: var(--vd);
  font-size: 0.875rem;
  line-height: 1.55;
  position: relative;
  max-width: 80%;
}

/* Agent bubble — glass translúcido sobre fundo escuro */
.chat-bubble--agent {
  align-self: flex-start;
  background: rgba(255, 255, 255, .12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, .15);
  border-radius: 1rem 1rem 1rem 0.25rem;
  color: #fff;
}

/* User bubble — branco */
.chat-bubble--user {
  align-self: flex-end;
  background: #fff;
  color: #111;
  border-radius: 1rem 1rem 0.25rem 1rem;
  border: none;
}

/* System message — pill rosa translúcido */
.chat-bubble--system {
  align-self: center;
  max-width: 90%;
  background: rgba(255, 232, 245, .12);
  border: 1px solid rgba(255, 60, 172, .3);
  border-radius: 99rem;
  color: #FF85CC;
  text-align: center;
}

.chat-bubble__text {
  margin: 0;
  white-space: pre-wrap;
}

.chat-bubble__time {
  display: block;
  font-size: 0.62rem;
  margin-top: 0.3rem;
  text-align: right;
}

.chat-bubble--agent .chat-bubble__time {
  color: rgba(255, 255, 255, .4);
}

.chat-bubble--user .chat-bubble__time {
  color: #9CA3AF;
}
```

- [ ] **Step 2: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos passam.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/patterns/ChatBubble/ChatBubble.svelte
git commit -m "fix(ds): align ChatBubble font-size and glass to mock"
```

---

### Task 7: Corrigir ItemCard

**Files:**
- Modify: `packages/design-system/src/patterns/ItemCard/ItemCard.svelte`
- Modify: `packages/design-system/src/patterns/ItemCard/ItemCard.test.ts`

**Interfaces:**
- Produz: ItemCard com `border:1.5px solid #EDE9E4`, `border-radius:1.25rem`, foto `200px`, oldPrice renderizado, seller row com listings + border-bottom, action buttons Lato

- [ ] **Step 1: Atualizar template — oldPrice e seller row**

No template de `ItemCard.svelte`, adicionar `oldPrice` logo após `.item-card__price` e adicionar `sellerListings` na `.item-card__seller`:

Localizar:
```svelte
<p class="item-card__price">{formattedPrice}</p>
```
Adicionar após:
```svelte
{#if oldPrice !== undefined}
  <p class="item-card__old-price">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(oldPrice)}</p>
{/if}
```

Adicionar prop `oldPrice?: number` à definição de props.

Na row do seller, localizar `<span class="item-card__seller-name">{sellerName}</span>` e adicionar após:
```svelte
{#if sellerListings !== undefined}
  <span class="item-card__seller-listings">{sellerListings} anúncios</span>
{/if}
```

Adicionar prop `sellerListings?: number` à definição de props (o tipo atual usa `string` — corrigir para `number`). Remover `sellerVerifiedLabel` como texto e substituir por ícone verificado igual ao do Avatar:
```svelte
{#if sellerVerifiedLabel}
  <span class="item-card__verified-dot" aria-label={sellerVerifiedLabel}>
    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
      <path d="M1 2.5L2.8 4.2L6 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
{/if}
```

Adicionar chevron ao final da row do seller:
```svelte
<svg class="item-card__seller-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
  <path d="M9 18l6-6-6-6"/>
</svg>
```

- [ ] **Step 2: Atualizar CSS — border, radius, foto, fav, fonts, seller**

Substituir os seguintes blocos no `<style>`:

```css
.item-card {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1.5px solid #EDE9E4;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .07);
  transition: box-shadow var(--transition-base), transform 0.2s;
}

.item-card__photo {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.item-card__fav {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, .9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.15s;
}

.item-card__title {
  font-family: var(--font-lato);
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.item-card__price {
  font-family: var(--font-lato);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--color-pink);
  margin: 0;
}

.item-card__old-price {
  font-family: var(--font-lato);
  font-size: 0.8rem;
  color: #9CA3AF;
  text-decoration: line-through;
  margin: 0;
}

.item-card__seller {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
  background: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}

.item-card__seller-name {
  font-family: var(--font-lato);
  font-size: 0.8rem;
  font-weight: 700;
  color: #111;
  flex: 1;
}

.item-card__seller-listings {
  font-family: var(--font-lato);
  font-size: 0.7rem;
  color: #9CA3AF;
}

.item-card__seller-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pk), #B03EFF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
}

.item-card__verified-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 0.7rem;
  height: 0.7rem;
  background: var(--color-pink);
  border: 1.5px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-card__seller-chevron {
  flex-shrink: 0;
}

.item-card__action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: none;
  border-radius: 0.5rem;
  padding: 0.65rem;
  font-family: var(--font-lato);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.item-card__action--ghost {
  background: #F3F4F6;
  color: #111;
}

.item-card__action--primary {
  background: var(--pk);
  color: var(--wh);
  box-shadow: 0 4px 12px rgba(255, 60, 172, .28);
}
```

- [ ] **Step 3: Atualizar testes**

Em `packages/design-system/src/patterns/ItemCard/ItemCard.test.ts`, verificar se existe teste para `oldPrice`. Se não existir, adicionar:
```ts
it('renders old price when provided', () => {
  render(ItemCard, {
    props: {
      title: 'Body',
      price: 32,
      clothingSize: 'M',
      conditionLabel: 'Novo',
      oldPrice: 55,
    },
  })
  expect(document.querySelector('.item-card__old-price')).toBeInTheDocument()
})

it('does not render old price when not provided', () => {
  render(ItemCard, {
    props: {
      title: 'Body',
      price: 32,
      clothingSize: 'M',
      conditionLabel: 'Novo',
    },
  })
  expect(document.querySelector('.item-card__old-price')).not.toBeInTheDocument()
})
```

- [ ] **Step 4: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos os testes passam incluindo os novos.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/patterns/ItemCard/ItemCard.svelte \
        packages/design-system/src/patterns/ItemCard/ItemCard.test.ts
git commit -m "fix(ds): align ItemCard to mock — border, photo, seller row, oldPrice"
```

---

### Task 8: Corrigir GrowthChart

**Files:**
- Modify: `packages/design-system/src/patterns/GrowthChart/GrowthChart.svelte`
- Modify: `packages/design-system/src/patterns/GrowthChart/GrowthChart.test.ts` (se existir)

**Interfaces:**
- Produz: GrowthChart com container `rgba(255,255,255,.75)` + borda sólida, size boxes `3.25rem`, timeline como linha horizontal, CTA gradiente

- [ ] **Step 1: Atualizar template — daysUntil e size blocks**

No template, localizar `<div class="growthchart__sizes">` e reestruturar para incluir o bloco de dias separado ao lado:

```svelte
{#if currentSize && nextSize}
  <div class="growthchart__sizes">
    <div class="growthchart__size-block">
      <span class="growthchart__size-label">{currentSizeLabel}</span>
      <div class="growthchart__size-value growthchart__size-value--current">{currentSize}</div>
    </div>
    <svg class="growthchart__size-arrow" width="18" height="14" viewBox="0 0 20 16" fill="none">
      <path d="M12 2l6 6-6 6M2 8h16" stroke="#FF3CAC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div class="growthchart__size-block">
      <span class="growthchart__size-label">{nextSizeLabel}</span>
      <div class="growthchart__size-value growthchart__size-value--next">{nextSize}</div>
    </div>
    {#if daysUntil !== undefined}
      <div class="growthchart__days">
        <span class="growthchart__days-label">em aprox.</span>
        <span class="growthchart__days-value">{daysUntil} dias</span>
      </div>
    {/if}
  </div>
{/if}
```

Remover o bloco `{#if daysUntil !== undefined && predictionLabel}` que estava separado (agora integrado acima).

Para a timeline, substituir o template `{#if sizes && sizes.length > 0}` por uma linha horizontal:
```svelte
{#if sizes && sizes.length > 0}
  <div class="growthchart__timeline">
    {#each sizes as entry, i (entry.label)}
      {#if i > 0}
        <div class="growthchart__line"
          class:growthchart__line--active={sizes[i-1].status === 'current' || entry.status === 'next'}
        ></div>
      {/if}
      <div class="growthchart__dot-wrap">
        <div
          class="growthchart__dot"
          class:growthchart__dot--past={entry.status === 'past'}
          class:growthchart__dot--current={entry.status === 'current'}
          class:growthchart__dot--next={entry.status === 'next'}
          class:growthchart__dot--future={entry.status === 'future'}
        ></div>
        <span class="growthchart__dot-label">{entry.label}</span>
      </div>
    {/each}
  </div>
{/if}
```

- [ ] **Step 2: Atualizar CSS — container, size blocks, timeline, CTA**

Substituir os blocos relevantes no `<style>`:

```css
.growthchart {
  background: rgba(255, 255, 255, .75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid #EDE9E4;
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, .07);
}

.growthchart--full {
  padding: 1.5rem;
  gap: 1rem;
}

.growthchart__sizes {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.growthchart__size-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.growthchart__size-label {
  font-family: var(--font-lato);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9CA3AF;
}

.growthchart__size-value {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-lato);
  font-size: 1rem;
  font-weight: 900;
  color: #fff;
}

.growthchart__size-value--current {
  background: #111;
}

.growthchart__size-value--next {
  background: linear-gradient(135deg, #FF3CAC, #B03EFF);
}

.growthchart__size-arrow {
  flex-shrink: 0;
}

.growthchart__days {
  display: flex;
  flex-direction: column;
}

.growthchart__days-label {
  font-family: var(--font-lato);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9CA3AF;
}

.growthchart__days-value {
  font-family: var(--font-lato);
  font-size: 1.25rem;
  font-weight: 900;
  color: #111;
}

/* Timeline — linha horizontal */
.growthchart__timeline {
  display: flex;
  align-items: center;
  gap: 0;
}

.growthchart__dot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.growthchart__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #D1D5DB;
}

.growthchart__dot--past {
  opacity: 0.3;
}

.growthchart__dot--current {
  width: 0.7rem;
  height: 0.7rem;
  background: #111;
  box-shadow: 0 0 0 2.5px #fff, 0 0 0 4px #111;
}

.growthchart__dot--next {
  width: 0.7rem;
  height: 0.7rem;
  background: linear-gradient(135deg, #FF3CAC, #B03EFF);
}

.growthchart__dot--future {
  opacity: 0.3;
}

.growthchart__dot-label {
  font-family: var(--font-lato);
  font-size: 0.58rem;
  font-weight: 700;
  color: #9CA3AF;
}

.growthchart__dot--current + .growthchart__dot-wrap .growthchart__dot-label,
.growthchart__dot--next + .growthchart__dot-wrap .growthchart__dot-label {
  color: #111;
}

.growthchart__dot--next .growthchart__dot-label {
  color: #FF3CAC;
}

.growthchart__line {
  flex: 1;
  height: 1.5px;
  background: #D1D5DB;
  margin-bottom: 1.2rem;
}

.growthchart__line--active {
  background: linear-gradient(90deg, #FF3CAC, #B03EFF);
}

/* Progress */
.growthchart__progress-bar {
  flex: 1;
  height: 6px;
  background: #F3F4F6;
  border-radius: 99rem;
  overflow: hidden;
}

.growthchart__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF3CAC, #B03EFF);
  border-radius: 99rem;
  transition: width 0.4s ease;
}

/* Description */
.growthchart__desc {
  font-family: var(--font-lato);
  font-size: 0.78rem;
  color: #6B7280;
  line-height: 1.55;
  margin: 0;
}

/* CTA */
.growthchart__btn--primary {
  background: linear-gradient(135deg, #FF3CAC, #B03EFF);
  color: #fff;
  width: 100%;
  border-radius: 0.75rem;
}

.growthchart__btn--ghost {
  background: rgba(255, 255, 255, .45);
  color: var(--bk);
  border: 1.5px solid #EDE9E4;
  border-radius: 0.75rem;
}
```

- [ ] **Step 3: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos passam.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/patterns/GrowthChart/GrowthChart.svelte
git commit -m "fix(ds): align GrowthChart container, timeline, and CTA to mock"
```

---

### Task 9: Corrigir NotificationCard

**Files:**
- Modify: `packages/design-system/src/patterns/NotificationCard/NotificationCard.svelte`
- Modify: `packages/design-system/src/patterns/NotificationCard/NotificationCard.test.ts`

**Interfaces:**
- Produz: NotificationCard com layout correto (dot ao lado do título, timeAgo abaixo do body), ícone SVG circular, unread bg `#FFF9FC`, body em Lato multi-line

- [ ] **Step 1: Reestruturar template**

Substituir o template completo (apenas o HTML, não o script) por:

```svelte
<button
  class="notification-card"
  class:notification-card--unread={!isRead}
  onclick={onclick}
>
  <div class="notification-card__icon-wrap">
    {#if icon}
      {@render icon()}
    {:else}
      <div class="notification-card__icon-circle"
        class:notification-card__icon-circle--unread={!isRead}
      >
        <div class="notification-card__icon-dot"
          class:notification-card__icon-dot--growth={type === 'growth_prediction'}
          class:notification-card__icon-dot--match={type === 'new_match'}
        ></div>
      </div>
    {/if}
  </div>

  <div class="notification-card__content">
    <div class="notification-card__title-row">
      <h3 class="notification-card__title">{title}</h3>
      {#if !isRead}
        <span class="notification-card__dot" aria-label={unreadAriaLabel}></span>
      {/if}
    </div>
    <p class="notification-card__body">{body}</p>
    <span class="notification-card__time">{timeAgo}</span>
  </div>
</button>
```

- [ ] **Step 2: Atualizar CSS**

Substituir o `<style>` completo por:

```css
.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background var(--transition-fast);
}

.notification-card:hover {
  background: var(--color-bg);
}

.notification-card--unread {
  background: #FFF9FC;
}

.notification-card--unread:hover {
  background: #FFF0F8;
}

.notification-card__icon-wrap {
  flex-shrink: 0;
}

.notification-card__icon-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-card__icon-circle--unread {
  background: #FFE8F5;
}

.notification-card__icon-dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: #9CA3AF;
}

.notification-card__icon-dot--growth {
  background: var(--color-pink);
}

.notification-card__icon-dot--match {
  background: var(--color-pk-purple);
}

.notification-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.notification-card__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.notification-card__title {
  font-family: var(--font-lato);
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.notification-card--unread .notification-card__title {
  font-weight: 900;
  color: #111;
}

.notification-card__dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-pink);
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-card__body {
  font-family: var(--font-lato);
  font-size: 0.75rem;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
}

.notification-card__time {
  font-family: var(--font-lato);
  font-size: 0.65rem;
  color: #9CA3AF;
  margin-top: 0.3rem;
}
```

- [ ] **Step 3: Atualizar testes**

Em `NotificationCard.test.ts`, verificar se existem testes para `isRead` e layout. Se não, adicionar:

```ts
it('shows unread dot next to title when not read', () => {
  render(NotificationCard, {
    props: { type: 'growth_prediction', title: 'Mudança de tamanho', body: 'Sofia vai precisar de G em breve.', timeAgo: 'há 2 min', isRead: false }
  })
  expect(document.querySelector('.notification-card__dot')).toBeInTheDocument()
})

it('does not show unread dot when read', () => {
  render(NotificationCard, {
    props: { type: 'system', title: 'Bem-vindo', body: 'Cadastro confirmado.', timeAgo: 'há 3 dias', isRead: true }
  })
  expect(document.querySelector('.notification-card__dot')).not.toBeInTheDocument()
})

it('applies unread background when not read', () => {
  render(NotificationCard, {
    props: { type: 'growth_prediction', title: 'Teste', body: 'Corpo', timeAgo: 'agora', isRead: false }
  })
  expect(document.querySelector('.notification-card')).toHaveClass('notification-card--unread')
})
```

- [ ] **Step 4: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos passam.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/patterns/NotificationCard/NotificationCard.svelte \
        packages/design-system/src/patterns/NotificationCard/NotificationCard.test.ts
git commit -m "fix(ds): align NotificationCard layout and styles to mock"
```

---

### Task 10: Corrigir BottomNav e TopBar

**Files:**
- Modify: `packages/design-system/src/patterns/BottomNav/BottomNav.svelte`
- Modify: `packages/design-system/src/patterns/TopBar/TopBar.svelte`

**Interfaces:**
- Produz: BottomNav e TopBar com `rgba(255,255,255,.88)` + `blur(12px)`, label sem uppercase
- Produz: TopBar com logo `0.82rem`, search sólido `#F3F4F6`, botões pill

- [ ] **Step 1: Corrigir BottomNav.svelte — glass e label**

No bloco `<style>`:

Trocar `.bottomnav` glass:
```css
.bottomnav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-around;
  padding: 0.625rem 0.25rem;
  padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, .88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, .6);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, .06);
}
```

Trocar `.bottomnav__label`:
```css
.bottomnav__label {
  font-family: var(--font-lato);
  font-size: 0.62rem;
  font-weight: 700;
}
```

- [ ] **Step 2: Corrigir TopBar.svelte — glass, logo, search, botões**

No bloco `<style>`:

Trocar `.topnav` glass:
```css
.topnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, .88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, .6);
  box-shadow: 0 2px 12px rgba(0, 0, 0, .06);
}
```

Trocar `.topnav__logo` font-size:
```css
.topnav__logo {
  font-family: var(--ld);
  font-size: 0.82rem;
  color: var(--bk);
  text-decoration: none;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
}
```

Trocar `.topnav__search` para sólido:
```css
.topnav__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 40rem;
  background: #F3F4F6;
  border-radius: 99rem;
  padding: 0.35rem 0.875rem;
  transition: background 0.2s;
}

.topnav__search:focus-within {
  background: #E5E7EB;
}
```

Trocar `.topnav__btn-ghost` para pill:
```css
.topnav__btn-ghost {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  text-decoration: none;
  border: 1.5px solid #D1D5DB;
  border-radius: 99rem;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: var(--font-lato);
  flex-shrink: 0;
}

.topnav__btn-ghost:hover {
  background: rgba(0, 0, 0, .04);
}
```

Trocar `.topnav__btn-pink` para pill:
```css
.topnav__btn-pink {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: var(--pk);
  border-radius: 99rem;
  cursor: pointer;
  transition: opacity 0.15s ease;
  border: none;
  font-family: var(--font-lato);
  flex-shrink: 0;
}
```

- [ ] **Step 3: Rodar testes**

```bash
cd packages/design-system && yarn test
```
Expected: todos passam.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/patterns/BottomNav/BottomNav.svelte \
        packages/design-system/src/patterns/TopBar/TopBar.svelte
git commit -m "fix(ds): align BottomNav and TopBar glass and styles to mock"
```

---

### Task 11: Migrar apps/web para @babyclothes/design-system

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/app.postcss`
- Modify: `apps/web/src/lib/presentation/components/ItemCard.svelte:2`
- Modify: `apps/web/src/routes/chat/+page.svelte:17`
- Modify: `apps/web/src/routes/catalog/+page.svelte:8`

**Interfaces:**
- Consome: `@babyclothes/design-system` com exports `"."` e `"./tokens.css"`
- Produz: `apps/web` sem dependência em `@babyclothes/ui`

- [ ] **Step 1: Atualizar package.json do web**

Em `apps/web/package.json`, no bloco `"dependencies"`:

Trocar:
```json
"@babyclothes/ui": "workspace:*",
```
por:
```json
"@babyclothes/design-system": "workspace:*",
```

- [ ] **Step 2: Atualizar app.postcss**

Em `apps/web/src/app.postcss`, trocar a linha de import:
```css
@import url('@babyclothes/ui/tokens.css');
```
por:
```css
@import url('@babyclothes/design-system/tokens.css');
@import url('@babyclothes/design-system/brand.css');
```

- [ ] **Step 3: Atualizar imports nos 3 arquivos**

`apps/web/src/lib/presentation/components/ItemCard.svelte`, linha 2:
```ts
import { Badge } from '@babyclothes/design-system'
```

`apps/web/src/routes/chat/+page.svelte`, linha 17:
```ts
import { Card, ChatInput } from '@babyclothes/design-system'
```

`apps/web/src/routes/catalog/+page.svelte`, linha 8:
```ts
import { Card } from '@babyclothes/design-system'
```

- [ ] **Step 4: Reinstalar dependências**

```bash
yarn install
```
Expected: sem erros. O PnP do Yarn 4 vai resolver `@babyclothes/design-system` como workspace.

- [ ] **Step 5: Verificar type check do web**

```bash
yarn workspace @babyclothes/web check
```
ou via Docker:
```bash
docker-compose exec web yarn workspace @babyclothes/web check
```
Expected: sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/src/app.postcss \
        apps/web/src/lib/presentation/components/ItemCard.svelte \
        apps/web/src/routes/chat/+page.svelte \
        apps/web/src/routes/catalog/+page.svelte \
        yarn.lock
git commit -m "feat(web): migrate from @babyclothes/ui to @babyclothes/design-system"
```

---

### Task 12: Remover packages/ui

**Files:**
- Modify: `package.json` (raiz) — remover workspace entry
- Delete: `packages/ui/` (pasta inteira)

**Interfaces:**
- Consome: confirmação de que `apps/web` e `apps/agents` não importam mais de `@babyclothes/ui`
- Produz: monorepo sem `packages/ui`

- [ ] **Step 1: Verificar que nenhum arquivo ainda importa de @babyclothes/ui**

```bash
grep -r "@babyclothes/ui" apps/ packages/design-system/ --include="*.ts" --include="*.svelte" --include="*.json"
```
Expected: zero resultados. Se houver resultados, corrigir antes de continuar.

- [ ] **Step 2: Remover workspace do package.json raiz**

Em `package.json` (raiz), localizar o array `"workspaces"` e remover a entrada `"packages/ui"`.

- [ ] **Step 3: Remover a pasta**

```bash
rm -rf packages/ui
```

- [ ] **Step 4: Reinstalar e verificar**

```bash
yarn install
```
Expected: sem erros.

```bash
yarn workspace @babyclothes/web check
```
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: remove packages/ui — web now uses @babyclothes/design-system"
```

---

## Ordem de execução recomendada

Tasks 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Tasks 1–10 são independentes entre si dentro do design-system e podem ser executadas em qualquer ordem. Tasks 11 e 12 dependem das anteriores estarem concluídas.
