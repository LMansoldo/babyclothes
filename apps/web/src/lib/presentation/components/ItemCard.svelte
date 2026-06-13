<script lang="ts">
  import { Badge } from '@babyclothes/ui'
  import type { Item } from '$lib/domain/item/entities/Item'

  let {
    item,
    onclick,
  }: {
    item: Item
    onclick?: () => void
  } = $props()

  const formattedPrice = $derived(
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(item.priceCents / 100),
  )

  const conditionLabel = $derived(
    item.condition === 'new'
      ? 'Novo'
      : item.condition === 'like_new'
        ? 'Seminovo'
        : 'Usado',
  )

  const mainPhoto = $derived(item.photoUrls[0] ?? '/placeholder.png')
</script>

<button class="item-card" onclick={onclick}>
  <div class="item-card__photo">
    <img src={mainPhoto} alt={item.title} class="item-card__img" />
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

<style>
  .item-card {
    display: flex;
    flex-direction: column;
    background: var(--color-white);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: box-shadow var(--transition-base);
  }

  .item-card:hover {
    box-shadow: var(--shadow-md);
  }

  .item-card__photo {
    aspect-ratio: 1;
    overflow: hidden;
  }

  .item-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  }

  .item-card__price {
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 900;
    color: var(--color-pink);
  }

  .item-card__badges {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
</style>
