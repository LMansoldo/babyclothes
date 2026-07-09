<script lang="ts">
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  import { dev } from '$app/environment'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'
  import RegistrationForm from '$lib/presentation/components/RegistrationForm.svelte'

  type Step = 'login' | 'register' | 'redirecting'

  let step = $state<Step>('login')
  let loading = $state(false)
  let error = $state('')

  let loginForm = $state<HTMLFormElement | undefined>(undefined)
  let credentialInput = $state<HTMLInputElement | undefined>(undefined)
  let devLoginForm = $state<HTMLFormElement | undefined>(undefined)
  let registerForm = $state<HTMLFormElement | undefined>(undefined)
  let registerType = $state<'pf' | 'pj'>('pf')
  let registerDocument = $state('')

  // Called by Google GSI (via window bridge). Fills the hidden field and submits the login action.
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
    if (!session.type) {
      step = 'register'
    } else {
      step = 'redirecting'
      goto('/catalog')
    }
  }

  function handleRegistrationComplete(data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }) {
    registerType = data.type
    registerDocument = data.cpf ?? data.cnpj ?? ''
    registerForm?.requestSubmit()
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>

  <!-- Google Identity Services library -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="login-page" class:login-page--register={step === 'register'}>
  <!-- Hidden login form driven by the Google credential -->
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

  <!-- Hidden register form -->
  <form
    method="POST"
    action="?/register"
    bind:this={registerForm}
    use:enhance={() => {
      loading = true
      error = ''
      return async ({ result }) => {
        loading = false
        if (result.type === 'success') {
          step = 'redirecting'
          goto('/catalog')
        } else {
          error = 'update_failed'
        }
      }
    }}
    hidden
  >
    <input type="hidden" name="type" value={registerType} />
    <input type="hidden" name="document" value={registerDocument} />
  </form>

  {#if step === 'login'}
    <AuthScreen
      onGoogleLogin={() => {}}
      onDevLogin={dev ? () => devLoginForm?.requestSubmit() : undefined}
      {loading}
    />
  {:else if step === 'register'}
    <RegistrationForm onComplete={handleRegistrationComplete} {loading} />
  {:else if step === 'redirecting'}
    <div class="login-page__redirecting">
      <span class="login-page__spinner"></span>
      <p class="login-page__redirect-text">{loading ? 'Redirecting...' : ''}</p>
    </div>
  {/if}

  {#if error}
    <p class="login-page__error">{error}</p>
  {/if}
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A0A 100%);
    padding: 1rem;
  }

  .login-page--register {
    background: #F8F5F2;
  }

  .login-page__redirecting {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .login-page__spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 0.25rem solid rgba(255, 255, 255, 0.4);
    border-top-color: var(--pk);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg) }
  }

  .login-page__redirect-text {
    font-family: var(--sr);
    font-size: 0.9rem;
    color: var(--gr);
  }

  .login-page__error {
    font-family: var(--sr);
    font-size: 0.8rem;
    color: #e74c3c;
    margin-top: 1rem;
    text-align: center;
  }
</style>
