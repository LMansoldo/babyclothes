<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '$lib/i18n'
  import { HttpNotificationRepository } from '$lib/infrastructure/http/HttpNotificationRepository'
  import type { Notification } from '$lib/domain/notification/entities/Notification'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockNotifications } from '$lib/mocks/data'
  import { Bell, Check } from 'lucide-svelte'

  const notifRepo = new HttpNotificationRepository()

  const mockMode = PUBLIC_MOCK_DATA === 'true'

  let notifications = $state<Notification[]>([])
  let loading = $state(true)

  onMount(async () => {
    try {
      if (mockMode) {
        notifications = [...mockNotifications]
      } else {
        notifications = await notifRepo.findAll()
      }
    } catch (e) {
      console.error('Failed to load notifications:', e)
    } finally {
      loading = false
    }
  })

  const unreadCount = $derived(notifications.filter((n) => !n.isRead()).length)

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.isRead())
    notifications = notifications.map((n) => {
      if (!n.isRead()) {
        return { ...n, readAt: new Date() }
      }
      return n
    })
    if (!mockMode) await Promise.allSettled(unread.map((n) => notifRepo.markAsRead(n.id)))
  }

  async function handleItemClick(id: string) {
    const target = notifications.find((n) => n.id === id)
    if (target?.isRead()) return
    notifications = notifications.map((n) => {
      if (n.id === id && !n.isRead()) {
        return { ...n, readAt: new Date() }
      }
      return n
    })
    try {
      await notifRepo.markAsRead(id)
    } catch (e) {
      console.error('Failed to mark notification read:', e)
    }
  }

  function timeAgo(date?: Date): string {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return $t('notification.time_now')
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  function typeClass(type: string): string {
    if (type === 'growth_prediction') return 'notifs__icon--growth'
    if (type === 'new_match') return 'notifs__icon--match'
    return 'notifs__icon--sys'
  }
</script>

<svelte:head>
  <title>{$t('notification.title')} | BabyClothes</title>
</svelte:head>

<div class="notifs-page">
  <header class="notifs-page__header">
    <h1 class="notifs-page__title">{$t('notification.title')}</h1>
    {#if unreadCount > 0}
      <button class="notifs-page__mark" onclick={handleMarkAllRead}>
        <Check size={12} strokeWidth={3} />
        {$t('notification.mark_all_read')}
      </button>
    {/if}
  </header>

  {#if notifications.length === 0}
    <div class="notifs-page__empty">
      <div class="notifs-page__empty-icon">
        <Bell size={24} />
      </div>
      <p class="notifs-page__empty-title">{$t('notification.empty_title')}</p>
      <p class="notifs-page__empty-sub">{$t('notification.empty_subtitle')}</p>
    </div>
  {:else}
    <ul class="notifs-page__list">
      {#each notifications as notification (notification.id)}
        {@const isRead = notification.isRead()}
        <li>
          <button
            class="notifs-page__item"
            class:notifs-page__item--unread={!isRead}
            onclick={() => handleItemClick(notification.id)}
          >
            <div class="notifs__icon {typeClass(notification.type)}">
              <span class="notifs__icon-dot"></span>
            </div>
            <div class="notifs-page__item-body">
              <p class="notifs-page__item-title">{notification.title}</p>
              <p class="notifs-page__item-msg">{notification.body}</p>
              <span class="notifs-page__item-time">{timeAgo(notification.readAt)}</span>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .notifs-page {
    min-height: 100vh;
    background: var(--wh);
    padding-bottom: 5rem;
  }

  .notifs-page__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.1rem;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.07);
  }

  .notifs-page__title {
    font-family: var(--ld);
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .notifs-page__mark {
    font-family: var(--ld);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--pk);
    cursor: pointer;
    background: none;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
  }

  .notifs-page__mark:hover {
    opacity: 0.72;
  }

  .notifs-page__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .notifs-page__item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 1.1rem;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
    width: 100%;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  .notifs-page__item:hover {
    background: var(--of2);
  }

  .notifs-page__item--unread {
    background: rgba(255, 60, 172, 0.03);
  }

  .notifs-page__item--unread::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0.3rem;
    background: var(--pk);
    border-radius: 0 0.2rem 0.2rem 0;
  }

  .notifs__icon {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notifs__icon-dot {
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
  }

  .notifs__icon--growth {
    background: var(--pk3);
  }

  .notifs__icon--growth .notifs__icon-dot {
    background: var(--pk);
  }

  .notifs__icon--match {
    background: rgba(59, 130, 246, 0.1);
  }

  .notifs__icon--match .notifs__icon-dot {
    background: #3b82f6;
  }

  .notifs__icon--sys {
    background: var(--of2);
  }

  .notifs__icon--sys .notifs__icon-dot {
    background: var(--gr2);
  }

  .notifs-page__item-body {
    flex: 1;
    min-width: 0;
  }

  .notifs-page__item-title {
    font-family: var(--ld);
    font-size: 0.76rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0 0 0.18rem;
    line-height: 1.3;
  }

  .notifs-page__item-msg {
    font-size: 0.7rem;
    color: var(--gr);
    line-height: 1.5;
    margin: 0;
  }

  .notifs-page__item-time {
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--gr2);
    margin-top: 0.25rem;
    display: block;
  }

  .notifs-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
    text-align: center;
  }

  .notifs-page__empty-icon {
    width: 5.6rem;
    height: 5.6rem;
    border-radius: 50%;
    background: var(--of2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gr2);
    margin-bottom: 1rem;
  }

  .notifs-page__empty-title {
    font-family: var(--ld);
    font-size: 0.92rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.3);
    margin: 0 0 0.25rem;
  }

  .notifs-page__empty-sub {
    font-size: 0.8rem;
    color: var(--gr2);
    margin: 0;
  }
</style>
