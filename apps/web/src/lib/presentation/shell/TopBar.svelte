<script lang="ts">
  import { getContext } from 'svelte'
  import { page } from '$app/stores'
  import { Button, Avatar, Badge } from '@babyclothes/ui'
  import type { Session } from '$lib/domain/auth/entities/Session'

  const session = getContext<Session>('session')
  const unreadCount = getContext<number>('unreadCount') ?? 0
</script>

<header class="topbar">
  <a href="/catalog" class="topbar__logo">
    <span class="topbar__logo-text">BabyClothes</span>
  </a>

  <div class="topbar__actions">
    <a href="/notifications" class="topbar__notification">
      <span class="topbar__bell" aria-label="Notificações">🔔</span>
      {#if unreadCount > 0}
        <Badge label={String(unreadCount)} variant="pk" size="sm" />
      {/if}
    </a>

    <a href="/profile" class="topbar__avatar">
      <Avatar
        name={session.name}
        src={session.avatarUrl}
        size="sm"
      />
    </a>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-white);
    border-bottom: 1px solid var(--color-bg-2);
  }

  .topbar__logo {
    text-decoration: none;
  }

  .topbar__logo-text {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-pink);
  }

  .topbar__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .topbar__notification {
    position: relative;
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .topbar__bell {
    font-size: 1.2rem;
  }

  .topbar__avatar {
    text-decoration: none;
  }
</style>
