<script lang="ts">
  import { Button, IconButton, Input, SelectionCardGroup } from '@babyclothes/design-system'
  import { ArrowRight, Store, User } from 'lucide-svelte'
  import { t } from '$lib/i18n'
  import {
    formatCpf,
    formatCnpj,
    isValidCpf,
    isValidCnpj,
    stripDocument,
  } from '$lib/domain/user/value-objects/Document'

  let {
    onSubmit,
    onBack,
    loading = false,
    error,
  }: {
    onSubmit: (data: { type: 'pf' | 'pj'; document: string }) => void
    onBack: () => void
    loading?: boolean
    error?: string
  } = $props()

  let selectedType = $state<string | undefined>(undefined)
  let documentValue = $state('')

  const options = $derived([
    {
      value: 'pf',
      label: $t('auth.registration.pf'),
      description: $t('auth.registration.pf_description'),
      iconTone: 'brand' as const,
    },
    {
      value: 'pj',
      label: $t('auth.registration.pj'),
      description: $t('auth.registration.pj_description'),
      iconTone: 'neutral' as const,
    },
  ])

  const isPf = $derived(selectedType === 'pf')

  const documentDigits = $derived(stripDocument(documentValue))

  const isDocumentValid = $derived.by(() => {
    if (selectedType === 'pf') return isValidCpf(documentDigits)
    if (selectedType === 'pj') return isValidCnpj(documentDigits)
    return false
  })

  function handleTypeChange() {
    documentValue = ''
  }

  function handleDocumentInput() {
    documentValue = isPf ? formatCpf(documentValue) : formatCnpj(documentValue)
  }

  function handleSubmit() {
    if (!selectedType || !isDocumentValid) return
    onSubmit({ type: selectedType as 'pf' | 'pj', document: documentDigits })
  }
</script>

<div class="registerscreen">
  <header class="registerscreen__header">
    <IconButton icon="back" variant="glass" size={32} ariaLabel={$t('auth.registration.back')} onclick={onBack} />
    <h1 class="registerscreen__heading">{$t('auth.registration.create_account')}</h1>
  </header>

  <p class="registerscreen__lead">{$t('auth.registration.subtitle_top')}</p>
  <h2 class="registerscreen__title">{$t('auth.registration.title')}</h2>

  <SelectionCardGroup
    {options}
    bind:value={selectedType}
    ariaLabel={$t('auth.registration.title')}
    onchange={handleTypeChange}
  >
    {#snippet icon(optionValue: string)}
      {#if optionValue === 'pf'}
        <User size={20} aria-hidden="true" />
      {:else}
        <Store size={20} aria-hidden="true" />
      {/if}
    {/snippet}
  </SelectionCardGroup>

  {#if selectedType}
    <div class="registerscreen__document">
      <Input
        id="register-document"
        name="document"
        label={isPf ? $t('auth.registration.cpf_label') : $t('auth.registration.cnpj_label')}
        placeholder={isPf ? $t('auth.registration.cpf_placeholder') : $t('auth.registration.cnpj_placeholder')}
        inputmode="numeric"
        maxlength={isPf ? 14 : 18}
        bind:value={documentValue}
        oninput={handleDocumentInput}
        disabled={loading}
      />
    </div>

    <Button
      variant="pk"
      size="lg"
      loading={loading}
      disabled={!isDocumentValid}
      onclick={handleSubmit}
    >
      {$t('auth.registration.submit')}
      <ArrowRight size={14} aria-hidden="true" />
    </Button>

    {#if error}
      <p class="registerscreen__error" role="alert">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .registerscreen {
    width: 100%;
    max-width: 40rem;
    display: flex;
    flex-direction: column;
    padding: 0.8rem 1rem;
  }

  .registerscreen__header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 1.4rem;
  }

  .registerscreen__heading {
    font-family: var(--sr);
    font-size: 1.35rem;
    font-weight: 400;
    color: var(--bk);
    margin: 0;
  }

  .registerscreen__lead {
    font-family: var(--font-lato);
    font-size: 0.78rem;
    color: #6B7280;
    line-height: 1.4;
    margin: 0 0 0.3rem;
  }

  .registerscreen__title {
    font-family: var(--sr);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--bk);
    line-height: 1.3;
    margin: 0 0 1.2rem;
  }

  .registerscreen__document {
    margin: 1.6rem 0 1rem;
  }

  .registerscreen__error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: var(--color-error);
    margin: 0.6rem 0 0;
    text-align: center;
  }
</style>
