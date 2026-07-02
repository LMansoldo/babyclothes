<script lang="ts">
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
    currentSizeLabel = 'Current',
    nextSizeLabel = 'Next',
    predictionLabel,
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
    currentSizeLabel?: string
    nextSizeLabel?: string
    predictionLabel?: string
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
        <span class="growthchart__size-label">{currentSizeLabel}</span>
        <div class="growthchart__size-value growthchart__size-value--current">{currentSize}</div>
      </div>
      <svg class="growthchart__size-arrow" width="18" height="14" viewBox="0 0 20 16" fill="none">
        <path d="M12 2l6 6-6 6M2 8h16" stroke="#FF3CAC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="growthchart__size-block">
        <span class="growthchart__size-label">{nextSizeLabel}</span>
        <div class="growthchart__size-value growthchart__size-value--next">{nextSize}</div>
      </div>
      {#if daysUntil !== undefined}
        <div class="growthchart__days">
          <span class="growthchart__days-label">em aprox.</span>
          <span class="growthchart__days-value">{daysUntil} dias</span>
        </div>
      {/if}
    </div>
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
      {#each sizes as entry, i (entry.label)}
        {#if i > 0}
          <div class="growthchart__line"
            class:growthchart__line--active={sizes[i-1].status === 'current' || entry.status === 'next'}
          ></div>
        {/if}
        <div class="growthchart__dot-wrap">
          <div
            class="growthchart__dot"
            class:growthchart__dot--past={entry.status === 'past'}
            class:growthchart__dot--current={entry.status === 'current'}
            class:growthchart__dot--next={entry.status === 'next'}
            class:growthchart__dot--future={entry.status === 'future'}
          ></div>
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
    background: rgba(255, 255, 255, .75);
    backdrop-filter: blur(0.6rem);
    -webkit-backdrop-filter: blur(0.6rem);
    border: 0.075rem solid #EDE9E4;
    border-radius: 1.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    box-shadow: 0 0.2rem 1.2rem rgba(0, 0, 0, .07);
  }

  .growthchart--full {
    padding: 1.5rem;
    gap: 1rem;
  }

  .growthchart__eyebrow {
    font-family: var(--sr);
    font-style: italic;
    font-size: 0.7rem;
    color: var(--pk);
    letter-spacing: 0.03em;
  }

  .growthchart__name {
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 900;
    color: var(--bk);
    margin: 0;
  }

  .growthchart__sizes {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex-wrap: wrap;
  }

  .growthchart__size-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .growthchart__size-label {
    font-family: var(--font-lato);
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9CA3AF;
  }

  .growthchart__size-value {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 900;
    color: #fff;
  }

  .growthchart__size-value--current {
    background: #111;
  }

  .growthchart__size-value--next {
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
  }

  .growthchart__size-arrow {
    flex-shrink: 0;
  }

  .growthchart__days {
    display: flex;
    flex-direction: column;
  }

  .growthchart__days-label {
    font-family: var(--font-lato);
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9CA3AF;
  }

  .growthchart__days-value {
    font-family: var(--font-lato);
    font-size: 1.25rem;
    font-weight: 900;
    color: #111;
  }

  /* Timeline — linha horizontal */
  .growthchart__timeline {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .growthchart__dot-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .growthchart__dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: #D1D5DB;
  }

  .growthchart__dot--past {
    opacity: 0.3;
  }

  .growthchart__dot--current {
    width: 0.7rem;
    height: 0.7rem;
    background: #111;
    box-shadow: 0 0 0 0.125rem #fff, 0 0 0 0.2rem #111;
  }

  .growthchart__dot--next {
    width: 0.7rem;
    height: 0.7rem;
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
  }

  .growthchart__dot--future {
    opacity: 0.3;
  }

  .growthchart__dot-label {
    font-family: var(--font-lato);
    font-size: 0.58rem;
    font-weight: 700;
    color: #9CA3AF;
  }

  .growthchart__line {
    flex: 1;
    height: 0.075rem;
    background: #D1D5DB;
    margin-bottom: 1.2rem;
  }

  .growthchart__line--active {
    background: linear-gradient(90deg, #FF3CAC, #B03EFF);
  }

  /* Progress */
  .growthchart__progress {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .growthchart__progress-bar {
    flex: 1;
    height: 0.3rem;
    background: #F3F4F6;
    border-radius: 99rem;
    overflow: hidden;
  }

  .growthchart__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF3CAC, #B03EFF);
    border-radius: 99rem;
    transition: width 0.4s ease;
  }

  .growthchart__progress-label {
    font-family: var(--font-lato);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--pk);
    min-width: 3rem;
    text-align: right;
  }

  /* Description */
  .growthchart__desc {
    font-family: var(--font-lato);
    font-size: 0.78rem;
    color: #6B7280;
    line-height: 1.55;
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
    border-radius: 0.75rem;
    padding: 0.6rem 1rem;
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }

  /* CTA */
  .growthchart__btn--primary {
    background: linear-gradient(135deg, #FF3CAC, #B03EFF);
    color: #fff;
    width: 100%;
    border-radius: 0.75rem;
  }

  .growthchart__btn--ghost {
    background: rgba(255, 255, 255, .45);
    color: var(--bk);
    border: 0.075rem solid #EDE9E4;
    border-radius: 0.75rem;
  }
</style>
