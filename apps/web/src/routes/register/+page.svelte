<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import RegisterScreen from '$lib/presentation/components/RegisterScreen.svelte'
  import { t } from '$lib/i18n'

  let loading = $state(false)
  let errorKey = $state('')

  let form = $state<HTMLFormElement | undefined>(undefined)
  let registerType = $state('')
  let registerDocument = $state('')

  const errorMessage = $derived(errorKey ? $t(errorKey) : undefined)

  function handleSubmit(data: { type: 'pf' | 'pj'; document: string }) {
    registerType = data.type
    registerDocument = data.document
    form?.requestSubmit()
  }
</script>

<svelte:head>
  <title>{$t('auth.registration.create_account')} | BabyClothes</title>
</svelte:head>

<div class="register-page">
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
