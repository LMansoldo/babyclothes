<script lang="ts">
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import GrowthChart from '$lib/presentation/components/GrowthChart.svelte'
  import { ArrowLeft } from 'lucide-svelte'

  let { data } = $props()

  const latestRecord = $derived(data.records[data.records.length - 1])

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
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
    if (months < 1) return '< 1 mês'
    if (months < 12) return `${months} meses`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years} ano${years > 1 ? 's' : ''} e ${rem} mês${rem > 1 ? 'es' : ''}` : `${years} ano${years > 1 ? 's' : ''}`
  }
</script>

<svelte:head>
  <title>{data.child.name} | BabyClothes</title>
</svelte:head>

<div class="child-detail-page">
  <header class="child-detail-page__header">
    <button class="child-detail-page__back" onclick={() => goto('/child')}>
      <ArrowLeft size={18} />
    </button>
    <div>
      <h1 class="child-detail-page__name">{data.child.name}</h1>
      <p class="child-detail-page__age">{getAge(data.child.birthDate)}</p>
    </div>
  </header>

  <div class="child-detail-page__content">
    <GrowthChart
      variant="full"
      childName={data.child.name}
      currentSize={latestRecord?.clothingSize ?? '?'}
      nextSize={nextSize}
      daysUntil={30}
      progress={65}
      sizes={growthSizes}
      eyebrow={$t('child.growth_prediction')}
      description={$t('child.growth_detail', { name: data.child.name, size: nextSize })}
      primaryAction={{ label: $t('child.view_catalog'), onclick: () => goto('/catalog') }}
      secondaryAction={{ label: $t('child.update_measurements'), onclick: () => console.log('Update') }}
    />

    {#if data.records.length > 0}
      <div class="child-detail-page__history">
        <h2 class="child-detail-page__section-title">{$t('child.history')}</h2>
        {#each data.records as record (record.id)}
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
</div>

<style>
  .child-detail-page {
    min-height: 100vh;
    background: var(--of2);
  }

  .child-detail-page__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--wh);
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  }

  .child-detail-page__back {
    width: 36px;
    height: 36px;
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
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .child-detail-page__history {
    background: var(--wh);
    border-radius: 16px;
    padding: 1.1rem 1.2rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .child-detail-page__record:last-child {
    border-bottom: none;
  }

  .child-detail-page__record-date {
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--gr);
    min-width: 80px;
  }

  .child-detail-page__record-size {
    background: var(--pk3);
    border: 1px solid var(--pk2);
    border-radius: 6px;
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
