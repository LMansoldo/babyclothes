<script lang="ts">
  type Variant = 'dark' | 'pink' | 'gray'
  type Size = 'sm' | 'md'

  let {
    count,
    max = 99,
    variant = 'dark',
    size = 'sm',
  }: {
    count: number
    max?: number
    variant?: Variant
    size?: Size
  } = $props()

  const displayText = $derived(count > max ? `${max}+` : `${Math.max(0, count)}`)
  const showBadge = $derived(count > 0)
</script>

{#if showBadge}
  <span
    class="count-badge count-badge--{variant} count-badge--{size}"
    aria-label="{count} itens"
  >
    {displayText}
  </span>
{:else}
  <span
    class="count-badge count-badge--{variant} count-badge--{size} count-badge--zero"
    aria-hidden="true"
  >
    0
  </span>
{/if}

<style>
  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-lato);
    font-weight: 700;
    border-radius: var(--radius-pill);
    color: var(--color-white);
    line-height: 1;
    min-width: max-content;
  }

  .count-badge--zero {
    opacity: 0;
    pointer-events: none;
  }

  /* Sizes */
  .count-badge--sm {
    height: 1.6rem;
    padding: 0 0.4rem;
    font-size: 0.55rem;
  }

  .count-badge--md {
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.65rem;
  }

  /* Variants */
  .count-badge--dark {
    background: var(--color-black);
  }

  .count-badge--pink {
    background: var(--color-pink);
  }

  .count-badge--gray {
    background: #6B7280;
  }
</style>
