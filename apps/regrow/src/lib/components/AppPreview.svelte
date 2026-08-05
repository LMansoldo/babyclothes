<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'

  const features = [
    { number: '1', titleKey: 'preview.item1_title', textKey: 'preview.item1_text' },
    { number: '2', titleKey: 'preview.item2_title', textKey: 'preview.item2_text' },
    { number: '3', titleKey: 'preview.item3_title', textKey: 'preview.item3_text' },
  ] as const
</script>

<section class="preview">
  <div class="preview__inner">
    <div class="preview__phone">
      <img
        src="/images/screen-party.png"
        alt={$t('preview.image_alt')}
        loading="lazy"
        decoding="async"
        width="340"
        height="580"
        class="preview__phone-image"
      />
    </div>

    <div class="preview__content">
      <h2 class="preview__title">{$t('preview.list_title')}</h2>
      <ul class="preview__list">
        {#each features as feature (feature.number)}
          <li class="preview__item">
            <span class="preview__item-number" aria-hidden="true">{feature.number}</span>
            <div class="preview__item-body">
              <h3 class="preview__item-title">{$t(feature.titleKey)}</h3>
              <p class="preview__item-text">{$t(feature.textKey)}</p>
            </div>
          </li>
        {/each}
      </ul>
      <div class="preview__cta">
        <WaitlistCta label={$t('hero.email_cta')} href="#waitlist" variant="hero" />
      </div>
    </div>
  </div>
</section>

<style>
  .preview {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .preview__inner {
    max-width: 50rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: clamp(2rem, 6vw, 4rem);
  }

  .preview__phone {
    flex: 0 0 40%;
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0.6rem 1rem 3rem rgba(0, 0, 0, 0.22);
    transform: rotate(-2deg);
  }

  .preview__phone-image {
    display: block;
    width: 100%;
    height: clamp(23rem, 42vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  .preview__content {
    flex: 1;
  }

  .preview__title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 2rem;
  }

  .preview__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .preview__item {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .preview__item-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--pk), var(--pk2));
    color: var(--surface-base);
    font-weight: 900;
    font-size: 0.85rem;
  }

  .preview__item-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.2rem;
  }

  .preview__item-text {
    font-size: 0.7rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .preview__cta {
    margin-top: 2rem;
  }

  @media (max-width: 64rem) {
    .preview__inner {
      flex-direction: column;
    }

    .preview__phone {
      flex: none;
      max-width: 17.5rem;
      margin: 0 auto;
    }

    .preview__title {
      text-align: center;
    }

    .preview__item {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .preview__cta {
      display: flex;
      justify-content: center;
    }
  }
</style>
