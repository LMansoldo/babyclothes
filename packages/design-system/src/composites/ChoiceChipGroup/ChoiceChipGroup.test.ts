import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ChoiceChipGroup from './ChoiceChipGroup.svelte'

const options = [
  { value: 'rn', label: 'RN' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
]

describe('ChoiceChipGroup', () => {
  it('renders a radiogroup with one radio per option', () => {
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Sizes' } })
    expect(screen.getByRole('radiogroup', { name: 'Sizes' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('renders option labels', () => {
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Sizes' } })
    expect(screen.getByText('RN')).toBeInTheDocument()
    expect(screen.getByText('3M')).toBeInTheDocument()
    expect(screen.getByText('6M')).toBeInTheDocument()
  })

  it('marks the option matching value as checked', () => {
    render(ChoiceChipGroup, { props: { options, value: '3m', ariaLabel: 'Sizes' } })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onSelect when a chip is clicked', async () => {
    const onSelect = vi.fn()
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Sizes', onSelect } })
    await fireEvent.click(screen.getByText('6M'))
    expect(onSelect).toHaveBeenCalledWith('6m')
  })

  it('does not call onSelect when disabled', async () => {
    const onSelect = vi.fn()
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Sizes', onSelect, disabled: true } })
    await fireEvent.click(screen.getByText('6M'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('applies roving tabindex', () => {
    render(ChoiceChipGroup, { props: { options, value: '3m', ariaLabel: 'Sizes' } })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('tabindex', '-1')
    expect(radios[1]).toHaveAttribute('tabindex', '0')
    expect(radios[2]).toHaveAttribute('tabindex', '-1')
  })

  it('applies aria-label to the radiogroup', () => {
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Choose a size' } })
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Choose a size')
  })

  it('moves selection with arrow keys', async () => {
    const onSelect = vi.fn()
    render(ChoiceChipGroup, { props: { options, value: '3m', ariaLabel: 'Sizes', onSelect } })
    const radios = screen.getAllByRole('radio')
    await fireEvent.keyDown(radios[1], { key: 'ArrowRight' })
    expect(onSelect).toHaveBeenCalledWith('6m')
  })

  it('wraps around with arrow keys', async () => {
    const onSelect = vi.fn()
    render(ChoiceChipGroup, { props: { options, value: '6m', ariaLabel: 'Sizes', onSelect } })
    const radios = screen.getAllByRole('radio')
    await fireEvent.keyDown(radios[2], { key: 'ArrowRight' })
    expect(onSelect).toHaveBeenCalledWith('rn')
  })

  it('applies primary class to primary options', () => {
    const primaryOptions = [
      { value: 'a', label: 'A', primary: true },
      { value: 'b', label: 'B' },
    ]
    const { container } = render(ChoiceChipGroup, { props: { options: primaryOptions, ariaLabel: 'Test' } })
    const chips = container.querySelectorAll('.choicechipgroup__chip')
    expect(chips[0]).toHaveClass('choicechipgroup__chip--primary')
    expect(chips[1]).not.toHaveClass('choicechipgroup__chip--primary')
  })

  it('applies selected class', () => {
    const { container } = render(ChoiceChipGroup, { props: { options, value: 'rn', ariaLabel: 'Sizes' } })
    const chips = container.querySelectorAll('.choicechipgroup__chip')
    expect(chips[0]).toHaveClass('choicechipgroup__chip--selected')
    expect(chips[1]).not.toHaveClass('choicechipgroup__chip--selected')
  })

  it('sets aria-disabled when disabled', () => {
    render(ChoiceChipGroup, { props: { options, ariaLabel: 'Sizes', disabled: true } })
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-disabled', 'true')
  })
})
