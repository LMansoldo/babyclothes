<script lang="ts">
  type Size = 'sm' | 'md' | 'lg' | 'featured'

  let {
    image,
    title,
    detail,
    price,
    oldPrice,
    badge,
    condition,
    size = 'md',
    pinkPrice = false,
    onAdd,
  }: {
    image?: string
    title: string
    detail?: string
    price?: string
    oldPrice?: string
    badge?: string
    condition?: string
    size?: Size
    pinkPrice?: boolean
    onAdd?: () => void
  } = $props()
</script>

<button
  class="card card--{size}"
  class:card--clickable={!!onAdd}
  type="button"
  onclick={onAdd}
>
  <div class="card__image-wrap">
    {#if image}
      <img src={image} alt={title} class="card__image" loading="lazy" />
    {:else}
      <div class="card__image-placeholder"></div>
    {/if}

    {#if condition}
      <span class="card__condition" class:card__condition--new={condition === 'Novo'} class:card__condition--semi={condition === 'Seminovo'} class:card__condition--used={condition === 'Usado'}>
        {condition}
      </span>
    {/if}

    {#if badge}
      <span class="card__badge">{badge}</span>
    {/if}

    <span class="card__fav" aria-label="Favoritar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </span>
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
  </div>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-brd);
    border-radius: var(--r);
    overflow: hidden;
    box-shadow: var(--glass-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-align: left;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: default;
    flex-shrink: 0;
  }

  .card--clickable {
    cursor: pointer;
  }

  .card--clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(10, 10, 10, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  /* ── Sizes ─────────────────────────────────────── */
  .card--sm { width: 155px; }
  .card--md { width: 195px; }
  .card--lg { width: 230px; }
  .card--featured { width: 300px; }

  /* ── Image ─────────────────────────────────────── */
  .card__image-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: var(--of2);
  }

  .card--sm .card__image-wrap { height: 125px; }
  .card--md .card__image-wrap { height: 155px; }
  .card--lg .card__image-wrap { height: 185px; }
  .card--featured .card__image-wrap { height: 220px; }

  .card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card__image-placeholder {
    width: 100%;
    height: 100%;
    background: var(--of2);
  }

  /* ── Condition badge (top-left) ── */
  .card__condition {
    position: absolute;
    top: 8px;
    left: 8px;
    font-family: var(--ld);
    font-size: 0.5rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: var(--r-xs);
    line-height: 1.3;
    white-space: nowrap;
  }

  .card__condition--new {
    background: rgba(22, 163, 74, 0.15);
    color: #16A34A;
    border: 1px solid rgba(22, 163, 74, 0.25);
  }

  .card__condition--semi {
    background: rgba(255, 214, 238, 0.6);
    color: var(--pk);
    border: 1px solid rgba(255, 110, 199, 0.3);
  }

  .card__condition--used {
    background: rgba(136, 136, 136, 0.15);
    color: var(--gr);
    border: 1px solid rgba(136, 136, 136, 0.25);
  }

  /* ── IA badge (top-right) ── */
  .card__badge {
    position: absolute;
    top: 8px;
    right: 8px;
    font-family: var(--ld);
    font-size: 0.48rem;
    font-weight: 900;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    background: var(--pk);
    color: var(--wh);
    padding: 2px 6px;
    border-radius: 3px;
    line-height: 1;
    white-space: nowrap;
  }

  /* ── Fav button (bottom-right) ── */
  .card__fav {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .card__fav:hover {
    color: var(--pk);
    background: rgba(255, 214, 238, 0.6);
    border-color: rgba(255, 110, 199, 0.4);
  }

  /* ── Body ──────────────────────────────────────── */
  .card__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px 10px;
    min-width: 0;
  }

  .card__title {
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--bk);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__detail {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.68rem;
    color: var(--gr);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__price-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-top: 2px;
  }

  .card__price {
    font-family: var(--ld);
    font-size: 0.78rem;
    font-weight: 900;
    color: var(--bk);
  }

  .card__price--pink {
    color: var(--pk);
  }

  .card__old-price {
    font-family: var(--vd);
    font-size: 0.65rem;
    color: var(--gr2);
    text-decoration: line-through;
  }
</style>
