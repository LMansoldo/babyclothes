<script lang="ts">
  import { t } from '$lib/i18n'

  let {
    selectedType,
    onSelect,
    pfLabel = $t('auth.registration.pf'),
    pfDescription = $t('auth.registration.pf_description'),
    pjLabel = $t('auth.registration.pj'),
    pjDescription = $t('auth.registration.pj_description'),
  }: {
    selectedType?: 'pf' | 'pj'
    onSelect?: (type: 'pf' | 'pj') => void
    pfLabel?: string
    pfDescription?: string
    pjLabel?: string
    pjDescription?: string
  } = $props()

  function handleSelect(type: 'pf' | 'pj') {
    onSelect?.(type)
  }

  function handleKeydown(e: KeyboardEvent, type: 'pf' | 'pj') {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(type)
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onSelect?.('pj')
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onSelect?.('pf')
    }
  }
</script>

<div
  class="regtypesel"
  role="radiogroup"
  aria-label={$t('auth.registration.title')}
>
  <!-- PF card -->
  <div
    class="regtypesel__card"
    class:regtypesel__card--selected={selectedType === 'pf'}
    role="radio"
    aria-checked={selectedType === 'pf'}
    tabindex={selectedType === 'pf' ? 0 : -1}
    onclick={() => handleSelect('pf')}
    onkeydown={(e: KeyboardEvent) => handleKeydown(e, 'pf')}
  >
    <div class="regtypesel__icon regtypesel__icon--pf">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pk)" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </svg>
    </div>
    <div class="regtypesel__text">
      <span class="regtypesel__label">{pfLabel}</span>
      <span class="regtypesel__desc">{pfDescription}</span>
    </div>
    {#if selectedType === 'pf'}
      <div class="regtypesel__check" aria-hidden="true">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- PJ card -->
  <div
    class="regtypesel__card"
    class:regtypesel__card--selected={selectedType === 'pj'}
    role="radio"
    aria-checked={selectedType === 'pj'}
    tabindex={selectedType === 'pj' ? 0 : -1}
    onclick={() => handleSelect('pj')}
    onkeydown={(e: KeyboardEvent) => handleKeydown(e, 'pj')}
  >
    <div class="regtypesel__icon regtypesel__icon--pj">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
    <div class="regtypesel__text">
      <span class="regtypesel__label">{pjLabel}</span>
      <span class="regtypesel__desc">{pjDescription}</span>
    </div>
    {#if selectedType === 'pj'}
      <div class="regtypesel__check" aria-hidden="true">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .regtypesel {
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  @media (max-width: 360px) {
    .regtypesel {
      flex-direction: column;
    }
  }

  .regtypesel__card {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--wh);
    border: 0.075rem solid #EDE9E4;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    position: relative;
  }

  .regtypesel__card:hover {
    border-color: #D1CBC4;
  }

  .regtypesel__card:focus-visible {
    box-shadow: 0 0 0 0.2rem var(--pk);
    border-color: var(--pk);
  }

  .regtypesel__card--selected {
    border: 0.1rem solid var(--pk);
    box-shadow: 0 0 0 0.2rem rgba(255, 60, 172, 0.12);
  }

  /* Icon */
  .regtypesel__icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .regtypesel__icon--pf {
    background: var(--pk3-soft);
  }

  .regtypesel__icon--pj {
    background: #ECEAE6;
  }

  /* Text */
  .regtypesel__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .regtypesel__label {
    font-family: var(--font-lato);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--bk);
  }

  .regtypesel__desc {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    color: var(--gr);
    line-height: 1.4;
  }

  /* Checkmark */
  .regtypesel__check {
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    background: var(--pk);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
  }
</style>
