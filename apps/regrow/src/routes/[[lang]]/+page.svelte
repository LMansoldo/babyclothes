<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '$lib/i18n'
  import Hero from '$lib/components/Hero.svelte'
  import HowItWorks from '$lib/components/HowItWorks.svelte'
  import AppPreview from '$lib/components/AppPreview.svelte'
  import WaitlistForm from '$lib/components/WaitlistForm.svelte'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
            observer.unobserve(entry.target)
          }
        }),
      { threshold: 0.15 },
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  })
</script>

<Hero />
<HowItWorks />
<div class="reveal">
  <AppPreview />
</div>

<section id="waitlist" class="waitlist reveal">
  <div class="waitlist__inner">
    <div class="waitlist__header">
      <p class="waitlist__eyebrow">{$t('form.eyebrow')}</p>
      <h2 class="waitlist__title">{$t('form.title')}</h2>
    </div>

    <div class="waitlist__card">
      <div class="waitlist__stats">
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_free_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_free_label')}</p>
        </div>
        <div class="waitlist__stat-divider"></div>
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_ai_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_ai_label')}</p>
        </div>
        <div class="waitlist__stat-divider"></div>
        <div class="waitlist__stat">
          <p class="waitlist__stat-value">{$t('form.stat_spam_value')}</p>
          <p class="waitlist__stat-label">{$t('form.stat_spam_label')}</p>
        </div>
      </div>

      <div class="waitlist__form-wrap">
        <WaitlistForm {form} />
      </div>
    </div>
  </div>
</section>

<style>
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      opacity: 0;
      transform: translateY(1rem);
      transition:
        opacity 0.5s ease-out,
        transform 0.5s ease-out;
    }

    :global(.reveal--visible) {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .waitlist {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .waitlist__inner {
    max-width: 27rem;
    margin: 0 auto;
  }

  .waitlist__header {
    text-align: center;
    margin-bottom: 1.8rem;
  }

  .waitlist__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 0.6rem;
  }

  .waitlist__title {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.025em;
    line-height: 1.07;
    color: var(--text-primary);
  }

  .waitlist__card {
    background: var(--surface-raised);
    border: 0.075rem solid var(--border-default);
    border-radius: 1.2rem;
    box-shadow: 0 1rem 3.2rem rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .waitlist__stats {
    display: flex;
    background: #fdf0f7;
    padding: 0.9rem 1.4rem;
  }

  .waitlist__stat {
    flex: 1;
    text-align: center;
  }

  .waitlist__stat-value {
    font-size: 1rem;
    font-weight: 900;
    color: var(--pk);
    letter-spacing: -0.02em;
  }

  .waitlist__stat-label {
    font-size: 0.575rem;
    color: var(--text-secondary);
    margin-top: 0.1rem;
  }

  .waitlist__stat-divider {
    width: 0.05rem;
    background: rgba(255, 60, 172, 0.15);
  }

  .waitlist__form-wrap {
    padding: 1.6rem 1.8rem;
  }
</style>
