<script lang="ts">
  export interface AgentTopBarProps {
    agentName: string
    status: 'online' | 'offline' | 'busy'
    statusLabel: string
    statusDetail?: string
    unreadCount?: number
    userInitials: string
    onNotifications?: () => void
    onProfile?: () => void
  }

  let {
    agentName,
    status,
    statusLabel,
    statusDetail,
    unreadCount = 0,
    userInitials,
    onNotifications,
    onProfile,
  }: AgentTopBarProps = $props()
</script>

<nav class="agenttopbar" aria-label="Agent navigation">
  <div class="agenttopbar__agent">
    <div class="agenttopbar__avatar">
      <svg width="14" height="17" viewBox="0 0 20 24" fill="none" aria-hidden="true">
        <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="var(--pk)"/>
      </svg>
      <span
        class="agenttopbar__status-dot"
        class:agenttopbar__status-dot--online={status === 'online'}
        class:agenttopbar__status-dot--busy={status === 'busy'}
        class:agenttopbar__status-dot--offline={status === 'offline'}
        aria-hidden="true"
      ></span>
    </div>

    <div class="agenttopbar__info">
      <span class="agenttopbar__name">{agentName}</span>
      <span class="agenttopbar__status">
        <span
          class="agenttopbar__status-indicator"
          class:agenttopbar__status-indicator--online={status === 'online'}
          class:agenttopbar__status-indicator--busy={status === 'busy'}
          class:agenttopbar__status-indicator--offline={status === 'offline'}
        ></span>
        <span class="agenttopbar__status-label">{statusLabel}</span>
        {#if statusDetail}
          <span class="agenttopbar__status-detail">&middot; {statusDetail}</span>
        {/if}
      </span>
    </div>
  </div>

  <div class="agenttopbar__actions">
    <button
      class="agenttopbar__action"
      aria-label="Notifications"
      onclick={() => onNotifications?.()}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {#if unreadCount > 0}
        <span class="agenttopbar__badge" aria-label={`${unreadCount} unread`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      {/if}
    </button>

    <button
      class="agenttopbar__user"
      aria-label="Profile"
      onclick={() => onProfile?.()}
    >
      {userInitials}
    </button>
  </div>
</nav>

<style>
  .agenttopbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0 0.7rem;
    height: 4rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(0.6rem);
    -webkit-backdrop-filter: blur(0.6rem);
    border-bottom: 0.05rem solid #F3F4F6;
  }

  .agenttopbar__agent {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .agenttopbar__avatar {
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

  .agenttopbar__status-dot {
    position: absolute;
    bottom: -0.05rem;
    right: -0.05rem;
    width: 0.5rem;
    height: 0.5rem;
    border: 0.1rem solid #fff;
    border-radius: 50%;
  }

  .agenttopbar__status-dot--online {
    background: #22C55E;
  }

  .agenttopbar__status-dot--busy {
    background: #F59E0B;
  }

  .agenttopbar__status-dot--offline {
    background: #9CA3AF;
  }

  .agenttopbar__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .agenttopbar__name {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    font-weight: 700;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .agenttopbar__status {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .agenttopbar__status-indicator {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
  }

  .agenttopbar__status-indicator--online {
    background: #22C55E;
  }

  .agenttopbar__status-indicator--busy {
    background: #F59E0B;
  }

  .agenttopbar__status-indicator--offline {
    background: #9CA3AF;
  }

  .agenttopbar__status-label {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    font-weight: 700;
  }

  .agenttopbar__status-indicator--online + .agenttopbar__status-label {
    color: #22C55E;
  }

  .agenttopbar__status-indicator--busy + .agenttopbar__status-label {
    color: #F59E0B;
  }

  .agenttopbar__status-indicator--offline + .agenttopbar__status-label {
    color: #9CA3AF;
  }

  .agenttopbar__status-detail {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    color: #9CA3AF;
  }

  .agenttopbar__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  .agenttopbar__action {
    position: relative;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: #F3F4F6;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #374151;
    transition: background var(--transition-fast);
  }

  .agenttopbar__action:hover {
    background: #E5E7EB;
  }

  .agenttopbar__badge {
    position: absolute;
    top: -0.2rem;
    right: -0.2rem;
    min-width: 0.8rem;
    height: 0.8rem;
    padding: 0 0.25rem;
    border-radius: 99rem;
    background: var(--color-pink);
    color: #fff;
    font-family: var(--font-lato);
    font-size: 0.55rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .agenttopbar__user {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 0.55rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  .agenttopbar__user:hover {
    transform: scale(1.05);
  }
</style>
