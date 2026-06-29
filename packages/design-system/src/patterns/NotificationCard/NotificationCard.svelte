<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    type,
    title,
    body,
    timeAgo,
    isRead = false,
    unreadAriaLabel,
    onclick,
    icon,
  }: {
    type: 'growth_prediction' | 'new_match' | 'system'
    title: string
    body: string
    timeAgo: string
    isRead?: boolean
    unreadAriaLabel?: string
    onclick?: () => void
    icon?: Snippet
  } = $props()
</script>

<button
  class="notification-card"
  class:notification-card--unread={!isRead}
  onclick={onclick}
>
  <div class="notification-card__icon-wrap">
    {#if icon}
      {@render icon()}
    {:else}
      <div class="notification-card__icon-circle"
        class:notification-card__icon-circle--unread={!isRead}
      >
        <div class="notification-card__icon-dot"
          class:notification-card__icon-dot--growth={type === 'growth_prediction'}
          class:notification-card__icon-dot--match={type === 'new_match'}
        ></div>
      </div>
    {/if}
  </div>

  <div class="notification-card__content">
    <div class="notification-card__title-row">
      <h3 class="notification-card__title">{title}</h3>
      {#if !isRead}
        <span class="notification-card__dot" aria-label={unreadAriaLabel}></span>
      {/if}
    </div>
    <p class="notification-card__body">{body}</p>
    <span class="notification-card__time">{timeAgo}</span>
  </div>
</button>

<style>
  .notification-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: #fff;
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
    background: #FFF9FC;
  }

  .notification-card--unread:hover {
    background: #FFF0F8;
  }

  .notification-card__icon-wrap {
    flex-shrink: 0;
  }

  .notification-card__icon-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-card__icon-circle--unread {
    background: #FFE8F5;
  }

  .notification-card__icon-dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: #9CA3AF;
  }

  .notification-card__icon-dot--growth {
    background: var(--color-pink);
  }

  .notification-card__icon-dot--match {
    background: var(--color-pk-purple);
  }

  .notification-card__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .notification-card__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .notification-card__title {
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    color: #374151;
    margin: 0;
  }

  .notification-card--unread .notification-card__title {
    font-weight: 900;
    color: #111;
  }

  .notification-card__dot {
    width: 0.5rem;
    height: 0.5rem;
    background: var(--color-pink);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .notification-card__body {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: #6B7280;
    line-height: 1.5;
    margin: 0;
  }

  .notification-card__time {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    color: #9CA3AF;
    margin-top: 0.3rem;
  }
</style>
