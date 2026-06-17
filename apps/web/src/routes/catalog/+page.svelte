<script lang="ts">
  import { t } from '$lib/i18n'
  import { mockItems, mockSellers } from '$lib/mocks/data'
  import ItemCard from '$lib/presentation/components/ItemCard.svelte'
  import CategoryTabNav from '$lib/presentation/components/CategoryTabNav.svelte'
  import PageHeader from '$lib/presentation/components/PageHeader.svelte'

  const categories = $derived([
    { id: 'all', label: $t('catalog.all') },
    { id: 'romper', label: $t('item_form.category_romper') },
    { id: 'bodysuit', label: $t('item_form.category_bodysuit') },
    { id: 'dress', label: $t('item_form.category_dress') },
    { id: 'coat', label: $t('item_form.category_coat') },
    { id: 'set', label: $t('item_form.category_set') },
    { id: 'accessory', label: $t('item_form.category_accessory') },
  ])

  let activeCategory = $state('all')

  const filteredItems = $derived(
    activeCategory === 'all'
      ? mockItems
      : mockItems.filter((item) => item.category === activeCategory)
  )

  function handleCategorySelect(category: string) {
    activeCategory = category
  }

  function handleFavorite(itemId: string) {
    console.log('Toggle favorite:', itemId)
  }

  function handleContact(itemId: string) {
    console.log('Contact seller for:', itemId)
  }

  function handleBuy(itemId: string) {
    console.log('Buy item:', itemId)
  }

  function handleSellerClick(sellerId: string) {
    console.log('View seller:', sellerId)
  }
</script>

<svelte:head>
  <title>{$t('catalog.title')} | BabyClothes</title>
</svelte:head>

<div class="catalog-page">
  <PageHeader variant="hero" title={$t('catalog.title')} subtitle={$t('auth.subtitle')} />

  <CategoryTabNav
    categories={categories.map((c) => c.label)}
    active={categories.find((c) => c.id === activeCategory)?.label ?? ''}
    onSelect={(label) => {
      const cat = categories.find((c) => c.label === label)
      if (cat) handleCategorySelect(cat.id)
    }}
  />

  <div class="catalog-page__grid">
    {#each filteredItems as item (item.id)}
      {@const seller = mockSellers[item.sellerId]}
      <ItemCard
        {item}
        seller={seller ? { name: seller.name, avatarUrl: seller.avatarUrl, listingCount: 3, verified: seller.verified } : undefined}
        paymentEnabled={true}
        onFavorite={() => handleFavorite(item.id)}
        onContact={() => handleContact(item.id)}
        onBuy={() => handleBuy(item.id)}
        onSellerClick={() => handleSellerClick(item.sellerId)}
      />
    {/each}
  </div>
</div>

<style>
  .catalog-page {
    padding-bottom: 5rem;
  }

  .catalog-page__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 640px) {
    .catalog-page__grid {
      grid-template-columns: 1fr;
    }
  }
</style>
