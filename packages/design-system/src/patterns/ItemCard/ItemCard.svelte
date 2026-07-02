<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    price,
    currency = 'BRL',
    locale = 'pt-BR',
    clothingSize,
    conditionLabel,
    oldPrice,
    photoUrl,
    badge,
    sellerName,
    sellerAvatarUrl,
    sellerVerifiedLabel,
    sellerListings,
    paymentEnabled = false,
    contactLabel,
    buyLabel,
    onclick,
    onFavorite,
    onContact,
    onBuy,
    onSellerClick,
    favoriteIcon,
    contactIcon,
    buyIcon,
  }: {
    title: string
    price: number
    currency?: string
    locale?: string
    clothingSize: string
    conditionLabel: string
    oldPrice?: number
    photoUrl?: string
    badge?: Snippet
    sellerName?: string
    sellerAvatarUrl?: string
    sellerVerifiedLabel?: string
    sellerListings?: number
    paymentEnabled?: boolean
    contactLabel?: string
    buyLabel?: string
    onclick?: () => void
    onFavorite?: () => void
    onContact?: () => void
    onBuy?: () => void
    onSellerClick?: () => void
    favoriteIcon?: Snippet
    contactIcon?: Snippet
    buyIcon?: Snippet
  } = $props()

  const formattedPrice = $derived(
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price),
  )

  const mainPhoto = $derived(photoUrl ?? '/placeholder.png')
</script>

<div class="item-card" role="article">
  <button class="item-card__main" onclick={onclick}>
    <div class="item-card__photo">
      <img src={mainPhoto} alt={title} class="item-card__img" />
      {#if onFavorite}
        <span
          class="item-card__fav"
          role="button"
          tabindex="0"
          onclick={(e) => { e.stopPropagation(); onFavorite() }}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onFavorite() } }}
        >
          {#if favoriteIcon}
            {@render favoriteIcon()}
          {:else}
            <span class="item-card__fav-dot"></span>
          {/if}
        </span>
      {/if}
    </div>

    <div class="item-card__info">
      <h3 class="item-card__title">{title}</h3>
      <p class="item-card__price">{formattedPrice}</p>
      {#if oldPrice !== undefined}
        <p class="item-card__old-price">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(oldPrice)}</p>
      {/if}

      <div class="item-card__badges">
        {#if badge}
          {@render badge()}
        {:else}
          <span class="item-card__chip">{clothingSize}</span>
          <span class="item-card__chip item-card__chip--pk">{conditionLabel}</span>
        {/if}
      </div>
    </div>
  </button>

  {#if sellerName}
    <button class="item-card__seller" onclick={onSellerClick}>
      <div class="item-card__seller-avatar">
        {#if sellerAvatarUrl}
          <img src={sellerAvatarUrl} alt={sellerName} class="item-card__seller-img" />
        {:else}
          <span class="item-card__seller-initial">{sellerName.charAt(0)}</span>
        {/if}
        {#if sellerVerifiedLabel}
          <span class="item-card__verified-dot" aria-label={sellerVerifiedLabel}>
            <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
              <path d="M1 2.5L2.8 4.2L6 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        {/if}
      </div>
      <span class="item-card__seller-name">{sellerName}</span>
      {#if sellerListings !== undefined}
        <span class="item-card__seller-listings">{sellerListings} anúncios</span>
      {/if}
      <svg class="item-card__seller-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  {/if}

  {#if paymentEnabled}
    <div class="item-card__actions">
      {#if onContact}
        <button class="item-card__action item-card__action--ghost" onclick={onContact}>
          {#if contactIcon}
            {@render contactIcon()}
          {/if}
          {contactLabel}
        </button>
      {/if}
      {#if onBuy}
        <button class="item-card__action item-card__action--primary" onclick={onBuy}>
          {#if buyIcon}
            {@render buyIcon()}
          {/if}
          {buyLabel}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .item-card {
    display: flex;
    flex-direction: column;
    background: var(--color-white);
    border-radius: 1.25rem;
    overflow: hidden;
    border: 0.075rem solid #EDE9E4;
    box-shadow: 0 0.1rem 0.6rem rgba(0, 0, 0, .07);
    transition: box-shadow var(--transition-base), transform 0.2s;
  }

  .item-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-0.2rem);
  }

  .item-card__main {
    display: flex;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    width: 100%;
  }

  .item-card__photo {
    height: 10rem;
    overflow: hidden;
    position: relative;
  }

  .item-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-card__fav {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, .9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: all 0.15s;
  }

  .item-card__fav:hover {
    color: var(--pk);
    background: var(--wh);
  }

  .item-card__fav-dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: currentColor;
  }

  .item-card__info {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1.2rem;
  }

  .item-card__title {
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }

  .item-card__price {
    font-family: var(--font-lato);
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--color-pink);
    margin: 0;
  }

  .item-card__old-price {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    color: #9CA3AF;
    text-decoration: line-through;
    margin: 0;
  }

  .item-card__badges {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }

  .item-card__chip {
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 0.4rem;
    background: var(--of2);
    color: var(--gr);
  }

  .item-card__chip--pk {
    background: var(--pk3);
    color: var(--pk);
  }

  .item-card__seller {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid #F3F4F6;
    border-bottom: 1px solid #F3F4F6;
    background: none;
    border-left: none;
    border-right: none;
    cursor: pointer;
    transition: background 0.15s;
    width: 100%;
    text-align: left;
  }

  .item-card__seller:hover {
    background: var(--of2);
  }

  .item-card__seller-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pk), #B03EFF);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: visible;
    position: relative;
  }

  .item-card__seller-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-card__seller-initial {
    font-family: var(--ld);
    font-size: 0.55rem;
    font-weight: 900;
    color: var(--wh);
  }

  .item-card__seller-name {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 700;
    color: #111;
    flex: 1;
  }

  .item-card__seller-listings {
    font-family: var(--font-lato);
    font-size: 0.7rem;
    color: #9CA3AF;
  }

  .item-card__verified-dot {
    position: absolute;
    bottom: -0.05rem;
    right: -0.05rem;
    width: 0.7rem;
    height: 0.7rem;
    background: var(--color-pink);
    border: 0.075rem solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-card__seller-chevron {
    flex-shrink: 0;
  }

  .item-card__actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem 1.2rem;
  }

  .item-card__action {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    border-radius: 0.5rem;
    padding: 0.65rem;
    font-family: var(--font-lato);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .item-card__action--ghost {
    background: #F3F4F6;
    color: #111;
  }

  .item-card__action--ghost:hover {
    background: var(--of3);
  }

  .item-card__action--primary {
    background: var(--pk);
    color: var(--wh);
    box-shadow: 0 0.2rem 0.6rem rgba(255, 60, 172, .28);
  }

  .item-card__action--primary:hover {
    opacity: 0.9;
  }
</style>
