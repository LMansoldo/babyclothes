<script lang="ts">
  type Variant = 'default' | 'pk' | 'on-dark'
  type Size = 'sm' | 'md'

  let {
    filters = [],
    selected = $bindable([]),
    variant = 'default',
    size = 'md',
    label,
    onchange,
  }: {
    filters: Array<{ label: string; value: string; count?: number }>
    selected?: string[]
    variant?: Variant
    size?: Size
    label?: string
    onchange?: (selected: string[]) => void
  } = $props()

  function toggle(value: string) {
    const idx = selected.indexOf(value)
    if (idx === -1) {
      selected = [...selected, value]
    } else {
      selected = selected.filter(v => v !== value)
    }
    onchange?.(selected)
  }
</script>

<div class="filter-bar filter-bar--{variant} filter-bar--{size}" role="group">
  {#if label}
    <span class="filter-bar__label">{label}</span>
  {/if}
  {#each filters as filter (filter.value)}
    <button
      class="filter-bar__chip"
      data-selected={selected.includes(filter.value) || undefined}
      onclick={() => toggle(filter.value)}
    >
      <span class="filter-bar__label">{filter.label}</span>
      {#if filter.count !== undefined}
        <span class="filter-bar__count">{filter.count}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .filter-bar {
    display: flex;
    gap: 0.8rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.2rem;
  }

  .filter-bar::-webkit-scrollbar {
    display: none;
  }

  .filter-bar__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    border: 0.15rem solid var(--color-black);
    background: transparent;
    color: var(--color-black);
    font-family: var(--font-ui);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: var(--radius-pill);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--transition-base),
      color var(--transition-base),
      border-color var(--transition-base);
  }

  .filter-bar__chip:hover {
    background: var(--color-bg-2);
  }

  .filter-bar__chip[data-selected] {
    background: var(--color-black);
    color: var(--color-white);
    border-color: var(--color-black);
  }

  .filter-bar__chip[data-selected]:hover {
    background: var(--color-black-2);
  }

  /* ── Size: md (default) ──────────────────────── */
  .filter-bar--md .filter-bar__chip {
    padding: 0.8rem 1.8rem;
    font-size: 0.72rem;
  }

  /* ── Size: sm ────────────────────────────────── */
  .filter-bar--sm .filter-bar__chip {
    padding: 0.5rem 1.2rem;
    font-size: 0.62rem;
  }

  /* ── Variant: pk ─────────────────────────────── */
  .filter-bar--pk .filter-bar__chip {
    border-color: var(--color-pink);
    color: var(--color-pink);
  }

  .filter-bar--pk .filter-bar__chip:hover {
    background: var(--color-pink-soft);
  }

  .filter-bar--pk .filter-bar__chip[data-selected] {
    background: var(--color-pink);
    color: var(--color-white);
    border-color: var(--color-pink);
  }

  .filter-bar--pk .filter-bar__chip[data-selected]:hover {
    background: var(--color-pink-light);
    border-color: var(--color-pink-light);
  }

  /* ── Count badge ─────────────────────────────── */
  .filter-bar__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.8rem;
    height: 1.8rem;
    padding: 0 0.5rem;
    border-radius: var(--radius-pill);
    background: var(--color-bg-2);
    color: var(--color-black);
    font-size: 0.54rem;
    font-weight: 700;
    font-family: var(--font-ui);
    line-height: 1;
  }

  .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(255, 255, 255, 0.25);
    color: var(--color-white);
  }

  .filter-bar--pk .filter-bar__count {
    background: var(--color-pink-soft);
    color: var(--color-pink);
  }

  .filter-bar--pk .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(255, 255, 255, 0.25);
    color: var(--color-white);
  }

  /* ── Label ────────────────────────────────────── */
  .filter-bar__label {
    font-family: var(--font-ui);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--color-black);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: 0.4rem;
  }

  /* ── Variant: on-dark ─────────────────────────── */
  .filter-bar--on-dark .filter-bar__label {
    color: var(--color-white);
  }

  .filter-bar--on-dark .filter-bar__chip {
    border-color: rgba(255, 255, 255, 0.35);
    color: var(--color-white);
  }

  .filter-bar--on-dark .filter-bar__chip:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .filter-bar--on-dark .filter-bar__chip[data-selected] {
    background: var(--color-white);
    color: var(--color-black);
    border-color: var(--color-white);
  }

  .filter-bar--on-dark .filter-bar__chip[data-selected]:hover {
    background: rgba(255, 255, 255, 0.85);
  }

  .filter-bar--on-dark .filter-bar__count {
    background: rgba(255, 255, 255, 0.15);
    color: var(--color-white);
  }

  .filter-bar--on-dark .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(0, 0, 0, 0.12);
    color: var(--color-black);
  }
</style>
