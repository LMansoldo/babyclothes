<script lang="ts">
  let {
    categories,
    active,
    onSelect,
  }: {
    categories: string[]
    active: string
    onSelect: (category: string) => void
  } = $props()
</script>

<nav class="categorytabnav">
  <div class="categorytabnav__inner">
    {#each categories as category (category)}
      <button
        class="categorytabnav__tab"
        class:categorytabnav__tab--active={active === category}
        role="tab"
        aria-selected={active === category}
        onclick={() => onSelect(category)}
      >
        {category}
      </button>
    {/each}
  </div>
</nav>

<style>
  .categorytabnav {
    background: #fff;
    border-bottom: 0.075rem solid #F3F4F6;
  }

  .categorytabnav__inner {
    display: flex;
    padding: 0 0.875rem;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 0;
  }

  .categorytabnav__inner::-webkit-scrollbar {
    display: none;
  }

  .categorytabnav__tab {
    display: flex;
    align-items: center;
    padding: 0.625rem 0.75rem;
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    color: #9CA3AF;
    cursor: pointer;
    white-space: nowrap;
    border: none;
    border-bottom: 0.125rem solid transparent;
    background: none;
    transition: color 0.2s;
  }

  .categorytabnav__tab:hover {
    color: var(--bk);
  }

  .categorytabnav__tab--active {
    color: var(--bk);
    border-bottom-color: var(--pk);
  }
</style>
