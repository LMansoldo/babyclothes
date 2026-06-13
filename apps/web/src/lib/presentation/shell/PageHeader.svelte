<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    showBack = false,
    onBack,
    actions,
  }: {
    title: string
    showBack?: boolean
    onBack?: () => void
    actions?: Snippet
  } = $props()

  function handleBack() {
    if (onBack) {
      onBack()
    } else {
      history.back()
    }
  }
</script>

<header class="page-header">
  <div class="page-header__left">
    {#if showBack}
      <button class="page-header__back" type="button" onclick={handleBack} aria-label="Voltar">
        ←
      </button>
    {/if}
    <h1 class="page-header__title">{title}</h1>
  </div>

  {#if actions}
    <div class="page-header__actions">
      {@render actions()}
    </div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--color-white);
  }

  .page-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-header__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--color-black);
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
  }

  .page-header__back:hover {
    background: var(--color-bg-2);
  }

  .page-header__back:focus-visible {
    outline: 2px solid var(--color-pink);
    outline-offset: 2px;
  }

  .page-header__title {
    font-family: var(--font-ui);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-black);
  }

  .page-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
