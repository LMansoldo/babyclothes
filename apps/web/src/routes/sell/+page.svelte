<script lang="ts">
  import { goto } from '$app/navigation'
  import { t, get } from '$lib/i18n'
  import { ZodError } from 'zod'
  import ItemForm from '$lib/presentation/components/ItemForm.svelte'
  import { CreateItem } from '$lib/application/item/CreateItem'
  import { HttpItemRepository } from '$lib/infrastructure/http/HttpItemRepository'
  import {
    mapItemFormToCreateInput,
    type ItemFormData,
  } from '$lib/application/item/mapItemFormToCreateInput'
  import { PUBLIC_MOCK_DATA } from '$lib/env'

  const mockMode = PUBLIC_MOCK_DATA === 'true'
  const createItem = new CreateItem(new HttpItemRepository())

  let currentStep = $state<1 | 2>(1)
  let submitting = $state(false)
  let errorMessage = $state<string | null>(null)

  async function handleSubmit(data: ItemFormData) {
    if (currentStep === 1) {
      currentStep = 2
      return
    }

    errorMessage = null

    if (mockMode) {
      goto('/catalog')
      return
    }

    submitting = true
    try {
      const item = await createItem.execute(mapItemFormToCreateInput(data))
      goto(`/catalog/${item.id}`)
    } catch (e) {
      errorMessage = extractErrorMessage(e)
    } finally {
      submitting = false
    }
  }

  function extractErrorMessage(e: unknown): string {
    if (e instanceof ZodError) {
      return e.issues[0]?.message ?? get(t)('sell.error_publish')
    }
    return get(t)('sell.error_publish')
  }

  function handleBack() {
    if (currentStep === 2) {
      currentStep = 1
      return
    }
    goto('/catalog')
  }
</script>

<svelte:head>
  <title>{$t('item_form.new_listing')} | BabyClothes</title>
</svelte:head>

<div class="sell-page">
  {#if errorMessage}
    <p class="sell-page__error" role="alert">{errorMessage}</p>
  {/if}

  <ItemForm
    {currentStep}
    totalSteps={2}
    {submitting}
    onSubmit={handleSubmit}
    onBack={handleBack}
  />
</div>

<style>
  .sell-page {
    min-height: 100vh;
    background: var(--wh);
    padding-bottom: 5rem;
  }

  .sell-page__error {
    max-width: 44rem;
    margin: 0 0 0.8rem;
    padding: 0.6rem 0.9rem;
    border-radius: 0.8rem;
    background: rgba(239, 68, 68, 0.08);
    border: 0.1rem solid rgba(239, 68, 68, 0.3);
    color: var(--color-error);
    font-size: 0.8rem;
  }
</style>
