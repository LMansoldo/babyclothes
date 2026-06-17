<script lang="ts">
  import { goto } from '$app/navigation'
  import { t } from '$lib/i18n'
  import ItemForm from '$lib/presentation/components/ItemForm.svelte'

  let currentStep = $state<1 | 2>(1)

  function handleSubmit(data: any) {
    console.log('Publish listing:', data)
    goto('/catalog')
  }

  function handleBack() {
    if (currentStep === 2) {
      currentStep = 1
    } else {
      goto('/catalog')
    }
  }
</script>

<svelte:head>
  <title>{$t('item_form.new_listing')} | BabyClothes</title>
</svelte:head>

<div class="sell-page">
  <ItemForm
    {currentStep}
    totalSteps={2}
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
</style>
