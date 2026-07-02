<script lang="ts">
  import { Chip } from '../../primitives/Chip/index.js'

  let {
    label,
    items,
    variant = 'size',
    multiselect = false,
    onchange,
  }: {
    label: string
    items: { value: string; label: string; selected: boolean }[]
    variant?: 'size' | 'gender' | 'category' | 'condition'
    multiselect?: boolean
    onchange?: (selectedValues: string[]) => void
  } = $props()

  let selectedValues = $state(
    items.filter((item) => item.selected).map((item) => item.value)
  )

  function toggleItem(value: string) {
    if (multiselect) {
      const idx = selectedValues.indexOf(value)
      if (idx === -1) {
        selectedValues = [...selectedValues, value]
      } else {
        selectedValues = selectedValues.filter((v) => v !== value)
      }
    } else {
      if (selectedValues.includes(value)) {
        selectedValues = []
      } else {
        selectedValues = [value]
      }
    }
    onchange?.(selectedValues)
  }

  function isSelected(value: string) {
    return selectedValues.includes(value)
  }

  function handleKeydown(e: KeyboardEvent) {
    const activeEl = document.activeElement
    if (!activeEl || !activeEl.closest('.filter-chip-group')) return

    const group = e.currentTarget as HTMLElement
    const chipButtons = group.querySelectorAll('button')

    const currentIndex = Array.from(chipButtons).indexOf(activeEl as HTMLButtonElement)
    if (currentIndex === -1) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = chipButtons[(currentIndex + 1) % chipButtons.length] as HTMLElement
      next?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = chipButtons[
        (currentIndex - 1 + chipButtons.length) % chipButtons.length
      ] as HTMLElement
      prev?.focus()
    } else if (e.key === ' ') {
      e.preventDefault()
      const value = chipButtons[currentIndex]?.closest('[data-chip-value]')?.getAttribute('data-chip-value')
      if (value) toggleItem(value)
    }
  }
</script>

<div class="filter-chip-group" role="group" aria-label={label} onkeydown={handleKeydown}>
  {#each items as item (item.value)}
    <div
      role={multiselect ? 'checkbox' : 'radio'}
      aria-checked={isSelected(item.value)}
      data-chip-value={item.value}
    >
      <Chip
        label={item.label}
        {variant}
        selected={isSelected(item.value)}
        onclick={() => toggleItem(item.value)}
        ariaLabel={item.label}
      />
    </div>
  {/each}
</div>

<style>
  .filter-chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
