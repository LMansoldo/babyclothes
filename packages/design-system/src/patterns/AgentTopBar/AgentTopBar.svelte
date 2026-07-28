<script lang="ts">
  export interface AgentTopBarProps {
    agentName: string
    status: 'online' | 'typing' | 'offline' | 'busy'
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

  const displayCount = $derived(unreadCount > 99 ? '99+' : String(unreadCount))
  const statusColor = $derived(status === 'offline' ? '#9CA3AF' : '#22C55E')
</script>

<nav class="agenttopbar" aria-label="Agent navigation">
  <div class="agenttopbar__left">
    <div class="agenttopbar__avatar">
      <svg viewBox="0 0 20 24" width="12" height="15" fill="none">
        <path
          d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z"
          fill="#FF3CAC"
        />
      </svg>
      <span class="agenttopbar__status-dot agenttopbar__status-dot--{status}"></span>
    </div>
    <div class="agenttopbar__info">
      <span class="agenttopbar__name">{agentName}</span>
      <span class="agenttopbar__status-indicator agenttopbar__status-indicator--{status}" style:color={statusColor}>
        {statusLabel}{#if statusDetail} <span class="agenttopbar__detail">{statusDetail}</span>{/if}
      </span>
    </div>
  </div>
  <div class="agenttopbar__right">
    <button class="agenttopbar__btn" onclick={onNotifications} aria-label="Notifications">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {#if unreadCount > 0}
        <span class="agenttopbar__badge">{displayCount}</span>
      {/if}
    </button>
    <button class="agenttopbar__avatar-btn" onclick={onProfile} aria-label="Profile">
      {userInitials}
    </button>
  </div>
</nav>

<style>
  .agenttopbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(1.2rem);
    border-bottom: 1px solid #F3F4F6;
    padding: 0.9rem 1.4rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .agenttopbar__left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .agenttopbar__avatar {
    position: relative;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--bk, #111111);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .agenttopbar__status-dot {
    position: absolute;
    bottom: -0.1rem;
    right: -0.1rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .agenttopbar__status-dot--online {
    background: #22C55E;
    animation: pulse 2s infinite;
  }

  .agenttopbar__status-dot--typing {
    background: #22C55E;
    animation: pulse 2s infinite;
  }

  .agenttopbar__status-dot--busy {
    background: #F59E0B;
  }

  .agenttopbar__status-dot--offline {
    background: #9CA3AF;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .agenttopbar__info {
    display: flex;
    flex-direction: column;
  }

  .agenttopbar__name {
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--bk, #111111);
  }

  .agenttopbar__status-indicator {
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.62rem;
    font-weight: 700;
  }

  .agenttopbar__detail {
    color: #9CA3AF;
  }

  .agenttopbar__right {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .agenttopbar__btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--bk, #111111);
    padding: 0.4rem;
  }

  .agenttopbar__badge {
    position: absolute;
    top: -0.2rem;
    right: -0.2rem;
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.5rem;
    font-weight: 700;
    min-width: 1rem;
    height: 1rem;
    border-radius: 99rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.3rem;
  }

  .agenttopbar__avatar-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-pk, #FF3CAC);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: var(--font-lato, 'Lato', sans-serif);
    font-size: 0.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
