<script lang="ts">
  import { IconButton } from '../../primitives/IconButton/index.js'
  import { DotIndicator } from '../../primitives/DotIndicator/index.js'

  let {
    images,
    initialIndex = 0,
    height = 240,
    showActions = true,
    showDots = true,
    onBack,
    onFav,
    onShare,
    isFavorited = false,
  }: {
    images: string[]
    initialIndex?: number
    height?: number
    showActions?: boolean
    showDots?: boolean
    onBack?: () => void
    onFav?: () => void
    onShare?: () => void
    isFavorited?: boolean
  } = $props()

  let currentIndex = $state(initialIndex)

  function handleScroll(e: Event) {
    const el = e.target as HTMLElement
    const scrollLeft = el.scrollLeft
    const itemWidth = el.clientWidth
    const idx = Math.round(scrollLeft / itemWidth)
    currentIndex = idx
  }
</script>

<div
  class="gallery"
  class:gallery--empty={images.length === 0}
  style="height: {height / 10}rem"
  aria-roledescription="carousel"
  aria-label="Galeria de imagens"
>
  {#if images.length > 0}
    <div
      class="gallery__track"
      onscroll={handleScroll}
      style="height: {height / 10}rem"
    >
      {#each images as src, i}
        <div
          class="gallery__slide"
          role="group"
          aria-roledescription="slide"
          aria-label="Foto {i + 1} de {images.length}"
        >
          <img src={src} alt="" class="gallery__image" loading={i === 0 ? 'eager' : 'lazy'} />
        </div>
      {/each}
    </div>
  {:else}
    <div class="gallery__empty">
      <svg class="gallery__empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span class="gallery__empty-text">Nenhuma foto disponível</span>
    </div>
  {/if}

  {#if showActions}
    <div class="gallery__actions">
      {#if onBack}
        <span class="gallery__action gallery__action--left">
          <IconButton icon="back" variant="glass" size={32} onclick={onBack} ariaLabel="Voltar" />
        </span>
      {/if}
      <span class="gallery__action gallery__action--right">
        {#if onFav}
          <IconButton icon="fav" variant="glass" size={32} active={isFavorited} onclick={onFav} ariaLabel={isFavorited ? 'Remover dos favoritos' : 'Favoritar'} />
        {/if}
        {#if onShare}
          <IconButton icon="share" variant="glass" size={32} onclick={onShare} ariaLabel="Compartilhar" />
        {/if}
      </span>
    </div>
  {/if}

  {#if showDots && images.length > 1}
    <div class="gallery__dots">
      <DotIndicator total={images.length} current={currentIndex} variant="light" />
    </div>
  {/if}
</div>

<style>
  .gallery {
    position: relative;
    width: 100%;
    border-radius: var(--r);
    overflow: hidden;
    background: linear-gradient(160deg, #0F0F0F, #1A0814, #0A0A1A);
  }

  .gallery__track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .gallery__track::-webkit-scrollbar {
    display: none;
  }

  .gallery__slide {
    flex: 0 0 100%;
    scroll-snap-align: center;
    width: 100%;
  }

  .gallery__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Empty state ───────────────────────────────── */
  .gallery__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    width: 100%;
    height: 100%;
  }

  .gallery__empty-icon {
    color: rgba(255, 255, 255, 0.3);
  }

  .gallery__empty-text {
    font-family: var(--font-lato);
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ── Actions overlay ──────────────────────────── */
  .gallery__actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.8rem;
    pointer-events: none;
    z-index: 2;
  }

  .gallery__action {
    display: flex;
    gap: 0.5rem;
    pointer-events: auto;
  }

  .gallery__action--right {
    display: flex;
    gap: 0.5rem;
  }

  /* ── Dots overlay ─────────────────────────────── */
  .gallery__dots {
    position: absolute;
    bottom: 0.8rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
</style>
