<script lang="ts">
  type Variant = 'role' | 'account-type' | 'status'

  let {
    label,
    variant = 'role',
    status,
  }: {
    label: string
    variant?: Variant
    status?: 'online' | 'offline'
  } = $props()
</script>

<span
  class="profile-badge profile-badge--{variant}"
  class:profile-badge--online={variant === 'status' && status === 'online'}
  class:profile-badge--offline={variant === 'status' && status === 'offline'}
  aria-label={variant === 'status' ? `${label}, ${status === 'online' ? 'online' : 'offline'}` : label}
>
  {#if variant === 'status'}
    <span class="profile-badge__dot" aria-hidden="true"></span>
  {/if}
  <span class="profile-badge__label">{label}</span>
</span>

<style>
  .profile-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: var(--radius-pill);
    padding: 0.2rem 0.6rem;
    font-family: var(--font-lato);
    font-size: 0.6rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }

  /* Role */
  .profile-badge--role {
    background: var(--color-pk-soft);
    color: var(--color-pink);
  }

  /* Account type */
  .profile-badge--account-type {
    background: #F3F4F6;
    color: var(--color-black);
  }

  /* Status */
  .profile-badge--status {
    background: #F3F4F6;
    color: var(--color-gray);
  }

  .profile-badge--status.profile-badge--online {
    background: #ECFDF5;
    color: #15803D;
  }

  .profile-badge__dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .profile-badge--online .profile-badge__dot {
    background: #10B981;
  }

  .profile-badge--offline .profile-badge__dot {
    background: #D1D5DB;
  }
</style>
