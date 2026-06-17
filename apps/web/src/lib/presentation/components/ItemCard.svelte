<script lang="ts">
  import { Badge } from '@babyclothes/ui'
  import { Heart, MessageCircle, ShoppingCart } from 'lucide-svelte'
  import type { Item } from '$lib/domain/item/entities/Item'
  import { t } from '$lib/i18n'

  let {
    item,
    seller,
    paymentEnabled = false,
    onclick,
    onFavorite,
    onContact,
    onBuy,
    onSellerClick,
  }: {
    item: Item
    seller?: { name: string; avatarUrl: string; listingCount: number; verified: boolean }
    paymentEnabled?: boolean
    onclick?: () => void
    onFavorite?: () => void
    onContact?: () => void
    onBuy?: () => void
    onSellerClick?: () => void
  } = $props()

  const formattedPrice = $derived(
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(item.priceCents / 100),
  )

  const conditionLabel = $derived(
    item.condition === 'new'
      ? $t('item_card.condition_new')
      : item.condition === 'like_new'
        ? $t('item_card.condition_like_new')
        : $t('item_card.condition_used'),
  )

  const mainPhoto = $derived(item.photoUrls[0] ?? '/placeholder.png')
</script>

<div class="item-card" role="article">
  <button class="item-card__main" onclick={onclick}>
    <div class="item-card__photo">
      <img src={mainPhoto} alt={item.title} class="item-card__img" />
      {#if onFavorite}
        <span
          class="item-card__fav"
          role="button"
          tabindex="0"
          onclick={(e) => { e.stopPropagation(); onFavorite() }}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onFavorite() } }}
          aria-label={$t('item_card.favorite')}
        >
          <Heart size={16} strokeWidth={2} />
        </span>
      {/if}
    </div>

    <div class="item-card__info">
      <h3 class="item-card__title">{item.title}</h3>
      <p class="item-card__price">{formattedPrice}</p>

      <div class="item-card__badges">
        <Badge label={item.clothingSize} variant="neutral" size="sm" />
        <Badge label={conditionLabel} variant="pk-soft" size="sm" />
      </div>
    </div>
  </button>

  {#if seller}
    <button class="item-card__seller" onclick={onSellerClick}>
      <div class="item-card__seller-avatar">
        {#if seller.avatarUrl}
          <img src={seller.avatarUrl} alt={seller.name} class="item-card__seller-img" />
        {:else}
          <span class="item-card__seller-initial">{seller.name.charAt(0)}</span>
        {/if}
      </div>
      <span class="item-card__seller-name">{seller.name}</span>
      {#if seller.verified}
        <Badge label={$t('item_card.verified')} variant="pk-soft" size="sm" />
      {/if}
    </button>
  {/if}

  {#if paymentEnabled}
    <div class="item-card__actions">
      {#if onContact}
        <button class="item-card__action item-card__action--ghost" onclick={onContact}>
          <MessageCircle size={14} strokeWidth={2} />
          {$t('item_card.contact')}
        </button>
      {/if}
      {#if onBuy}
        <button class="item-card__action item-card__action--primary" onclick={onBuy}>
          <ShoppingCart size={14} strokeWidth={2} />
          {$t('item_card.buy')}
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
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: box-shadow var(--transition-base), transform 0.2s;
  }

  .item-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
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
    aspect-ratio: 1;
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
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gr);
    transition: all 0.15s;
    backdrop-filter: blur(4px);
  }

  .item-card__fav:hover {
    color: var(--pk);
    background: var(--wh);
  }

  .item-card__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
  }

  .item-card__title {
    font-family: var(--font-ui);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-black);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
  }

  .item-card__price {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 900;
    color: var(--color-pink);
    margin: 0;
  }

  .item-card__badges {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .item-card__seller {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: none;
    border-left: none;
    border-right: none;
    border-bottom: none;
    cursor: pointer;
    transition: background 0.15s;
  }

  .item-card__seller:hover {
    background: var(--of2);
  }

  .item-card__seller-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--pk), #7b2ff7);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
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
    font-family: var(--vd);
    font-size: 0.72rem;
    color: rgba(0, 0, 0, 0.6);
    flex: 1;
  }

  .item-card__actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.6rem 12px 12px;
  }

  .item-card__action {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .item-card__action--ghost {
    background: var(--of2);
    color: var(--bk);
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .item-card__action--ghost:hover {
    background: var(--of3);
  }

  .item-card__action--primary {
    background: var(--pk);
    color: var(--wh);
  }

  .item-card__action--primary:hover {
    opacity: 0.9;
  }
</style>
