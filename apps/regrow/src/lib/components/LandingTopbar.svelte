<script lang="ts">
  import { t } from '$lib/i18n'
  import WaitlistCta from './WaitlistCta.svelte'
</script>

<header class="landing-topbar">
  <nav class="landing-topbar__bar">
    <a href="#top" class="landing-topbar__brand">Re<span class="landing-topbar__brand-accent">Grow</span></a>
    <div class="landing-topbar__nav">
      <a class="landing-topbar__link" href="#como-funciona">{$t('how.title')}</a>
    </div>
    <WaitlistCta label={$t('hero.email_cta')} href="#waitlist" variant="topbar" />
  </nav>
</header>

<style>
  .landing-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0.7rem clamp(1rem, 4vw, 2.4rem);
    background: rgba(248, 245, 242, 0.72);
    backdrop-filter: blur(1rem) saturate(180%);
    -webkit-backdrop-filter: blur(1rem) saturate(180%);
    border-bottom: 0.05rem solid rgba(10, 10, 10, 0.06);
    box-shadow: 0 0.2rem 1.2rem rgba(10, 10, 10, 0.04);
  }

  .landing-topbar__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 62rem;
    margin: 0 auto;
  }

  .landing-topbar__brand {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    text-decoration: none;
  }

  .landing-topbar__brand-accent {
    color: var(--pk);
  }

  .landing-topbar__nav {
    display: flex;
    align-items: center;
    gap: 1.6rem;
  }

  @media (max-width: 40rem) {
    .landing-topbar__nav {
      display: none;
    }
  }

  .landing-topbar__link {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .landing-topbar__link:hover {
    color: var(--pk);
  }
</style>
