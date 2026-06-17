<script lang="ts">
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import { mockChildren, mockGrowthRecords } from '$lib/mocks/data'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import EmptyState from '$lib/presentation/components/EmptyState.svelte'
  import ChildSelector from '$lib/presentation/components/ChildSelector.svelte'

  let activeChildId = $state(mockChildren[0]?.id ?? '')

  const activeChild = $derived(mockChildren.find((c) => c.id === activeChildId))

  const childRecords = $derived(
    mockGrowthRecords
      .filter((r) => r.childId === activeChildId)
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

  function handleSelectChild(id: string) {
    activeChildId = id
  }

  function handleAddChild() {
    goto('/child/register')
  }

  function getAge(birthDate: Date): string {
    const now = new Date()
    const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth()
    if (months < 1) return '< 1m'
    if (months < 12) return `${months}m`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years}a ${rem}m` : `${years}a`
  }
</script>

<svelte:head>
  <title>{$t('child.title')} | BabyClothes</title>
</svelte:head>

<div class="child-page">
  <ChildSelector
    children={mockChildren.map((c) => ({ id: c.id, name: c.name, age: getAge(c.birthDate), size: latestRecord?.clothingSize ?? '?' }))}
    activeId={activeChildId}
    onSelect={handleSelectChild}
    onAdd={handleAddChild}
  />

  {#if !activeChild}
    <EmptyState
      variant="centered"
      title={$t('child.title')}
      description="Adicione uma criança para ver as previsões de crescimento."
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
        description="Baseado no histórico de crescimento de {activeChild.name}"
        primaryAction={{ label: 'Ver catálogo', onclick: () => goto('/catalog') }}
        secondaryAction={{ label: 'Atualizar medidas', onclick: () => console.log('Update measurements') }}
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
    max-width: 600px;
    margin: 0 auto;
  }
</style>
