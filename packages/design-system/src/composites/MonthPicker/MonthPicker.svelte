<script lang="ts">
  export interface MonthOption {
    value: string
    label: string
  }

  export interface MonthPickerProps {
    months: MonthOption[]
    value?: string
    onChange?: (value: string) => void
    ariaLabel: string
  }

  let {
    months,
    value = $bindable(undefined),
    onChange,
    ariaLabel,
  }: MonthPickerProps = $props()

  function handleSelect(monthValue: string) {
    value = monthValue
    onChange?.(monthValue)
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const columns = 4
    const target = targetIndex(event.key, index, columns)
    if (target === null) return
    event.preventDefault()
    handleSelect(months[target].value)
  }

  function targetIndex(key: string, index: number, columns: number): number | null {
    const total = months.length
    if (key === 'ArrowRight') return (index + 1) % total
    if (key === 'ArrowLeft') return (index - 1 + total) % total
    if (key === 'ArrowDown') return (index + columns) % total
    if (key === 'ArrowUp') return (index - columns + total) % total
    if (key === 'Home') return 0
    if (key === 'End') return total - 1
    return null
  }

  function tabindexFor(index: number): number {
    if (value === undefined) return index === 0 ? 0 : -1
    return months[index].value === value ? 0 : -1
  }
</script>

<div
  class="monthpicker"
  role="radiogroup"
  aria-label={ariaLabel}
>
  {#each months as month, index (month.value)}
    <button
      type="button"
      class="monthpicker__cell"
      class:monthpicker__cell--selected={month.value === value}
      role="radio"
      aria-checked={month.value === value}
      tabindex={tabindexFor(index)}
      onclick={() => handleSelect(month.value)}
      onkeydown={(event: KeyboardEvent) => handleKeydown(event, index)}
    >
      {month.label}
    </button>
  {/each}
</div>

<style>
  .monthpicker {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
  }

  .monthpicker__cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0.4rem;
    border: 0.1rem solid #EDE9E4;
    border-radius: 0.5rem;
    background: transparent;
    color: #374151;
    font-family: var(--font-lato);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
  }

  .monthpicker__cell:hover {
    border-color: var(--color-pink);
    color: var(--color-pink);
  }

  .monthpicker__cell:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--color-pink);
  }

  .monthpicker__cell--selected {
    background: var(--color-pink);
    border-color: var(--color-pink);
    color: #fff;
  }

  .monthpicker__cell--selected:hover {
    background: var(--color-pink-light);
    border-color: var(--color-pink-light);
    color: #fff;
  }
</style>
