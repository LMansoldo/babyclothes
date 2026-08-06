<script lang="ts">
  import { t, locale } from '$lib/i18n';
  import WaitlistCta from './WaitlistCta.svelte';
  import { waitlistEmail } from '../stores/waitlist-email';

  let quickEmail = $state('');

  const chatMockupSrc = $derived(
    $locale === 'en' ? '/images/hero-chat-mockup-en.webp' : '/images/hero-chat-mockup-pt.webp',
  );

  function scrollToWaitlist() {
    const target = document.getElementById('waitlist');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function handleQuickSignup(event: SubmitEvent) {
    event.preventDefault();
    waitlistEmail.set(quickEmail);
    scrollToWaitlist();
  }
</script>

<section id="top" class="hero">
  <div class="hero__content">
    <div class="hero__copy">
      <h1 class="hero__headline">
        {$t('hero.headline_line1')}<br />
        <em class="hero__headline-accent">{$t('hero.headline_line2')}</em>
      </h1>

      <p class="hero__subheadline">{$t('hero.subheadline')}</p>

      <form class="hero__quick-signup" onsubmit={handleQuickSignup}>
        <div class="hero__quick-signup-card">
          <span class="hero__quick-signup-badge">{$t('hero.vip_badge')}</span>
          <input
            type="email"
            name="email"
            required
            placeholder={$t('hero.email_placeholder')}
            class="hero__quick-signup-input"
            bind:value={quickEmail}
          />
        </div>
        <p class="hero__quick-signup-disclaimer">{$t('hero.signup_disclaimer')}</p>
        <WaitlistCta type="submit" variant="hero" label={$t('hero.signup_cta')} />
      </form>
    </div>

    <div class="hero__visual">
      <div class="hero__chat-mockup">
        <div class="hero__chat-mockup-notch" aria-hidden="true"></div>
        <img
          src={chatMockupSrc}
          alt={$t('hero.chat_mockup_alt')}
          loading="lazy"
          decoding="async"
          width="500"
          height="1056"
          class="hero__chat-mockup-image"
        />
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    min-height: 80vh;
    display: flex;
    align-items: center;
    padding: 7rem 0 5rem;
    background: #e91e8c;
  }

  .hero__content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 clamp(1rem, 5vw, 4rem);
    display: flex;
    align-items: center;
    gap: clamp(1.5rem, 4vw, 3rem);
  }

  .hero__copy {
    flex: 0 0 45%;
    max-width: 26rem;
  }

  .hero__headline {
    font-family: Verdana, sans-serif;
    font-size: clamp(2.04rem, 4.76vw, 2.74rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: #ffffff;
    text-shadow: 0 0.15rem 0.6rem rgba(0, 0, 0, 0.35);
    margin-bottom: 2rem;
  }

  .hero__headline-accent {
    font-style: normal;
    color: #ffffff;
  }

  .hero__subheadline {
    font-size: clamp(0.85rem, 1.6vw, 1rem);
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.9);
    max-width: 25rem;
    margin-bottom: 1.6rem;
  }

  .hero__quick-signup {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero__quick-signup-card {
    position: relative;
    background: #ffffff;
    border: 0.1rem solid var(--border-default);
    border-radius: 1rem;
    padding: 1.2rem 1.4rem;
    box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.15);
  }

  .hero__quick-signup-badge {
    position: absolute;
    top: -0.9rem;
    right: 1.2rem;
    padding: 0.35rem 0.9rem;
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #e91e8c, #b03eff);
    border: 0.1rem solid #ffffff;
    border-radius: var(--radius-pill);
  }

  .hero__quick-signup-input {
    display: block;
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--text-primary);
    background: transparent;
    border: none;
    outline: none;
    padding: 0.3rem 0;
  }

  .hero__quick-signup-input::placeholder {
    color: #999999;
  }

  .hero__quick-signup-disclaimer {
    font-size: 0.65rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.85);
    text-align: center;
  }

  .hero__quick-signup :global(.waitlist-cta--hero) {
    width: 100%;
    border-radius: var(--radius-pill);
    padding: 1rem 2.1rem;
    font-size: 1rem;
    background: #e91e8c;
    box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.35);
  }

  .hero__quick-signup :global(.waitlist-cta--hero:hover) {
    filter: brightness(0.95);
  }

  .hero__visual {
    flex: 0 0 55%;
  }

  .hero__chat-mockup {
    position: relative;
    width: 100%;
    max-width: 16rem;
    margin: 0 auto;
    border: 0.4rem solid #000000;
    border-radius: 1.6rem;
    overflow: hidden;
    box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.3);
  }

  .hero__chat-mockup-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    height: 0.9rem;
    background: #000000;
    border-radius: 0 0 0.7rem 0.7rem;
    z-index: 1;
  }

  .hero__chat-mockup-image {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 48rem) {
    .hero__content {
      flex-direction: column;
      align-items: stretch;
    }

    .hero__copy {
      flex: none;
      max-width: none;
    }

    .hero__subheadline {
      max-width: none;
    }

    .hero__visual {
      display: none;
    }
  }
</style>
