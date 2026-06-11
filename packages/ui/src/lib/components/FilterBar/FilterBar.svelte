<script lang="ts">
  type Variant = 'default' | 'pk'
  type Size = 'sm' | 'md'

  let {
    filters = [],
    selected = $bindable([]),
    variant = 'default',
    size = 'md',
    onchange,
  }: {
    filters: Array<{ label: string; value: string; count?: number }>
    selected?: string[]
    variant?: Variant
    size?: Size
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
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 2px;
  }

  .filter-bar::-webkit-scrollbar {
    display: none;
  }

  .filter-bar__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1.5px solid var(--color-black);
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
    padding: 8px 18px;
    font-size: 0.72rem;
  }

  /* ── Size: sm ────────────────────────────────── */
  .filter-bar--sm .filter-bar__chip {
    padding: 5px 12px;
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
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
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
</style>
