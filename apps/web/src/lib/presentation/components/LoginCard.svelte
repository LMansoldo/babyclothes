<script lang="ts">
  import { t } from '$lib/i18n'
  import { Spinner } from '@babyclothes/design-system'

  let {
    onGoogleLogin,
    onDevLogin,
    onNavigateTerms,
    onNavigatePrivacy,
    isLoading = false,
    error,
    heading = $t('auth.headline.buy_sell'),
    tagline = $t('auth.subtitle'),
    googleLabel = $t('auth.continue_google'),
    devLabel = $t('auth.dev_login'),
    termsPrefix = $t('auth.terms_prefix'),
    termsLabel = $t('auth.terms_of_use'),
    privacyLabel = $t('auth.privacy_policy'),
  }: {
    onGoogleLogin: () => void
    onDevLogin?: () => void
    onNavigateTerms?: () => void
    onNavigatePrivacy?: () => void
    isLoading?: boolean
    error?: string
    heading?: string
    tagline?: string
    googleLabel?: string
    devLabel?: string
    termsPrefix?: string
    termsLabel?: string
    privacyLabel?: string
  } = $props()

  function handleTermsClick(e: MouseEvent) {
    e.preventDefault()
    onNavigateTerms?.()
  }

  function handlePrivacyClick(e: MouseEvent) {
    e.preventDefault()
    onNavigatePrivacy?.()
  }
</script>

<div class="logincard">
  <div class="logincard__card">
    <!-- Logo -->
    <div class="logincard__logo">
      <span class="logincard__logo-drop" aria-hidden="true"></span>
      <span class="logincard__logo-text">
        <span class="logincard__logo-baby">Baby</span><span class="logincard__logo-clothes">Clothes</span>
      </span>
    </div>

    <!-- Heading -->
    <h1 class="logincard__heading">{heading}</h1>

    <!-- Tagline -->
    {#if tagline}
      <p class="logincard__tagline">{tagline}</p>
    {/if}

    <!-- Google login button -->
    <button
      class="logincard__google-btn"
      onclick={onGoogleLogin}
      disabled={isLoading}
      aria-label={googleLabel}
    >
      {#if isLoading}
        <Spinner size="sm" variant="default" label={$t('common.loading')} />
      {:else}
        <svg class="logincard__google-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>{googleLabel}</span>
      {/if}
    </button>

    <!-- Dev login link -->
    {#if onDevLogin}
      <button
        class="logincard__dev-link"
        onclick={onDevLogin}
        disabled={isLoading}
      >
        {devLabel}
      </button>
    {/if}

    <!-- Error -->
    {#if error}
      <p class="logincard__error" role="alert">{error}</p>
    {/if}

    <!-- Terms footer -->
    <p class="logincard__footer">
      {termsPrefix}{' '}
      {#if onNavigateTerms}
        <a
          class="logincard__footer-link"
          href="/terms"
          onclick={handleTermsClick}
        >{termsLabel}</a>
      {:else}
        <span class="logincard__footer-link">{termsLabel}</span>
      {/if}
      {' '}{$t('auth.or')}{' '}
      {#if onNavigatePrivacy}
        <a
          class="logincard__footer-link"
          href="/privacy"
          onclick={handlePrivacyClick}
        >{privacyLabel}</a>
      {:else}
        <span class="logincard__footer-link">{privacyLabel}</span>
      {/if}
    </p>
  </div>
</div>

<style>
  .logincard {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100%;
    padding: 1rem;
  }

  .logincard__card {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(0.6rem);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 1rem;
  }

  /* Logo */
  .logincard__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .logincard__logo-drop {
    display: block;
    width: 1.2rem;
    height: 1.6rem;
    background: var(--pk);
    border-radius: 50% / 60% 60% 40% 40%;
    flex-shrink: 0;
  }

  .logincard__logo-text {
    font-family: var(--ld);
    font-size: 1.6rem;
    line-height: 1;
  }

  .logincard__logo-baby {
    color: var(--wh);
  }

  .logincard__logo-clothes {
    color: var(--pk);
  }

  /* Heading */
  .logincard__heading {
    font-family: var(--sr);
    font-size: 1.9rem;
    font-weight: 300;
    color: var(--wh);
    margin: 0 0 0.5rem;
    text-align: center;
    line-height: 1.2;
  }

  /* Tagline */
  .logincard__tagline {
    font-family: var(--font-lato);
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.55);
    margin: 0 0 1.5rem;
    text-align: center;
    line-height: 1.4;
  }

  /* Google button */
  .logincard__google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--wh);
    border: 0.075rem solid #D1D5DB;
    border-radius: 0.625rem;
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--bk);
    cursor: pointer;
    transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .logincard__google-btn:hover:not(:disabled) {
    box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.08);
    transform: translateY(-0.05rem);
  }

  .logincard__google-btn:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .logincard__google-btn:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .logincard__google-icon {
    flex-shrink: 0;
  }

  /* Dev login link */
  .logincard__dev-link {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: var(--pk2);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-top: 0.75rem;
    text-decoration: underline;
    text-underline-offset: 0.2rem;
    transition: opacity var(--transition-fast);
  }

  .logincard__dev-link:hover:not(:disabled) {
    opacity: 0.75;
  }

  .logincard__dev-link:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .logincard__dev-link:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
    border-radius: 0.25rem;
  }

  /* Error */
  .logincard__error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: #F87171;
    margin: 0.75rem 0 0;
    text-align: center;
  }

  /* Footer */
  .logincard__footer {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.35);
    margin: 1.25rem 0 0;
    text-align: center;
    line-height: 1.5;
  }

  .logincard__footer-link {
    color: var(--pk);
    text-decoration: underline;
    text-underline-offset: 0.15rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    font-size: inherit;
    transition: opacity var(--transition-fast);
  }

  .logincard__footer-link:hover {
    opacity: 0.75;
  }

  .logincard__footer-link:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
    border-radius: 0.15rem;
  }
</style>
