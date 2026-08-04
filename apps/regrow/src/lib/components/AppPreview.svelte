<script lang="ts">
  import { t } from '$lib/i18n'
</script>

<section class="preview">
  <div class="preview__inner">
    <p class="preview__eyebrow">{$t('preview.title')}</p>
    <div class="preview__phone">
      <img
        src="/images/screen-party.png"
        alt={$t('preview.caption')}
        loading="lazy"
        decoding="async"
        width="340"
        height="580"
        class="preview__phone-image"
      />
    </div>
    <p class="preview__caption">{$t('preview.caption')}</p>
  </div>
</section>

<style>
  .preview {
    padding: clamp(4rem, 9vw, 6.4rem) clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
  }

  .preview__inner {
    max-width: 28rem;
    margin: 0 auto;
    text-align: center;
  }

  .preview__eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pk);
    margin-bottom: 1.5rem;
  }

  .preview__phone {
    display: inline-block;
    background: var(--surface-inverse);
    border-radius: 2rem;
    padding: 0.4rem;
    box-shadow: 0 1.4rem 3.5rem rgba(0, 0, 0, 0.22);
    margin-bottom: 1.5rem;
  }

  .preview__phone-image {
    display: block;
    width: 17rem;
    height: clamp(23rem, 52vw, 29rem);
    object-fit: cover;
    object-position: top;
    border-radius: 1.65rem;
  }

  .preview__caption {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 300;
  }
</style>
