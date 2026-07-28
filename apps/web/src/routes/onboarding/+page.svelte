<script lang="ts">
  import { goto } from '$app/navigation'
  import { Button, OnboardingHero } from '@babyclothes/design-system'
  import { ArrowRight } from 'lucide-svelte'
  import { t } from '$lib/i18n'

  const STORAGE_KEY = 'bc_onboarded'

  const features = $derived([
    { icon: 'size' as const, label: $t('onboarding.features.size') },
    { icon: 'age' as const, label: $t('onboarding.features.age') },
    { icon: 'weight' as const, label: $t('onboarding.features.weight') },
    { icon: 'location' as const, label: $t('onboarding.features.location') },
  ])

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    goto('/agent')
  }
</script>

<svelte:head>
  <title>{$t('onboarding.title')} {$t('onboarding.title_accent')} | BabyClothes</title>
</svelte:head>

<div class="onboarding" data-theme="dark">
  <div class="onboarding__glow" aria-hidden="true"></div>

  <div class="onboarding__container">
    <OnboardingHero
      title={$t('onboarding.title')}
      titleAccent={$t('onboarding.title_accent')}
      titleRest={$t('onboarding.title_rest')}
      description={$t('onboarding.description')}
      {features}
    />

    <div class="onboarding__footer">
      <Button variant="pk" size="lg" onclick={finish}>
        {$t('onboarding.cta')}
        <ArrowRight size={14} />
      </Button>
    </div>
  </div>
</div>

<style>
  .onboarding {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-base);
    padding: 1.6rem;
  }

  .onboarding__glow {
    position: absolute;
    top: -4.5rem;
    left: -3rem;
    width: 18rem;
    height: 18rem;
    background: radial-gradient(circle, rgba(176, 62, 255, 0.18) 0%, transparent 65%);
    pointer-events: none;
  }

  .onboarding__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 24rem;
    width: 100%;
    gap: 1.4rem;
  }

  .onboarding__footer {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .onboarding__footer :global(button) {
    width: 100%;
  }
</style>
