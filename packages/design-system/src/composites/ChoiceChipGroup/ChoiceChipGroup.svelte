<script lang="ts">
  export interface ChoiceChipOption {
    value: string
    label: string
    primary?: boolean
  }

  export interface ChoiceChipGroupProps {
    options: ChoiceChipOption[]
    value?: string
    onSelect?: (value: string) => void
    disabled?: boolean
    ariaLabel: string
    tone?: 'default' | 'soft'
    size?: 'sm' | 'md'
  }

  let {
    options,
    value = $bindable(undefined),
    onSelect,
    disabled = false,
    ariaLabel,
    tone = 'default',
    size = 'md',
  }: ChoiceChipGroupProps = $props()

  function handleSelect(optionValue: string) {
    if (disabled) return
    value = optionValue
    onSelect?.(optionValue)
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const target = targetIndex(event.key, index)
    if (target === null) return
    event.preventDefault()
    handleSelect(options[target].value)
  }

  function targetIndex(key: string, index: number): number | null {
    if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % options.length
    if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + options.length) % options.length
    if (key === 'Home') return 0
    if (key === 'End') return options.length - 1
    return null
  }

  function tabindexFor(index: number): number {
    if (value === undefined) return index === 0 ? 0 : -1
    return options[index].value === value ? 0 : -1
  }
</script>

<div
  class="choicechipgroup"
  class:choicechipgroup--soft={tone === 'soft'}
  class:choicechipgroup--sm={size === 'sm'}
  role="radiogroup"
  aria-label={ariaLabel}
  aria-disabled={disabled}
>
  {#each options as option, index (option.value)}
    <button
      type="button"
      class="choicechipgroup__chip"
      class:choicechipgroup__chip--selected={option.value === value}
      class:choicechipgroup__chip--primary={option.primary}
      class:choicechipgroup__chip--disabled={disabled}
      role="radio"
      aria-checked={option.value === value}
      aria-disabled={disabled}
      tabindex={tabindexFor(index)}
      {disabled}
      onclick={() => handleSelect(option.value)}
      onkeydown={(event: KeyboardEvent) => handleKeydown(event, index)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .choicechipgroup {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .choicechipgroup--sm {
    gap: 0.35rem;
  }

  .choicechipgroup__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.55rem 1rem;
    border: 0.09rem solid #EDE9E4;
    border-radius: 99rem;
    background: #fff;
    color: #374151;
    font-family: var(--font-lato);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
  }

  .choicechipgroup--sm .choicechipgroup__chip {
    padding: 0.3rem 0.65rem;
    font-size: 0.72rem;
  }

  .choicechipgroup__chip:hover:not(:disabled) {
    border-color: var(--color-pink);
    color: var(--color-pink);
  }

  .choicechipgroup__chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .choicechipgroup__chip--primary {
    border-color: var(--color-pink);
    color: var(--color-pink);
    box-shadow: 0 2px 8px rgba(255, 60, 172, 0.12);
  }

  .choicechipgroup__chip--primary:hover:not(:disabled) {
    background: var(--color-pk-soft);
  }

  .choicechipgroup--soft .choicechipgroup__chip--primary {
    background: var(--color-pk-soft);
    border-color: transparent;
  }

  .choicechipgroup__chip--selected {
    background: var(--color-pink);
    border-color: var(--color-pink);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 60, 172, 0.25);
  }

  .choicechipgroup__chip--selected:hover:not(:disabled) {
    background: var(--color-pink-light);
    border-color: var(--color-pink-light);
    color: #fff;
  }

  .choicechipgroup__chip--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
</style>
