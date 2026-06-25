<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'
  import RegistrationForm from '$lib/presentation/components/RegistrationForm.svelte'
  import { HttpAuthRepository } from '$lib/infrastructure/http/HttpAuthRepository'

  type Step = 'login' | 'register' | 'redirecting'

  let step = $state<Step>('login')
  let loading = $state(false)
  let error = $state('')

  const authRepo = new HttpAuthRepository()

  // Google Identity Services callback — invoked when user selects an account
  declare global {
    function handleGoogleCredential(response: { credential: string }): void
  }

  async function handleGoogleCredential(response: { credential: string }) {
    loading = true
    error = ''

    try {
      const session = await authRepo.loginWithGoogle(response.credential)
      if (!session.type) {
        step = 'register'
      } else {
        step = 'redirecting'
        goto('/catalog')
      }
    } catch (e) {
      error = (e as Error).message
    } finally {
      loading = false
    }
  }

  // Dev fallback: log in directly without Google
  async function handleDevLogin() {
    loading = true
    error = ''

    try {
      // Try to get an existing token first
      const existing = await authRepo.getSession()
      if (existing) {
        if (!existing.type) {
          step = 'register'
        } else {
          step = 'redirecting'
          goto('/catalog')
        }
        return
      }
      error = 'No session found. Seed the database and set localStorage manually.'
    } catch (e) {
      error = (e as Error).message
    } finally {
      loading = false
    }
  }

  // Expose callback globally so Google's GSI library can call it
  if (typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).handleGoogleCredential = handleGoogleCredential
  }

  async function handleRegistrationComplete(data: {
    type: 'pf' | 'pj'
    cpf?: string
    cnpj?: string
  }) {
    loading = true
    error = ''

    try {
      await authRepo.updateProfile(data)
      step = 'redirecting'
      goto('/catalog')
    } catch (e) {
      error = (e as Error).message
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>

  <!-- Google Identity Services library -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="login-page">
  {#if step === 'login'}
    <AuthScreen
      onGoogleLogin={() => {
        /* Handled by GSI button rendered inside AuthScreen */
      }}
      onDevLogin={handleDevLogin}
      {loading}
    />
  {:else if step === 'register'}
    <RegistrationForm
      onComplete={handleRegistrationComplete}
      {loading}
    />
  {:else if step === 'redirecting'}
    <div class="login-page__redirecting">
      <span class="login-page__spinner"></span>
      <p class="login-page__redirect-text">
        {loading ? 'Redirecting...' : ''}
      </p>
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
    background: linear-gradient(135deg, var(--of2), var(--pk3));
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
