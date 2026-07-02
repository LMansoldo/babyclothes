<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant = 'catalog',
    searchPlaceholder,
    searchAriaLabel,
    publishLabel,
    onSearch,
    onNavigate,
    avatar,
    searchIcon,
    chatTitle = 'Assistente IA',
    chatStatus = 'SSE Live',
    chatChildContext = '',
    onMenuClick,
  }: {
    variant?: 'catalog' | 'chat'
    searchPlaceholder?: string
    searchAriaLabel?: string
    publishLabel?: string
    onSearch?: (value: string) => void
    onNavigate?: (href: string) => void
    avatar?: Snippet
    searchIcon?: Snippet
    chatTitle?: string
    chatStatus?: string
    chatChildContext?: string
    onMenuClick?: () => void
  } = $props()
</script>

{#if variant === 'catalog'}
  <nav class="topnav topnav--catalog">
    {#if onNavigate}
      <button class="topnav__logo" onclick={() => onNavigate('/catalog')}>
        <svg width="12" height="15" viewBox="0 0 20 24" fill="none">
          <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="var(--pk)"/>
        </svg>
        <span>BabyClothes</span>
      </button>
    {:else}
      <a href="/catalog" class="topnav__logo">
        <svg width="12" height="15" viewBox="0 0 20 24" fill="none">
          <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="var(--pk)"/>
        </svg>
        <span>BabyClothes</span>
      </a>
    {/if}

    <div class="topnav__search">
      {#if searchIcon}
        {@render searchIcon()}
      {:else}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      {/if}
      <input
        type="text"
        placeholder={searchPlaceholder}
        class="topnav__search-input"
        aria-label={searchAriaLabel}
        oninput={(e) => onSearch?.((e.target as HTMLInputElement).value)}
      />
    </div>

    {#if onNavigate}
      <button class="topnav__btn-publish" onclick={() => onNavigate('/sell')}>
        {publishLabel}
      </button>
    {:else}
      <a href="/sell" class="topnav__btn-publish">{publishLabel}</a>
    {/if}

    {#if avatar}
      {@render avatar()}
    {:else}
      <div class="topnav__avatar-placeholder">BC</div>
    {/if}
  </nav>
{:else}
  <nav class="topnav topnav--chat">
    <div class="topnav__ai-avatar">
      <svg width="14" height="17" viewBox="0 0 20 24" fill="none">
        <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="var(--pk)"/>
      </svg>
      <div class="topnav__online-dot"></div>
    </div>

    <div class="topnav__chat-info">
      <div class="topnav__chat-title">{chatTitle}</div>
      <div class="topnav__chat-status">
        <div class="topnav__status-dot"></div>
        <span class="topnav__status-text">{chatStatus}</span>
        {#if chatChildContext}
          <span class="topnav__child-context">· {chatChildContext}</span>
        {/if}
      </div>
    </div>

    <button class="topnav__btn-menu" aria-label="Menu" onclick={() => onMenuClick?.()}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
        <circle cx="5" cy="12" r="1"/>
      </svg>
    </button>
  </nav>
{/if}

<style>
  .topnav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, .95);
    backdrop-filter: blur(0.6rem);
    -webkit-backdrop-filter: blur(0.6rem);
    border-bottom: 1px solid #F3F4F6;
  }

  .topnav--catalog {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.7rem;
    height: 4rem;
  }

  .topnav--chat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.7rem;
    height: 4rem;
    background: #fff;
  }

  /* Logo */
  .topnav__logo {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    font-family: var(--ld);
    font-size: 0.8rem;
    color: var(--bk);
  }

  /* Search */
  .topnav__search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: #F3F4F6;
    border-radius: 99rem;
    padding: 0.35rem 0.5rem;
  }

  .topnav__search-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.75rem;
    color: var(--bk);
    width: 100%;
  }

  .topnav__search-input::placeholder {
    color: #9CA3AF;
  }

  /* Publish button */
  .topnav__btn-publish {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.5rem;
    border-radius: 99rem;
    background: var(--pk);
    border: none;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    text-decoration: none;
  }

  /* Avatar placeholder */
  .topnav__avatar-placeholder {
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  /* Chat variant — AI avatar */
  .topnav__ai-avatar {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  .topnav__online-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0.45rem;
    height: 0.45rem;
    background: #22C55E;
    border: 0.1rem solid #fff;
    border-radius: 50%;
  }

  /* Chat variant — info */
  .topnav__chat-info {
    flex: 1;
  }

  .topnav__chat-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #111;
  }

  .topnav__chat-status {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .topnav__status-dot {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: #22C55E;
  }

  .topnav__status-text {
    font-size: 0.65rem;
    color: #22C55E;
    font-weight: 700;
  }

  .topnav__child-context {
    font-size: 0.65rem;
    color: #9CA3AF;
    margin-left: 0.2rem;
  }

  /* Chat variant — menu button */
  .topnav__btn-menu {
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: #F3F4F6;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }
</style>
