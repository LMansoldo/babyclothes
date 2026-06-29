<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    tabs,
    currentPath,
    onNavigate,
  }: {
    tabs: { href: string; label: string; icon: Snippet }[]
    currentPath: string
    onNavigate?: (href: string) => void
  } = $props()

  function isActive(href: string): boolean {
    return currentPath.startsWith(href)
  }
</script>

<nav class="bottomnav">
  {#each tabs as tab (tab.href)}
    {#if onNavigate}
      <button
        class="bottomnav__tab"
        class:bottomnav__tab--active={isActive(tab.href)}
        aria-current={isActive(tab.href) ? 'page' : undefined}
        aria-label={tab.label}
        onclick={() => onNavigate(tab.href)}
      >
        <span class="bottomnav__icon">
          {@render tab.icon?.()}
        </span>
        <span class="bottomnav__label">{tab.label}</span>
      </button>
    {:else}
      <a
        href={tab.href}
        class="bottomnav__tab"
        class:bottomnav__tab--active={isActive(tab.href)}
        aria-current={isActive(tab.href) ? 'page' : undefined}
        aria-label={tab.label}
      >
        <span class="bottomnav__icon">
          {@render tab.icon?.()}
        </span>
        <span class="bottomnav__label">{tab.label}</span>
      </a>
    {/if}
  {/each}
</nav>

<style>
  .bottomnav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-around;
    padding: 0.625rem 0.25rem;
    padding-bottom: calc(0.625rem + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, .88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, .6);
    box-shadow: 0 -2px 12px rgba(0, 0, 0, .06);
  }

  @media (min-width: 76.9rem) {
    .bottomnav {
      display: none;
    }
  }

  .bottomnav__tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    text-decoration: none;
    color: var(--gr);
    font-size: 1rem;
    transition: color 0.15s ease;
    background: none;
    border: none;
    cursor: pointer;
  }

  .bottomnav__tab--active {
    color: var(--pk);
  }

  .bottomnav__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .bottomnav__label {
    font-family: var(--font-lato);
    font-size: 0.62rem;
    font-weight: 700;
  }
</style>
