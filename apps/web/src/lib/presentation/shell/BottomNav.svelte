<script lang="ts">
  import { page } from '$app/stores'

  const tabs = [
    { href: '/catalog', label: 'Catálogo', icon: '🏠' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/child', label: 'Filho', icon: '👶' },
    { href: '/sell', label: 'Vender', icon: '➕' },
  ]

  const currentPath = $derived($page.url.pathname)

  function isActive(href: string): boolean {
    return currentPath.startsWith(href)
  }
</script>

<nav class="bottomnav">
  {#each tabs as tab (tab.href)}
    <a
      href={tab.href}
      class="bottomnav__tab"
      class:bottomnav__tab--active={isActive(tab.href)}
      aria-label={tab.label}
    >
      <span class="bottomnav__icon">{tab.icon}</span>
      <span class="bottomnav__label">{tab.label}</span>
    </a>
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
    align-items: center;
    justify-content: space-around;
    padding: 8px 0;
    background: var(--color-white);
    border-top: 1px solid var(--color-bg-2);
  }

  .bottomnav__tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    color: var(--color-gray);
    transition: color var(--transition-fast);
  }

  .bottomnav__tab--active {
    color: var(--color-pink);
  }

  .bottomnav__icon {
    font-size: 1.2rem;
  }

  .bottomnav__label {
    font-family: var(--font-ui);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
</style>
