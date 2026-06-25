<script lang="ts">
  import { getContext } from 'svelte'
  import { page } from '$app/stores'
  import { Search, MessageSquare } from 'lucide-svelte'
  import type { Session } from '$lib/domain/auth/entities/Session'
  import { t } from '$lib/i18n'

  interface Props {
    variant?: 'catalog' | 'chat'
  }

  let { variant = 'catalog' }: Props = $props()

  const session = getContext<Session>('session')!
  const currentPath = $derived($page.url.pathname)
</script>

<nav class="topnav">
  <div class="topnav__inner">
    <a href="/catalog" class="topnav__logo">BabyClothes</a>

    {#if variant === 'catalog'}
      <div class="topnav__search">
        <Search size={16} class="topnav__search-icon" />
        <input
          type="text"
          placeholder={$t('topbar.search_label')}
          class="topnav__search-input"
          aria-label={$t('topbar.search_aria')}
        />
      </div>
    {:else}
      <div class="topnav__tabs">
        <a
          href="/catalog"
          class="topnav__tab"
          class:topnav__tab--active={currentPath.startsWith('/catalog')}
        >
          {$t('topbar.nav.catalog')}
        </a>
        <a
          href="/chat"
          class="topnav__tab"
          class:topnav__tab--active={currentPath.startsWith('/chat')}
        >
          {$t('topbar.nav.messages')}
        </a>
        <a
          href="/child"
          class="topnav__tab"
          class:topnav__tab--active={currentPath.startsWith('/child')}
        >
          {$t('topbar.nav.growth')}
        </a>
      </div>
    {/if}

    <div class="topnav__actions">
      {#if variant === 'catalog'}
        <a href="/chat" class="topnav__btn-ghost">
          <MessageSquare size={16} />
          {$t('topbar.nav.chat_ai')}
        </a>
        <a href="/sell" class="topnav__btn-pink">+ {$t('topbar.publish')}</a>
      {/if}
      <a href="/profile" class="topnav__avatar">
        {#if session.avatarUrl}
          <img src={session.avatarUrl} alt={session.name} />
        {:else}
          <span class="topnav__avatar-fallback">{session.name?.charAt(0)?.toUpperCase()}</span>
        {/if}
      </a>
    </div>
  </div>
</nav>

<style>
  .topnav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 5.6rem;
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 0.1rem solid var(--glass-brd);
  }

  .topnav__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.6rem;
    height: 100%;
    padding: 0 2rem;
    max-width: 120rem;
    margin: 0 auto;
  }

  .topnav__logo {
    font-family: var(--ld);
    font-weight: 900;
    font-size: 1.5rem;
    color: var(--bk);
    text-decoration: none;
    letter-spacing: -0.05rem;
    flex-shrink: 0;
  }

  /* ── Search bar (catalog variant) ── */
  .topnav__search {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex: 1;
    max-width: 40rem;
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 0.1rem solid var(--glass-brd);
    border-radius: 99.9rem;
    padding: 0.6rem 1.4rem;
    transition: background 0.2s;
  }

  .topnav__search:focus-within {
    background: rgba(255, 255, 255, 0.55);
  }

  :global(.topnav__search-icon) {
    color: var(--gr);
    flex-shrink: 0;
  }

  .topnav__search-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.9rem;
    color: var(--bk);
    width: 100%;
  }

  .topnav__search-input::placeholder {
    color: var(--gr);
  }

  /* ── Center tabs (chat variant) ── */
  .topnav__tabs {
    display: flex;
    gap: 0.4rem;
  }

  .topnav__tab {
    padding: 0.6rem 1.4rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gr);
    text-decoration: none;
    border-bottom: 0.2rem solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .topnav__tab:hover {
    color: var(--bk);
  }

  .topnav__tab--active {
    color: var(--pk);
    border-bottom-color: var(--pk);
  }

  .topnav__tab--active:hover {
    color: var(--pk);
  }

  /* ── Actions (right side) ── */
  .topnav__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .topnav__btn-ghost {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--bk);
    text-decoration: none;
    border: 0.1rem solid var(--glass-line);
    border-radius: var(--r-sm);
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .topnav__btn-ghost:hover {
    background: rgba(255, 255, 255, 0.38);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
  }

  .topnav__btn-pink {
    display: flex;
    align-items: center;
    padding: 0.6rem 1.4rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--wh);
    text-decoration: none;
    background: var(--pk);
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .topnav__btn-pink:hover {
    opacity: 0.9;
  }

  /* ── Avatar ── */
  .topnav__avatar {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: var(--r-xs);
    overflow: hidden;
    flex-shrink: 0;
    text-decoration: none;
  }

  .topnav__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .topnav__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--of2);
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--gr);
  }
</style>
