<script lang="ts">
  import { t } from '$lib/i18n'

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

<nav class="categorytabnav" aria-label={$t('category_nav.aria_label')}>
  <div class="categorytabnav__inner">
    {#each categories as category, i (category)}
      {#if i > 0}
        <span class="categorytabnav__sep" aria-hidden="true"></span>
      {/if}
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
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.04);
    border-radius: 12px;
    overflow: hidden;
  }

  .categorytabnav__inner {
    display: flex;
    padding: 0 1rem;
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
    padding: 0.72rem 1rem;
    font-family: var(--ld);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    white-space: nowrap;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    transition: all 0.2s;
  }

  .categorytabnav__tab:hover {
    color: rgba(0, 0, 0, 0.65);
  }

  .categorytabnav__tab--active {
    color: var(--bk);
    border-bottom-color: var(--pk);
  }

  .categorytabnav__sep {
    width: 1px;
    height: 12px;
    background: rgba(0, 0, 0, 0.07);
    flex-shrink: 0;
    align-self: center;
    margin: 0 0.1rem;
  }
</style>
