<script lang="ts">
  export interface OnboardingFeature {
    icon: string
    label: string
  }

  export interface OnboardingHeroProps {
    title: string
    titleAccent?: string
    titleRest?: string
    description: string
    features: OnboardingFeature[]
  }

  let {
    title,
    titleAccent,
    titleRest,
    description,
    features,
  }: OnboardingHeroProps = $props()
</script>

{#snippet featureIcon(name: string)}
  {#if name === 'size'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <rect x="3" y="9" width="18" height="7" rx="2" /><path d="M7 9v3M11 9v2M15 9v3M19 9v2" />
    </svg>
  {:else if name === 'age'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  {:else if name === 'weight'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 12l4-5" /><circle cx="12" cy="12" r="1.5" fill="var(--color-pk-mid)" />
    </svg>
  {:else if name === 'location'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-pk-mid)" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  {/if}
{/snippet}

<section class="onboardinghero">
  <div class="onboardinghero__illustration" aria-hidden="true">
    <svg width="240" height="200" viewBox="0 0 240 200" fill="none">
      <circle cx="120" cy="96" r="82" fill="rgba(255,60,172,.08)" />
      <circle cx="120" cy="96" r="58" fill="rgba(255,60,172,.1)" />
      <path d="M120 52 C120 52 96 76 96 90 C96 103 106.7 111 120 111 C133.3 111 144 103 144 90 C144 76 120 52 120 52Z" fill="var(--pk)" />
      <circle cx="113" cy="90" r="3" fill="#fff" />
      <circle cx="127" cy="90" r="3" fill="#fff" />
      <path d="M113 99 Q120 104 127 99" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" />
      <g transform="translate(30,40)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <path d="M14 12 L18 9 H26 L30 12 L34 17 L30 20 L29 18 V33 H15 V18 L14 20 L10 17 Z" fill="var(--color-pk-soft)" stroke="var(--color-pk-mid)" stroke-width="1.2" />
      </g>
      <g transform="translate(168,34)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <rect x="10" y="18" width="24" height="9" rx="2" fill="var(--color-pk-purple)" />
        <path d="M14 18v4M19 18v3M24 18v4M29 18v3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g transform="translate(36,122)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <circle cx="22" cy="23" r="11" fill="none" stroke="var(--color-pk-mid)" stroke-width="2" />
        <path d="M22 23 L27 17" stroke="var(--pk)" stroke-width="2" stroke-linecap="round" />
        <circle cx="22" cy="23" r="2.4" fill="var(--pk)" />
      </g>
      <g transform="translate(162,122)">
        <rect x="0" y="0" width="44" height="44" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <path d="M22 11c-5 0-8.5 3.6-8.5 8 0 6 8.5 14 8.5 14s8.5-8 8.5-14c0-4.4-3.5-8-8.5-8z" fill="var(--pk)" />
        <circle cx="22" cy="19" r="3" fill="#fff" />
      </g>
      <path d="M78 66 Q96 70 102 78" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M164 60 Q146 68 140 78" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M82 140 Q98 124 106 110" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M160 140 Q142 124 134 110" stroke="rgba(255,133,204,.5)" stroke-width="1.5" stroke-dasharray="3 4" fill="none" />
      <path d="M120 22 l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="var(--color-pk-mid)" />
      <path d="M196 96 l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="rgba(255,255,255,.5)" />
      <path d="M42 96 l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="rgba(176,62,255,.7)" />
    </svg>
  </div>

  <div class="onboardinghero__content">
    <h1 class="onboardinghero__title">
      {title}{#if titleAccent}&nbsp;<em class="onboardinghero__accent">{titleAccent}</em>{/if}{#if titleRest}&nbsp;{titleRest}{/if}
    </h1>
    <p class="onboardinghero__description">{description}</p>
  </div>

  <div class="onboardinghero__features" role="list">
    {#each features as feature (feature.label)}
      <div class="onboardinghero__pill" role="listitem">
        <span class="onboardinghero__pill-icon" aria-hidden="true">{@render featureIcon(feature.icon)}</span>
        <span class="onboardinghero__pill-label">{feature.label}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .onboardinghero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.4rem;
  }

  .onboardinghero__illustration { flex-shrink: 0; }

  .onboardinghero__content {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 28rem;
  }

  .onboardinghero__title {
    font-family: var(--sr);
    font-size: var(--text-display-size);
    font-weight: var(--text-display-weight);
    color: var(--text-primary);
    line-height: var(--text-display-line);
    margin: 0;
  }

  .onboardinghero__accent {
    font-style: normal;
    color: var(--pk);
  }

  .onboardinghero__description {
    font-family: var(--font-lato);
    font-size: var(--text-body-sm-size);
    color: var(--text-secondary);
    line-height: var(--text-body-sm-line);
    margin: 0;
  }

  .onboardinghero__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    width: 100%;
    max-width: 24rem;
  }

  .onboardinghero__pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.56rem 0.75rem;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: 10px;
  }

  .onboardinghero__pill-icon {
    display: inline-flex;
    flex-shrink: 0;
    line-height: 0;
  }

  .onboardinghero__pill-label {
    font-family: var(--font-lato);
    font-size: var(--text-label-size);
    font-weight: var(--text-label-weight);
    color: var(--text-primary);
    line-height: var(--text-label-line);
    white-space: nowrap;
  }
</style>
