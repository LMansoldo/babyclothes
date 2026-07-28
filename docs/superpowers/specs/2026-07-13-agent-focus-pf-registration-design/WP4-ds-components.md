## WP4 — Componentes novos do design system

Local: `packages/design-system/src/...`. Seguir regra global 7. Especificação visual = classes do mock (`BabyClothes Chat Mocks.dc.html`).

### 4.1 `composites/ChoiceChipGroup/ChoiceChipGroup.svelte`

```ts
export interface ChoiceChipOption {
  value: string
  label: string
  /** Realce rosa (borda/texto pk) — ex.: opção recomendada */
  primary?: boolean
}
export interface ChoiceChipGroupProps {
  options: ChoiceChipOption[]
  /** Valor selecionado (chip vira fundo pk) */
  value?: string
  onSelect: (value: string) => void
  disabled?: boolean
  ariaLabel: string
  /** outline = chat intake (padrão) · soft = sugestões (fundo pk-soft no primary) */
  tone?: 'outline' | 'soft'
  size?: 'md' | 'sm'
}
```

Render: `<div role="radiogroup" aria-label>` com `<button role="radio" aria-checked>` por opção, `display:flex; gap:0.8rem; flex-wrap:wrap`.

CSS (BEM `.choicechipgroup__chip`):
- base: radius `99rem`; Lato 700; md = padding `0.9rem 1.6rem`, font `.78rem`; sm = `0.9rem 1.4rem`, `.75rem`; fundo `#fff`; borda `1.5px solid #EDE9E4`; cor `#374151`; cursor pointer; transição `background .15s, border-color .15s`.
- `--primary` (tone outline): borda/cor `var(--color-pk)`; sombra `0 2px 8px rgba(255,60,172,.12)`.
- `--primary` (tone soft): fundo `var(--color-pk-soft)`; borda `#FFD0ED`; cor `var(--color-pk)`.
- `--selected` (value === option.value): fundo `var(--color-pk)`; borda transparente; cor `#fff`; sombra `0 2px 8px rgba(255,60,172,.25)`.
- `:disabled`: opacity .5, cursor not-allowed.

Testes: renderiza N chips; click chama `onSelect(value)`; `disabled` não chama; `aria-checked` correto. Story: tone outline (Sim/Não/Bebê a caminho, primeiro primary) e tone soft (5 sugestões).

### 4.2 `composites/AgentFormCard/AgentFormCard.svelte`

```ts
import type { Snippet } from 'svelte'
export interface AgentFormCardProps {
  title: string
  children: Snippet
  maxWidth?: string   // ex. '26rem'; default 100%
}
```

Markup: `<section class="agentformcard" style:max-width>` → header (`display:flex; gap:0.6rem; align-items:center; margin-bottom:1.2rem`) com badge IA + `<h3 class="agentformcard__title">` → `{@render children()}`.

Badge IA (elemento interno, não componente): `inline-flex; gap:0.4rem; padding:0.2rem 0.8rem; radius 99rem; background:var(--bk); color:#fff; font:.6rem 700 var(--font-lato)`; dot `<span>` 5px circle `var(--color-pk)`; texto "IA".

Card: `background:#fff; border:1.5px solid #FFD0ED; border-radius:1.4rem; padding:1.4rem; box-shadow:0 2px 12px rgba(255,60,172,.1)`. Título: `.72rem 700 var(--bk)`.

### 4.3 `composites/MonthPicker/MonthPicker.svelte`

```ts
export interface MonthOption { value: string /* YYYY-MM */; label: string /* 'Out' */ }
export interface MonthPickerProps {
  months: MonthOption[]
  value?: string
  onChange: (value: string) => void
  ariaLabel: string
}
```

Grid `repeat(4, 1fr); gap:0.6rem`. Célula: botão `padding:0.7rem 0; radius 0.8rem; font .72rem 700`; default `background:#F3F4F6; color:#374151`; selecionada `background:var(--color-pk); color:#fff; box-shadow:0 2px 8px rgba(255,60,172,.25)`. `role="radiogroup"`/`radio` como no 4.1.

### 4.4 `patterns/ChildInlineForm/ChildInlineForm.svelte`

Formulário da tela 05, para uso dentro de `AgentFormCard` (e reuso futuro em `/child/register`).

```ts
export interface ChildInlineFormValues {
  name: string
  ageMonths: number | null
  currentHeightCm: number | null
  currentWeightKg: number | null
  birthHeightCm: number | null
  birthWeightG: number | null
}
export interface ChildInlineFormProps {
  initial?: Partial<ChildInlineFormValues>
  loading?: boolean
  submitLabel: string
  labels: {
    name: string; age: string; height: string; weight: string
    birthHeight: string; birthWeight: string
  }
  units?: { age?: string; height?: string; weight?: string; birthHeight?: string; birthWeight?: string }
  onSubmit: (values: ChildInlineFormValues) => void
}
```

