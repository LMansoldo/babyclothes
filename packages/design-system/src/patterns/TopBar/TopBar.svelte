<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant = 'catalog',
    currentPath,
    searchPlaceholder,
    searchAriaLabel,
    chatAiLabel,
    publishLabel,
    navItems,
    onSearch,
    onNavigate,
    avatar,
    searchIcon,
    chatIcon,
  }: {
    variant?: 'catalog' | 'chat'
    currentPath?: string
    searchPlaceholder?: string
    searchAriaLabel?: string
    chatAiLabel?: string
    publishLabel?: string
    navItems?: { href: string; label: string }[]
    onSearch?: (value: string) => void
    onNavigate?: (href: string) => void
    avatar?: Snippet
    searchIcon?: Snippet
    chatIcon?: Snippet
  } = $props()
</script>

<nav class="topnav">
  <div class="topnav__inner">
    {#if onNavigate}
      <button class="topnav__logo" onclick={() => onNavigate('/catalog')}>BabyClothes</button>
    {:else}
      <a href="/catalog" class="topnav__logo">BabyClothes</a>
    {/if}

    {#if variant === 'catalog'}
      <div class="topnav__search">
        <span class="topnav__search-icon">
          {#if searchIcon}
            {@render searchIcon()}
          {:else}
            <span class="topnav__search-icon-dot"></span>
          {/if}
        </span>
        <input
          type="text"
          placeholder={searchPlaceholder}
          class="topnav__search-input"
          aria-label={searchAriaLabel}
          oninput={(e) => onSearch?.((e.target as HTMLInputElement).value)}
        />
      </div>
    {:else if navItems}
      <div class="topnav__tabs">
        {#each navItems as item (item.href)}
          {#if onNavigate}
            <button
              class="topnav__tab"
              class:topnav__tab--active={currentPath?.startsWith(item.href) ?? false}
              onclick={() => onNavigate(item.href)}
            >
              {item.label}
            </button>
          {:else}
            <a
              href={item.href}
              class="topnav__tab"
              class:topnav__tab--active={currentPath?.startsWith(item.href) ?? false}
            >
              {item.label}
            </a>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="topnav__actions">
      {#if variant === 'catalog'}
        {#if onNavigate}
          <button class="topnav__btn-ghost" onclick={() => onNavigate('/chat')}>
            {#if chatIcon}
              {@render chatIcon()}
            {/if}
            {chatAiLabel}
          </button>
          <button class="topnav__btn-pink" onclick={() => onNavigate('/sell')}>
            {publishLabel}
          </button>
        {:else}
          <a href="/chat" class="topnav__btn-ghost">
            {#if chatIcon}
              {@render chatIcon()}
            {/if}
            {chatAiLabel}
          </a>
          <a href="/sell" class="topnav__btn-pink">+ {publishLabel}</a>
        {/if}
      {/if}
      {#if avatar}
        {@render avatar()}
      {:else}
        <div class="topnav__avatar-placeholder"></div>
      {/if}
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
    background: rgba(255, 255, 255, .88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, .6);
    box-shadow: 0 2px 12px rgba(0, 0, 0, .06);
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
    font-size: 0.82rem;
    color: var(--bk);
    text-decoration: none;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .topnav__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    max-width: 40rem;
    background: #F3F4F6;
    border-radius: 99rem;
    padding: 0.35rem 0.875rem;
    transition: background 0.2s;
  }

  .topnav__search:focus-within {
    background: #E5E7EB;
  }

  .topnav__search-icon-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 0.2rem solid var(--gr);
    display: block;
    position: relative;
  }

  .topnav__search-icon-dot::after {
    content: '';
    position: absolute;
    bottom: -0.3rem;
    right: -0.3rem;
    width: 0.3rem;
    height: 0.5rem;
    background: var(--gr);
    border-radius: 0.1rem;
    transform: rotate(-45deg);
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
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    cursor: pointer;
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

  .topnav__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .topnav__btn-ghost {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #374151;
    text-decoration: none;
    border: 1.5px solid #D1D5DB;
    border-radius: 99rem;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease;
    font-family: var(--font-lato);
    flex-shrink: 0;
  }

  .topnav__btn-ghost:hover {
    background: rgba(0, 0, 0, .04);
  }

  .topnav__btn-pink {
    display: flex;
    align-items: center;
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    background: var(--pk);
    border-radius: 99rem;
    cursor: pointer;
    transition: opacity 0.15s ease;
    border: none;
    font-family: var(--font-lato);
    flex-shrink: 0;
  }

  .topnav__btn-pink:hover {
    opacity: 0.9;
  }

  .topnav__avatar-placeholder {
    width: 3.2rem;
    height: 3.2rem;
    border-radius: var(--r-xs);
    background: var(--of2);
    flex-shrink: 0;
  }
</style>
