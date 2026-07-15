<script lang="ts">
  import { onMount } from 'svelte'
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

  onMount(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        goto('/agent', { replaceState: true })
      }
    } catch {}
  })
</script>

<div class="onboarding">
  <div class="onboarding__container">
    <a
      href="/agent"
      class="onboarding__skip"
      onclick={(event) => {
        event.preventDefault()
        finish()
      }}
    >
      {$t('onboarding.skip')}
    </a>

    <OnboardingHero
      title={$t('onboarding.title') + ' ' + $t('onboarding.title_rest')}
      titleAccent={$t('onboarding.title_accent')}
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #0f0f0f 0%, #1a0814 60%, #0a0a1a 100%);
    padding: 1.6rem;
  }

  .onboarding__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 40rem;
    width: 100%;
    gap: 2rem;
  }

  .onboarding__skip {
    align-self: flex-end;
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    text-decoration: none;
    transition: color 0.15s;
  }

  .onboarding__skip:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  .onboarding__footer {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .onboarding__footer :global(button) {
    width: 100%;
  }
</style>
