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
