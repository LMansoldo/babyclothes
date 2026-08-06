<script lang="ts">
  import { onMount } from 'svelte'

  let scrolled = $state(false)

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 10
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<header class="landing-topbar" class:landing-topbar--scrolled={scrolled}>
  <nav class="landing-topbar__bar">
    <a href="#top" class="landing-topbar__brand">Re<span class="landing-topbar__brand-accent">Grow</span></a>
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
    background: transparent;
    border-bottom: 0.05rem solid transparent;
    box-shadow: none;
    transition:
      background var(--transition-base),
      border-color var(--transition-base),
      box-shadow var(--transition-base);
  }

  .landing-topbar--scrolled {
    background: rgba(248, 245, 242, 0.72);
    backdrop-filter: blur(1rem) saturate(180%);
    -webkit-backdrop-filter: blur(1rem) saturate(180%);
    border-bottom: 0.05rem solid rgba(10, 10, 10, 0.06);
    box-shadow: 0 0.2rem 1.2rem rgba(10, 10, 10, 0.04);
  }

  .landing-topbar__bar {
    display: flex;
    align-items: center;
    max-width: 62rem;
    margin: 0 auto;
  }

  .landing-topbar__brand {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #ffffff;
    text-decoration: none;
    transition: color var(--transition-base);
  }

  .landing-topbar__brand-accent {
    color: #ffffff;
    transition: color var(--transition-base);
  }

  .landing-topbar--scrolled .landing-topbar__brand {
    color: var(--text-primary);
  }

  .landing-topbar--scrolled .landing-topbar__brand-accent {
    color: var(--pk);
  }
</style>
