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
