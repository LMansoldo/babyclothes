<script lang="ts">
  let {
    variant = 'default',
    title,
    subtitle,
  }: {
    variant?: 'default' | 'hero'
    title: string
    subtitle?: string
  } = $props()
</script>

{#if variant === 'hero'}
  <header class="pageheader pageheader--hero">
    <h1 class="pageheader__title pageheader__title--hero">{title}</h1>
    {#if subtitle}
      <p class="pageheader__subtitle">{subtitle}</p>
    {/if}
  </header>
{:else}
  <header class="pageheader">
    <h1 class="pageheader__title">{title}</h1>
    {#if subtitle}
      <p class="pageheader__subtitle">{subtitle}</p>
    {/if}
  </header>
{/if}

<style>
  .pageheader {
    padding: 1.5rem 1rem 1rem;
  }

  .pageheader--hero {
    padding: 2.5rem 1.5rem 1.5rem;
    background: linear-gradient(135deg, var(--of2), var(--pk3));
    border-radius: 0 0 2.4rem 2.4rem;
  }

  .pageheader__title {
    font-family: var(--ld);
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--bk);
    letter-spacing: -0.03em;
    margin: 0;
  }

  .pageheader__title--hero {
    font-size: 1.8rem;
  }

  .pageheader__subtitle {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--gr);
    margin: 0.3rem 0 0;
    line-height: 1.5;
  }
</style>
