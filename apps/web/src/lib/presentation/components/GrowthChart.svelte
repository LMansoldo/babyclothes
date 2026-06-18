<script lang="ts">
  import { t } from '$lib/i18n'

  type SizeEntry = { label: string; status: 'past' | 'current' | 'next' | 'future' }

  let {
    variant = 'compact',
    childName,
    currentSize,
    nextSize,
    daysUntil,
    progress,
    sizes,
    eyebrow,
    description,
    primaryAction,
    secondaryAction,
  }: {
    variant?: 'compact' | 'full'
    childName?: string
    currentSize?: string
    nextSize?: string
    daysUntil?: number
    progress?: number
    sizes?: SizeEntry[]
    eyebrow?: string
    description?: string
    primaryAction?: { label: string; onclick: () => void }
    secondaryAction?: { label: string; onclick: () => void }
  } = $props()
</script>

<div class="growthchart" class:growthchart--full={variant === 'full'}>
  {#if eyebrow}
    <span class="growthchart__eyebrow">{eyebrow}</span>
  {/if}

  {#if childName}
    <h3 class="growthchart__name">{childName}</h3>
  {/if}

  {#if currentSize && nextSize}
    <div class="growthchart__sizes">
      <div class="growthchart__size-block">
        <span class="growthchart__size-label">{$t('growth_chart.current_size')}</span>
        <span class="growthchart__size-value">{currentSize}</span>
      </div>
      <div class="growthchart__size-arrow">&rarr;</div>
      <div class="growthchart__size-block">
        <span class="growthchart__size-label">{$t('growth_chart.next_size')}</span>
        <span class="growthchart__size-value growthchart__size-value--pk">{nextSize}</span>
      </div>
    </div>
  {/if}

  {#if daysUntil !== undefined}
    <p class="growthchart__prediction">
      {$t('growth_chart.days_until', { days: daysUntil })}
    </p>
  {/if}

  {#if progress !== undefined}
    <div class="growthchart__progress">
      <div class="growthchart__progress-bar">
        <div class="growthchart__progress-fill" style="width: {progress}%"></div>
      </div>
      <span class="growthchart__progress-label">{progress}%</span>
    </div>
  {/if}

  {#if sizes && sizes.length > 0}
    <div class="growthchart__timeline">
      {#each sizes as entry (entry.label)}
        <div
          class="growthchart__dot"
          class:growthchart__dot--past={entry.status === 'past'}
          class:growthchart__dot--current={entry.status === 'current'}
          class:growthchart__dot--next={entry.status === 'next'}
        >
          <span class="growthchart__dot-label">{entry.label}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if description}
    <p class="growthchart__desc">{description}</p>
  {/if}

  {#if primaryAction || secondaryAction}
    <div class="growthchart__actions">
      {#if primaryAction}
        <button class="growthchart__btn growthchart__btn--primary" onclick={primaryAction.onclick}>
          {primaryAction.label}
        </button>
      {/if}
      {#if secondaryAction}
        <button class="growthchart__btn growthchart__btn--ghost" onclick={secondaryAction.onclick}>
          {secondaryAction.label}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .growthchart {
    background: var(--glass);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-brd);
    border-radius: var(--r);
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    box-shadow: var(--glass-shadow);
  }

  .growthchart--full {
    padding: 1.5rem;
    gap: 0.8rem;
  }

  .growthchart__eyebrow {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.7rem;
    color: var(--pk);
    letter-spacing: 0.03em;
  }

  .growthchart__name {
    font-family: var(--ld);
    font-size: 1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .growthchart__sizes {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.3rem 0;
  }

  .growthchart__size-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .growthchart__size-label {
    font-family: var(--ld);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: rgba(0, 0, 0, 0.4);
    text-transform: uppercase;
  }

  .growthchart__size-value {
    font-family: var(--ld);
    font-size: 1.3rem;
    font-weight: 900;
    color: var(--bk);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-brd);
    border-radius: 10px;
    padding: 0.3rem 0.7rem;
    min-width: 40px;
    text-align: center;
  }

  .growthchart__size-value--pk {
    background: var(--pk3);
    color: var(--pk);
  }

  .growthchart__size-arrow {
    font-size: 1.2rem;
    color: var(--pk);
    margin-top: 0.8rem;
  }

  .growthchart__prediction {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.78rem;
    color: var(--gr);
    margin: 0;
  }

  .growthchart__progress {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .growthchart__progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 3px;
    overflow: hidden;
  }

  .growthchart__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--pk), #7b2ff7);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .growthchart__progress-label {
    font-family: var(--ld);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--pk);
    min-width: 30px;
    text-align: right;
  }

  .growthchart__timeline {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    margin-top: 0.3rem;
  }

  .growthchart__dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid var(--glass-brd);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .growthchart__dot--past {
    opacity: 0.4;
  }

  .growthchart__dot--current {
    background: var(--bk);
    border-color: var(--bk);
  }

  .growthchart__dot--current .growthchart__dot-label {
    color: var(--wh);
  }

  .growthchart__dot--next {
    background: var(--pk3);
    border-color: var(--pk2);
  }

  .growthchart__dot--next .growthchart__dot-label {
    color: var(--pk);
  }

  .growthchart__dot-label {
    font-family: var(--ld);
    font-size: 0.58rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.45);
  }

  .growthchart__desc {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.72rem;
    color: var(--gr);
    line-height: 1.5;
    margin: 0;
  }

  .growthchart__actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }

  .growthchart__btn {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 0.6rem 1rem;
    font-family: var(--ld);
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  .growthchart__btn--primary {
    background: var(--pk);
    color: var(--wh);
  }

  .growthchart__btn--primary:hover {
    opacity: 0.9;
  }

  .growthchart__btn--ghost {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--bk);
    border: 1px solid var(--glass-brd);
  }

  .growthchart__btn--ghost:hover {
    background: rgba(255, 255, 255, 0.65);
  }
</style>
