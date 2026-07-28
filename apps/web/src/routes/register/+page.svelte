<script lang="ts">
  import { tick } from 'svelte'
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import RegisterScreen from '$lib/presentation/components/RegisterScreen.svelte'
  import { RegisterForm } from '$lib/presentation/components/RegisterForm'
  import { flags } from '$lib/feature-flags'
  import { t } from '$lib/i18n'
  import type { RegisterPFInput } from '$lib/domain/user/schemas'

  let loading = $state(false)
  let errorKey = $state('')

  let form = $state<HTMLFormElement | undefined>(undefined)
  let registerType = $state('')
  let registerDocument = $state('')

  let pfForm = $state<HTMLFormElement | undefined>(undefined)
  let pfData = $state<RegisterPFInput | null>(null)
  let pfServerFieldErrors = $state<Partial<Record<keyof RegisterPFInput, string>>>({})

  const errorMessage = $derived(errorKey ? $t(errorKey) : undefined)

  function handleSubmit(data: { type: 'pf' | 'pj'; document: string }) {
    registerType = data.type
    registerDocument = data.document
    form?.requestSubmit()
  }

  async function handlePFSubmit(data: RegisterPFInput) {
    pfData = data
    await tick()
    pfForm?.requestSubmit()
  }
</script>

<svelte:head>
  <title>{$t('auth.registration.create_account')} | BabyClothes</title>
</svelte:head>

<div class="register-page">
  {#if flags.pjRegistration}
    <form
      method="POST"
      bind:this={form}
      use:enhance={() => {
        loading = true
        errorKey = ''
        return async ({ result, update }) => {
          loading = false
          if (result.type === 'redirect') {
            await goto(result.location)
            return
          }
          if (result.type === 'failure') {
            const failure = result.data as { error?: string } | undefined
            errorKey =
              failure?.error === 'invalid_document'
                ? 'auth.registration.error_invalid_document'
                : 'auth.registration.error_generic'
            return
          }
          await update()
        }
      }}
      hidden
    >
      <input type="hidden" name="type" value={registerType} />
      <input type="hidden" name="document" value={registerDocument} />
    </form>

    <RegisterScreen
      onSubmit={handleSubmit}
      onBack={() => goto('/login')}
      {loading}
      error={errorMessage}
    />
  {:else}
    <form
      method="POST"
      bind:this={pfForm}
      use:enhance={() => {
        loading = true
        errorKey = ''
        return async ({ result, update }) => {
          loading = false
          if (result.type === 'redirect') {
            await goto(result.location)
            return
          }
          if (result.type === 'failure') {
            const failure = result.data as { error?: string; details?: Record<string, string> } | undefined
            if (failure?.error === 'validation_failed' && failure.details) {
              pfServerFieldErrors = failure.details
              errorKey = ''
            } else if (failure?.error === 'pj_disabled') {
              errorKey = 'auth.register_pf.error_pj_disabled'
            } else {
              errorKey = 'auth.register_pf.error_generic'
            }
            return
          }
          await update()
        }
      }}
      hidden
    >
      <input type="hidden" name="type" value="pf" />
      {#if pfData}
        <input type="hidden" name="name" value={pfData.name} />
        <input type="hidden" name="email" value={pfData.email} />
        <input type="hidden" name="password" value={pfData.password} />
        <input type="hidden" name="cpf" value={pfData.cpf} />
        <input type="hidden" name="phone" value={pfData.phone} />
        <input type="hidden" name="nationality" value={pfData.nationality} />
        <input type="hidden" name="cep" value={pfData.cep} />
        <input type="hidden" name="addressLine" value={pfData.addressLine} />
        <input type="hidden" name="city" value={pfData.city} />
        <input type="hidden" name="state" value={pfData.state} />
      {/if}
    </form>

    <RegisterForm
      onSubmit={handlePFSubmit}
      onBack={() => goto('/login')}
      {loading}
      error={errorMessage}
      serverFieldErrors={pfServerFieldErrors}
    />
  {/if}
</div>

<style>
  .register-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    background: var(--of);
    padding: 1rem;
  }
</style>
