<script lang="ts">
  type Variant = 'light' | 'dark'

  let {
    total,
    current = 0,
    variant = 'light',
    size = 0.6,
    gap = 0.6,
  }: {
    total: number
    current?: number
    variant?: Variant
    size?: number
    gap?: number
  } = $props()

  const dots = $derived(Array.from({ length: total }, (_, i) => i))
</script>

<div
  class="dot-indicator dot-indicator--{variant}"
  style="gap: {gap}rem"
  aria-hidden="true"
>
  {#each dots as i}
    <span
      class="dot-indicator__dot"
      class:dot-indicator__dot--active={i === current}
      style="width: {size}rem; height: {size}rem"
    ></span>
  {/each}
</div>

<style>
  .dot-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
  }

  .dot-indicator__dot {
    border-radius: 50%;
    transition: background var(--transition-fast), transform var(--transition-fast);
    flex-shrink: 0;
  }

  .dot-indicator__dot--active {
    transform: scale(1.33);
  }

  /* Light */
  .dot-indicator--light .dot-indicator__dot {
    background: rgba(255, 255, 255, 0.35);
  }

  .dot-indicator--light .dot-indicator__dot--active {
    background: var(--color-white);
  }

  /* Dark */
  .dot-indicator--dark .dot-indicator__dot {
    background: #D1D5DB;
  }

  .dot-indicator--dark .dot-indicator__dot--active {
    background: var(--color-black);
  }
</style>
