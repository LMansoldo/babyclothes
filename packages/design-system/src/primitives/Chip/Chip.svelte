<script lang="ts">
  import type { Snippet } from 'svelte'

  type Variant = 'neutral' | 'size' | 'condition' | 'gender' | 'category' | 'selected'
  type Size = 'sm' | 'md'

  let {
    label,
    variant = 'neutral',
    selected = false,
    size = 'md',
    disabled = false,
    prefixIcon,
    onclick,
    ariaLabel,
  }: {
    label: string
    variant?: Variant
    selected?: boolean
    size?: Size
    disabled?: boolean
    prefixIcon?: Snippet
    onclick?: () => void
    ariaLabel?: string
  } = $props()

  const Element = $derived(onclick && !disabled ? 'button' : 'span')
</script>

{#if Element === 'button'}
  <button
    class="chip chip--{variant} chip--{size}"
    class:chip--selected={selected}
    class:chip--disabled={disabled}
    disabled={disabled}
    onclick={onclick}
    aria-pressed={selected}
    aria-label={ariaLabel || label}
    type="button"
  >
    {#if prefixIcon}{@render prefixIcon()}{/if}
    <span class="chip__label">{label}</span>
  </button>
{:else}
  <span
    class="chip chip--{variant} chip--{size}"
    class:chip--selected={selected}
    class:chip--disabled={disabled}
    aria-label={ariaLabel}
  >
    {#if prefixIcon}{@render prefixIcon()}{/if}
    <span class="chip__label">{label}</span>
  </span>
{/if}

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: none;
    border-radius: var(--radius-pill);
    font-family: var(--font-lato);
    font-weight: 600;
    cursor: default;
    transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
    white-space: nowrap;
    line-height: 1;
  }

  .chip:is(button) {
    cursor: pointer;
  }

  .chip:is(button):focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .chip--sm {
    padding: 0.4rem 0.7rem;
    font-size: 0.65rem;
  }

  .chip--md {
    padding: 0.5rem 0.9rem;
    font-size: 0.75rem;
  }

  /* Neutral */
  .chip--neutral {
    background: #F3F4F6;
    color: var(--color-black);
  }

  .chip--neutral:is(button):hover {
    background: #E5E7EB;
  }

  /* Size */
  .chip--size {
    background: #F3F4F6;
    color: var(--color-black);
  }

  .chip--size.chip--selected {
    background: var(--color-black);
    color: var(--color-white);
  }

  .chip--size:is(button):hover {
    background: #E5E7EB;
  }

  .chip--size.chip--selected:is(button):hover {
    background: #1C1C1C;
  }

  /* Condition */
  .chip--condition {
    background: #F3F4F6;
    color: var(--color-gray);
  }

  .chip--condition.chip--selected,
  .chip--condition[aria-pressed="true"] {
    background: var(--color-pink-soft);
    color: var(--color-pink);
  }

  .chip--condition:is(button):hover {
    background: #E5E7EB;
  }

  /* Gender */
  .chip--gender {
    background: #F3F4F6;
    color: var(--color-black);
  }

  .chip--gender.chip--selected {
    background: var(--color-black);
    color: var(--color-white);
  }

  .chip--gender:is(button):hover {
    background: #E5E7EB;
  }

  /* Category */
  .chip--category {
    background: #F3F4F6;
    color: var(--color-black);
  }

  .chip--category.chip--selected {
    background: var(--color-pk-soft);
    color: var(--color-pink);
    box-shadow: inset 0 0 0 0.2rem var(--color-pink);
  }

  .chip--category:is(button):hover {
    background: #E5E7EB;
  }

  /* Selected (generic) */
  .chip--selected {
    background: var(--color-pink-soft);
    color: var(--color-pink);
  }

  .chip--selected.chip--selected {
    box-shadow: inset 0 0 0 0.2rem var(--color-pink);
  }

  .chip--selected:is(button):hover {
    background: #FFD6EE;
  }

  /* Disabled */
  .chip--disabled {
    opacity: 0.35;
    pointer-events: none;
  }
</style>