Layout: grid `1fr 1fr; gap:1rem`; nome ocupa 2 colunas em telas <480px se necessário (mock usa 2 col sempre — manter 2 col). Campos numéricos com sufixo de unidade: reusar `FormField`/`Input` do DS se suportarem sufixo; senão, marcação própria `.childinlineform__group` (`display:flex; border:1.5px solid #D1D5DB; radius 0.8rem; overflow:hidden`) com `<input type="number">` + `<span class="childinlineform__suffix">` (`background:#F3F4F6; font:.65rem 700; border-left:1.5px solid #D1D5DB; padding:0.9rem 0.8rem`). Labels: `.68rem 700 #374151; margin-bottom:0.4rem`. CTA: `Button variant="pk"` full-width, `disabled` até nome + idade preenchidos. Unidades default: meses/cm/kg/cm/g.

Validação: apenas UI (required/min=0); validação de domínio fica no chamador com `CreateChildInputSchema` (WP6.2).

### 4.5 `patterns/AgentTopBar/AgentTopBar.svelte`

```ts
export interface AgentTopBarProps {
  agentName: string
  status: 'online' | 'typing' | 'offline'
  statusLabel: string          // texto traduzido: 'online' etc.
  statusDetail?: string        // ex. '· Sofia: M'
  unreadCount?: number
  userInitials: string
  onNotifications: () => void
  onProfile: () => void
}
```

Estrutura (mock `.chat-topbar`): container `position:sticky; top:0; z-index:100; background:rgba(255,255,255,.95); backdrop-filter:blur(12px); border-bottom:1px solid #F3F4F6; padding:0.9rem 1.4rem; display:flex; align-items:center; gap:1rem`.
- Esquerda (flex:1): avatar do agente = círculo 32px `var(--bk)` com SVG droplet (`viewBox="0 0 20 24"`, path do logo, fill `var(--color-pk)`, 12×15) + `DotIndicator` verde 8px, borda branca 2px, pulsante quando `status !== 'offline'`; coluna nome (`.8rem 700`) e status (`.62rem 700; cor #22C55E` online / `#9CA3AF` offline) + `statusDetail` em `#9CA3AF`.
- Direita: `IconButton` sino (badge `CountBadge` se `unreadCount > 0`, dot rosa posição absoluta) e `Avatar size="sm" fill="pk"` com `userInitials`, clicável (`onProfile`).

Teste: clicks chamam callbacks; badge só com unread>0; droplet presente.

### 4.6 `patterns/OnboardingHero/OnboardingHero.svelte`

```ts
export interface OnboardingFeature {
  icon: 'size' | 'age' | 'weight' | 'location'
  label: string
}
export interface OnboardingHeroProps {
  title: string          // pode conter <em> — usar {@html} NÃO; receber duas partes:
  titleAccent?: string   // trecho em itálico rosa
  description: string
  features: OnboardingFeature[]
}
```

Conteúdo: SVG ilustrativo **copiado literalmente da tela 03 do mock** (`viewBox="0 0 240 200"`: círculos de glow, droplet com rosto, 4 cards orbitais — body/régua/balança/pin — linhas tracejadas e sparkles). Abaixo, título Cormorant 300 (accent `<em>` rosa), descrição `.8rem` translúcida, grid 2×2 de pills (`background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); radius 1rem; padding:0.9rem 1.2rem`) com ícone lucide correspondente (`Ruler`, `Clock`, `Gauge`, `MapPin`) em `var(--color-pk-mid)`.

O componente assume fundo escuro (gradiente fica na página, WP5).

### 4.7 Exports — editar `packages/design-system/src/index.ts`

```ts
export { ChoiceChipGroup } from './composites/ChoiceChipGroup/index.js'
export type { ChoiceChipOption } from './composites/ChoiceChipGroup/index.js'
export { AgentFormCard } from './composites/AgentFormCard/index.js'
export { MonthPicker } from './composites/MonthPicker/index.js'
export type { MonthOption } from './composites/MonthPicker/index.js'
// patterns/index.ts:
export { AgentTopBar } from './AgentTopBar/index.js'
export { ChildInlineForm } from './ChildInlineForm/index.js'
export { OnboardingHero } from './OnboardingHero/index.js'
```

**DoD**: 6 componentes com stories visíveis no Storybook, testes passando, exports funcionando via `import { X } from '@babyclothes/design-system'`.
