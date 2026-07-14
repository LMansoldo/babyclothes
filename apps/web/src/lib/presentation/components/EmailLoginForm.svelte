<script lang="ts">
  import { Input, Button } from '@babyclothes/design-system'
  import { t } from '$lib/i18n'
  import { LoginInputSchema, type LoginInput } from '$lib/domain/user/schemas'

  let {
    onSubmit,
    loading = false,
    error,
  }: {
    onSubmit: (data: LoginInput) => void
    loading?: boolean
    error?: string
  } = $props()

  let email = $state('')
  let password = $state('')
  let fieldErrors = $state<Partial<Record<'email' | 'password', string>>>({})

  function collectErrors(issues: { path: (string | number)[]; message: string }[]) {
    return Object.fromEntries(issues.map((i) => [i.path[0], $t(String(i.message))])) as Partial<
      Record<'email' | 'password', string>
    >
  }

  function handleSubmit(e: Event) {
    e.preventDefault()
    const parsed = LoginInputSchema.safeParse({ email, password })
    if (!parsed.success) {
      fieldErrors = collectErrors(parsed.error.issues)
      return
    }
    fieldErrors = {}
    onSubmit(parsed.data)
  }
</script>

<form class="emaillogin" onsubmit={handleSubmit}>
  <div class="emaillogin__fields">
    <Input
      id="email-login-email"
      type="email"
      inputmode="email"
      label={$t('auth.login_email.email_label')}
      placeholder={$t('auth.login_email.email_placeholder')}
      bind:value={email}
      error={fieldErrors.email}
      disabled={loading}
    />
    <Input
      id="email-login-password"
      type="password"
      label={$t('auth.login_email.password_label')}
      placeholder={$t('auth.login_email.password_placeholder')}
      bind:value={password}
      error={fieldErrors.password}
      disabled={loading}
    />
  </div>

  {#if error}
    <p class="emaillogin__error">{error}</p>
  {/if}

  <div class="emaillogin__cta">
    <Button variant="pk" size="lg" type="submit" {loading}>
      {$t('auth.login_email.submit')}
    </Button>
  </div>
</form>

<style>
  .emaillogin {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .emaillogin__fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .emaillogin__error {
    font-family: var(--sr);
    font-size: 0.8rem;
    color: #e74c3c;
    margin: 0;
    text-align: center;
  }

  .emaillogin__cta {
    margin-top: 0.5rem;
  }

  .emaillogin__cta :global(.btn) {
    width: 100%;
  }
</style>
