<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
  import { waitlistEmail } from '../stores/waitlist-email'
  import { ItemCard } from '@babyclothes/design-system'

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

  <div class="hero__card-collage">
    <div class="hero__card-collage-secondary hero__card-collage-secondary--a">
      <ItemCard
        title={$t('hero.card2_title')}
        price={22}
        oldPrice={39}
        clothingSize={$t('hero.card2_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        onclick={scrollToWaitlist}
      />
    </div>
    <div class="hero__card-collage-secondary hero__card-collage-secondary--b">
      <ItemCard
        title={$t('hero.card3_title')}
        price={45}
        oldPrice={68}
        clothingSize={$t('hero.card3_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        onclick={scrollToWaitlist}
      />
    </div>
    <div class="hero__card-collage-featured">
      <ItemCard
        title={$t('hero.card1_title')}
        price={34}
        clothingSize={$t('hero.card1_size')}
        conditionLabel={$t('hero.condition_seminovo')}
        sellerName={$t('hero.card1_seller')}
        sellerVerifiedLabel={$t('hero.verified_label')}
        paymentEnabled={true}
        contactLabel={$t('hero.contact_label')}
        buyLabel={$t('hero.buy_label')}
        onclick={scrollToWaitlist}
        onFavorite={scrollToWaitlist}
        onContact={scrollToWaitlist}
        onBuy={scrollToWaitlist}
        onSellerClick={scrollToWaitlist}
      />
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

  .hero__card-collage {
    position: absolute;
    right: clamp(0.8rem, 7vw, 4.5rem);
    bottom: 2.6rem;
    z-index: 3;
  }

  .hero__card-collage :global(.item-card) {
    box-shadow: 0 1.2rem 3rem rgba(0, 0, 0, 0.17);
  }

  .hero__card-collage-featured {
    position: relative;
    width: 13rem;
    z-index: 3;
  }

  .hero__card-collage-secondary {
    position: absolute;
    width: 9.5rem;
  }

  .hero__card-collage-secondary--a {
    top: -3rem;
    left: -4rem;
    transform: rotate(-6deg);
    z-index: 2;
  }

  .hero__card-collage-secondary--b {
    top: -1.5rem;
    right: -3.5rem;
    transform: rotate(5deg);
    z-index: 1;
  }

  @media (max-width: 64rem) {
    .hero__card-collage {
      display: none;
    }
  }
</style>
