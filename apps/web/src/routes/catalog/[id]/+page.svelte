<script lang="ts">
  import { t, get } from '$lib/i18n'
  import { ImageGallery, ProductTray } from '@babyclothes/design-system'

  let { data } = $props()

  const conditionLabel = $derived(get(t)(`item_card.condition_${data.item.condition}`))
  const conditionVariant = $derived<'new' | 'semi' | 'used'>(
    data.item.condition === 'like_new' ? 'semi' : data.item.condition === 'new' ? 'new' : 'used',
  )
  const formattedPrice = $derived(`R$ ${(data.item.priceCents / 100).toFixed(2).replace('.', ',')}`)

  function handleBack() {
    history.back()
  }

  function handleFavorite() {
    console.log('Toggle favorite:', data.item.id)
  }

  function handleShare() {
    console.log('Share item:', data.item.id)
  }

  function handleContact() {
    console.log('Contact seller for:', data.item.id)
  }

  function handleBuy() {
    console.log('Buy item:', data.item.id)
  }

  function handleSellerClick() {
    console.log('View seller:', data.item.sellerId)
  }
</script>

<svelte:head>
  <title>{data.item.title} | BabyClothes</title>
</svelte:head>

<div class="item-detail-page">
  <div class="item-detail-page__gallery">
    <ImageGallery
      images={data.item.photoUrls}
      onBack={handleBack}
      onFav={handleFavorite}
      onShare={handleShare}
    />
  </div>

  <div class="item-detail-page__tray">
    <ProductTray
      title={data.item.title}
      price={formattedPrice}
      condition={conditionLabel}
      conditionVariant={conditionVariant}
      sizeLabel={data.item.clothingSize ? `Tam. ${data.item.clothingSize}` : undefined}
      genderLabel={data.item.gender ? $t(`item_card.gender_${data.item.gender}`) : undefined}
      sellerName={data.seller?.name}
      sellerAvatar={data.seller?.avatarUrl}
      verified={data.seller?.verified}
      contactLabel={$t('item_card.contact')}
      buyLabel={$t('item_card.buy')}
      onContact={handleContact}
      onBuy={handleBuy}
      onSellerClick={handleSellerClick}
    />
  </div>
</div>

<style>
  .item-detail-page {
    min-height: 100vh;
    background: var(--color-bg);
  }

  .item-detail-page__gallery {
    width: 100%;
  }

  .item-detail-page__tray {
    padding: 0 1rem;
    margin-top: -1.6rem;
  }
</style>
