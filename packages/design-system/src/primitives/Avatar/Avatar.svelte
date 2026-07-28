<script lang="ts">
  type Size = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  type Fill = 'pk' | 'bk' | 'of'

  let {
    name,
    src,
    size = 'md',
    fill = 'pk',
    online = false,
    verified = false,
  }: {
    name: string
    src?: string
    size?: Size
    fill?: Fill
    online?: boolean
    verified?: boolean
  } = $props()

  const initials = $derived.by(() => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  })
</script>

<div class="avatar avatar--{size} avatar--{fill}" aria-label={name}>
  {#if src}
    <img src={src} alt={name} class="avatar__img" />
  {:else}
    <span class="avatar__initials">{initials}</span>
  {/if}

  {#if online}
    <span class="avatar__online-ring" aria-label="Online"></span>
  {/if}

  {#if verified}
    <span class="avatar__verified" aria-label="Verificado">
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </span>
  {/if}
</div>

<style>
  .avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
  }

  .avatar--sm { width: 2rem;  height: 2rem; }
  .avatar--md { width: 2.5rem;   height: 2.5rem; }
  .avatar--lg { width: 3rem; height: 3rem; }
  .avatar--xl { width: 4rem; height: 4rem; }
  .avatar--xxl { width: 7.2rem; height: 7.2rem; }

  .avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .avatar__initials {
    font-family: var(--font-lato);
    font-weight: 900;
    color: var(--color-white);
    user-select: none;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar--sm .avatar__initials { font-size: .6rem; }
  .avatar--md .avatar__initials { font-size: .82rem; }
  .avatar--lg .avatar__initials { font-size: 1.1rem; }
  .avatar--xl .avatar__initials { font-size: 1.4rem; }
  .avatar--xxl .avatar__initials { font-size: 1.5rem; }

  .avatar--pk .avatar__initials {
    background: linear-gradient(135deg, var(--color-pink) 0%, #B03EFF 100%);
  }

  .avatar--bk .avatar__initials {
    background: var(--color-black);
  }

  .avatar--of .avatar__initials {
    background: linear-gradient(135deg, #D1D5DB, #9CA3AF);
    color: #fff;
  }

  .avatar__online-ring {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 28%;
    height: 28%;
    min-width: 0.5rem;
    min-height: 0.5rem;
    background: #22C55E;
    border-radius: 50%;
    border: 0.1rem solid var(--color-white);
  }

  .avatar__verified {
    position: absolute;
    bottom: -0.1rem;
    right: -0.1rem;
    width: 1.1rem;
    height: 1.1rem;
    background: var(--color-pink);
    border-radius: 50%;
    border: 0.1rem solid var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    line-height: 1;
  }
</style>
