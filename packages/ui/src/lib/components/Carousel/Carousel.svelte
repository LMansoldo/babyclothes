<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    children,
    onprevious,
    onnext,
  }: {
    label?: string
    children?: Snippet
    onprevious?: () => void
    onnext?: () => void
  } = $props()

  let trackEl: HTMLDivElement | undefined = $state()
  let canScrollLeft = $state(false)
  let canScrollRight = $state(false)

  function checkScroll() {
    if (!trackEl) return
    canScrollLeft = trackEl.scrollLeft > 4
    canScrollRight = trackEl.scrollLeft < trackEl.scrollWidth - trackEl.clientWidth - 4
  }

  function scrollBy(direction: 'left' | 'right') {
    if (!trackEl) return
    const amount = trackEl.clientWidth * 0.7
    trackEl.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
    if (direction === 'left') onprevious?.()
    else onnext?.()
  }

  $effect(() => {
    checkScroll()
  })
</script>

<div class="carousel">
  {#if label || onprevious || onnext}
    <div class="carousel__header">
      {#if label}
        <span class="carousel__label">{label}</span>
      {/if}
      <div class="carousel__nav">
        <button
          class="carousel__btn"
          type="button"
          disabled={!canScrollLeft}
          onclick={() => scrollBy('left')}
          aria-label="Anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          class="carousel__btn"
          type="button"
          disabled={!canScrollRight}
          onclick={() => scrollBy('right')}
          aria-label="Proximo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <div
    bind:this={trackEl}
    class="carousel__track"
    onscroll={checkScroll}
    role="region"
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .carousel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  /* ── Header ───────────────────────────────────── */
  .carousel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.4rem;
  }

  .carousel__label {
    font-family: var(--font-ui);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--color-pink);
  }

  .carousel__nav {
    display: flex;
    gap: 0.4rem;
  }

  .carousel__btn {
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 50%;
    border: 0.15rem solid rgba(0, 0, 0, 0.12);
    background: var(--color-white);
    color: var(--color-black);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color var(--transition-base), background var(--transition-base);
    padding: 0;
  }

  .carousel__btn:hover:not(:disabled) {
    border-color: var(--color-pink);
    background: var(--color-pink-soft);
    color: var(--color-pink);
  }

  .carousel__btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ── Track ────────────────────────────────────── */
  .carousel__track {
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.4rem;
  }

  .carousel__track::-webkit-scrollbar {
    display: none;
  }

  :global(.carousel__track > *) {
    scroll-snap-align: start;
    flex-shrink: 0;
  }
</style>
