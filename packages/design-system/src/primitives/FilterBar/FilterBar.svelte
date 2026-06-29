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
      <span class="filter-bar__chip-label">{filter.label}</span>
      {#if filter.count !== undefined}
        <span class="filter-bar__count">{filter.count}</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .filter-bar {
    display: flex;
    gap: 0.5rem;
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
    gap: 0.5rem;
    background: #F3F4F6;
    color: #374151;
    border: none;
    font-family: var(--font-lato);
    font-weight: 700;
    border-radius: var(--radius-pill);
    cursor: pointer;
    white-space: nowrap;
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
    transition:
      background var(--transition-base),
      color var(--transition-base);
  }

  .filter-bar__chip:hover {
    background: #E5E7EB;
  }

  .filter-bar__chip[data-selected] {
    background: #111;
    color: #fff;
  }

  .filter-bar__chip[data-selected]:hover {
    background: var(--color-black-2);
  }

  /* ── Variant: pk ─────────────────────────────── */
  .filter-bar--pk .filter-bar__chip {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .filter-bar--pk .filter-bar__chip:hover {
    background: #FFD0ED;
  }

  .filter-bar--pk .filter-bar__chip[data-selected] {
    background: var(--color-pink);
    color: #fff;
  }

  .filter-bar--pk .filter-bar__chip[data-selected]:hover {
    background: var(--color-pink-light);
  }

  /* ── Variant: on-dark ─────────────────────────── */
  .filter-bar--on-dark .filter-bar__chip {
    background: rgba(255, 255, 255, .15);
    color: rgba(255, 255, 255, .85);
  }

  .filter-bar--on-dark .filter-bar__chip:hover {
    background: rgba(255, 255, 255, .22);
  }

  .filter-bar--on-dark .filter-bar__chip[data-selected] {
    background: #fff;
    color: #111;
  }

  /* ── Count badge ─────────────────────────────── */
  .filter-bar__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.35rem;
    border-radius: var(--radius-pill);
    background: #E5E7EB;
    color: #6B7280;
    font-size: 0.62rem;
    font-weight: 700;
    font-family: var(--font-lato);
    line-height: 1.4;
  }

  .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }

  .filter-bar--pk .filter-bar__count {
    background: #FFD0ED;
    color: var(--color-pink);
  }

  .filter-bar--pk .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }

  .filter-bar--on-dark .filter-bar__count {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, .85);
  }

  .filter-bar--on-dark .filter-bar__chip[data-selected] .filter-bar__count {
    background: rgba(0, 0, 0, 0.12);
    color: #111;
  }

  /* ── Label ────────────────────────────────────── */
  .filter-bar__label {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--color-black);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: 0.4rem;
  }

  .filter-bar--on-dark .filter-bar__label {
    color: #fff;
  }

  .filter-bar__chip-label {
    font-family: var(--font-lato);
  }

  /* ── Size sm ─────────────────────────────────── */
  .filter-bar--sm .filter-bar__chip {
    padding: 0.25rem 0.6rem;
    font-size: 0.72rem;
  }
</style>
