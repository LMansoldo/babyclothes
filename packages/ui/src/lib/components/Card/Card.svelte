<script lang="ts">
  import type { Snippet } from 'svelte'

  type Size = 'sm' | 'md' | 'lg'

  let {
    image,
    title,
    detail,
    price,
    oldPrice,
    badge,
    size = 'md',
    pinkPrice = false,
    onclick,
    children,
  }: {
    image?: string
    title: string
    detail?: string
    price?: string
    oldPrice?: string
    badge?: string
    size?: Size
    pinkPrice?: boolean
    onclick?: () => void
    children?: Snippet
  } = $props()
</script>

<button
  class="card card--{size}"
  class:card--clickable={!!onclick}
  type="button"
  {onclick}
>
  <div class="card__image-wrap">
    {#if image}
      <img src={image} alt={title} class="card__image" loading="lazy" />
    {:else}
      <div class="card__image-placeholder"></div>
    {/if}
    {#if badge}
      <span class="card__badge">{badge}</span>
    {/if}
  </div>

  <div class="card__body">
    <span class="card__title">{title}</span>
    {#if detail}
      <span class="card__detail">{detail}</span>
    {/if}
    {#if price}
      <div class="card__price-row">
        <span class="card__price" class:card__price--pink={pinkPrice}>{price}</span>
        {#if oldPrice}
          <span class="card__old-price">{oldPrice}</span>
        {/if}
      </div>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background: var(--color-white);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
    text-align: left;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: default;
    width: 100%;
  }

  .card--clickable {
    cursor: pointer;
  }

  .card--clickable:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  /* ── Sizes ─────────────────────────────────────── */
  .card--sm { max-width: 148px; }
  .card--md { max-width: 196px; }
  .card--lg { max-width: 240px; }

  /* ── Image ─────────────────────────────────────── */
  .card__image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--color-bg-2);
  }

  .card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card__image-placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-bg-2);
  }

  .card__badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-family: var(--font-ui);
    font-size: 0.54rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    background: var(--color-black);
    color: var(--color-white);
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Body ──────────────────────────────────────── */
  .card__body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 12px 12px;
    min-width: 0;
  }

  .card__title {
    font-family: var(--font-ui);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-black);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__detail {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--color-gray);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__price-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 2px;
  }

  .card__price {
    font-family: var(--font-ui);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-black);
  }

  .card__price--pink {
    color: var(--color-pink);
  }

  .card__old-price {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--color-gray);
    text-decoration: line-through;
  }
</style>
