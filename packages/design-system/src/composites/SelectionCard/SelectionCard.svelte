<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    description,
    selected = false,
    iconTone = 'neutral',
    icon,
    tabindex = 0,
    onclick,
    onkeydown,
  }: {
    title: string
    description?: string
    selected?: boolean
    iconTone?: 'brand' | 'neutral'
    icon?: Snippet
    tabindex?: number
    onclick?: () => void
    onkeydown?: (event: KeyboardEvent) => void
  } = $props()
</script>

<button
  type="button"
  class="selectioncard"
  class:selectioncard--selected={selected}
  role="radio"
  aria-checked={selected}
  {tabindex}
  {onclick}
  {onkeydown}
>
  {#if icon}
    <span class="selectioncard__icon selectioncard__icon--{iconTone}" aria-hidden="true">
      {@render icon()}
    </span>
  {/if}

  <span class="selectioncard__text">
    <span class="selectioncard__title">{title}</span>
    {#if description}
      <span class="selectioncard__description">{description}</span>
    {/if}
  </span>

  {#if selected}
    <span class="selectioncard__check" aria-hidden="true">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  {/if}
</button>

<style>
  .selectioncard {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    width: 100%;
    padding: 0.8rem;
    background: var(--wh);
    border: 0.075rem solid var(--of2);
    border-radius: 0.7rem;
    cursor: pointer;
    font-family: var(--font-lato);
    text-align: left;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .selectioncard:hover {
    border-color: var(--pk);
  }

  .selectioncard:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .selectioncard--selected {
    border: 0.1rem solid var(--pk);
    box-shadow: 0 0.1rem 0.6rem rgba(255, 60, 172, 0.12);
  }

  .selectioncard__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .selectioncard__icon--brand {
    background: var(--color-pk-soft);
    color: var(--pk);
  }

  .selectioncard__icon--neutral {
    background: #F3F4F6;
    color: #6B7280;
  }

  .selectioncard__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .selectioncard__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--bk);
  }

  .selectioncard__description {
    font-size: 0.75rem;
    color: #6B7280;
    line-height: 1.5;
  }

  .selectioncard__check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    background: var(--pk);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
</style>
