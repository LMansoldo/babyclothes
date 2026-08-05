<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
  import { waitlistEmail } from '../stores/waitlist-email'

  let quickEmail = $state('')

  function scrollToWaitlist() {
    const target = document.getElementById('waitlist')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function handleQuickSignup(event: SubmitEvent) {
    event.preventDefault()
    waitlistEmail.set(quickEmail)
    scrollToWaitlist()
  }
</script>

<section id="top" class="hero">
  <picture>
    <source srcset="/images/hero-mobile.webp" media="(max-width: 40rem)" type="image/webp" />
    <source srcset="/images/hero-desktop.webp" type="image/webp" />
    <img
      src="/images/hero-desktop.png"
      srcset="/images/hero-mobile.png 640w, /images/hero-desktop.png 1200w"
      sizes="(max-width: 40rem) 100vw, 50vw"
      alt={$t('hero.headline')}
      width="1200"
      height="800"
      fetchpriority="high"
      decoding="async"
      class="hero__image"
    />
  </picture>
  <div class="hero__scrim hero__scrim--horizontal"></div>
  <div class="hero__scrim hero__scrim--vertical"></div>

  <div class="hero__content">
    <div class="hero__copy">
      <h1 class="hero__headline">
        {$t('hero.headline_line1')}<br />
        <em class="hero__headline-accent">{$t('hero.headline_line2')}</em>
      </h1>

      <form class="hero__quick-signup" onsubmit={handleQuickSignup}>
        <input
          type="email"
          name="email"
          required
          placeholder={$t('hero.email_placeholder')}
          class="hero__quick-signup-input"
          bind:value={quickEmail}
        />
        <WaitlistCta type="submit" variant="hero" label={$t('hero.email_cta')} />
      </form>
    </div>
  </div>

  <div class="hero__floating-card">
    <div class="hero__floating-card-image">
      <span class="hero__floating-card-badge">{$t('hero.floating_card_badge')}</span>
      <span class="hero__floating-card-favorite" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF3CAC" stroke-width="2.2">
          <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
          />
        </svg>
      </span>
    </div>
    <p class="hero__floating-card-title">Body inverno manga longa</p>
    <p class="hero__floating-card-meta">M · 6-9 meses · Menina</p>
    <div class="hero__floating-card-price-row">
      <span class="hero__floating-card-price">R$ 34,00</span>
      <span class="hero__floating-card-price-old">R$ 59,00</span>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    min-height: 36rem;
    display: flex;
    align-items: center;
    padding: 7rem 0 5rem;
  }

  .hero__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    z-index: 0;
  }

  .hero__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero__scrim--horizontal {
    background: linear-gradient(
      to right,
      rgba(248, 245, 242, 1) 0%,
      rgba(248, 245, 242, 0.97) 30%,
      rgba(248, 245, 242, 0.72) 55%,
      rgba(248, 245, 242, 0.15) 78%,
      transparent 100%
    );
  }

  .hero__scrim--vertical {
    background: linear-gradient(
      to bottom,
      rgba(248, 245, 242, 0.6) 0%,
      transparent 18%,
      transparent 72%,
      rgba(248, 245, 242, 0.9) 100%
    );
  }

  .hero__content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 62rem;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 3.6rem);
  }

  .hero__copy {
    max-width: 30rem;
  }

  .hero__headline {
    font-size: clamp(2.5rem, 6.4vw, 4.2rem);
    font-weight: 900;
    line-height: 1.01;
    letter-spacing: -0.032em;
    color: var(--text-primary);
    margin-bottom: 1.1rem;
  }

  .hero__headline-accent {
    font-style: normal;
    color: var(--pk);
  }

  .hero__quick-signup {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .hero__quick-signup-input {
    flex: 1;
    min-width: 0;
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-primary);
    background: var(--surface-sunken);
    border: 0.075rem solid var(--border-default);
    border-radius: var(--radius-pill);
    padding: 0.85rem 1.2rem;
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .hero__quick-signup-input:focus {
    border-color: var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.09);
    background: var(--surface-raised);
  }

  @media (max-width: 40rem) {
    .hero__quick-signup {
      flex-direction: column;
    }
  }

  .hero__floating-card {
    position: absolute;
    right: clamp(0.8rem, 7vw, 4.5rem);
    bottom: 2.6rem;
    z-index: 3;
    width: 11.5rem;
    background: var(--surface-raised);
    border-radius: 1rem;
    padding: 0.7rem;
    box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.17);
  }

  .hero__floating-card-image {
    position: relative;
    height: 4.7rem;
    border-radius: 0.65rem;
    background: linear-gradient(135deg, #c3d6ff 0%, #aeeef0 100%);
    margin-bottom: 0.65rem;
  }

  .hero__floating-card-badge {
    position: absolute;
    top: 0.45rem;
    left: 0.45rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.55rem;
    font-weight: 700;
    color: var(--pk);
    background: var(--brand-subtle);
    border-radius: var(--radius-pill);
  }

  .hero__floating-card-favorite {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    width: 1.35rem;
    height: 1.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-raised);
    border-radius: 50%;
    box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.1);
  }

  .hero__floating-card-title {
    font-size: 0.675rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.15rem;
    letter-spacing: -0.01em;
  }

  .hero__floating-card-meta {
    font-size: 0.575rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .hero__floating-card-price-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .hero__floating-card-price {
    font-size: 0.95rem;
    font-weight: 900;
    color: var(--pk);
  }

  .hero__floating-card-price-old {
    font-size: 0.575rem;
    color: var(--text-tertiary);
    text-decoration: line-through;
  }

  @media (max-width: 64rem) {
    .hero__floating-card {
      display: none;
    }
  }
</style>
