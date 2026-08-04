<script lang="ts">
  let {
    label,
    href,
    type = 'button',
    onclick,
    variant = 'hero',
  }: {
    label: string
    href?: string
    type?: 'button' | 'submit'
    onclick?: () => void
    variant?: 'hero' | 'form' | 'topbar'
  } = $props()

  const hasShimmer = $derived(variant === 'hero')
  const hasIcon = $derived(variant === 'hero')
</script>

{#if href}
  <a {href} class="waitlist-cta waitlist-cta--{variant}">
    {label}
    {#if hasIcon}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    {/if}
    {#if hasShimmer}
      <span class="waitlist-cta__shimmer" aria-hidden="true"></span>
    {/if}
  </a>
{:else}
  <button {type} {onclick} class="waitlist-cta waitlist-cta--{variant}">
    {label}
    {#if hasShimmer}
      <span class="waitlist-cta__shimmer" aria-hidden="true"></span>
    {/if}
  </button>
{/if}

<style>
  .waitlist-cta {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--text-inverse);
    background: var(--pk);
    border: none;
    border-radius: var(--radius-pill);
    text-decoration: none;
    cursor: pointer;
  }

  .waitlist-cta.waitlist-cta--hero,
  .waitlist-cta.waitlist-cta--topbar {
    transition:
      background var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .waitlist-cta:hover {
    background: var(--pk2);
    transform: translateY(-0.1rem);
  }

  .waitlist-cta--hero {
    padding: 1.1rem 2.8rem;
    font-size: 0.95rem;
    box-shadow: 0 0.5rem 1.8rem rgba(255, 60, 172, 0.35);
  }

  .waitlist-cta--hero:hover {
    box-shadow: 0 0.8rem 2.2rem rgba(255, 60, 172, 0.45);
  }

  .waitlist-cta--form {
    width: 100%;
    padding: 0.85rem 0;
    font-size: 0.85rem;
    box-shadow: 0 0.4rem 1.4rem rgba(255, 60, 172, 0.3);
  }

  .waitlist-cta--topbar {
    padding: 0.45rem 1rem;
    font-size: 0.7rem;
    box-shadow: 0 0.2rem 0.8rem rgba(255, 60, 172, 0.3);
  }

  .waitlist-cta__shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
    animation: waitlist-cta-shimmer 2.4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes waitlist-cta-shimmer {
    from {
      transform: translateX(-160%);
    }
    to {
      transform: translateX(160%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .waitlist-cta__shimmer {
      animation: none;
      display: none;
    }
  }
</style>
