<script lang="ts">
  import { t } from '$lib/i18n'

  const steps = [
    { number: '01', titleKey: 'how.step1_title', descKey: 'how.step1_desc' },
    { number: '02', titleKey: 'how.step2_title', descKey: 'how.step2_desc' },
    { number: '03', titleKey: 'how.step3_title', descKey: 'how.step3_desc' },
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

    <div class="how__grid">
      {#each steps as step (step.number)}
        <div class="how__item">
          <span class="how__number" aria-hidden="true">{step.number}</span>
          <h3 class="how__step-title">{$t(step.titleKey)}</h3>
          <p class="how__step-desc">{$t(step.descKey)}</p>
        </div>
      {/each}
    </div>
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

  .how__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(2rem, 5vw, 3.5rem);
  }

  .how__item {
    text-align: center;
  }

  .how__number {
    display: block;
    font-size: clamp(5rem, 8vw, 7.5rem);
    font-weight: 900;
    line-height: 1;
    color: var(--pk);
    opacity: 0.055;
    user-select: none;
    margin-bottom: -2.5rem;
  }

  .how__step-title {
    font-size: clamp(1.2rem, 2.4vw, 1.5rem);
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
    margin-inline: auto;
  }

  @media (max-width: 64rem) {
    .how__grid {
      grid-template-columns: 1fr;
      gap: clamp(2.4rem, 8vw, 3.5rem);
    }
  }
</style>
