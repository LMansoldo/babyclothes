<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { t, get } from '$lib/i18n'
  import { HttpCatalogRepository } from '$lib/infrastructure/http/HttpCatalogRepository'
  import type { Item } from '$lib/domain/item/entities/Item'
  import type { Filter } from '$lib/domain/catalog/value-objects/Filter'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockItems } from '$lib/mocks/data'
  import { Card, CategoryTabNav, EmptyState } from '@babyclothes/design-system'
  import { RefreshCw, AlertCircle } from 'lucide-svelte'

  const catalogRepo = new HttpCatalogRepository()
  const mockMode = PUBLIC_MOCK_DATA === 'true'

  type Option = { value: string; label: string }

  const categoryOptions = $derived<Option[]>([
    { value: '', label: $t('catalog.all') },
    { value: 'romper', label: $t('item_form.category_romper') },
    { value: 'bodysuit', label: $t('item_form.category_bodysuit') },
    { value: 'dress', label: $t('item_form.category_dress') },
    { value: 'coat', label: $t('item_form.category_coat') },
    { value: 'set', label: $t('item_form.category_set') },
    { value: 'accessory', label: $t('item_form.category_accessory') },
  ])

  const sizeOptions = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3']

  const genderOptions = $derived<Option[]>([
    { value: 'female', label: $t('item_card.gender_girl') },
    { value: 'male', label: $t('item_card.gender_boy') },
    { value: 'unisex', label: $t('item_card.gender_unisex') },
  ])

  const conditionOptions = $derived<Option[]>([
    { value: 'new', label: $t('item_card.condition_new') },
    { value: 'like_new', label: $t('item_card.condition_like_new') },
    { value: 'used', label: $t('item_card.condition_used') },
  ])

  let selectedCategory = $state('')
  let selectedSize = $state('')
  let selectedGender = $state('')
  let selectedCondition = $state('')

  let items = $state<Item[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  const activeCategoryLabel = $derived(
    categoryOptions.find((option) => option.value === selectedCategory)?.label ??
      categoryOptions[0].label,
  )

  function currentFilter(): Filter {
    return {
      category: selectedCategory || undefined,
      size: selectedSize || undefined,
      gender: selectedGender || undefined,
      condition: selectedCondition || undefined,
    }
  }

  function applyFilterToMocks(): Item[] {
    return mockItems.filter(
      (item) =>
        (!selectedCategory || item.category === selectedCategory) &&
        (!selectedSize || item.clothingSize === selectedSize) &&
        (!selectedGender || item.gender === selectedGender) &&
        (!selectedCondition || item.condition === selectedCondition),
    )
  }

  async function fetchCatalog() {
    loading = true
    error = null
    try {
      items = mockMode ? applyFilterToMocks() : await catalogRepo.fetch(currentFilter())
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load catalog'
    } finally {
      loading = false
    }
  }

  onMount(fetchCatalog)

  function selectCategory(label: string) {
    const option = categoryOptions.find((candidate) => candidate.label === label)
    selectedCategory = option?.value ?? ''
    fetchCatalog()
  }

  function toggleSize(size: string) {
    selectedSize = selectedSize === size ? '' : size
    fetchCatalog()
  }

  function toggleGender(value: string) {
    selectedGender = selectedGender === value ? '' : value
    fetchCatalog()
  }

  function toggleCondition(value: string) {
    selectedCondition = selectedCondition === value ? '' : value
    fetchCatalog()
  }

  function conditionLabel(condition: string) {
    const translate = get(t)
    if (condition === 'new') return translate('item_card.condition_new')
    if (condition === 'like_new') return translate('item_card.condition_like_new')
    return translate('item_card.condition_used')
  }

  function genderLabel(gender: string) {
    const translate = get(t)
    if (gender === 'female') return translate('item_card.gender_girl')
    if (gender === 'male') return translate('item_card.gender_boy')
    return translate('item_card.gender_unisex')
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }
</script>

<svelte:head>
  <title>{$t('catalog.title')} | BabyClothes</title>
</svelte:head>

<div class="catalog-page">
  <CategoryTabNav
    categories={categoryOptions.map((option) => option.label)}
    active={activeCategoryLabel}
    onSelect={selectCategory}
  />

  <div class="catalog-page__filters">
    {#each genderOptions as option (option.value)}
      <button
        class="catalog-page__pill catalog-page__pill--gender"
        class:catalog-page__pill--on={selectedGender === option.value}
        onclick={() => toggleGender(option.value)}
      >
        {option.label}
      </button>
    {/each}
    {#each conditionOptions as option (option.value)}
      <button
        class="catalog-page__pill"
        class:catalog-page__pill--on={selectedCondition === option.value}
        onclick={() => toggleCondition(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  <div class="catalog-page__sizes">
    {#each sizeOptions as size (size)}
      <button
        class="catalog-page__pill"
        class:catalog-page__pill--on={selectedSize === size}
        onclick={() => toggleSize(size)}
      >
        {size}
      </button>
    {/each}
  </div>

  <div class="catalog-page__content">
    {#if loading}
      <div class="catalog-page__status">
        <p>{$t('catalog.loading') ?? 'Loading catalog...'}</p>
      </div>
    {:else if error}
      <div class="catalog-page__status catalog-page__status--error">
        <div class="catalog-page__status-icon">
          <AlertCircle size={32} />
        </div>
        <h2 class="catalog-page__status-title">{$t('catalog.error_title')}</h2>
        <p class="catalog-page__status-desc">{$t('catalog.error_description')}</p>
        <button class="catalog-page__status-btn" onclick={fetchCatalog}>
          <RefreshCw size={14} />
          {$t('catalog.error_retry')}
        </button>
      </div>
    {:else if items.length === 0}
      <EmptyState
        variant="centered"
        title={$t('catalog.empty_title')}
        description={$t('catalog.empty_description')}
        accent="pink"
        action={{ label: $t('catalog.error_retry'), variant: 'pk', onclick: fetchCatalog }}
      />
    {:else}
      <div class="catalog-page__grid">
        {#each items as item (item.id)}
          <div class="catalog-page__cell">
            <Card
              image={item.photoUrls[0] ?? ''}
              title={item.title}
              detail={`Tam. ${item.clothingSize} · ${genderLabel(item.gender)}`}
              price={formatPrice(item.priceCents)}
              condition={conditionLabel(item.condition)}
              pinkPrice={true}
              size="md"
              onClick={() => goto(`/catalog/${item.id}`)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .catalog-page {
    min-height: 100vh;
    background: var(--color-bg);
  }

  /* Pills solidas (spec DS: sem glassmorphism) */
  .catalog-page__filters,
  .catalog-page__sizes {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    padding: 0.6rem 0.7rem 0;
  }

  .catalog-page__sizes {
    padding-bottom: 0.2rem;
  }

  .catalog-page__pill {
    background: #F3F4F6;
    border: none;
    border-radius: 99rem;
    padding: 0.35rem 0.75rem;
    font-family: var(--ld);
    font-size: 0.8rem;
    font-weight: 700;
    color: #374151;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .catalog-page__pill--on {
    background: #111;
    color: #fff;
  }

  .catalog-page__pill--gender {
    background: #FFE8F5;
    color: #FF3CAC;
  }

  .catalog-page__pill--gender.catalog-page__pill--on {
    background: #FF3CAC;
    color: #fff;
  }

  .catalog-page__content {
    padding-bottom: 2rem;
  }

  /* Grid de 2 colunas (spec do mock) */
  .catalog-page__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.2rem 1.4rem;
  }

  @media (min-width: 76.8rem) {
    .catalog-page__grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .catalog-page__cell {
    min-width: 0;
    display: flex;
  }

  .catalog-page__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 3rem 1.4rem;
    text-align: center;
  }

  .catalog-page__status-icon {
    color: var(--color-error);
  }

  .catalog-page__status-title {
    font-family: var(--ld);
    font-size: 1rem;
    margin: 0;
  }

  .catalog-page__status-desc {
    font-size: 0.8rem;
    color: var(--gr);
    margin: 0;
  }

  .catalog-page__status-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--bk);
    color: var(--wh);
    border: none;
    border-radius: 99rem;
    padding: 0.45rem 1rem;
    font-family: var(--ld);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }
</style>
