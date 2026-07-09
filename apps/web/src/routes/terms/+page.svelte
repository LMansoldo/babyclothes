<script lang="ts">
  import { t } from '$lib/i18n'
</script>

<svelte:head>
  <title>{$t('terms.title')} | BabyClothes</title>
</svelte:head>

<div class="legal-page">
  <h1 class="legal-page__title">{$t('terms.title')}</h1>
  <p class="legal-page__body">{$t('terms.body')}</p>
</div>

<style>
  .legal-page {
    max-width: 72rem;
    margin: 0 auto;
    padding: 2.4rem 1.6rem 4rem;
  }

  .legal-page__title {
    font-family: var(--ld);
    font-size: 1.6rem;
    font-weight: 900;
    margin: 0 0 1.2rem;
    color: var(--bk);
  }

  .legal-page__body {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--bk);
    white-space: pre-line;
    margin: 0;
  }
</style>
