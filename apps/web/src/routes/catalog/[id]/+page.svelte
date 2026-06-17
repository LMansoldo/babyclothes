<script lang="ts">
  import { t } from '$lib/i18n'
  import ItemCard from '$lib/presentation/components/ItemCard.svelte'

  let { data } = $props()

  function handleFavorite() {
    console.log('Toggle favorite:', data.item.id)
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
  <ItemCard
    item={data.item}
    seller={data.seller ? { name: data.seller.name, avatarUrl: data.seller.avatarUrl, listingCount: 3, verified: data.seller.verified } : undefined}
    paymentEnabled={true}
    onFavorite={handleFavorite}
    onContact={handleContact}
    onBuy={handleBuy}
    onSellerClick={handleSellerClick}
  />
</div>

<style>
  .item-detail-page {
    display: flex;
    justify-content: center;
    padding: 1.5rem 1rem;
    min-height: 100vh;
    background: var(--of2);
  }
</style>
