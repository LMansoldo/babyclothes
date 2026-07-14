<script lang="ts">
  export interface OnboardingFeature {
    icon: string
    label: string
  }

  export interface OnboardingHeroProps {
    title: string
    titleAccent?: string
    description: string
    features: OnboardingFeature[]
  }

  let {
    title,
    titleAccent,
    description,
    features,
  }: OnboardingHeroProps = $props()
</script>

<section class="onboardinghero">
  <div class="onboardinghero__illustration" aria-hidden="true">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="var(--color-pk-soft)" />
      <path d="M60 20C60 20 30 45 30 65C30 80.46 43.43 92 60 92C76.57 92 90 80.46 90 65C90 45 60 20 60 20Z" fill="var(--pk)" opacity="0.8" />
      <circle cx="50" cy="58" r="4" fill="#fff" opacity="0.9" />
      <circle cx="70" cy="58" r="4" fill="#fff" opacity="0.9" />
      <path d="M52 72C52 72 56 78 60 78C64 78 68 72 68 72" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
      <circle cx="38" cy="50" r="8" fill="var(--color-pk-soft)" opacity="0.6" />
      <circle cx="82" cy="50" r="8" fill="var(--color-pk-soft)" opacity="0.6" />
      <rect x="45" y="10" width="30" height="12" rx="6" fill="var(--color-pink-light)" opacity="0.5" />
    </svg>
  </div>

  <div class="onboardinghero__content">
    <h1 class="onboardinghero__title">
      {title}
      {#if titleAccent}
        <span class="onboardinghero__accent">{titleAccent}</span>
      {/if}
    </h1>
    <p class="onboardinghero__description">{description}</p>
  </div>

  <div class="onboardinghero__features" role="list">
    {#each features as feature (feature.label)}
      <div class="onboardinghero__pill" role="listitem">
        <span class="onboardinghero__pill-icon" aria-hidden="true">{feature.icon}</span>
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
    padding: 2rem 1.2rem;
    gap: 1.4rem;
  }

  .onboardinghero__illustration {
    flex-shrink: 0;
  }

  .onboardinghero__content {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 28rem;
  }

  .onboardinghero__title {
    font-family: var(--font-lato);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--bk);
    line-height: 1.3;
    margin: 0;
  }

  .onboardinghero__accent {
    font-weight: 700;
    color: var(--pk);
  }

  .onboardinghero__description {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    color: #6B7280;
    line-height: 1.5;
    margin: 0;
  }

  .onboardinghero__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
    width: 100%;
    max-width: 24rem;
  }

  .onboardinghero__pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.75rem;
    background: var(--wh);
    border: 0.075rem solid #EDE9E4;
    border-radius: 99rem;
    transition: border-color var(--transition-fast);
  }

  .onboardinghero__pill:hover {
    border-color: var(--color-pink-soft);
  }

  .onboardinghero__pill-icon {
    font-size: 0.9rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .onboardinghero__pill-label {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
