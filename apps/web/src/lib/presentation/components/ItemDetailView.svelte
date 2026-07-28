<script lang="ts">
  import { t, get } from '$lib/i18n'
  import { ImageGallery, ProductTray } from '@babyclothes/design-system'
  import type { Item } from '$lib/domain/item/entities/Item'
  import type { SellerInfo } from '$lib/infrastructure/http/loadItemDetail'

  let { item, seller }: { item: Item; seller: SellerInfo | null } = $props()

  const conditionLabel = $derived(get(t)(`item_card.condition_${item.condition}`))
  const conditionVariant = $derived<'new' | 'semi' | 'used'>(
    item.condition === 'like_new' ? 'semi' : item.condition === 'new' ? 'new' : 'used',
  )
  const formattedPrice = $derived(`R$ ${(item.priceCents / 100).toFixed(2).replace('.', ',')}`)
</script>

<div class="item-detail-view">
  <div class="item-detail-view__gallery">
    <ImageGallery images={item.photoUrls} />
  </div>
  <div class="item-detail-view__tray">
    <ProductTray
      title={item.title}
      price={formattedPrice}
      condition={conditionLabel}
      conditionVariant={conditionVariant}
      sizeLabel={item.clothingSize ? `Tam. ${item.clothingSize}` : undefined}
      genderLabel={item.gender ? $t(`item_card.gender_${item.gender}`) : undefined}
      sellerName={seller?.name}
      sellerAvatar={seller?.avatarUrl}
      verified={seller?.verified}
      contactLabel={$t('item_card.contact')}
      buyLabel={$t('item_card.buy')}
    />
  </div>
</div>

<style>
  .item-detail-view__gallery {
    width: 100%;
  }
  .item-detail-view__tray {
    padding: 0 1rem;
    margin-top: -1.6rem;
  }
</style>
