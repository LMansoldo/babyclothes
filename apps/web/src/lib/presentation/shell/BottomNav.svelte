<script lang="ts">
  import { page } from '$app/stores'
  import { Home, MessageSquare, Baby, Plus } from 'lucide-svelte'

  const tabs = [
    { href: '/catalog', label: 'Catálogo', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/child', label: 'Filho', icon: Baby },
    { href: '/sell', label: 'Vender', icon: Plus },
  ]

  const currentPath = $derived($page.url.pathname)

  function isActive(href: string): boolean {
    return currentPath.startsWith(href)
  }
</script>

<nav class="bottomnav" aria-label="Navegação principal">
  {#each tabs as tab (tab.href)}
    <a
      href={tab.href}
      class="bottomnav__tab"
      class:bottomnav__tab--active={isActive(tab.href)}
      aria-current={isActive(tab.href) ? 'page' : undefined}
      aria-label={tab.label}
    >
      <span class="bottomnav__icon">
        <tab.icon size={20} strokeWidth={1.75} />
      </span>
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
    justify-content: space-around;
    padding: 10px 0;
    padding-bottom: env(safe-area-inset-bottom);
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-top: 1px solid var(--glass-brd);
  }

  @media (min-width: 769px) {
    .bottomnav {
      display: none;
    }
  }

  .bottomnav__tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    color: var(--gr);
    font-size: 1rem;
    transition: color 0.15s ease;
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
    font-family: var(--font-ui);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
</style>
