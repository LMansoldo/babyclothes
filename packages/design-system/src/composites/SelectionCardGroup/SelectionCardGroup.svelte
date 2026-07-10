<script lang="ts" module>
  export type SelectionOption = {
    value: string
    label: string
    description?: string
    iconTone?: 'brand' | 'neutral'
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import SelectionCard from '../SelectionCard/SelectionCard.svelte'

  let {
    options,
    value = $bindable(undefined),
    ariaLabel,
    icon,
    onchange,
  }: {
    options: SelectionOption[]
    value?: string
    ariaLabel: string
    icon?: Snippet<[string]>
    onchange?: (value: string) => void
  } = $props()

  const selectedIndex = $derived(options.findIndex((option) => option.value === value))

  function select(optionValue: string) {
    value = optionValue
    onchange?.(optionValue)
  }

  function tabindexFor(index: number): number {
    if (selectedIndex === -1) return index === 0 ? 0 : -1
    return index === selectedIndex ? 0 : -1
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const target = targetIndex(event.key, index)
    if (target === null) return
    event.preventDefault()
    select(options[target].value)
  }

  function targetIndex(key: string, index: number): number | null {
    if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % options.length
    if (key === 'ArrowUp' || key === 'ArrowLeft') return (index - 1 + options.length) % options.length
    if (key === 'Home') return 0
    if (key === 'End') return options.length - 1
    return null
  }
</script>

<div class="selectioncardgroup" role="radiogroup" aria-label={ariaLabel}>
  {#each options as option, index (option.value)}
    {#snippet optionIcon()}
      {#if icon}
        {@render icon(option.value)}
      {/if}
    {/snippet}
    <SelectionCard
      title={option.label}
      description={option.description}
      selected={option.value === value}
      iconTone={option.iconTone}
      tabindex={tabindexFor(index)}
      onclick={() => select(option.value)}
      onkeydown={(event: KeyboardEvent) => handleKeydown(event, index)}
      icon={icon ? optionIcon : undefined}
    />
  {/each}
</div>

<style>
  .selectioncardgroup {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
  }
</style>
