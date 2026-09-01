<script lang="ts">
  let {
    links,
    loginLabel = 'Entrar',
    ctaLabel = 'Comece gratis',
    ctaHref = '/register',
    loginHref = '/login',
    brandName = 'BabyClothes',
    onNavigate,
  }: {
    links: { href: string; label: string }[]
    loginLabel?: string
    ctaLabel?: string
    ctaHref?: string
    loginHref?: string
    brandName?: string
    onNavigate?: (href: string) => void
  } = $props()
</script>

<div class="landing-topbar">
  <nav class="landing-topbar__bar">
    {#if onNavigate}
      <button class="landing-topbar__brand" onclick={() => onNavigate('/')}>
        {brandName}
      </button>
    {:else}
      <a href="/" class="landing-topbar__brand">{brandName}</a>
    {/if}

    <div class="landing-topbar__nav">
      {#each links as link (link.href)}
        <a class="landing-topbar__link" href={link.href}>{link.label}</a>
      {/each}
    </div>

    <div class="landing-topbar__actions">
      {#if onNavigate}
        <button class="landing-topbar__link" onclick={() => onNavigate(loginHref)}>
          {loginLabel}
        </button>
        <button class="landing-topbar__btn-cta" onclick={() => onNavigate(ctaHref)}>
          {ctaLabel}
        </button>
      {:else}
        <a class="landing-topbar__link" href={loginHref}>{loginLabel}</a>
        <a class="landing-topbar__btn-cta" href={ctaHref}>{ctaLabel}</a>
      {/if}
    </div>
  </nav>
</div>

<style>
  .landing-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--glass-line);
    box-shadow: var(--shadow-sm);
  }

  .landing-topbar__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
    max-width: var(--container-ultra);
    margin: 0 auto;
    padding: var(--space-4) var(--gutter-large);
  }

  @media (max-width: 40rem) {
    .landing-topbar__bar {
      padding: var(--space-3) var(--gutter-mobile);
    }
  }

  /* Brand */
  .landing-topbar__brand {
    font-family: var(--ld);
    font-weight: 900;
    font-size: var(--text-heading-size);
    color: var(--pk);
    text-decoration: none;
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  /* Nav links */
  .landing-topbar__nav {
    display: flex;
    gap: var(--space-7);
  }

  @media (max-width: 40rem) {
    .landing-topbar__nav {
      display: none;
    }
  }

  .landing-topbar__link {
    white-space: nowrap;
    cursor: pointer;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--text-body-size);
    font-family: var(--font-body);
    background: none;
    border: none;
    padding: 0;
    transition: opacity var(--transition-fast);
  }

  .landing-topbar__link:hover {
    opacity: 0.7;
  }

  /* Actions */
  .landing-topbar__actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    flex-shrink: 0;
  }

  /* CTA button */
  .landing-topbar__btn-cta {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-pill);
    background: var(--surface-inverse);
    color: var(--text-inverse);
    font-family: var(--font-body);
    font-weight: 700;
    font-size: var(--text-body-size);
    white-space: nowrap;
    text-align: center;
    cursor: pointer;
    text-decoration: none;
    border: none;
    box-shadow: var(--shadow-md);
    transition: opacity var(--transition-fast);
  }

  .landing-topbar__btn-cta:hover {
    opacity: 0.9;
  }
</style>
