<script lang="ts">
  let {
    variant = 'default',
    title,
    subtitle,
    onBack,
  }: {
    variant?: 'default' | 'hero'
    title: string
    subtitle?: string
    onBack?: () => void
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
  <header class="pageheader" class:pageheader--has-back={onBack}>
    {#if onBack}
      <button class="pageheader__back" onclick={onBack} aria-label="Back" type="button">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"></path>
        </svg>
      </button>
    {/if}
    <h1 class="pageheader__title">{title}</h1>
    {#if subtitle}
      <p class="pageheader__subtitle">{subtitle}</p>
    {/if}
  </header>
{/if}

<style>
  .pageheader {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.6rem;
    background: #fff;
    border-bottom: 1px solid #F3F4F6;
  }

  .pageheader--hero {
    padding: 2.5rem 1.5rem 1.5rem;
    background: linear-gradient(135deg, var(--of2), var(--pk3));
    border-radius: 0 0 2.4rem 2.4rem;
    border-bottom: none;
    display: block;
  }

  .pageheader__back {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #F3F4F6;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
  }

  .pageheader__back:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink, #FF3CAC);
  }

  .pageheader__title {
    font-family: var(--sr, 'Sriracha', cursive);
    font-size: 1.2rem;
    font-weight: 400;
    color: #111;
    margin: 0;
  }

  .pageheader--hero .pageheader__title {
    font-family: var(--ld);
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: -0.03em;
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
