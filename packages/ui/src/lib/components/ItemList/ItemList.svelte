<script lang="ts">
  import type { Snippet } from 'svelte'

  type Layout = 'grid' | 'list'

  let {
    label,
    count,
    layout = 'grid',
    children,
  }: {
    label?: string
    count?: number
    layout?: Layout
    children?: Snippet
  } = $props()
</script>

<div class="item-list">
  {#if label}
    <div class="item-list__header">
      <span class="item-list__label">{label}</span>
      {#if count !== undefined}
        <span class="item-list__count">{count}</span>
      {/if}
    </div>
  {/if}

  <div class="item-list__track item-list__track--{layout}">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .item-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  /* ── Header ───────────────────────────────────── */
  .item-list__header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0 0.4rem;
  }

  .item-list__label {
    font-family: var(--font-ui);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--color-black);
  }

  .item-list__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.6rem;
    border-radius: var(--radius-pill);
    background: var(--color-bg-2);
    color: var(--color-gray);
    font-family: var(--font-ui);
    font-size: 0.54rem;
    font-weight: 700;
    line-height: 1;
  }

  /* ── Track: grid ──────────────────────────────── */
  .item-list__track--grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  @media (max-width: 64rem) {
    .item-list__track--grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ── Track: list ──────────────────────────────── */
  .item-list__track--list {
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.4rem;
  }

  .item-list__track--list::-webkit-scrollbar {
    display: none;
  }

  :global(.item-list__track--list > *) {
    flex-shrink: 0;
  }
</style>
