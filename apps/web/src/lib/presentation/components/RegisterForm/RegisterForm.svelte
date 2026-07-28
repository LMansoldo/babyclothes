<script lang="ts">
  import { setContext } from 'svelte'
  import { get } from 'svelte/store'
  import { createRegisterFormStore, type RegisterFormStore } from './RegisterFormStore'
  import Step1 from './Step1.svelte'
  import Step2 from './Step2.svelte'
  import { IconButton } from '@babyclothes/design-system'
  import { t } from '$lib/i18n'
  import type { RegisterPFInput } from '$lib/domain/user/schemas'

  let {
    onSubmit,
    onBack,
    loading = false,
    error,
    serverFieldErrors,
  }: {
    onSubmit: (data: RegisterPFInput) => void
    onBack: () => void
    loading?: boolean
    error?: string
    serverFieldErrors?: Partial<Record<keyof RegisterPFInput, string>>
  } = $props()

  const store: RegisterFormStore = createRegisterFormStore()
  setContext('registerForm', store)

  // Sync server errors into store
  let prevServerErrors: string | undefined
  $effect(() => {
    if (!serverFieldErrors) return
    const key = JSON.stringify(serverFieldErrors)
    if (key === prevServerErrors) return
    prevServerErrors = key
    store.setServerErrors(serverFieldErrors)
  })

  function handleBack() {
    const currentStep = get(store).step
    if (currentStep === 2) {
      store.goToStep1()
      return
    }
    onBack()
  }

  function handleContinue() {
    store.goToStep2()
  }

  function handleSubmit() {
    const data = store.collectData()
    if (!data) return
    onSubmit(data)
  }
</script>

<form
  class="registerform"
  onsubmit={(e) => e.preventDefault()}
  novalidate
>
  <div class="registerform__header">
    <IconButton
      icon="back"
      ariaLabel={$t('auth.register_pf.back')}
      onclick={handleBack}
    />
    <span class="registerform__create-label">{$t('auth.register_pf.create_account')}</span>
  </div>

  {#if $store.step === 1}
    <div class="registerform__heading">
      <p class="registerform__step">{$t('auth.register_pf.step_indicator', { step: 1 })}</p>
      <h1 class="registerform__title">
        <span class="registerform__title-accent">{$t('auth.register_pf.title_accent')}</span>
        {' '}{$t('auth.register_pf.title')}
      </h1>
      <p class="registerform__lead">{$t('auth.register_pf.lead')}</p>
    </div>

    <Step1 />

    <div class="registerform__cta">
      <button type="button" class="registerform__cta-btn" onclick={handleContinue}>
        {$t('auth.register_pf.continue')}
      </button>
    </div>
  {:else}
    <div class="registerform__heading">
      <p class="registerform__step">{$t('auth.register_pf.step_indicator', { step: 2 })}</p>
      <h1 class="registerform__title">{$t('auth.register_pf.step2_title')}</h1>
      <p class="registerform__lead">{$t('auth.register_pf.step2_lead')}</p>
    </div>

    <Step2 />

    {#if error}
      <p class="registerform__error" role="alert">{error}</p>
    {/if}

    <div class="registerform__cta">
      <button type="button" class="registerform__cta-btn" onclick={handleSubmit} disabled={loading}>
        {#if loading}
          <span class="registerform__cta-loading">{$t('common.loading')}</span>
        {:else}
          <span>{$t('auth.register_pf.submit')}</span>
        {/if}
      </button>
    </div>
  {/if}
</form>

<style>
  .registerform {
    display: flex;
    flex-direction: column;
    max-width: 40rem;
    width: 100%;
    padding: 0.8rem 1rem;
    margin: 0 auto;
  }

  .registerform__header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
  }

  .registerform__create-label {
    font-family: var(--font-lato);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--bk);
  }

  .registerform__heading {
    margin-bottom: 1.6rem;
  }

  .registerform__step {
    font-family: var(--font-lato);
    font-size: 0.72rem;
    font-weight: 700;
    color: #9CA3AF;
    margin: 0 0 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .registerform__title {
    font-family: var(--sr);
    font-size: 1.6rem;
    font-weight: 300;
    color: var(--bk);
    margin: 0 0 0.4rem;
    line-height: 1.2;
  }

  .registerform__title-accent {
    color: var(--pk);
  }

  .registerform__lead {
    font-family: var(--font-lato);
    font-size: 0.82rem;
    color: #6B7280;
    margin: 0;
    line-height: 1.4;
  }

  .registerform__cta {
    margin-top: 0.4rem;
  }

  .registerform__cta-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.3rem;
    border-radius: 1rem;
    background: var(--pk);
    border: none;
    cursor: pointer;
    font-family: var(--font-lato);
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    box-shadow: 0 4px 16px rgba(255, 60, 172, 0.3);
    transition: opacity 0.15s;
  }

  .registerform__cta-btn:hover {
    opacity: 0.9;
  }

  .registerform__cta-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .registerform__cta-loading {
    font-family: var(--font-lato);
  }

  .registerform__error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: #F87171;
    margin: 0.8rem 0 0;
    text-align: center;
  }
</style>
