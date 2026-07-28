# Spec detalhada — Modo Agente: feature flag + registro PF-only

> Data: 2026-07-13 · Destino: `docs/superpowers/specs/`
> Formato: **work packages (WP0–WP11)** autocontidos para delegação a subagentes.
> Emenda 2026-07-13: e-mail/senha na API (WP9), campos de perfil no registro (WP3 reescrito), `Select` no DS (WP10) e login por e-mail (WP11) — design em `docs/superpowers/specs/2026-07-13-email-auth-profile-fields-design.md`.
> Cada WP tem: arquivos, código completo ou diff, regras, e Definition of Done (DoD).
> Base visual: `BabyClothes Chat Mocks.dc.html` (telas 01–12). Base de código: monorepo `babyclothes`.

## Regras globais (valem para TODOS os WPs)

1. **Svelte 5 runes**: `$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`, `Snippet`. Nunca `export let`.
2. **Sem emojis** em código, strings ou stories. Ícones somente de `lucide-svelte`.
3. **CSS**: custom properties de `@babyclothes/design-system/tokens.css`; BEM `.block__element--modifier`; `<style>` scoped no componente.
4. **Não editar** estes arquivos (somente ler): `RegisterScreen.svelte`, `LoginCard.svelte`, componentes existentes do design system, rotas de catálogo/sell.
5. **Nada é deletado.** Marketplace fica no código, oculto por flag.
6. Componentes **nunca** leem `import.meta.env` ou `PUBLIC_APP_MODE` diretamente — sempre via `flags` (WP1).
7. Todo componente novo do design system tem: `NomeDoComponente.svelte` + `index.ts` + `NomeDoComponente.stories.ts` + `NomeDoComponente.test.ts`, e export em `packages/design-system/src/index.ts`.
8. Rodar ao final de cada WP: `yarn workspace @babyclothes/web check && yarn workspace @babyclothes/web test` (e o equivalente do design-system quando aplicável).
9. Textos via i18n: `$t('chave')` — chaves definidas no WP7. Nunca hardcodar português no componente.

Tokens de referência (de `tokens.css` / mock):
`--color-pk #FF3CAC` · `--color-pk-soft #FFE8F5` · `--color-pk-mid #FF85CC` · `--color-pk-purple #B03EFF` · `--bk #111111` · `--of #F8F5F2` · borda neutra `#EDE9E4` · borda input `#D1D5DB` · texto secundário `#6B7280` · texto terciário `#9CA3AF` · sucesso `#22C55E` · erro `var(--color-error)` / `#EF4444` · fontes `--font-lato`, `--sr` (Cormorant), `--font-londrina`.

Ordem de execução e dependências:

```
WP9 (API e-mail/senha) ──► WP3 (registro PF) e WP11 (login e-mail)
WP10 (DS Select) ──► WP3
WP1 (flags) ──► WP2 (shell/guards) ──► WP8 (QA)
WP1 ──► WP3 (registro PF) e WP11 (login e-mail)
WP4 (DS components) ──► WP5 (onboarding) e WP6 (agente)
WP1 + WP4 ──► WP5, WP6
WP7 (i18n) pode rodar em paralelo; WP3/5/6/11 dependem das chaves
```

---

## WP0 — Ambiente

**Arquivo novo** `apps/web/.env.agent`:

```bash
PUBLIC_API_URL=http://localhost:4000
PUBLIC_MOCK_DATA=false
PUBLIC_GOOGLE_CLIENT_ID=350255803527-o0hj99i1tnmj82lsb20hokj9lhn2prsf.apps.googleusercontent.com
PUBLIC_APP_MODE=agent
```

**Editar** `apps/web/.env` — acrescentar linha:

```bash
PUBLIC_APP_MODE=full
```

**Editar** `apps/web/package.json` — script novo:

```json
"dev:agent": "dotenv -e .env.agent -- vite dev"
```

(Se `dotenv-cli` não estiver no workspace, adicionar como devDependency.)

**DoD**: `yarn workspace @babyclothes/web dev` sobe em modo full; `dev:agent` sobe em modo agent.

---

## WP1 — Feature flags

### 1.1 Editar `apps/web/src/lib/env.ts` — acrescentar ao final:

```ts
export const PUBLIC_APP_MODE = get('PUBLIC_APP_MODE', 'full')
```

### 1.2 Arquivo novo `apps/web/src/lib/feature-flags.ts` (código completo):

```ts
import { PUBLIC_APP_MODE } from '$lib/env'

export type AppMode = 'full' | 'agent'

export interface FeatureFlags {
  /** Catálogo, detalhe de item, venda, ProductTray, busca no TopBar */
  marketplace: boolean
  /** Registro PJ (CNPJ). false = somente PF */
  pjRegistration: boolean
  /** BottomNav com abas de marketplace */
  marketplaceNav: boolean
  /** Tela /onboarding antes do primeiro acesso ao agente */
  agentOnboarding: boolean
  /** Formulário de login por e-mail/senha na tela /login (WP11) */
  emailLogin: boolean
}

export function parseAppMode(raw: string): AppMode {
  return raw === 'agent' ? 'agent' : 'full'
}

export function deriveFlags(mode: AppMode): FeatureFlags {
  const isAgent = mode === 'agent'
  return {
    marketplace: !isAgent,
    pjRegistration: !isAgent,
    marketplaceNav: !isAgent,
    agentOnboarding: isAgent,
    emailLogin: isAgent,
  }
}

export const appMode: AppMode = parseAppMode(PUBLIC_APP_MODE)
export const flags: FeatureFlags = deriveFlags(appMode)

/** Prefixos de rota bloqueados quando marketplace=false */
export const MARKETPLACE_ROUTES = ['/catalog', '/sell'] as const

/** Home autenticada conforme o modo */
export const HOME_ROUTE: string = flags.marketplace ? '/catalog' : '/agent'
```

### 1.3 Arquivo novo `apps/web/src/lib/feature-flags.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { deriveFlags, parseAppMode } from './feature-flags'

describe('parseAppMode', () => {
  it('retorna agent apenas para "agent"', () => {
    expect(parseAppMode('agent')).toBe('agent')
    expect(parseAppMode('full')).toBe('full')
    expect(parseAppMode('')).toBe('full')
    expect(parseAppMode('banana')).toBe('full')
  })
})

