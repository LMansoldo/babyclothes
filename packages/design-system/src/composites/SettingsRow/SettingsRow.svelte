<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    icon,
    trailing,
    onclick,
    ariaLabel,
  }: {
    label: string
    icon?: Snippet
    trailing?: Snippet
    onclick?: () => void
    ariaLabel?: string
  } = $props()
</script>

{#if onclick}
  <button class="settingsrow" onclick={onclick} aria-label={ariaLabel ?? label} type="button">
    <div class="settingsrow__left">
      {#if icon}
        <span class="settingsrow__icon">{@render icon()}</span>
      {/if}
      <span class="settingsrow__label">{label}</span>
    </div>
    {#if trailing}
      <div class="settingsrow__trailing">{@render trailing()}</div>
    {/if}
  </button>
{:else}
  <div class="settingsrow" role="group" aria-label={ariaLabel ?? label}>
    <div class="settingsrow__left">
      {#if icon}
        <span class="settingsrow__icon">{@render icon()}</span>
      {/if}
      <span class="settingsrow__label">{label}</span>
    </div>
    {#if trailing}
      <div class="settingsrow__trailing">{@render trailing()}</div>
    {/if}
  </div>
{/if}

<style>
  .settingsrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.4rem;
    background: #fff;
    border-radius: 1rem;
    width: 100%;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: left;
  }

  .settingsrow:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink, #FF3CAC);
  }

  .settingsrow[role='group'] {
    cursor: default;
  }

  .settingsrow__left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .settingsrow__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  .settingsrow__label {
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.85rem;
    font-weight: 700;
    color: #111;
  }

  .settingsrow__trailing {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
</style>
