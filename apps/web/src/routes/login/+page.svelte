<script lang="ts">
  import { goto } from '$app/navigation'
  import { enhance } from '$app/forms'
  import { dev } from '$app/environment'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'

  type Step = 'login' | 'redirecting'

  let step = $state<Step>('login')
  let loading = $state(false)
  let error = $state('')

  let loginForm = $state<HTMLFormElement | undefined>(undefined)
  let credentialInput = $state<HTMLInputElement | undefined>(undefined)
  let devLoginForm = $state<HTMLFormElement | undefined>(undefined)

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
    step = 'redirecting'
    goto(session.type ? '/catalog' : '/register')
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>

  <!-- Google Identity Services library -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="login-page">
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

  {#if step === 'login'}
    <AuthScreen
      onGoogleLogin={() => {}}
      onDevLogin={dev ? () => devLoginForm?.requestSubmit() : undefined}
      {loading}
    />
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
