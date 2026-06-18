<script lang="ts">
  import { t } from '$lib/i18n'
  import { mockItems } from '$lib/mocks/data'
  import { Card } from '@babyclothes/ui'
  import CategoryTabNav from '$lib/presentation/components/CategoryTabNav.svelte'

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

  const aiItems = mockItems.filter((i) => i.clothingSize === 'G').slice(0, 5)
  const trendingItems = mockItems.slice(0, 5)
  const newbornItems = mockItems.filter((i) => i.clothingSize === 'RN' || i.clothingSize === 'P').slice(0, 6)
  const romperItems = mockItems.filter((i) => i.category === 'romper').slice(0, 5)
  const budgetItems = mockItems.filter((i) => i.priceCents < 5000).slice(0, 6)

  function conditionLabel(c: string) {
    if (c === 'new') return 'Novo'
    if (c === 'like_new') return 'Seminovo'
    return 'Usado'
  }

  function conditionClass(c: string) {
    if (c === 'new') return 'new'
    if (c === 'like_new') return 'semi'
    return 'used'
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(0)}`
  }

  let activeFilters = $state(filters.map((f) => f.active))
  let activeSizes = $state(sizes.map((s) => s.active))

  function toggleFilter(i: number) {
    activeFilters[i] = !activeFilters[i]
  }

  function toggleSize(i: number) {
    activeSizes[i] = !activeSizes[i]
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
          <span class="eyebrow">Agente de crescimento</span> — Preparando para tam. G
        </div>
        <a href="/chat" class="cat-row-see">Perguntar ao agente</a>
      </div>
      <div class="row-track">
        {#each aiItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? 'menina' : item.gender === 'male' ? 'menino' : 'unissex'}`}
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
        <div class="cat-row-title">Em alta esta semana</div>
        <a href="#" class="cat-row-see">Ver todos</a>
      </div>
      <div class="row-track">
        {#each trendingItems as item, idx (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.category}`}
            price={formatPrice(item.priceCents)}
            oldPrice={idx === 0 ? formatPrice(item.priceCents + 6000) : undefined}
            condition={conditionLabel(item.condition)}
            size={idx === 0 ? 'featured' : 'md'}
            pinkPrice={idx === 0}
            onAdd={() => console.log('View item:', item.id)}
          />
        {/each}
      </div>
    </div>

    <!-- Row 3: Newborn -->
    <div class="cat-row">
      <div class="cat-row-hdr">
        <div class="cat-row-title">Recem-nascido · RN</div>
        <a href="#" class="cat-row-see">Ver categoria</a>
      </div>
      <div class="row-track">
        {#each newbornItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`${item.clothingSize} · ${item.gender === 'female' ? 'menina' : item.gender === 'male' ? 'menino' : 'unissex'}`}
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
        <div class="cat-row-title">Macacoes · todos os tamanhos</div>
        <a href="#" class="cat-row-see">Ver categoria</a>
      </div>
      <div class="row-track">
        {#each romperItems as item (item.id)}
          <Card
            image={item.photoUrls[0] ?? ''}
            title={item.title}
            detail={`Tam. ${item.clothingSize} · ${item.gender === 'female' ? 'menina' : item.gender === 'male' ? 'menino' : 'unissex'}`}
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
        <div class="cat-row-title">Boas pecas abaixo de R$50</div>
        <a href="#" class="cat-row-see">Ver todos</a>
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
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
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
    border: 1px solid rgba(255, 255, 255, 0.7);
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
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: var(--r-xs);
    padding: 0.28rem 0.62rem;
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.42);
    cursor: pointer;
    transition: all 0.15s;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  .sz-chip:hover {
    border-color: rgba(0, 0, 0, 0.2);
    color: var(--bk);
  }

  .sz-chip--on {
    background: rgba(10, 10, 10, 0.9);
    border-color: rgba(10, 10, 10, 0.9);
    color: var(--wh);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
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
    top: -5px;
    right: -4px;
    background: var(--pk);
    color: var(--wh);
    font-size: 0.44rem;
    font-family: var(--ld);
    font-weight: 900;
    border-radius: 3px;
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
    transform: translateX(4px);
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
    height: 3px;
  }

  .row-track::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
</style>
