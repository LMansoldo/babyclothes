<script lang="ts">
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  import { dev } from '$app/environment'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'
  import { flags, HOME_ROUTE } from '$lib/feature-flags'
  import { t } from '$lib/i18n'
  import { LoginInputSchema, type LoginInput } from '$lib/domain/user/schemas'
  import { Button, Input } from '@babyclothes/design-system'
  import { Eye, EyeOff } from 'lucide-svelte'

  type Step = 'login' | 'redirecting'

  let step = $state<Step>('login')
  let loading = $state(false)
  let error = $state('')
  let emailLoading = $state(false)
  let emailError = $state('')
  let showPassword = $state(false)

  let loginForm = $state<HTMLFormElement | undefined>(undefined)
  let credentialInput = $state<HTMLInputElement | undefined>(undefined)
  let devLoginForm = $state<HTMLFormElement | undefined>(undefined)
  let emailLoginForm = $state<HTMLFormElement | undefined>(undefined)
  let emailInput = $state<HTMLInputElement | undefined>(undefined)
  let passwordInput = $state<HTMLInputElement | undefined>(undefined)

  // Email login fields (agent mode)
  let emailValue = $state('')
  let passwordValue = $state('')
  let fieldErrors = $state<Partial<Record<keyof LoginInput, string>>>({})

  function handleGoogleCredential(response: { credential: string }) {
    if (credentialInput && loginForm) {
      credentialInput.value = response.credential
      loginForm.requestSubmit()
    }
  }

  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).handleGoogleCredential = handleGoogleCredential
  }

  function onLoginResult(session: { type: string | null } | undefined) {
    loading = false
    if (!session) {
      error = 'login_failed'
      return
    }
    step = 'redirecting'
    goto(session.type ? HOME_ROUTE : '/register')
  }

  function handleEmailSubmit() {
    const parsed = LoginInputSchema.safeParse({ email: emailValue, password: passwordValue })
    if (!parsed.success) {
      fieldErrors = Object.fromEntries(
        parsed.error.issues.map((i) => [i.path[0], $t(String(i.message))])
      )
      return
    }
    fieldErrors = {}
    if (emailInput && passwordInput && emailLoginForm) {
      emailInput.value = parsed.data.email
      passwordInput.value = parsed.data.password
      emailLoginForm.requestSubmit()
    }
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<!-- Hidden login form driven by Google credential -->
<form
  method="POST"
  action="?/login"
  bind:this={loginForm}
  use:enhance={() => {
    loading = true
    error = ''
    return async ({ result }) => {
      if (result.type === 'success') {
        onLoginResult(result.data?.session as { type: string | null } | undefined)
      } else {
        loading = false
        error = 'login_failed'
      }
    }
  }}
  hidden
>
  <input type="hidden" name="credential" bind:this={credentialInput} />
</form>

<!-- Hidden dev-login form (dev only) -->
{#if dev}
  <form
    method="POST"
    action="?/devLogin"
    bind:this={devLoginForm}
    use:enhance={() => {
      loading = true
      error = ''
      return async ({ result }) => {
        if (result.type === 'success') {
          onLoginResult(result.data?.session as { type: string | null } | undefined)
        } else {
          loading = false
          error = 'login_failed'
        }
      }
    }}
    hidden
  ></form>
{/if}

<!-- Hidden email login form -->
<form
  method="POST"
  action="?/email"
  bind:this={emailLoginForm}
  use:enhance={() => {
    emailLoading = true
    emailError = ''
    return async ({ result }) => {
      emailLoading = false
      if (result.type === 'redirect') {
        step = 'redirecting'
      } else if (result.type === 'failure') {
        const err = (result.data as { error?: string } | undefined)?.error
        if (err === 'invalid_credentials') {
          emailError = $t('auth.login_email.error_invalid_credentials')
        } else {
          emailError = $t('auth.login_email.error_generic')
        }
      } else {
        emailError = $t('auth.login_email.error_generic')
      }
    }
  }}
  hidden
>
  <input type="hidden" name="email" bind:this={emailInput} />
  <input type="hidden" name="password" bind:this={passwordInput} />
</form>

{#if step === 'login'}
  {#if flags.emailLogin}
    <!-- Agent mode: unified login screen matching mock 01 -->
    <div class="login-agent">
      <div class="login-agent__glow" aria-hidden="true"></div>

      <div class="login-agent__content">
        <div class="login-agent__logo">
          <svg class="login-agent__logo-drop" width="26" height="32" viewBox="0 0 20 24" fill="none" aria-hidden="true">
            <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="var(--pk)"/>
          </svg>
          <span class="login-agent__logo-text">Baby<em>Clothes</em></span>
        </div>

        <div class="login-agent__headings">
          <h1 class="login-agent__title">{$t('auth.login_agent.title')}</h1>
          <h1 class="login-agent__title-accent">{$t('auth.login_agent.title_accent')}</h1>
        </div>

        <p class="login-agent__subtitle">{$t('auth.login_agent.subtitle')}</p>

        <button
          class="login-agent__google-btn"
          onclick={() => {}}
          disabled={loading}
        >
          {#if loading}
            <span class="login-agent__spinner"></span>
            {$t('auth.loading')}
          {:else}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {$t('auth.login_agent.google')}
          {/if}
        </button>

        <div class="login-agent__divider">
          <span class="login-agent__divider-line"></span>
          <span class="login-agent__divider-text">{$t('auth.login_agent.divider')}</span>
          <span class="login-agent__divider-line"></span>
        </div>

        <div class="login-agent__fields">
          <div class="login-agent__field">
            <label class="login-agent__label" for="login-email">{$t('auth.login_agent.email_label')}</label>
            <input
              id="login-email"
              type="email"
              class="login-agent__input"
              class:login-agent__input--error={fieldErrors.email}
              placeholder={$t('auth.login_agent.email_placeholder')}
              bind:value={emailValue}
              inputmode="email"
            />
            {#if fieldErrors.email}
              <span class="login-agent__field-error">{fieldErrors.email}</span>
            {/if}
          </div>
          <div class="login-agent__field">
            <label class="login-agent__label" for="login-password">{$t('auth.login_agent.password_label')}</label>
            <div class="login-agent__password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                class="login-agent__input login-agent__input--password"
                class:login-agent__input--error={fieldErrors.password}
                placeholder={$t('auth.login_agent.password_placeholder')}
                bind:value={passwordValue}
              />
              <button
                type="button"
                class="login-agent__eye-btn"
                onclick={() => showPassword = !showPassword}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {#if showPassword}
                  <EyeOff size={15} />
                {:else}
                  <Eye size={15} />
                {/if}
              </button>
            </div>
            {#if fieldErrors.password}
              <span class="login-agent__field-error">{fieldErrors.password}</span>
            {/if}
          </div>
        </div>

        <div class="login-agent__forgot">
          <span class="login-agent__forgot-link">{$t('auth.login_agent.forgot_password')}</span>
        </div>

        {#if emailError}
          <p class="login-agent__error" role="alert">{emailError}</p>
        {/if}

        <button
          class="login-agent__submit-btn"
          onclick={handleEmailSubmit}
          disabled={emailLoading}
        >
          {#if emailLoading}
            <span class="login-agent__spinner"></span>
          {:else}
            {$t('auth.login_agent.submit')}
          {/if}
        </button>

        <p class="login-agent__register-link">
          {$t('auth.login_agent.no_account')}
          <a href="/register" class="login-agent__register-btn">
            {$t('auth.login_agent.create_account')}
          </a>
        </p>

        <div class="login-agent__spacer"></div>

        <p class="login-agent__terms">
          {$t('auth.login_agent.terms_prefix')}
          <a href="/terms">{$t('auth.login_agent.terms_of_use')}</a>
          {$t('auth.login_agent.or')}
          <a href="/privacy">{$t('auth.login_agent.privacy_policy')}</a>
        </p>
      </div>
    </div>
  {:else}
    <!-- Full mode: original AuthScreen -->
    <AuthScreen
      onGoogleLogin={() => {}}
      onDevLogin={dev ? () => devLoginForm?.requestSubmit() : undefined}
      {loading}
    />
  {/if}
{:else if step === 'redirecting'}
  <div class="login-agent__redirecting">
    <span class="login-agent__spinner login-agent__spinner--lg"></span>
  </div>
{/if}

{#if error}
  <p class="login-agent__global-error">{error}</p>
{/if}

<style>
  /* ── Agent login screen (mock 01) ─────────────────────── */
  .login-agent {
    width: 100%;
    max-width: 40rem;
    min-height: 100vh;
    position: relative;
    background: linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A1A 100%);
  }

  .login-agent__glow {
    position: fixed;
    top: -6rem;
    right: -4rem;
    width: 26rem;
    height: 26rem;
    background: radial-gradient(circle, rgba(255, 60, 172, 0.22) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .login-agent__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    padding: 0 2.8rem 2.4rem;
    min-height: 100vh;
  }

  /* Logo */
  .login-agent__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 3.6rem;
    margin-bottom: 2.8rem;
  }

  .login-agent__logo-drop {
    flex-shrink: 0;
  }

  .login-agent__logo-text {
    font-family: var(--ld);
    font-size: 1.6rem;
    color: #fff;
    letter-spacing: 0.02em;
  }

  .login-agent__logo-text :global(em) {
    font-style: normal;
    color: var(--pk);
  }

  /* Headings */
  .login-agent__headings {
    text-align: center;
    margin-bottom: 0.6rem;
  }

  .login-agent__title {
    font-family: var(--sr);
    font-size: 1.8rem;
    font-weight: 300;
    color: #fff;
    line-height: 1.1;
    margin: 0;
  }

  .login-agent__title-accent {
    font-family: var(--sr);
    font-size: 1.8rem;
    font-weight: 300;
    color: var(--pk);
    font-style: italic;
    line-height: 1.1;
    margin: 0;
  }

  .login-agent__subtitle {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 2.8rem;
    text-align: center;
  }

  /* Google button */
  .login-agent__google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.3rem;
    border-radius: 1rem;
    background: #fff;
    border: none;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 1.8rem;
    transition: opacity 0.15s;
  }

  .login-agent__google-btn:hover {
    opacity: 0.88;
  }

  .login-agent__google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Divider */
  .login-agent__divider {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.8rem;
  }

  .login-agent__divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.12);
  }

  .login-agent__divider-text {
    font-size: 0.68rem;
    color: rgba(255, 255, 255, 0.35);
    white-space: nowrap;
  }

  /* Fields */
  .login-agent__fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.6rem;
  }

  .login-agent__field {
    display: flex;
    flex-direction: column;
  }

  .login-agent__label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.65);
    margin-bottom: 0.5rem;
  }

  .login-agent__input {
    width: 100%;
    padding: 1.2rem 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 1rem;
    font-size: 0.85rem;
    font-family: var(--font-lato);
    color: #fff;
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    transition: border-color 0.15s;
  }

  .login-agent__input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .login-agent__input:focus {
    border-color: var(--pk);
  }

  .login-agent__input--error {
    border-color: #EF4444;
  }

  .login-agent__input--password {
    padding-right: 4rem;
  }

  .login-agent__password-wrap {
    position: relative;
  }

  .login-agent__eye-btn {
    position: absolute;
    right: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    padding: 0;
    transition: color 0.15s;
  }

  .login-agent__eye-btn:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  .login-agent__field-error {
    font-size: 0.68rem;
    color: #EF4444;
    margin-top: 0.4rem;
  }

  /* Forgot password */
  .login-agent__forgot {
    text-align: right;
    margin-bottom: 1.6rem;
  }

  .login-agent__forgot-link {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: color 0.15s;
  }

  .login-agent__forgot-link:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  /* Error */
  .login-agent__error {
    font-size: 0.75rem;
    color: #EF4444;
    margin: 0 0 1rem;
    text-align: center;
  }

  /* Submit button */
  .login-agent__submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1.3rem;
    border-radius: 1rem;
    background: var(--pk);
    border: none;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 0.9rem;
    font-weight: 700;
    color: #fff;
    box-shadow: 0 4px 16px rgba(255, 60, 172, 0.3);
    margin-bottom: 1.4rem;
    transition: opacity 0.15s;
  }

  .login-agent__submit-btn:hover {
    opacity: 0.9;
  }

  .login-agent__submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Register link */
  .login-agent__register-link {
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  }

  .login-agent__register-link :global(a) {
    color: var(--pk);
    font-weight: 700;
    text-decoration: none;
  }

  .login-agent__register-link :global(a:hover) {
    text-decoration: underline;
  }

  .login-agent__register-btn {
    background: none;
    border: none;
    color: var(--pk);
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
  }

  .login-agent__register-btn:hover {
    text-decoration: underline;
  }

  .login-agent__spacer {
    flex: 1;
    min-height: 2rem;
  }

  /* Terms */
  .login-agent__terms {
    font-size: 0.62rem;
    color: rgba(255, 255, 255, 0.28);
    text-align: center;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }

  .login-agent__terms :global(a) {
    color: rgba(255, 255, 255, 0.28);
    text-decoration: underline;
  }

  .login-agent__terms :global(a:hover) {
    color: rgba(255, 255, 255, 0.5);
  }

  /* Redirecting state */
  .login-agent__redirecting {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A1A 100%);
  }

  .login-agent__spinner {
    width: 1.6rem;
    height: 1.6rem;
    border: 0.2rem solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--pk);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .login-agent__spinner--lg {
    width: 2.5rem;
    height: 2.5rem;
    border-width: 0.25rem;
  }

  .login-agent__global-error {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    color: #EF4444;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.8rem 1.6rem;
    border-radius: 0.8rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg) }
  }
</style>
