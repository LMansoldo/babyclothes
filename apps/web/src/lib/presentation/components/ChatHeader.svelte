<script lang="ts">
  import { RefreshCw, MoreHorizontal, Wifi, WifiOff } from 'lucide-svelte'
  import { t } from '$lib/i18n'

  let {
    variant = 'agent',
    name,
    subtitle,
    chatState = 'idle',
    avatarGradient,
    childContext,
    onRetry,
    onMore,
  }: {
    variant?: 'agent' | 'seller'
    name: string
    subtitle?: string
    chatState?: 'idle' | 'streaming' | 'error'
    avatarGradient?: string
    childContext?: string
    onRetry?: () => void
    onMore?: () => void
  } = $props()

  const resolvedSubtitle = $derived(
    subtitle ?? $t('chat_header.seller_online_verified')
  )

  const stateLabel = $derived(
    chatState === 'streaming'
      ? $t('chat_header.sse_live')
      : chatState === 'error'
        ? $t('chat_header.reconnecting')
        : ''
  )
</script>

<header class="chatheader">
  <div class="chatheader__left">
    <div
      class="chatheader__avatar"
      style={avatarGradient ? `background: ${avatarGradient}` : ''}
    >
      <span class="chatheader__avatar-icon">
        {#if variant === 'agent'}
          <Wifi size={16} strokeWidth={2} />
        {:else}
          <WifiOff size={16} strokeWidth={2} />
        {/if}
      </span>
    </div>

    <div class="chatheader__info">
      <span class="chatheader__name">{name}</span>
      <span class="chatheader__subtitle">
        {resolvedSubtitle}
        {#if childContext}
          <span class="chatheader__child">· {childContext}</span>
        {/if}
      </span>
    </div>
  </div>

  <div class="chatheader__right">
    {#if chatState !== 'idle'}
      <span class="chatheader__state" class:chatheader__state--error={chatState === 'error'}>
        {stateLabel}
      </span>
    {/if}

    {#if chatState === 'error' && onRetry}
      <button
        class="chatheader__btn"
        onclick={onRetry}
        aria-label={$t('chat_header.reconnect')}
      >
        <RefreshCw size={14} strokeWidth={2} />
      </button>
    {/if}

    {#if onMore}
      <button
        class="chatheader__btn"
        onclick={onMore}
        aria-label={$t('chat_header.more_options')}
      >
        <MoreHorizontal size={16} strokeWidth={2} />
      </button>
    {/if}
  </div>
</header>

<style>
  .chatheader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--wh);
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    flex-shrink: 0;
  }

  .chatheader__left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .chatheader__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pk), #7b2ff7);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .chatheader__avatar-icon {
    color: var(--wh);
    display: flex;
  }

  .chatheader__info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .chatheader__name {
    font-family: var(--ld);
    font-size: 0.85rem;
    font-weight: 900;
    color: var(--bk);
  }

  .chatheader__subtitle {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.72rem;
    color: var(--gr);
  }

  .chatheader__child {
    color: var(--pk);
    font-weight: 600;
  }

  .chatheader__right {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .chatheader__state {
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #22c55e;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .chatheader__state--error {
    color: #ef4444;
  }

  .chatheader__btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--bk);
    transition: all 0.15s;
  }

  .chatheader__btn:hover {
    background: var(--of2);
    border-color: rgba(0, 0, 0, 0.18);
  }
</style>
