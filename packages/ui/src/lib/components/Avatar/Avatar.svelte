<script lang="ts">
  type Size = 'sm' | 'md' | 'lg' | 'xl'
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
    <span class="avatar__verified" aria-label="Verificado">✓</span>
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

  .avatar--sm { width: 28px;  height: 28px; }
  .avatar--md { width: 40px;  height: 40px; }
  .avatar--lg { width: 56px;  height: 56px; }
  .avatar--xl { width: 72px;  height: 72px; }

  .avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .avatar__initials {
    font-family: var(--font-ui);
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

  .avatar--pk .avatar__initials {
    background: linear-gradient(135deg, var(--color-pink) 0%, #A855F7 100%);
  }

  .avatar--bk .avatar__initials {
    background: var(--color-black);
  }

  .avatar--of .avatar__initials {
    background: var(--color-bg-2);
    color: var(--color-gray);
  }

  .avatar__online-ring {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 28%;
    height: 28%;
    min-width: 8px;
    min-height: 8px;
    background: #22C55E;
    border-radius: 50%;
    border: 2px solid var(--color-white);
  }

  .avatar__verified {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 36%;
    height: 36%;
    min-width: 12px;
    min-height: 12px;
    background: var(--color-pink);
    border-radius: 50%;
    border: 2px solid var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .5rem;
    font-weight: 900;
    color: var(--color-white);
    line-height: 1;
  }
</style>
