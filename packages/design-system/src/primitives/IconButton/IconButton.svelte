<script lang="ts">
  import type { Snippet } from 'svelte'

  type IconName = 'back' | 'close' | 'fav' | 'share'
  type Variant = 'glass' | 'ghost' | 'dark'
  type Size = 32 | 28

  let {
    icon,
    variant = 'glass',
    size = 32,
    active = false,
    ariaLabel,
    onclick,
  }: {
    icon: IconName | Snippet
    variant?: Variant
    size?: Size
    active?: boolean
    ariaLabel?: string
    onclick?: () => void
  } = $props()

  const sizeRem = $derived(size / 10)
</script>

<button
  class="icon-btn icon-btn--{variant} icon-btn--sz{size}"
  class:icon-btn--active={active}
  aria-label={ariaLabel}
  onclick={onclick}
  type="button"
  style="width: {sizeRem}rem; height: {sizeRem}rem; min-width: {sizeRem}rem;"
>
  {#if typeof icon === 'string'}
    {#if icon === 'back'}
      <svg class="icon-btn__svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
    {:else if icon === 'close'}
      <svg class="icon-btn__svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    {:else if icon === 'fav'}
      {#if active}
        <svg class="icon-btn__svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      {:else}
        <svg class="icon-btn__svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      {/if}
    {:else if icon === 'share'}
      <svg class="icon-btn__svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>
    {/if}
  {:else}
    {@render icon()}
  {/if}
</button>

<style>
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
    flex-shrink: 0;
    /* Touch target */
    padding: 0;
    position: relative;
  }

  /* Extend touch target to minimum 4.4rem without visual impact */
  .icon-btn::after {
    content: '';
    position: absolute;
    inset: -0.6rem;
  }

  .icon-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .icon-btn:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .icon-btn:not(:disabled):hover {
    transform: scale(1.05);
  }

  .icon-btn__svg {
    flex-shrink: 0;
  }

  /* Glass */
  .icon-btn--glass {
    background: rgba(255, 255, 255, 0.85);
    color: var(--color-black);
  }

  .icon-btn--glass:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.95);
  }

  /* Ghost */
  .icon-btn--ghost {
    background: transparent;
    color: var(--color-black);
  }

  .icon-btn--ghost:not(:disabled):hover {
    background: rgba(0, 0, 0, 0.04);
  }

  /* Dark */
  .icon-btn--dark {
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-black);
  }

  .icon-btn--dark:not(:disabled):hover {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Active fav */
  .icon-btn--active .icon-btn__svg {
    color: var(--color-pink);
  }


</style>
