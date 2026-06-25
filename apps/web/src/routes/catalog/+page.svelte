<script lang="ts">
  import { onMount } from 'svelte'
  import { t, get } from '$lib/i18n'
  import { HttpCatalogRepository } from '$lib/infrastructure/http/HttpCatalogRepository'
  import type { Item } from '$lib/domain/item/entities/Item'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockItems } from '$lib/mocks/data'
  import { Card } from '@babyclothes/ui'
  import CategoryTabNav from '$lib/presentation/components/CategoryTabNav.svelte'
  import EmptyState from '$lib/presentation/components/EmptyState.svelte'
  import { RefreshCw, AlertCircle } from 'lucide-svelte'

  const catalogRepo = new HttpCatalogRepository()

  const mockMode = PUBLIC_MOCK_DATA === 'true'

  const categories = [
    'Destaques', 'Recem-nascido', 'Macacoes', 'Bodies',
    'Casacos', 'Calcas', 'Conjuntos', 'Acessorios', 'Enxoval', 'Seminovos', 'Sugerido pela IA',
  ]

  const filters = [
    { label: 'Tam. M', active: true },
    { label: 'Tam. G', active: false },
    { label: 'Tam. GG', active: false },
    { label: 'Menina', active: false },
    { label: 'Menino', active: false },
    { label: 'Unissex', active: false },
    { label: 'Novo', active: true },
    { label: 'Seminovo', active: false },
    { label: 'Ate R$50', active: false },
    { label: 'Ate R$100', active: false },
  ]

  const sizes = [
    { label: 'RN', active: false },
    { label: 'P', active: false },
    { label: 'M · Sofia atual', active: true },
    { label: 'G proximo', active: false, predicted: true },
    { label: 'GG', active: false },
    { label: '1', active: false },
    { label: '2', active: false },
    { label: '3', active: false },
  ]

  let allItems = $state<Item[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  const aiItems = $derived(allItems.filter((item) => item.clothingSize === 'G').slice(0, 5))
  const trendingItems = $derived(allItems.slice(0, 5))
  const newbornItems = $derived(allItems.filter((item) => item.clothingSize === 'RN' || item.clothingSize === 'P').slice(0, 6))
  const romperItems = $derived(allItems.filter((item) => item.category === 'romper').slice(0, 5))
  const budgetItems = $derived(allItems.filter((item) => item.priceCents < 5000).slice(0, 6))

  async function fetchCatalog() {
    loading = true
    error = null
    try {
      allItems = mockMode ? [...mockItems] : await catalogRepo.fetch({})
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load catalog'
    } finally {
      loading = false
    }
  }

  onMount(fetchCatalog)

  function conditionLabel(c: string) {
    const translate = get(t)
    if (c === 'new') return translate('item_card.condition_new')
    if (c === 'like_new') return translate('item_card.condition_like_new')
    return translate('item_card.condition_used')
  }

  function conditionClass(c: string) {
    if (c === 'new') return 'new'
    if (c === 'like_new') return 'semi'
    return 'used'
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }

  let activeFilters = $state(filters.map((filter) => filter.active))
  let activeSizes = $state(sizes.map((size) => size.active))

  function toggleFilter(index: number) {
    activeFilters[index] = !activeFilters[index]
  }

  function toggleSize(index: number) {
    activeSizes[index] = !activeSizes[index]
  }
</script>

<svelte:head>
  <title>Catalogo | BabyClothes</title>
</svelte:head>

<div class="catalog-page">
  <!-- Category Nav -->
  <CategoryTabNav
    categories={categories}
    active={categories[0]}
    onSelect={() => {}}
  />

  <!-- Filter Bar -->
  <div class="filter-bar">
    <span class="filter-lbl">Filtros</span>
    {#each filters as filter, i}
      <button
        class="fchip"
        class:fchip--on={activeFilters[i]}
        onclick={() => toggleFilter(i)}
      >
        {filter.label}
      </button>
    {/each}
    <button class="filter-clear" onclick={() => activeFilters = filters.map(() => false)}>Limpar</button>
  </div>

  <!-- Content -->
  <div class="content">
    {#if loading}
      <div class="catalog-loading">
        <p>{$t('catalog.loading') ?? 'Loading catalog...'}</p>
      </div>
    {:else if error}
      <div class="catalog-status catalog-status--error">
        <div class="catalog-status__icon">
          <AlertCircle size={32} />
        </div>
        <h2 class="catalog-status__title">{$t('catalog.error_title')}</h2>
        <p class="catalog-status__desc">{$t('catalog.error_description')}</p>
        <button class="catalog-status__btn" onclick={fetchCatalog}>
          <RefreshCw size={14} />
          {$t('catalog.error_retry')}
        </button>
      </div>
    {:else if allItems.length === 0}
      <EmptyState
        variant="centered"
        title={$t('catalog.empty_title')}
        description={$t('catalog.empty_description')}
        accent="pink"
        action={{ label: $t('catalog.error_retry'), variant: 'pk', onclick: fetchCatalog }}
      />
    {:else}
    <!-- Size Row -->
    <div class="size-row">
      <span class="sz-lbl">Tamanho</span>
      {#each sizes as size, i}
        <button
          class="sz-chip"
          class:sz-chip--on={activeSizes[i]}
          class:sz-chip--predicted={size.predicted}
          onclick={() => toggleSize(i)}
        >
          {size.label}
        </button>
      {/each}
    </div>

    <!-- Row 1: AI Suggested -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">
          <span class="eyebrow">{$t('catalog.section_ai_eyebrow')}</span> — {$t('catalog.section_ai_detail')}
        </div>
        <a href="/chat" class="cat-row-see">{$t('catalog.ask_agent')}</a>
      </div>
      <div class="row-track">
        {#each aiItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? $t('item_card.gender_girl') : item.gender === 'male' ? $t('item_card.gender_boy') : $t('item_card.gender_unisex')}`}
            price={formatPrice(item.priceCents)}
            condition={conditionLabel(item.condition)}
            badge="IA"
            size="lg"
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>

    <!-- Row 2: Trending -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">{$t('catalog.section_trending')}</div>
        <a href="#" class="cat-row-see">{$t('catalog.view_all')}</a>
      </div>
      <div class="row-track">
        {#each trendingItems as item, index (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.category}`}
            price={formatPrice(item.priceCents)}
            oldPrice={index === 0 ? formatPrice(item.priceCents + 6000) : undefined}
            condition={conditionLabel(item.condition)}
            size={index === 0 ? 'featured' : 'md'}
            pinkPrice={index === 0}
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>

    <!-- Row 3: Newborn -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">{$t('catalog.section_newborn')}</div>
        <a href="#" class="cat-row-see">{$t('catalog.view_category')}</a>
      </div>
      <div class="row-track">
        {#each newbornItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`${item.clothingSize} · ${item.gender === 'female' ? $t('item_card.gender_girl') : item.gender === 'male' ? $t('item_card.gender_boy') : $t('item_card.gender_unisex')}`}
            price={formatPrice(item.priceCents)}
            condition={conditionLabel(item.condition)}
            size="sm"
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>

    <!-- Row 4: Rompers -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">{$t('catalog.section_rompers')}</div>
        <a href="#" class="cat-row-see">{$t('catalog.view_category')}</a>
      </div>
      <div class="row-track">
        {#each romperItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? $t('item_card.gender_girl') : item.gender === 'male' ? $t('item_card.gender_boy') : $t('item_card.gender_unisex')}`}
            price={formatPrice(item.priceCents)}
            condition={conditionLabel(item.condition)}
            size="md"
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>

    <!-- Row 5: Budget -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">{$t('catalog.section_budget')}</div>
        <a href="#" class="cat-row-see">{$t('catalog.view_all')}</a>
      </div>
      <div class="row-track">
        {#each budgetItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize}`}
            price={formatPrice(item.priceCents)}
            condition={conditionLabel(item.condition)}
            size="sm"
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  .catalog-page {
    padding-bottom: 2rem;
  }

  /* ── Filter Bar ── */
  .filter-bar {
    padding: 0.85rem 5vw;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 0.32);
    backdrop-filter: blur(1.6rem);
    -webkit-backdrop-filter: blur(1.6rem);
    border-bottom: 0.1rem solid rgba(255, 255, 255, 0.6);
    box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.7);
  }

  .filter-lbl {
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.25);
    margin-right: 0.2rem;
    flex-shrink: 0;
  }

  .fchip {
    background: rgba(255, 255, 255, 0.45);
    border: 0.1rem solid rgba(255, 255, 255, 0.7);
    border-radius: var(--r-xs);
    padding: 0.25rem 0.7rem;
    font-family: var(--ld);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    backdrop-filter: blur(1rem);
    box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.8);
  }

  .fchip:hover {
    border-color: rgba(0, 0, 0, 0.18);
    color: var(--bk);
  }

  .fchip--on {
    background: rgba(255, 214, 238, 0.55);
    border-color: rgba(255, 110, 199, 0.5);
    color: var(--pk);
  }

  .filter-clear {
    margin-left: auto;
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: color 0.15s;
    flex-shrink: 0;
    background: none;
    border: none;
  }

  .filter-clear:hover {
    color: var(--pk);
  }

  /* ── Content ── */
  .content {
    padding: 0 5vw 2.5rem;
  }

  /* ── Size Row ── */
  .size-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 1.25rem 0 0.5rem;
    flex-wrap: wrap;
  }

  .sz-lbl {
    font-family: var(--ld);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.25);
    margin-right: 0.15rem;
  }

  .sz-chip {
    background: rgba(255, 255, 255, 0.5);
    border: 0.1rem solid rgba(255, 255, 255, 0.75);
    border-radius: var(--r-xs);
    padding: 0.28rem 0.62rem;
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.42);
    cursor: pointer;
    transition: all 0.15s;
    backdrop-filter: blur(1rem);
    box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.85);
  }

  .sz-chip:hover {
    border-color: rgba(0, 0, 0, 0.2);
    color: var(--bk);
  }

  .sz-chip--on {
    background: rgba(10, 10, 10, 0.9);
    border-color: rgba(10, 10, 10, 0.9);
    color: var(--wh);
    box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.15);
  }

  .sz-chip--predicted {
    background: rgba(255, 214, 238, 0.55);
    border-color: rgba(255, 110, 199, 0.5);
    color: var(--pk);
    position: relative;
  }

  .sz-chip--predicted::after {
    content: 'IA';
    position: absolute;
    top: -0.5rem;
    right: -0.4rem;
    background: var(--pk);
    color: var(--wh);
    font-size: 0.44rem;
    font-family: var(--ld);
    font-weight: 900;
    border-radius: 0.3rem;
    padding: 0.03rem 0.22rem;
    letter-spacing: 0.05em;
  }

  /* ── Category Rows ── */
  .cat-row {
    padding: 2rem 0 0.5rem;
  }

  .cat-row-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .cat-row-title {
    font-family: var(--ld);
    font-size: 0.9rem;
    font-weight: 900;
    color: var(--bk);
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .eyebrow {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.8rem;
    color: var(--pk);
    font-weight: 400;
    margin-right: 0.1rem;
  }

  .cat-row-see {
    font-family: var(--ld);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.32);
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .cat-row-see::after {
    content: '\2192';
    transition: transform 0.2s;
  }

  .cat-row-see:hover {
    color: var(--pk);
  }

  .cat-row-see:hover::after {
    transform: translateX(0.4rem);
  }

  .row-track {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.15rem 0 0.75rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
  }

  .row-track::-webkit-scrollbar {
    height: 0.3rem;
  }

  .row-track::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.2rem;
  }

  /* ── Status States (error) ── */
  .catalog-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
    gap: 0.5rem;
  }

  .catalog-status__icon {
    color: var(--pk);
    margin-bottom: 0.5rem;
    opacity: 0.7;
  }

  .catalog-status__title {
    font-family: var(--ld);
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .catalog-status__desc {
    font-family: var(--sr);
    font-size: 0.82rem;
    color: var(--gr);
    margin: 0;
    max-width: 20rem;
  }

  .catalog-status__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
    background: var(--pk);
    color: var(--wh);
    border: none;
    border-radius: var(--r-xs);
    padding: 0.55rem 1.4rem;
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .catalog-status__btn:hover {
    opacity: 0.85;
  }
</style>
