<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { t, get } from '$lib/i18n'
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository'
  import type { Child } from '$lib/domain/child/entities/Child'
  import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { mockChildren, mockGrowthRecords } from '$lib/mocks/data'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import { ArrowLeft } from 'lucide-svelte'

  const childRepo = new HttpChildRepository()

  let child = $state<Child | null>(null)
  let records = $state<GrowthRecord[]>([])
  let loading = $state(true)
  let errorMsg = $state('')

  const mockMode = PUBLIC_MOCK_DATA === 'true'

  onMount(async () => {
    const childId = $page.params.id ?? ''
    if (!childId) { errorMsg = 'No child ID'; loading = false; return }
    try {
      if (mockMode) {
        const found = mockChildren.find((c) => c.id === childId)
        if (found) {
          child = { ...found, birthDate: new Date(found.birthDate) }
        }
        records = mockGrowthRecords
          .filter((r) => r.childId === childId)
          .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      } else {
        const [found, measurements] = await Promise.all([
          childRepo.findById(childId),
          childRepo.getMeasurements(childId),
        ])
        child = found
        records = measurements.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      }
    } catch (e) {
      console.error('Failed to load child:', e)
      errorMsg = 'Failed to load child data'
    } finally {
      loading = false
    }
  })

  const latestRecord = $derived(records[records.length - 1])

  const allSizes = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6']

  const growthSizes = $derived(
    allSizes.map((label) => {
      if (!latestRecord) return { label, status: 'future' as const }
      const currentIdx = allSizes.indexOf(latestRecord.clothingSize)
      const idx = allSizes.indexOf(label)
      if (idx < currentIdx) return { label, status: 'past' as const }
      if (idx === currentIdx) return { label, status: 'current' as const }
      if (idx === currentIdx + 1) return { label, status: 'next' as const }
      return { label, status: 'future' as const }
    })
  )

  const nextSize = $derived(
    latestRecord ? allSizes[allSizes.indexOf(latestRecord.clothingSize) + 1] ?? '?' : '?'
  )

  function getAge(birthDate: string | Date): string {
    const translate = get(t)
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (months < 1) return translate('child.age_less_than_one_month')
    if (months === 1) return translate('child.age_one_month')
    if (months < 12) return translate('child.age_months_long', { count: months })
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return years === 1 ? translate('child.age_one_year') : translate('child.age_years_long', { count: years })
    if (years === 1 && remainingMonths === 1) return translate('child.age_one_year_one_month')
    if (years === 1) return translate('child.age_one_year_months', { months: remainingMonths })
    if (remainingMonths === 1) return translate('child.age_years_one_month', { years })
    return translate('child.age_years_months_long', { years, months: remainingMonths })
  }
</script>

<svelte:head>
  <title>{child?.name ?? 'Child'} | BabyClothes</title>
</svelte:head>

<div class="child-detail-page">
  {#if loading}
    <div class="child-detail-page__loading">Loading...</div>
  {:else if errorMsg || !child}
    <div class="child-detail-page__error">
      <p>{errorMsg || 'Child not found'}</p>
      <button onclick={() => goto('/child')}>Go back</button>
    </div>
  {:else}
    <header class="child-detail-page__header">
      <button class="child-detail-page__back" onclick={() => goto('/child')}>
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 class="child-detail-page__name">{child.name}</h1>
        <p class="child-detail-page__age">{getAge(child.birthDate)}</p>
      </div>
    </header>

    <div class="child-detail-page__content">
      <GrowthChart
        variant="full"
        childName={child.name}
        currentSize={latestRecord?.clothingSize ?? '?'}
        nextSize={nextSize}
        daysUntil={30}
        progress={65}
        sizes={growthSizes}
        eyebrow={$t('child.growth_prediction')}
        description={$t('child.growth_detail', { name: child.name, size: nextSize })}
        primaryAction={{ label: $t('child.view_catalog'), onclick: () => goto('/catalog') }}
        secondaryAction={{ label: $t('child.update_measurements'), onclick: () => console.log('Update') }}
      />

      {#if records.length > 0}
        <div class="child-detail-page__history">
          <h2 class="child-detail-page__section-title">{$t('child.history')}</h2>
          {#each records as record (record.id)}
            <div class="child-detail-page__record">
              <span class="child-detail-page__record-date">
                {record.recordedAt.toLocaleDateString('pt-BR')}
              </span>
              <span class="child-detail-page__record-size">{record.clothingSize}</span>
              <span class="child-detail-page__record-stats">
                {record.weightG}g · {record.heightCm}cm
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .child-detail-page {
    min-height: 100vh;
    background: var(--of2);
  }

  .child-detail-page__loading,
  .child-detail-page__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--gr);
  }

  .child-detail-page__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--wh);
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.07);
  }

  .child-detail-page__back {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    background: var(--of2);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--bk);
    transition: background 0.15s;
  }

  .child-detail-page__back:hover {
    background: var(--of3);
  }

  .child-detail-page__name {
    font-family: var(--ld);
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .child-detail-page__age {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.75rem;
    color: var(--gr);
    margin: 0.1rem 0 0;
  }

  .child-detail-page__content {
    padding: 1rem;
    max-width: 60rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .child-detail-page__history {
    background: var(--wh);
    border-radius: 1.6rem;
    padding: 1.1rem 1.2rem;
    border: 0.1rem solid rgba(0, 0, 0, 0.08);
  }

  .child-detail-page__section-title {
    font-family: var(--ld);
    font-size: 0.85rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0 0 0.75rem;
  }

  .child-detail-page__record {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.05);
  }

  .child-detail-page__record:last-child {
    border-bottom: none;
  }

  .child-detail-page__record-date {
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--gr);
    min-width: 8rem;
  }

  .child-detail-page__record-size {
    background: var(--pk3);
    border: 0.1rem solid var(--pk2);
    border-radius: 0.6rem;
    padding: 0.15rem 0.4rem;
    font-family: var(--ld);
    font-size: 0.62rem;
    font-weight: 900;
    color: var(--pk);
  }

  .child-detail-page__record-stats {
    font-family: var(--vd);
    font-size: 0.72rem;
    color: rgba(0, 0, 0, 0.4);
  }
</style>