describe('deriveFlags', () => {
  it('modo full liga tudo de marketplace', () => {
    expect(deriveFlags('full')).toEqual({
      marketplace: true,
      pjRegistration: true,
      marketplaceNav: true,
      agentOnboarding: false,
      emailLogin: false,
    })
  })
  it('modo agent desliga marketplace e PJ', () => {
    expect(deriveFlags('agent')).toEqual({
      marketplace: false,
      pjRegistration: false,
      marketplaceNav: false,
      agentOnboarding: true,
      emailLogin: true,
    })
  })
})
```

**DoD**: testes acima passam; nenhum outro arquivo importa `PUBLIC_APP_MODE` diretamente (grep).

---

## WP2 — Guards de rota e shell

### 2.1 Editar `apps/web/src/hooks.server.ts`

No `handle`, **após** resolver a sessão e **antes** de `resolve(event)`, inserir:

```ts
import { redirect } from '@sveltejs/kit'
import { flags, MARKETPLACE_ROUTES, HOME_ROUTE } from '$lib/feature-flags'

// dentro do handle:
const { pathname } = event.url
if (!flags.marketplace && MARKETPLACE_ROUTES.some((r) => pathname.startsWith(r))) {
  throw redirect(303, HOME_ROUTE)
}
```

Atualizar `hooks.server.test.ts`: caso novo — com `flags.marketplace=false` (mock do módulo `$lib/feature-flags` via `vi.mock`), GET `/catalog` → 303 para `/agent`; com `true`, passa.

### 2.2 Trocar redirects hardcoded `'/catalog'`

Arquivos: `routes/login/+page.server.ts`, `routes/register/+page.server.ts`. Toda ocorrência `redirect(303, '/catalog')` vira `redirect(303, HOME_ROUTE)` com import de `$lib/feature-flags`. **Exceção**: no `register/+page.server.ts`, o redirect de sucesso do modo agent vai para `/onboarding` (ver WP3.6).

### 2.3 Editar `apps/web/src/routes/+layout.svelte`

Mudanças exatas:

1. Import: `import { flags } from '$lib/feature-flags'` e `import AgentTopBar from '$lib/presentation/shell/AgentTopBar.svelte'` (wrapper criado no WP4.5; até lá usar o pattern do DS direto).
2. Rotas sem shell: hoje só `/login`. Passa a: `const bareRoutes = ['/login', '/register', '/onboarding']` — `const isBareRoute = $derived(bareRoutes.some((r) => $page.url.pathname.startsWith(r)))`; o `{#if isLoginRoute}` vira `{#if isBareRoute}`.
3. TopBar:

```svelte
{#if flags.marketplace}
  <TopBar variant={topbarVariant} ... />   <!-- bloco atual, intacto -->
{:else}
  <AgentTopBar
    agentName={$t('agent.topbar.name')}
    status="online"
    unreadCount={$unreadCount}
    userInitials={initials(data.session?.name ?? '')}
    onNotifications={() => goto('/notifications')}
    onProfile={() => goto('/profile')}
  />
{/if}
```

Helper local no script: `function initials(name: string): string { return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') }`.

4. BottomNav: envolver em `{#if flags.marketplaceNav} ... {/if}`. O padding-bottom mobile de `.app-main` (6.4rem) só se aplica com nav — adicionar classe condicional `class:app-main--with-nav={flags.marketplaceNav}` e mover a media query para essa classe.
5. Footer: `{#if flags.marketplace && !isChatRoute}` (modo agent não mostra footer no shell; footer continua nas páginas bare via suas próprias telas se preciso).
6. `isChatRoute` passa a cobrir `/agent`: `$page.url.pathname.startsWith('/chat') || $page.url.pathname.startsWith('/agent')`.

**DoD**: modo full = pixel-idêntico ao atual (nenhum snapshot muda); modo agent = sem BottomNav, sem busca/Publicar, AgentTopBar em todas as rotas autenticadas.

---

## WP3 — Registro PF-only (wizard de 2 passos)

> Depende de: WP9 (`POST /auth/signup`), WP10 (primitive `Select`), WP1 (flags), WP7 (chaves i18n).
> Todos os campos são obrigatórios. Máscaras só no front — o wire leva dígitos puros (CPF, telefone, CEP).

### 3.1 Arquivo novo `apps/web/src/lib/domain/user/value-objects/Contact.ts`

```ts
export function stripDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** (11) 98765-4321 · (11) 3456-7890 — formata progressivamente enquanto digita */
export function formatPhone(value: string): string {
  const d = stripDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** 01310-100 */
export function formatCep(value: string): string {
  const d = stripDigits(value).slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}
```

Teste `Contact.test.ts` ao lado: `formatPhone` com 10 e 11 dígitos, entrada parcial e entrada já mascarada (idempotente); `formatCep` parcial/completo; `stripDigits`.

### 3.2 Arquivo novo `apps/web/src/lib/domain/user/schemas.ts`

```ts
import { z } from 'zod'
import { isValidCpf, stripDocument } from './value-objects/Document'
import { stripDigits } from './value-objects/Contact'

export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const RegisterPFStep1Schema = z.object({
  name: z.string().trim().min(2, 'validation.name_required').max(120),
  email: z.string().trim().email('validation.email_invalid').max(254),
  password: z.string().min(8, 'validation.password_min').max(72),
  cpf: z.string().transform(stripDocument).refine(isValidCpf, 'validation.cpf_invalid'),
})

export const RegisterPFStep2Schema = z.object({
  phone: z
    .string()
    .transform(stripDigits)
    .refine((v) => v.length === 10 || v.length === 11, 'validation.phone_invalid'),
  nationality: z.string().trim().min(2, 'validation.nationality_required').max(60),
  cep: z.string().transform(stripDigits).refine((v) => v.length === 8, 'validation.cep_invalid'),
  addressLine: z.string().trim().min(4, 'validation.address_required').max(160),
  city: z.string().trim().min(2, 'validation.city_required').max(80),
  state: z.string().refine((v) => (UF_LIST as readonly string[]).includes(v), 'validation.state_required'),
})

export const RegisterPFInputSchema = RegisterPFStep1Schema.merge(RegisterPFStep2Schema)
export type RegisterPFInput = z.infer<typeof RegisterPFInputSchema>
```

(Mensagens são **chaves i18n**, resolvidas na apresentação.)

Teste novo `schemas.test.ts` ao lado, com `safeParse` e assert em `success` e `error.issues[0].message`:
- Passo 1 — válido completo; CPF com máscara `529.982.247-25` (válido após strip); CPF `111.111.111-11` inválido; email sem `@`; senha 7 chars.
- Passo 2 — válido completo; telefone mascarado `(11) 98765-4321` (válido após strip); telefone com 9 dígitos (falha); CEP `01310-100` (ok) e com 7 dígitos (falha); estado `XX` (falha); endereço com 3 chars (falha); cidade vazia (falha).
- `RegisterPFInputSchema` exige os 10 campos.

### 3.3 Arquivo novo `apps/web/src/lib/presentation/components/RegisterPFScreen.svelte`

Tela **nova e independente** (não importa nada de `RegisterScreen.svelte`), em **wizard de 2 passos**. Layout base = mock tela 02: header com voltar + "Criar conta"; lead; título Cormorant com em rosa; o passo 2 reusa o mesmo esqueleto (header, bloco de campos, CTA), trocando título/lead.

Contrato:

```ts
import type { RegisterPFInput } from '$lib/domain/user/schemas'

export interface RegisterPFScreenProps {
  onSubmit: (data: RegisterPFInput) => void
  onGoogleSignIn: () => void
  onBack: () => void
  loading?: boolean
  /** Mensagem já traduzida */
  error?: string
  /** Erros por campo vindos do servidor (chaves de RegisterPFInput, mensagens já traduzidas) */
  serverFieldErrors?: Partial<Record<keyof RegisterPFInput, string>>
}
```

Esqueleto (estrutura obrigatória; subagente completa estilos seguindo o mock):

```svelte
<script lang="ts">
  import { Button, IconButton, Input, Select } from '@babyclothes/design-system'
  import { ArrowRight, MapPin } from 'lucide-svelte'
  import { t } from '$lib/i18n'
  import {
    RegisterPFStep1Schema, RegisterPFInputSchema, UF_LIST, type RegisterPFInput,
  } from '$lib/domain/user/schemas'
  import { formatCpf } from '$lib/domain/user/value-objects/Document'
  import { formatPhone, formatCep } from '$lib/domain/user/value-objects/Contact'

  let { onSubmit, onGoogleSignIn, onBack, loading = false, error, serverFieldErrors }:
    RegisterPFScreenProps = $props()

  let step = $state<1 | 2>(1)
  let name = $state(''); let email = $state(''); let password = $state(''); let cpf = $state('')
  let phone = $state(''); let nationality = $state('Brasileira'); let cep = $state('')
  let addressLine = $state(''); let city = $state(''); let stateUf = $state('')
  let fieldErrors = $state<Partial<Record<keyof RegisterPFInput, string>>>({})

  const STEP1_FIELDS: (keyof RegisterPFInput)[] = ['name', 'email', 'password', 'cpf']

  function handleCpfInput() { cpf = formatCpf(cpf) }
  function handlePhoneInput() { phone = formatPhone(phone) }
  function handleCepInput() { cep = formatCep(cep) }

  function collectErrors(issues: { path: (string | number)[]; message: string }[]) {
    return Object.fromEntries(issues.map((i) => [i.path[0], $t(String(i.message))]))
  }

  function handleContinue() {
    const parsed = RegisterPFStep1Schema.safeParse({ name, email, password, cpf })
    if (!parsed.success) { fieldErrors = collectErrors(parsed.error.issues); return }
    fieldErrors = {}
    step = 2
  }

  function handleBack() {
    if (step === 2) { step = 1; return }
    onBack()
  }

  function handleSubmit() {
    const parsed = RegisterPFInputSchema.safeParse({
      name, email, password, cpf, phone, nationality, cep, addressLine, city, state: stateUf,
    })
    if (!parsed.success) { fieldErrors = collectErrors(parsed.error.issues); return }
    fieldErrors = {}
    onSubmit(parsed.data)
  }

  $effect(() => {
    if (!serverFieldErrors) return
    fieldErrors = { ...fieldErrors, ...serverFieldErrors }
    if (STEP1_FIELDS.some((f) => serverFieldErrors[f])) step = 1
  })
</script>
```

Comportamento por passo:

- **Passo 1 — "Sua conta"**: indicador `auth.register_pf.step_indicator` ("Passo 1 de 2"); campos Nome, E-mail (`inputmode="email"`), Senha (toggle de visibilidade), CPF (máscara, `inputmode="numeric"`, `maxlength=14`); botão Google + divisor "ou com e-mail" **só neste passo**; CTA `auth.register_pf.continue` → `handleContinue()`.
- **Passo 2 — "Contato e endereço"** (`auth.register_pf.step2_title`, lead `auth.register_pf.step2_lead`): Telefone (máscara, `inputmode="tel"`, `maxlength=15`), Nacionalidade (pré-preenchida "Brasileira"), CEP (máscara, `inputmode="numeric"`, `maxlength=9`), Endereço (placeholder "Rua, número e complemento"), Cidade (ícone MapPin + hint existente), Estado (`Select` do DS — options de `UF_LIST`, label = value, placeholder `auth.register_pf.state_placeholder`); CTA `auth.register_pf.submit` com `ArrowRight size={14}` e `{loading}` → `handleSubmit()`.
- Voltar (IconButton do header): passo 2 → passo 1 preservando valores; passo 1 → `onBack()`.
- Erros do servidor: `$effect` acima mescla `serverFieldErrors` e volta ao passo 1 quando o erro é de campo do passo 1 (caso típico: e-mail já cadastrado).

Markup: BEM `registerpf__*` (`__header`, `__heading`, `__lead`, `__title`, `__step`, `__google`, `__divider`, `__fields`, `__cta`, `__error`). Botão Google: `Button variant="ghost" size="lg"` com SVG do logo Google inline (copiar paths de `LoginCard.svelte`). Cada `Input`/`Select` recebe `error={fieldErrors.campo}`.

Largura máx `40rem`, padding `0.8rem 1rem` (igual RegisterScreen).

Teste `RegisterPFScreen.test.ts`: passo 1 inválido não avança (erros visíveis); passo 1 válido mostra os campos do passo 2; voltar do passo 2 preserva os valores do passo 1; submit final chama `onSubmit` com dados sem máscara; `serverFieldErrors` com `email` força retorno ao passo 1.

### 3.4 Editar `apps/web/src/routes/register/+page.svelte`

```svelte
{#if flags.pjRegistration}
  <RegisterScreen onSubmit={handleSubmit} onBack={() => goto('/login')} {loading} error={errorMessage} />
{:else}
  <RegisterPFScreen
    onSubmit={handlePFSubmit}
    onGoogleSignIn={() => goto('/login')}
    onBack={() => goto('/login')}
    {loading}
    error={errorMessage}
    serverFieldErrors={form?.details}
  />
{/if}
```

`handlePFSubmit(data: RegisterPFInput)` grava os 10 campos em inputs hidden (+ `type=pf` fixo) e chama `form.requestSubmit()`.

### 3.5 Arquivo novo `apps/web/src/lib/server/auth-cookies.ts`

Extrair de `routes/login/+page.server.ts` os helpers `cookieOpts` e `setAuthCookies(cookies, token, refreshToken)` para este módulo, **sem mudar comportamento** (mesmos nomes de cookie, mesmos TTLs 1h/30d). `login/+page.server.ts` passa a importar daqui; a action de registro (3.6) e a de login por e-mail (WP11) reusam. Testes do login continuam verdes.

### 3.6 Editar `apps/web/src/routes/register/+page.server.ts`

- `load`: trocar `redirect(303, '/catalog')` por `redirect(303, HOME_ROUTE)`. Em modo agent **não** exigir sessão prévia (o signup por e-mail começa deslogado); com sessão ativa, redirecionar a `HOME_ROUTE`.
- `actions.default`, modo full (`flags.pjRegistration`): comportamento atual (POST `/auth/register` com token da sessão) **intacto**.
- `actions.default`, modo agent:
  - Se `type === 'pj'` → `return fail(400, { error: 'pj_disabled' })`.
  - Validar com `RegisterPFInputSchema.safeParse`; em falha `return fail(422, { error: 'invalid_fields', details })` (details = mapa campo → mensagem i18n resolvida).
  - `POST ${PUBLIC_API_URL}/auth/signup` com body **snake_case**:

    ```json
    { "name": "...", "email": "...", "password": "...", "cpf": "...", "phone": "...",
      "nationality": "...", "cep": "...", "address_line": "...", "city": "...", "state": "..." }
    ```

    (mapear `addressLine → address_line`; cpf/phone/cep já vêm sem máscara do schema).
  - `201` → `setAuthCookies(cookies, token, refresh_token)` e `throw redirect(303, '/onboarding')`.
  - `422` da API → `return fail(422, { error: 'validation_failed', details })`, traduzindo `details.email` de unicidade para `$t('auth.register_pf.error_email_taken')`.
  - Outro erro → `return fail(502, { error: 'signup_failed' })`.
- Atualizar `page.server.test.ts` (mock de flags e de fetch): pj_disabled; campos inválidos → 422 com details; sucesso seta os 2 cookies e redireciona `/onboarding`; e-mail duplicado devolve `details.email`; modo full inalterado.

**DoD**: modo full registra PF/PJ como hoje; modo agent completa o wizard de 2 passos, cria a conta via `POST /auth/signup` **já autenticada** (cookies setados, sem passo de login) e cai em `/onboarding`; e-mail duplicado volta ao passo 1 com erro no campo.

---

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

---

## WP5 — Rota /onboarding

**Arquivos novos**: `apps/web/src/routes/onboarding/+page.svelte` e `+page.server.ts`.

`+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit'
import { flags, HOME_ROUTE } from '$lib/feature-flags'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login')
  if (!flags.agentOnboarding) throw redirect(303, HOME_ROUTE)
  return {}
}
```

`+page.svelte`: página bare (sem shell — WP2.2 item 2). Fundo `linear-gradient(160deg,#0F0F0F 0%,#1A0814 60%,#0A0A1A 100%)`, min-height 100vh, conteúdo centrado max-width 40rem. Topo: link "Pular" (`.72rem 700; rgba(255,255,255,.4)`) → `finish()`. Corpo: `<OnboardingHero>` com chaves i18n. Rodapé: `Button variant="pk" size="lg"` full-width `onboarding.cta` + `ArrowRight` → `finish()`.

```ts
const KEY = 'bc_onboarded'
function finish() {
  try { localStorage.setItem(KEY, '1') } catch {}
  goto('/agent')
}
```

Guard client-side no `onMount`/`$effect`: se `localStorage.getItem(KEY) === '1'` → `goto('/agent')` (replaceState).

**DoD**: registro em modo agent cai no onboarding uma única vez; "Pular" e CTA levam a `/agent`; recarregar `/onboarding` depois de visto redireciona.

---

## WP6 — Rota /agent (intake + chat)

### 6.1 Tipos de mensagem — editar `apps/web/src/lib/domain/chat/entities/Message.ts`

Substituir o type `ComponentPayload` por união discriminada, **preservando** os três formatos atuais como interfaces nomeadas (mesmos campos de hoje):

```ts
export interface CarouselPayload { type: 'carousel'; items?: Item[]; label?: string }
export interface ItemListPayload { type: 'itemList'; items?: Item[]; label?: string }
export interface GrowthAlertPayload {
  type: 'growthAlert'
  childName?: string; currentSize?: string; nextSize?: string
  daysUntil?: number; progress?: number; eyebrow?: string; description?: string
  sizes?: { label: string; status: 'past' | 'current' | 'next' | 'future' }[]
  primaryAction?: { label: string; onclick: () => void }
  secondaryAction?: { label: string; onclick: () => void }
}

export interface ChoiceChipsPayload {
  type: 'choiceChips'
  options: { value: string; label: string; primary?: boolean }[]
  onSelect: (value: string) => void
}
export interface ChildFormPayload {
  type: 'childForm'
  title: string
  initial?: Partial<import('$lib/domain/child/schemas').CreateChildInput>
  onSubmit: (input: import('$lib/domain/child/schemas').CreateChildInput) => void
}
export interface DueDatePayload {
  type: 'dueDate'
  title: string
  months: { value: string; label: string }[]
  onConfirm: (month: string) => void
}
export interface SuggestionChipsPayload {
  type: 'suggestions'
  heading?: string
  suggestions: { id: string; label: string; primary?: boolean }[]
  onSelect: (id: string) => void
}

export type ComponentPayload =
  | CarouselPayload | ItemListPayload | GrowthAlertPayload
  | ChoiceChipsPayload | ChildFormPayload | DueDatePayload | SuggestionChipsPayload
```

`Message` inalterado. Verificar chamadores de `ComponentPayload` (chat page) — campos existentes não mudam, só o narrowing por `payload.type`.

### 6.2 Schemas — editar `apps/web/src/lib/domain/child/schemas.ts`

Substituir `CreateChildInputSchema` por:

```ts
export const CreateChildInputSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(80),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
    ageMonths: z.number().int().min(0).max(216).optional(),
    currentWeightG: z.number().int().min(0).optional(),
    currentHeightCm: z.number().int().min(0).optional(),
    birthWeightG: z.number().int().min(0, 'Peso não pode ser negativo'),
    birthHeightCm: z.number().int().min(0, 'Altura não pode ser negativa'),
    document: z.string().optional(),
  })
  .refine((c) => c.birthDate !== undefined || c.ageMonths !== undefined, {
    message: 'Informe data de nascimento ou idade',
    path: ['birthDate'],
  })
```

Atualizar `schemas.test.ts`: os casos atuais que passavam `birthDate` continuam válidos; casos novos — só `ageMonths` (ok), nenhum dos dois (falha), `ageMonths: -1` (falha).

### 6.3 Máquina de intake — arquivo novo `apps/web/src/lib/application/chat/IntakeMachine.ts`

```ts
import type { CreateChildInput } from '$lib/domain/child/schemas'

export type IntakeStep =
  | 'ask_has_children' | 'ask_children_count' | 'fill_child_form'
  | 'ask_due_date' | 'explain_platform' | 'ask_search_intent' | 'free_chat'

export type HasChildrenAnswer = 'yes' | 'no' | 'expecting'

export interface IntakeState {
  step: IntakeStep
  hasChildren: HasChildrenAnswer | null
  childrenCount: number | null
  childrenFilled: number
  children: CreateChildInput[]
  dueDate: string | null // YYYY-MM
}

export const initialIntakeState: IntakeState = {
  step: 'ask_has_children',
  hasChildren: null,
  childrenCount: null,
  childrenFilled: 0,
  children: [],
  dueDate: null,
}

export type IntakeEvent =
  | { type: 'ANSWER_HAS_CHILDREN'; answer: HasChildrenAnswer }
  | { type: 'ANSWER_COUNT'; count: number }
  | { type: 'CHILD_SUBMITTED'; child: CreateChildInput }
  | { type: 'DUE_DATE_CONFIRMED'; month: string }
  | { type: 'EXPLANATION_DONE' }
  | { type: 'SEARCH_INTENT_CHOSEN' }

export function reduceIntake(state: IntakeState, event: IntakeEvent): IntakeState {
  switch (event.type) {
    case 'ANSWER_HAS_CHILDREN':
      if (state.step !== 'ask_has_children') return state
      if (event.answer === 'yes') return { ...state, hasChildren: 'yes', step: 'ask_children_count' }
      if (event.answer === 'expecting') return { ...state, hasChildren: 'expecting', step: 'ask_due_date' }
      return { ...state, hasChildren: 'no', step: 'explain_platform' }
    case 'ANSWER_COUNT':
      if (state.step !== 'ask_children_count' || event.count < 1) return state
      return { ...state, childrenCount: event.count, step: 'fill_child_form' }
    case 'CHILD_SUBMITTED': {
      if (state.step !== 'fill_child_form') return state
      const filled = state.childrenFilled + 1
      const children = [...state.children, event.child]
      const done = state.childrenCount !== null && filled >= state.childrenCount
      return { ...state, childrenFilled: filled, children, step: done ? 'explain_platform' : 'fill_child_form' }
    }
    case 'DUE_DATE_CONFIRMED':
      if (state.step !== 'ask_due_date') return state
      return { ...state, dueDate: event.month, step: 'explain_platform' }
    case 'EXPLANATION_DONE':
      if (state.step !== 'explain_platform') return state
      return { ...state, step: 'ask_search_intent' }
    case 'SEARCH_INTENT_CHOSEN':
      if (state.step !== 'ask_search_intent') return state
      return { ...state, step: 'free_chat' }
  }
}
```

Teste novo `IntakeMachine.test.ts`: os 3 ramos completos (yes com count=2 exige 2 CHILD_SUBMITTED; no vai direto a explain; expecting exige DUE_DATE), eventos fora de ordem são no-ops, count<1 é no-op.

### 6.4 Rota — arquivos novos `apps/web/src/routes/agent/+page.server.ts` e `+page.svelte`

`+page.server.ts`: exige sessão (`redirect /login`); se `flags.marketplace` (modo full), `redirect(303, '/chat')`.

`+page.svelte`: fork de `routes/chat/+page.svelte` (ler antes de escrever) com:
- Mesmo transporte SSE/`IChatRepository` e store de mensagens.
- Estado `let intake = $state(initialIntakeState)`; helper `dispatch(event)` que aplica `reduceIntake` e enfileira as mensagens/payloads do próximo passo (textos das chaves `agent.intake.*`).
- Render de `ComponentPayload` por `payload.type`:
  - `choiceChips` → `<ChoiceChipGroup>` (tone outline)
  - `childForm` → `<AgentFormCard title>` com `<ChildInlineForm>`; no submit: `CreateChildInputSchema.parse` → `CreateChild` use case (`IChildRepository`) → `dispatch({ type: 'CHILD_SUBMITTED', child })`
  - `dueDate` → `<AgentFormCard>` com `<MonthPicker>` + confirmar
  - `suggestions` → `<ChoiceChipGroup tone="soft" size="sm">` com heading
- `explain_platform`: mensagem do agente `agent.intake.explain` + auto `EXPLANATION_DONE` após render.
- `ask_search_intent`: sugestões fixas v1 = `bodies_m | winter | party | pajamas | next_size` (labels i18n); escolha envia o texto como mensagem do usuário para o agente e entra em `free_chat`.
- Persistir intake em `sessionStorage bc_intake` (JSON) para sobreviver a reload; hidratar no início.

`routes/chat/+page.server.ts` (criar se não existir): em modo agent, `throw redirect(308, '/agent')`.

**DoD**: fluxo 04→07 do mock reproduzido ponta a ponta em `PUBLIC_APP_MODE=agent`, com crianças persistidas e chat livre funcionando após o intake.

---

## WP7 — i18n

Editar `apps/web/src/lib/i18n/pt.json` e `en.json`. Blocos completos a adicionar (en análogo):

```json
"auth": {
  "register_pf": {
    "back": "Voltar",
    "create_account": "Criar conta",
    "lead": "Leva menos de um minuto",
    "title": "Comece a conversar",
    "title_accent": "com o agente",
    "google": "Registrar com Google",
    "divider": "ou com e-mail",
    "name_label": "Nome completo",
    "name_placeholder": "Maria Clara Santos",
    "email_label": "E-mail",
    "email_placeholder": "voce@email.com",
    "password_label": "Senha",
    "password_placeholder": "Mínimo 8 caracteres",
    "city_label": "Cidade",
    "city_placeholder": "São Paulo, SP",
    "city_hint": "Usada para encontrar itens perto de você",
    "cpf_label": "CPF",
    "cpf_placeholder": "000.000.000-00",
    "submit": "Criar conta",
    "step_indicator": "Passo {{step}} de 2",
    "continue": "Continuar",
    "step2_title": "Contato e endereço",
    "step2_lead": "Para entregas e itens perto de você",
    "phone_label": "Telefone",
    "phone_placeholder": "(11) 98765-4321",
    "nationality_label": "Nacionalidade",
    "nationality_placeholder": "Brasileira",
    "cep_label": "CEP",
    "cep_placeholder": "00000-000",
    "address_label": "Endereço",
    "address_placeholder": "Rua, número e complemento",
    "state_label": "Estado",
    "state_placeholder": "UF",
    "error_email_taken": "Este e-mail já está cadastrado.",
    "error_pj_disabled": "Cadastro de empresas indisponível no momento.",
    "error_generic": "Não foi possível criar a conta. Tente novamente."
  },
  "login_email": {
    "divider": "ou entre com e-mail",
    "email_label": "E-mail",
    "email_placeholder": "voce@email.com",
    "password_label": "Senha",
    "password_placeholder": "Sua senha",
    "submit": "Entrar",
    "error_invalid_credentials": "E-mail ou senha incorretos.",
    "error_generic": "Não foi possível entrar. Tente novamente."
  }
},
"validation": {
  "name_required": "Nome é obrigatório",
  "email_invalid": "E-mail inválido",
  "password_min": "Mínimo 8 caracteres",
  "password_required": "Informe a senha",
  "city_required": "Cidade é obrigatória",
  "cpf_invalid": "CPF inválido — verifique os dígitos",
  "phone_invalid": "Telefone inválido — use DDD + número",
  "nationality_required": "Nacionalidade é obrigatória",
  "cep_invalid": "CEP inválido",
  "address_required": "Endereço é obrigatório",
  "state_required": "Selecione o estado"
},
"onboarding": {
  "skip": "Pular",
  "title": "Um agente que",
  "title_accent": "garimpa",
  "title_rest": "o brechó por você",
  "description": "A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
  "features": { "size": "Tamanho", "age": "Idade", "weight": "Peso", "location": "Localização" },
  "cta": "Conversar com o agente"
},
"agent": {
  "topbar": { "name": "Assistente IA", "online": "online", "offline": "offline", "typing": "digitando..." },
  "intake": {
    "greeting": "Oi, {{name}}! Sou o assistente do BabyClothes. Vou te ajudar a encontrar roupinhas ideais em brechós.",
    "has_children": "Pra começar: você tem filhos?",
    "yes": "Sim", "no": "Não", "expecting": "Bebê a caminho",
    "how_many": "Que bom! Quantos filhos você tem?",
    "count_3plus": "3+",
    "child_form_intro": "Perfeito! Me conta sobre ela(e) — preencha os dados abaixo:",
    "child_form_title": "Cadastro da criança",
    "child_saved": "{{name}} cadastrada! Já sei o tamanho ideal.",
    "due_date_intro": "Que alegria! Qual é a previsão de nascimento? Assim já preparo o enxoval no tamanho certo.",
    "due_date_title": "Previsão de nascimento",
    "due_date_confirm": "Confirmar",
    "due_date_saved": "Anotado! Vou sugerir itens RN e P — os tamanhos que recém-nascidos mais usam nos primeiros meses.",
    "explain": "A plataforma funciona assim: eu procuro em brechós roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
    "search_intent": "Tudo pronto! Agora me conta: o que você quer encontrar? Posso buscar por tipo de peça, ocasião ou estação.",
    "suggestions_heading": "Sugestões",
    "input_placeholder": "Pergunte sobre roupas, tamanhos...",
    "choice_placeholder": "Ou responda por aqui..."
  },
  "suggestions": {
    "bodies_m": "Bodies tamanho M",
    "winter": "Roupas de inverno",
    "party": "Look para festa",
    "pajamas": "Pijamas confortáveis",
    "next_size": "Próximo tamanho (G)"
  },
  "form": {
    "name": "Nome", "age": "Idade", "height": "Altura", "weight": "Peso",
    "birth_height": "Altura ao nascer", "birth_weight": "Peso ao nascer",
    "submit": "Salvar criança"
  }
}
```

**DoD**: nenhuma string nova hardcodada em componente; `en.json` completo com traduções equivalentes.

---

## WP8 — QA final (checklist de aceite)

Executar nos dois modos (`.env` full e `.env.agent`):

| # | Verificação | full | agent |
|---|---|---|---|
| 1 | `/catalog` acessível | ✓ | 303 → `/agent` |
| 2 | `/sell` acessível | ✓ | 303 → `/agent` |
| 3 | BottomNav renderiza | ✓ | ausente |
| 4 | TopBar busca + Publicar | ✓ | ausente (AgentTopBar) |
| 5 | `/register` tela | PF/PJ (RegisterScreen) | wizard PF 2 passos (RegisterPFScreen) |
| 6 | Action aceita `type=pj` | ✓ | fail 400 `pj_disabled` |
| 7 | Pós-registro | `/catalog` | `/onboarding` → `/agent` |
| 8 | `/chat` | ✓ | 308 → `/agent` |
| 9 | Intake: 3 ramos completos | n/a | ✓ (crianças persistidas) |
| 10 | Sugestões clicáveis enviam mensagem | n/a | ✓ |
| 11 | `/profile`, `/child`, `/child/[id]`, `/notifications` | ✓ | ✓ (via avatar/sino) |
| 12 | `check` + `test` (web e design-system) | ✓ | ✓ |
| 13 | Storybook: 6 stories novas renderizam | ✓ | — |
| 14 | grep: zero emojis em código novo; zero `import.meta.env` fora de `env.ts` | ✓ | ✓ |
| 15 | Wizard: passo 1 inválido não avança; voltar preserva valores | n/a | ✓ |
| 16 | Signup completo (2 passos) cria conta já autenticada → `/onboarding` | n/a | ✓ |
| 17 | Login por e-mail/senha após logout leva a `/agent` | ausente (flag off) | ✓ |
| 18 | Senha errada no login → "E-mail ou senha incorretos." | n/a | ✓ |
| 19 | E-mail duplicado no signup → erro no campo, wizard volta ao passo 1 | n/a | ✓ |
| 20 | `GET /auth/session` retorna phone/nationality/cep/address_line/city/state | ✓ (null p/ contas Google) | ✓ |
| 21 | Nenhuma resposta da API contém `password_hash`; senha nunca logada | ✓ | ✓ |

---

## WP9 — API: registro e login por e-mail/senha + campos de perfil

Local: `apps/api` (Elixir). Comandos sempre via Docker: `yarn test:api`, `yarn api:migrate`, `yarn api:credo`. Regras do repo: lógica de negócio no contexto (`Api.Users`), controller só delega, `{:ok, _}/{:error, _}`, `@moduledoc`/`@doc`/`@spec` em módulos e funções públicas, credo limpo, migrations aplicadas são imutáveis (criar novas).

Documentos com checksum válido para testes: CPFs `52998224725`, `11144477735`, `76523910083`; inválido `12345678900`.

### 9.1 Dependência — editar `apps/api/mix.exs`

Acrescentar em `deps`:

```elixir
{:bcrypt_elixir, "~> 3.0"},
```

Rodar `mix deps.get` dentro do container da api. (`bcrypt_elixir` compila NIF em C — se a imagem Docker não tiver toolchain, adicionar `build-base`/`gcc make` ao Dockerfile da api.)

### 9.2 Migration nova `apps/api/priv/repo/migrations/20260713000001_add_email_auth_and_profile_to_users.exs`

```elixir
defmodule Api.Repo.Migrations.AddEmailAuthAndProfileToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :password_hash, :string
      add :phone, :string
      add :nationality, :string
      add :cep, :string
      add :address_line, :string
      add :city, :string
      add :state, :string
    end

    execute(
      "ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL",
      "ALTER TABLE users ALTER COLUMN google_id SET NOT NULL"
    )
  end
end
```

(Colunas nullable de propósito: usuários Google existentes ainda não têm perfil. `google_id` vira nullable para contas de e-mail/senha existirem; o unique index continua válido — Postgres ignora NULLs em unique.)

Run: `yarn api:migrate` → `AddEmailAuthAndProfileToUsers: migrated`.

### 9.3 Schema — editar `apps/api/lib/api/users/user.ex`

1. Campos novos no `schema "users"`:

```elixir
field :password, :string, virtual: true, redact: true
field :password_hash, :string, redact: true
field :phone, :string
field :nationality, :string
field :cep, :string
field :address_line, :string
field :city, :string
field :state, :string
```

2. Atributos de módulo:

```elixir
@ufs ~w(AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO)
@profile_fields [:phone, :nationality, :cep, :address_line, :city, :state]
```

3. Changeset novo (signup e-mail/senha, conta já registrada como PF):

```elixir
@doc "Changeset for e-mail/password signup: account + password + PF document + full profile."
def signup_changeset(user, attrs) do
  user
  |> cast(attrs, [:email, :name, :password, :cpf] ++ @profile_fields)
  |> validate_required([:email, :name, :password, :cpf] ++ @profile_fields)
  |> validate_format(:email, ~r/@/)
  |> validate_length(:password, min: 8, max: 72)
  |> put_change(:type, "pf")
  |> validate_change(:cpf, &cpf_checksum/2)
  |> validate_profile()
  |> hash_password()
  |> unique_constraint(:email)
  |> unique_constraint(:cpf)
end

defp validate_profile(changeset) do
  changeset
  |> validate_format(:phone, ~r/^\d{10,11}$/, message: "must have 10 or 11 digits")
  |> validate_format(:cep, ~r/^\d{8}$/, message: "must have 8 digits")
  |> validate_inclusion(:state, @ufs)
  |> validate_length(:name, max: 120)
  |> validate_length(:nationality, max: 60)
  |> validate_length(:address_line, max: 160)
  |> validate_length(:city, max: 80)
end

defp hash_password(%Ecto.Changeset{valid?: true} = changeset) do
  case get_change(changeset, :password) do
    nil ->
      changeset

    password ->
      changeset
      |> put_change(:password_hash, Bcrypt.hash_pwd_salt(password))
      |> delete_change(:password)
  end
end

defp hash_password(changeset), do: changeset
```

4. `registration_changeset/2` (fluxo Google, uma vez) passa a **aceitar** o perfil sem exigi-lo — trocar o `cast` por `cast(attrs, [:type, :cpf, :cnpj] ++ @profile_fields)` e encadear `|> validate_profile()` depois de `validate_document_for_type()`. (`validate_format`/`validate_inclusion`/`validate_length` só rodam quando o campo veio nos attrs — nada vira obrigatório no fluxo Google, e o `RegisterScreen` do modo full continua funcionando sem mudanças.)

5. `changeset/2` (perfil Google) fica **intacto** — continua exigindo `google_id`.

### 9.4 Contexto — editar `apps/api/lib/api/users/users.ex`

```elixir
@doc "Creates a fully-registered PF account from e-mail/password signup attrs."
@spec signup(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
def signup(attrs) do
  %User{}
  |> User.signup_changeset(attrs)
  |> Repo.insert()
end

@doc "Authenticates by e-mail and password. Constant-time on unknown e-mail."
@spec authenticate(String.t(), String.t()) :: {:ok, User.t()} | {:error, :invalid_credentials}
def authenticate(email, password) when is_binary(email) and is_binary(password) do
  user = Repo.get_by(User, email: email)

  cond do
    user && user.password_hash && Bcrypt.verify_pass(password, user.password_hash) ->
      {:ok, user}

    user && user.password_hash ->
      {:error, :invalid_credentials}

    true ->
      Bcrypt.no_user_verify()
      {:error, :invalid_credentials}
  end
end
```

(Usuário só-Google, sem `password_hash`, cai no ramo `no_user_verify` → `invalid_credentials`, sem vazar que a conta existe.)

### 9.5 Rotas — editar `apps/api/lib/api/router.ex`

Junto das rotas `/auth` existentes:

```elixir
post "/auth/signup" do
  Api.Controllers.AuthController.signup(conn)
end

post "/auth/login" do
  Api.Controllers.AuthController.login(conn)
end
```

### 9.6 Controller — editar `apps/api/lib/api/controllers/auth_controller.ex`

```elixir
@doc """
POST /auth/signup
Creates a fully-registered PF account with e-mail/password and returns tokens.
"""
def signup(conn) do
  case Users.signup(conn.body_params) do
    {:ok, user} ->
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(201, Jason.encode!(%{
        token: Auth.generate_access_token(user),
        refresh_token: Auth.generate_refresh_token(user),
        user: user_json(user)
      }))

    {:error, %Ecto.Changeset{} = changeset} ->
      register_error(conn, 422, %{error: "validation_failed", details: changeset_errors(changeset)})
  end
end

@doc """
POST /auth/login
Authenticates by e-mail/password and returns tokens.
"""
def login(conn) do
  with %{"email" => email, "password" => password}
       when is_binary(email) and is_binary(password) <- conn.body_params,
       {:ok, user} <- Users.authenticate(email, password) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{
      token: Auth.generate_access_token(user),
      refresh_token: Auth.generate_refresh_token(user),
      user: user_json(user)
    }))
  else
    {:error, :invalid_credentials} -> register_error(conn, 401, %{error: "invalid_credentials"})
    _ -> register_error(conn, 400, %{error: "missing_credentials"})
  end
end
```

E estender `user_json/1` com os campos de perfil (**nunca** `password_hash`):

```elixir
defp user_json(user) do
  %{
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    type: user.type,
    cpf: user.cpf,
    cnpj: user.cnpj,
    is_seller: user.is_seller,
    phone: user.phone,
    nationality: user.nationality,
    cep: user.cep,
    address_line: user.address_line,
    city: user.city,
    state: user.state
  }
end
```

`GET /auth/session` monta o JSON do usuário manualmente hoje — trocar pelo `user_json/1` para eliminar a duplicação e já expor o perfil.

### 9.7 Testes

Attrs válidos de referência:

```elixir
@signup_attrs %{
  "email" => "maria@example.com",
  "name" => "Maria Clara",
  "password" => "senha-forte-123",
  "cpf" => "52998224725",
  "phone" => "11987654321",
  "nationality" => "Brasileira",
  "cep" => "01310100",
  "address_line" => "Av. Paulista, 1000, ap 12",
  "city" => "São Paulo",
  "state" => "SP"
}
```

- `test/api/users/user_test.exs`, describe `signup_changeset/2`: válido completo (`type == "pf"`, `password_hash` preenchido, `:password` ausente de `changes`); cada campo obrigatório ausente → erro naquele campo; senha 7 chars; telefone 9 dígitos; CEP 7 dígitos; `state: "XX"`; CPF `12345678900` (checksum).
- `test/api/users_test.exs`: `signup/1` ok; e-mail duplicado → `{:error, changeset}` com erro em `:email`; `authenticate/2` ok; senha errada; e-mail inexistente; usuário Google (sem `password_hash`) → `invalid_credentials` nos três últimos.
- `test/api/controllers/auth_controller_test.exs`: `POST /auth/signup` → 201 com `token`, `refresh_token` e `user` completo; 422 com `details` por campo; 422 e-mail duplicado. `POST /auth/login` → 200 com tokens; 401 senha errada; 400 body sem campos. `GET /auth/session` de usuário criado via signup → campos de perfil presentes, sem `password_hash` no JSON.

**DoD**: `yarn test:api` e `yarn api:credo` verdes; `yarn api:migrate` aplica a migration; nenhuma resposta HTTP contém `password_hash`; senha nunca aparece em log/inspect. Fora de escopo (não implementar): rate limiting, recuperação de senha, verificação de e-mail — ver `docs/superpowers/specs/2026-07-13-email-auth-profile-fields-design.md`.

---

## WP10 — DS: primitive `Select`

Local: `packages/design-system/src/primitives/Select/`. Seguir a regra global 7 (`.svelte` + `index.ts` + `.stories.ts` + `.test.ts` + export no barrel). Não existe select no DS hoje — **ler `primitives/Input/Input.svelte` antes** e espelhar API e visual.

```ts
export interface SelectOption { value: string; label: string }
// Select props
{
  id: string
  options: SelectOption[]
  value?: string            // $bindable
  label?: string
  placeholder?: string      // vira <option value="" disabled>
  error?: string
  hint?: string
  disabled?: boolean
  name?: string
  onchange?: (value: string) => void
}
```

Render: `<select>` nativo com `appearance: none` e chevron SVG inline posicionado à direita. BEM: `.select`, `.select__label`, `.select__el`, `.select__el--error`, `.select__error`, `.select__hint`. Visual = Input: fundo `var(--wh)`, borda `1.5px solid #D1D5DB` (erro: `var(--color-error)`), radius igual ao Input, fonte `--font-lato`, mesmo padding. Com placeholder selecionado, texto `#9CA3AF`.

Testes: renderiza label e N options; `bind:value` reflete a seleção e dispara `onchange`; placeholder vira option disabled; erro aplica modifier e exibe mensagem; `disabled` bloqueia. Story: UFs brasileiras como options, variantes default/erro/disabled.

**DoD**: `yarn test:ds` e `yarn check:ds` verdes; `import { Select } from '@babyclothes/design-system'` funciona; story no Storybook.

---

## WP11 — Web: login por e-mail/senha (modo agent)

> Depende de: WP9 (`POST /auth/login`), WP1 emendado (flag `emailLogin`), WP3.5 (`auth-cookies.ts`), WP7 (chaves `auth.login_email.*`).
> `LoginCard.svelte` continua intocável (regra global 4) — o formulário é componente novo, composto pela página.

### 11.1 Schema — acrescentar em `apps/web/src/lib/domain/user/schemas.ts`

```ts
export const LoginInputSchema = z.object({
  email: z.string().trim().email('validation.email_invalid').max(254),
  password: z.string().min(1, 'validation.password_required').max(72),
})

export type LoginInput = z.infer<typeof LoginInputSchema>
```

Teste em `schemas.test.ts`: válido; email sem `@`; senha vazia.

### 11.2 Componente novo `apps/web/src/lib/presentation/components/EmailLoginForm.svelte`

```ts
import type { LoginInput } from '$lib/domain/user/schemas'

export interface EmailLoginFormProps {
  onSubmit: (data: LoginInput) => void
  loading?: boolean
  /** Mensagem já traduzida */
  error?: string
}
```

Campos: `Input` e-mail (`inputmode="email"`) e senha com toggle de visibilidade (mesmo pattern do RegisterPFScreen); CTA `Button variant="pk" size="lg" {loading}` com `auth.login_email.submit`. Validação client com `LoginInputSchema.safeParse` → `fieldErrors` (mesmo pattern de coleta de issues do WP3.3). BEM `emaillogin__*` (`__fields`, `__cta`, `__error`). O divisor "ou entre com e-mail" fica na **página**, não no componente.

Teste: submit inválido não chama `onSubmit`; válido chama com `{ email, password }`; `error` renderizado.

### 11.3 Editar `apps/web/src/routes/login/+page.svelte`

Abaixo do `LoginCard`, apenas com a flag ligada:

```svelte
{#if flags.emailLogin}
  <div class="login__divider">{$t('auth.login_email.divider')}</div>
  <EmailLoginForm onSubmit={handleEmailLogin} loading={emailLoading} error={emailError} />
{/if}
```

`handleEmailLogin(data)` grava e-mail/senha em inputs hidden de um form `action="?/email"` e chama `requestSubmit()` (mesmo pattern do registro). `emailError` traduz `form.error`: `invalid_credentials` → `$t('auth.login_email.error_invalid_credentials')`, resto → `error_generic`.

### 11.4 Editar `apps/web/src/routes/login/+page.server.ts`

Action nova `email` (as actions existentes ficam intactas):

- Flag `emailLogin` desligada → `return fail(404, { error: 'not_found' })`.
- Validar com `LoginInputSchema.safeParse`; falha → `return fail(422, { error: 'invalid_fields' })`.
- `POST ${PUBLIC_API_URL}/auth/login` com `{ email, password }`; `401` → `return fail(401, { error: 'invalid_credentials' })`; outro não-200 → `return fail(502, { error: 'login_failed' })`.
- Sucesso: `setAuthCookies(cookies, token, refresh_token)` (import de `$lib/server/auth-cookies.ts`) e `throw redirect(303, HOME_ROUTE)`. (Usuário que retorna não repete onboarding — o guard client-side do WP5 já cuida disso via `localStorage`.)

Atualizar `page.server.test.ts`: sucesso seta cookies e redireciona `/agent`; 401 da API → `invalid_credentials`; flag off → 404; campos inválidos → 422.

**DoD**: em modo agent, o ciclo signup → logout → login por e-mail/senha funciona ponta a ponta; em modo full `/login` continua pixel-idêntica (flag desligada, componente não renderiza).
