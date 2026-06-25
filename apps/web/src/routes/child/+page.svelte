<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { t, get } from '$lib/i18n'
  import { PUBLIC_MOCK_DATA } from '$lib/env'
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository'
  import type { Child } from '$lib/domain/child/entities/Child'
  import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord'
  import { mockChildren as mockChildrenRaw, mockGrowthRecords } from '$lib/mocks/data'
  import type { MockChild } from '$lib/mocks/data'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import EmptyState from '$lib/presentation/components/EmptyState.svelte'
  import ChildSelector from '$lib/presentation/components/ChildSelector.svelte'

  const mockMode = PUBLIC_MOCK_DATA === 'true'

  const childRepo = new HttpChildRepository()

  let children = $state<Child[]>([])
  let measurements = $state<Record<string, GrowthRecord[]>>({})
  let loading = $state(true)
  let activeChildId = $state('')

  const activeChild = $derived(children.find((c) => c.id === activeChildId))

  const childRecords = $derived(
    (measurements[activeChildId] ?? [])
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
  )

  const latestRecord = $derived(childRecords[childRecords.length - 1])

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

  const daysUntil = $derived(30)

  const progress = $derived(65)

  onMount(async () => {
    try {
      if (mockMode) {
        const loaded = mockChildrenRaw.map((c: MockChild) => ({
          ...c,
          birthDate: new Date(c.birthDate),
        }))
        children = loaded
        if (loaded.length > 0) {
          activeChildId = loaded[0].id
        }
      } else {
        const loadedChildren = await childRepo.findAll()
        children = loadedChildren
        if (loadedChildren.length > 0) {
          activeChildId = loadedChildren[0].id
        }
      }
    } catch (e) {
      console.error('Failed to load children:', e)
    } finally {
      loading = false
    }
  })

  async function loadMeasurements(childId: string) {
    if (measurements[childId]) return
    try {
      if (mockMode) {
        measurements = { ...measurements, [childId]: mockGrowthRecords.filter((r) => r.childId === childId) }
      } else {
        const records = await childRepo.getMeasurements(childId)
        measurements = { ...measurements, [childId]: records }
      }
    } catch (e) {
      console.error('Failed to load measurements:', e)
    }
  }

  function getAge(birthDate: Date): string {
    const translate = get(t)
    const now = new Date()
    const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth()
    if (months < 1) return translate('child.age_less_than_month')
    if (months < 12) return translate('child.age_months_short', { count: months })
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0
      ? translate('child.age_years_months_short', { years, months: remainingMonths })
      : translate('child.age_years_short', { count: years })
  }

  const childOptions = $derived(
    children.map((c) => ({
      id: c.id,
      name: c.name,
      age: getAge(c.birthDate),
      size: (measurements[c.id] ?? [])[0]?.clothingSize ?? '?',
    }))
  )

  function handleSelectChild(id: string) {
    activeChildId = id
    loadMeasurements(id)
  }

  function handleAddChild() {
    goto('/child/register')
  }
</script>

<svelte:head>
  <title>{$t('child.title')} | BabyClothes</title>
</svelte:head>

<div class="child-page">
  <ChildSelector
    children={childOptions}
    activeId={activeChildId}
    onSelect={handleSelectChild}
    onAdd={handleAddChild}
  />

  {#if !activeChild}
    <EmptyState
      variant="centered"
      title={$t('child.title')}
      description={$t('child.empty_description')}
      action={{ label: $t('child.add'), variant: 'pk', onclick: handleAddChild }}
    />
  {:else}
    <div class="child-page__content">
      <GrowthChart
        variant="full"
        childName={activeChild.name}
        currentSize={latestRecord?.clothingSize ?? '?'}
        nextSize={nextSize}
        daysUntil={daysUntil}
        progress={progress}
        sizes={growthSizes}
        description={$t('child.growth_description', { name: activeChild.name })}
        primaryAction={{ label: $t('child.view_catalog'), onclick: () => goto('/catalog') }}
        secondaryAction={{ label: $t('child.update_measurements'), onclick: () => console.log('Update measurements') }}
      />
    </div>
  {/if}
</div>

<style>
  .child-page {
    padding-bottom: 5rem;
  }

  .child-page__content {
    padding: 1rem;
    max-width: 60rem;
    margin: 0 auto;
  }
</style>
