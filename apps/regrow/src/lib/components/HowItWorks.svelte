<script lang="ts">
  import { t } from '$lib/i18n'

  const steps = [
    {
      number: '01',
      titleKey: 'how.step1_title',
      descKey: 'how.step1_desc',
      altKey: 'how.step1_alt',
      image: 'screen-winter',
      reversed: false,
    },
    {
      number: '02',
      titleKey: 'how.step2_title',
      descKey: 'how.step2_desc',
      altKey: 'how.step2_alt',
      image: 'screen-party',
      reversed: true,
    },
    {
      number: '03',
      titleKey: 'how.step3_title',
      descKey: 'how.step3_desc',
      altKey: 'how.step3_alt',
      image: 'screen-size',
      reversed: false,
    },
  ] as const
</script>

<section id="como-funciona" class="how">
  <div class="how__lines" aria-hidden="true">
    <div class="how__line how__line--left"></div>
    <div class="how__line how__line--right"></div>
  </div>

  <div class="how__inner">
    <div class="how__header">
      <p class="how__eyebrow">{$t('how.title')}</p>
      <h2 class="how__title"><span>{$t('how.subtitle_line1')}</span><br /><span>{$t('how.subtitle_line2')}</span></h2>
    </div>

    {#each steps as step (step.number)}
      <div class="how__row" class:how__row--reversed={step.reversed}>
        <div class="how__text">
          <span class="how__number" aria-hidden="true">{step.number}</span>
          <h3 class="how__step-title">{$t(step.titleKey)}</h3>
          <p class="how__step-desc">{$t(step.descKey)}</p>
        </div>
        <div class="how__phone">
          <img
            src="/images/{step.image}.png"
            alt={$t(step.altKey)}
            loading="lazy"
            decoding="async"
            width="340"
            height="580"
            class="how__phone-image"
          />
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .how {
    position: relative;
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: linear-gradient(180deg, #ffffff 0%, #fdf0f7 60%, #fceaf5 100%);
    overflow: hidden;
  }

  .how__lines {
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .how__line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0.05rem;
    background: rgba(255, 60, 172, 0.07);
  }

  .how__line--left {
    left: 33%;
  }

  .how__line--right {
    left: 66%;
  }

  .how__inner {
    position: relative;
    max-width: 58rem;
    margin: 0 auto;
  }

  .how__header {
    text-align: center;
    max-width: 28rem;
    margin: 0 auto clamp(3rem, 7vw, 5rem);
  }

  .how__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 0.6rem;
  }

  .how__title {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.025em;
    line-height: 1.07;
    color: var(--text-primary);
  }

  .how__row {
    display: grid;
    grid-template-columns: 1fr 17rem;
    gap: clamp(1.8rem, 6vw, 4.8rem);
    align-items: center;
    margin-bottom: clamp(3.2rem, 8vw, 5.5rem);
  }

  .how__row--reversed {
    grid-template-columns: 17rem 1fr;
  }

  .how__row--reversed .how__text {
    order: 2;
  }

  .how__row--reversed .how__phone {
    order: 1;
  }

  .how__text {
    position: relative;
    padding-left: 0.7rem;
  }

  .how__number {
    position: absolute;
    top: -1.4rem;
    left: -0.2rem;
    font-size: clamp(5rem, 12vw, 7.5rem);
    font-weight: 900;
    line-height: 1;
    color: var(--pk);
    opacity: 0.055;
    user-select: none;
  }

  .how__step-title {
    font-size: clamp(1.4rem, 3.2vw, 2rem);
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.08;
    color: var(--text-primary);
    margin-bottom: 0.7rem;
  }

  .how__step-desc {
    font-size: clamp(0.85rem, 1.5vw, 1rem);
    line-height: 1.6;
    color: var(--text-secondary);
    font-weight: 300;
    max-width: 23rem;
  }

  .how__phone {
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0 1.4rem 3.5rem rgba(0, 0, 0, 0.22);
  }

  .how__phone-image {
    display: block;
    width: 100%;
    height: clamp(23rem, 52vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  @media (max-width: 64rem) {
    .how__row,
    .how__row--reversed {
      grid-template-columns: 1fr;
    }

    .how__row--reversed .how__text,
    .how__row--reversed .how__phone {
      order: unset;
    }
  }
</style>
