<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    detail,
    price,
    oldPrice,
    condition,
    sizeLabel,
    genderLabel,
    sellerName,
    sellerAvatar,
    sellerListings,
    verified = false,
    onContact,
    onBuy,
    onSellerClick,
    children,
  }: {
    title: string
    detail?: string
    price?: string
    oldPrice?: string
    condition?: string
    sizeLabel?: string
    genderLabel?: string
    sellerName?: string
    sellerAvatar?: string
    sellerListings?: string
    verified?: boolean
    onContact?: () => void
    onBuy?: () => void
    onSellerClick?: () => void
    children?: Snippet
  } = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && onSellerClick) onSellerClick()
  }
</script>

<div class="product-tray">
  <div class="product-tray__header">
    <span class="product-tray__title">{title}</span>
    {#if condition || sizeLabel || genderLabel}
      <div class="product-tray__badges">
        {#if condition}
          <span
            class="product-tray__badge"
            class:product-tray__badge--new={condition === 'Novo'}
            class:product-tray__badge--semi={condition === 'Seminovo'}
            class:product-tray__badge--used={condition === 'Usado'}
          >
            {condition}
          </span>
        {/if}
        {#if sizeLabel}
          <span class="product-tray__badge product-tray__badge--neutral">{sizeLabel}</span>
        {/if}
        {#if genderLabel}
          <span class="product-tray__badge product-tray__badge--neutral">{genderLabel}</span>
        {/if}
      </div>
    {/if}
  </div>

  {#if detail}
    <span class="product-tray__detail">{detail}</span>
  {/if}

  {#if price}
    <div class="product-tray__price">
      <span class="product-tray__price-current">{price}</span>
      {#if oldPrice}
        <span class="product-tray__price-old">{oldPrice}</span>
      {/if}
    </div>
  {/if}

  {#if sellerName}
    <div
      class="product-tray__seller"
      onclick={onSellerClick}
      role={onSellerClick ? 'button' : undefined}
      tabindex={onSellerClick ? 0 : undefined}
      onkeydown={onSellerClick ? handleKeydown : undefined}
    >
      <div class="product-tray__seller-left">
        {#if sellerAvatar}
          <img src={sellerAvatar} alt={sellerName} class="product-tray__seller-avatar" />
        {:else}
          <div class="product-tray__seller-avatar product-tray__seller-avatar--empty"></div>
        {/if}
        <div class="product-tray__seller-info">
          <span class="product-tray__seller-name">
            {sellerName}
            {#if verified}
              <svg class="product-tray__seller-verified" width="14" height="14" viewBox="0 0 24 24" fill="#FF3CAC" stroke="#FF3CAC" stroke-width="2">
                <circle cx="12" cy="12" r="10" fill="#FF3CAC" stroke="none"/>
                <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            {/if}
          </span>
          {#if sellerListings}
            <span class="product-tray__seller-meta">{sellerListings} anuncios</span>
          {/if}
        </div>
      </div>
      <svg class="product-tray__seller-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  {/if}

  {#if children}
    {@render children()}
  {/if}

  {#if onContact || onBuy}
    <div class="product-tray__actions">
      {#if onContact}
        <button type="button" class="product-tray__button product-tray__button--ghost" onclick={onContact}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Contatar
        </button>
      {/if}
      {#if onBuy}
        <button type="button" class="product-tray__button product-tray__button--primary" onclick={onBuy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Comprar
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .product-tray {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 1.6rem 1.6rem 0 0;
    margin-top: -1.6rem;
    padding: 1.8rem 1.8rem 8rem;
    position: relative;
    z-index: 1;
  }

  .product-tray__header {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .product-tray__title {
    font-family: var(--font-lato);
    font-size: 1.05rem;
    font-weight: 700;
    color: #111;
  }

  .product-tray__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .product-tray__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 99rem;
    font-family: var(--font-lato);
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;
  }

  .product-tray__badge--new {
    background: #111;
    color: #fff;
  }

  .product-tray__badge--semi {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .product-tray__badge--used {
    background: #F3F4F6;
    color: #374151;
  }

  .product-tray__badge--neutral {
    background: #F3F4F6;
    color: #374151;
  }

  .product-tray__detail {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    color: #9CA3AF;
    margin-top: 0.2rem;
  }

  .product-tray__price {
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
    margin-top: 0.8rem;
  }

  .product-tray__price-current {
    font-family: var(--font-lato);
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF3CAC;
  }

  .product-tray__price-old {
    font-family: var(--font-lato);
    font-size: 0.8rem;
    color: #9CA3AF;
    text-decoration: line-through;
  }

  .product-tray__seller {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 0;
    border-top: 1px solid #F3F4F6;
    border-bottom: 1px solid #F3F4F6;
    margin-top: 1.2rem;
    cursor: pointer;
    background: none;
    border-left: none;
    border-right: none;
    width: 100%;
    text-align: left;
  }

  .product-tray__seller:hover {
    background: #FAFAFA;
  }

  .product-tray__seller-left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .product-tray__seller-avatar {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    position: relative;
  }

  .product-tray__seller-avatar--empty {
    background: #F3F4F6;
    border-radius: 50%;
  }

  .product-tray__seller-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .product-tray__seller-name {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    font-weight: 700;
    color: #111;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .product-tray__seller-verified {
    flex-shrink: 0;
  }

  .product-tray__seller-meta {
    font-family: var(--font-lato);
    font-size: 0.68rem;
    color: #9CA3AF;
  }

  .product-tray__seller-chevron {
    color: #9CA3AF;
    flex-shrink: 0;
  }

  .product-tray__actions {
    display: flex;
    gap: 0.8rem;
    margin-top: 1.6rem;
  }

  .product-tray__button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 1.2rem;
    border: none;
    border-radius: 1rem;
    font-family: var(--font-lato);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .product-tray__button--ghost {
    background: #F3F4F6;
    color: #111;
  }

  .product-tray__button--ghost:hover {
    background: #E5E7EB;
  }

  .product-tray__button--primary {
    background: #FF3CAC;
    color: #fff;
    box-shadow: 0 0.3rem 1rem rgba(255, 60, 172, 0.3);
  }

  .product-tray__button--primary:hover {
    opacity: 0.9;
  }
</style>
