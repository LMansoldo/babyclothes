<script lang="ts">
  type Size = 'sm' | 'md' | 'lg'

  let {
    image,
    title,
    detail,
    price,
    oldPrice,
    badge,
    condition,
    size = 'md',
    sellerName,
    sellerAvatar,
    sellerListings,
    verified = false,
    onContact,
    onBuy,
    onAdd,
    onClick,
    pinkPrice,
  }: {
    image?: string
    title: string
    detail?: string
    price?: string
    oldPrice?: string
    badge?: string
    condition?: string
    size?: Size
    sellerName?: string
    sellerAvatar?: string
    sellerListings?: string
    verified?: boolean
    onContact?: () => void
    onBuy?: () => void
    onAdd?: () => void
    onClick?: () => void
    pinkPrice?: boolean
  } = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && onClick) onClick()
  }
</script>

<div class="card card--{size}" class:card--clickable={onClick} onclick={onClick} role={onClick ? 'button' : undefined} tabindex={onClick ? 0 : undefined} onkeydown={onClick ? handleKeydown : undefined}>
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

    <button class="card__fav" aria-label="Favoritar" onclick={(e) => { e.stopPropagation(); }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>

    {#if badge}
      <span class="card__badge">
        <span class="card__badge-dot"></span>
        {badge}
      </span>
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
  </div>

  {#if sellerName}
    <div class="card__seller" onclick={onAdd}>
      <div class="card__seller-left">
        {#if sellerAvatar}
          <img src={sellerAvatar} alt={sellerName} class="card__seller-avatar" />
        {:else}
          <div class="card__seller-avatar card__seller-avatar--empty"></div>
        {/if}
        <div class="card__seller-info">
          <span class="card__seller-name">
            {sellerName}
            {#if verified}
              <svg class="card__seller-verified" width="12" height="12" viewBox="0 0 24 24" fill="#FF3CAC" stroke="#FF3CAC" stroke-width="2">
                <circle cx="12" cy="12" r="10" fill="#FF3CAC" stroke="none"/>
                <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {/if}
          </span>
          {#if sellerListings}
            <span class="card__seller-listings">{sellerListings} anúncios</span>
          {/if}
        </div>
      </div>
      <svg class="card__seller-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  {/if}

  {#if onContact || onBuy}
    <div class="card__actions">
      {#if onContact}
        <button type="button" class="card__btn card__btn--ghost" onclick={onContact}>Contatar</button>
      {/if}
      {#if onBuy}
        <button type="button" class="card__btn card__btn--primary" onclick={onBuy}>Comprar</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 0.6rem;
    overflow: hidden;
    box-shadow: 0 0.05rem 0.3rem rgba(0, 0, 0, .07);
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

  /* ── Sizes ─────────────────────────────────────── */
  .card--sm { width: 14rem; }
  .card--md { width: 16rem; }
  .card--lg { width: 18rem; }

  /* ── Image ─────────────────────────────────────── */
  .card__image-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #FDE68A, #FBCFE8);
  }

  .card--sm .card__image-wrap { height: 8.5rem; }
  .card--md .card__image-wrap { height: 10rem; }
  .card--lg .card__image-wrap { height: 12rem; }

  .card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card__image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #FDE68A, #FBCFE8);
  }

  /* ── Condition badge (top-left) ── */
  .card__condition {
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    padding: 0.1rem 0.35rem;
    border-radius: 99rem;
    font-family: var(--font-lato);
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;
  }

  .card__condition--new {
    background: #111;
    color: #fff;
  }

  .card__condition--semi {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .card__condition--used {
    background: #F3F4F6;
    color: #374151;
  }

  /* ── Fav heart (top-right) ── */
  .card__fav {
    position: absolute;
    top: 0.3rem;
    right: 0.3rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, .85);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }

  .card__fav:hover {
    background: rgba(255, 255, 255, 1);
  }

  /* ── IA badge (bottom-right) ── */
  .card__badge {
    position: absolute;
    bottom: 0.3rem;
    right: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-family: var(--font-lato);
    font-size: 0.48rem;
    font-weight: 900;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    background: var(--pk);
    color: var(--wh);
    padding: 0.25rem 0.55rem;
    border-radius: 0.3rem;
    line-height: 1;
    white-space: nowrap;
  }

  .card__badge-dot {
    width: 0.2rem;
    height: 0.2rem;
    border-radius: 50%;
    background: white;
    flex-shrink: 0;
  }

  /* ── Body ──────────────────────────────────────── */
  .card__body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.4rem 0.5rem;
    min-width: 0;
  }

  .card__title {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    font-weight: 700;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card__detail {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    color: #9CA3AF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.1rem;
  }

  .card__price-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .card__price {
    font-family: var(--font-lato);
    font-size: 0.9rem;
    font-weight: 900;
    color: #111;
  }

  .card__price--pink {
    color: #FF3CAC;
  }

  .card__old-price {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    color: #9CA3AF;
    text-decoration: line-through;
  }

  /* ── Seller row ─────────────────────────────────── */
  .card__seller {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem 0.5rem;
    border-top: 1px solid #F3F4F6;
  }

  .card__seller-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .card__seller-avatar {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .card__seller-avatar--empty {
    background: #F3F4F6;
    border-radius: 50%;
  }

  .card__seller-info {
    display: flex;
    flex-direction: column;
  }

  .card__seller-name {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    font-weight: 700;
    color: #111;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .card__seller-verified {
    flex-shrink: 0;
  }

  .card__seller-listings {
    font-family: var(--font-lato);
    font-size: 0.55rem;
    color: #9CA3AF;
  }

  .card__seller-chevron {
    color: #9CA3AF;
    flex-shrink: 0;
  }

  /* ── Action buttons ─────────────────────────────── */
  .card__actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem 1rem 0.8rem;
  }

  .card__btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 0.4rem;
    font-family: var(--font-lato);
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .card__btn--ghost {
    background: #F3F4F6;
    color: #374151;
  }

  .card__btn--ghost:hover {
    background: #E5E7EB;
  }

  .card__btn--primary {
    background: var(--pk);
    color: #fff;
    box-shadow: 0 0.2rem 0.6rem rgba(255, 60, 172, 0.28);
  }

  .card__btn--primary:hover {
    opacity: 0.9;
  }
</style>
