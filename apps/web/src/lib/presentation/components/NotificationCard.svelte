<script lang="ts">
  import type { Notification } from '$lib/domain/notification/entities/Notification'

  let {
    notification,
    onclick,
  }: {
    notification: Notification
    onclick?: () => void
  } = $props()

  const isRead = $derived(notification.isRead())

  const timeAgo = $derived.by(() => {
    const now = new Date()
    const diff = now.getTime() - (notification.readAt?.getTime() ?? now.getTime())
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  })
</script>

<button
  class="notification-card"
  class:notification-card--unread={!isRead}
  onclick={onclick}
>
  <div class="notification-card__icon">
    {#if notification.type === 'growth_prediction'}
      📈
    {:else if notification.type === 'new_match'}
      🎯
    {:else}
      🔔
    {/if}
  </div>

  <div class="notification-card__content">
    <h3 class="notification-card__title">{notification.title}</h3>
    <p class="notification-card__body">{notification.body}</p>
  </div>

  <div class="notification-card__meta">
    <span class="notification-card__time">{timeAgo}</span>
    {#if !isRead}
      <span class="notification-card__dot" aria-label="Não lida"></span>
    {/if}
  </div>
</button>

<style>
  .notification-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--color-white);
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background var(--transition-fast);
  }

  .notification-card:hover {
    background: var(--color-bg);
  }

  .notification-card--unread {
    background: var(--color-pink-soft);
  }

  .notification-card--unread:hover {
    background: var(--color-bg);
  }

  .notification-card__icon {
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .notification-card__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .notification-card__title {
    font-family: var(--font-ui);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-black);
  }

  .notification-card--unread .notification-card__title {
    font-weight: 900;
  }

  .notification-card__body {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--color-gray);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-card__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  .notification-card__time {
    font-family: var(--font-ui);
    font-size: 0.62rem;
    color: var(--color-gray);
  }

  .notification-card__dot {
    width: 8px;
    height: 8px;
    background: var(--color-pink);
    border-radius: 50%;
  }
</style>
