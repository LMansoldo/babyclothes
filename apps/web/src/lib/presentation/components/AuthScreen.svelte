<script lang="ts">
  import { PUBLIC_GOOGLE_CLIENT_ID } from '$lib/env'
  import { t } from '$lib/i18n'
  import { onMount } from 'svelte'

  let {
    onGoogleLogin,
    onDevLogin,
    loading = false,
  }: {
    onGoogleLogin?: () => void
    onDevLogin?: () => void
    loading?: boolean
  } = $props()

  let gsiContainer = $state<HTMLDivElement | undefined>(undefined)
  let gsiLoaded = $state(false)

  onMount(() => {
    // Wait for GSI library to load, then render the button
    const checkGSI = () => {
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).google) {
        initializeGSI()
      } else {
        setTimeout(checkGSI, 300)
      }
    }
    checkGSI()
  })

  function initializeGSI() {
    const google = (window as unknown as Record<string, { accounts: { id: { initialize: (config: Record<string, unknown>) => void; renderButton: (el: HTMLElement, options: Record<string, unknown>) => void; prompt: () => void } } }>).google
    const clientId = PUBLIC_GOOGLE_CLIENT_ID

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        const globalHandler = (window as unknown as Record<string, (response: { credential: string }) => void>).handleGoogleCredential
        if (globalHandler) {
          globalHandler(response)
        }
      },
    })

    if (gsiContainer) {
      google.accounts.id.renderButton(gsiContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: gsiContainer.offsetWidth || 320,
      })
    }

    gsiLoaded = true
  }
</script>

<div class="authscreen">
  <div class="authscreen__card">
    <div class="authscreen__logo">
      <span class="authscreen__logo-drop" aria-hidden="true"></span>
      <span class="authscreen__logo-text">Baby<em>Clothes</em></span>
    </div>

    <h1 class="authscreen__title">
      {$t('auth.headline.buy_sell')}<br />
      <span class="authscreen__title--pink">{$t('auth.headline.clothes_smart')}</span>
    </h1>

    <p class="authscreen__subtitle">{$t('auth.subtitle')}</p>

    {#if !gsiLoaded}
      <button
        class="authscreen__google-btn"
        onclick={() => {
          // Fallback: if GSI hasn't loaded, call the parent handler
          onGoogleLogin?.()
        }}
        disabled={loading}
      >
        {#if loading}
          <span class="authscreen__spinner"></span>
          {$t('auth.loading')}
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {$t('auth.continue_google')}
        {/if}
      </button>
    {:else}
      <div bind:this={gsiContainer} class="authscreen__gsi-container"></div>
    {/if}

    <!-- Dev Login: sempre visível como fallback -->
    <button
      class="authscreen__google-btn authscreen__dev-btn"
      onclick={() => onDevLogin?.()}
    >
      Dev Login (Skip Google)
    </button>

    <p class="authscreen__terms">
      {$t('auth.terms_prefix')}
      <a href="/terms">{$t('auth.terms_of_use')}</a>
      {$t('auth.or')}
      <a href="/privacy">{$t('auth.privacy_policy')}</a>
    </p>
  </div>
</div>

<style>
  .authscreen {
    width: 100%;
    max-width: 40rem;
  }

  .authscreen__card {
    background: var(--wh);
    border-radius: 2rem;
    padding: 2.5rem 2rem;
    box-shadow: 0 0.4rem 2.4rem rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .authscreen__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    margin-bottom: 2rem;
  }

  .authscreen__logo-drop {
    width: 1.2rem;
    height: 1.6rem;
    background: var(--pk);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  }

  .authscreen__logo-text {
    font-family: var(--ld);
    font-weight: 900;
    font-size: 1.5rem;
    letter-spacing: -0.03em;
    color: var(--bk);
  }

  .authscreen__logo-text :global(em) {
    font-style: normal;
    color: var(--pk);
  }

  .authscreen__title {
    font-family: var(--ld);
    font-size: 1.6rem;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--bk);
    margin: 0 0 0.75rem;
  }

  .authscreen__title--pink {
    color: var(--pk);
  }

  .authscreen__subtitle {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--gr);
    margin: 0 0 2rem;
    line-height: 1.5;
  }

  .authscreen__google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.85rem 1.5rem;
    background: var(--bk);
    color: var(--wh);
    border: none;
    border-radius: 1.2rem;
    font-family: var(--ld);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .authscreen__google-btn:hover {
    opacity: 0.88;
  }

  .authscreen__google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .authscreen__dev-btn {
    margin-top: 0.75rem;
    background: var(--gr);
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .authscreen__dev-btn:hover {
    opacity: 1;
  }

  .authscreen__gsi-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .authscreen__gsi-container :global(iframe) {
    max-width: 100%;
  }

  .authscreen__spinner {
    width: 1.6rem;
    height: 1.6rem;
    border: 0.2rem solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--wh);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg) }
  }

  .authscreen__terms {
    font-family: var(--sr);
    font-size: 0.72rem;
    color: var(--gr);
    margin: 1.5rem 0 0;
    line-height: 1.6;
  }

  .authscreen__terms a {
    color: var(--pk);
    text-decoration: underline;
  }
</style>
