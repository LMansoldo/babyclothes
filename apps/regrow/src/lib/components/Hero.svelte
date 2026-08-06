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
  <div class="hero__bottom-fade"></div>

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

    <div class="hero__visual">
      <div class="hero__card hero__card--back">
        <ItemCard
          title={$t('hero.card2_title')}
          price={22}
          oldPrice={39}
          clothingSize={$t('hero.card2_size')}
          conditionLabel={$t('hero.condition_seminovo')}
          onclick={scrollToWaitlist}
        />
      </div>
      <div class="hero__card hero__card--middle">
        <ItemCard
          title={$t('hero.card3_title')}
          price={45}
          oldPrice={68}
          clothingSize={$t('hero.card3_size')}
          conditionLabel={$t('hero.condition_seminovo')}
          onclick={scrollToWaitlist}
        />
      </div>
      <div class="hero__card hero__card--front">
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

  .hero__bottom-fade {
    position: absolute;
    inset: auto 0 0 0;
    z-index: 1;
    height: 10rem;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #ffffff 100%);
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
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.4rem, 5.6vw, 4.4rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: 0.01em;
    color: #ffffff;
    margin-bottom: 2rem;
  }

  .hero__headline-accent {
    font-style: normal;
    color: #ffffff;
  }

  .hero__quick-signup {
    display: flex;
    gap: 0;
  }

  .hero__quick-signup-input {
    flex: 1;
    min-width: 0;
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--text-primary);
    background: #f0f0f0;
    border: none;
    border-radius: 1.5rem 0 0 1.5rem;
    padding: 1rem 1.6rem;
    outline: none;
    transition: box-shadow var(--transition-fast);
  }

  .hero__quick-signup-input::placeholder {
    color: #999999;
  }

  .hero__quick-signup-input:focus {
    box-shadow: inset 0 0 0 0.1rem #e91e8c;
  }

  .hero__quick-signup :global(.waitlist-cta--hero) {
    border-radius: 0 1.5rem 1.5rem 0;
    padding: 1rem 2.1rem;
    font-size: 1rem;
    background: linear-gradient(135deg, #e91e8c, #f54dab);
    box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.35);
  }

  .hero__quick-signup :global(.waitlist-cta--hero:hover) {
    filter: brightness(0.95);
  }

  .hero__visual {
    position: relative;
    flex: 0 0 55%;
    height: 24rem;
  }

  .hero__card {
    position: absolute;
    width: 15rem;
  }

  .hero__card :global(.item-card) {
    box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.3);
  }

  .hero__card--back {
    top: 0;
    right: 10rem;
    transform: scale(0.9);
    opacity: 0.7;
    z-index: 1;
  }

  .hero__card--middle {
    top: -1rem;
    right: 6rem;
    transform: scale(0.95);
    opacity: 0.85;
    z-index: 2;
  }

  .hero__card--front {
    top: 1rem;
    right: 2rem;
    transform: scale(1);
    z-index: 3;
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

    .hero__quick-signup {
      flex-direction: column;
      gap: 0.5rem;
    }

    .hero__quick-signup-input {
      border-radius: 1.5rem;
    }

    .hero__quick-signup :global(.waitlist-cta--hero) {
      border-radius: 1.5rem;
    }

    .hero__visual {
      height: auto;
    }

    .hero__card--back,
    .hero__card--middle {
      display: none;
    }

    .hero__card--front {
      position: static;
      transform: none;
      margin: 0 auto;
    }
  }
</style>
