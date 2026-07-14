import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import MonthPicker from './MonthPicker.svelte'

const months = [
  { value: '0', label: '0m' },
  { value: '3', label: '3m' },
  { value: '6', label: '6m' },
  { value: '9', label: '9m' },
  { value: '12', label: '12m' },
]

describe('MonthPicker', () => {
  it('renders a radiogroup with one radio per month', () => {
    render(MonthPicker, { props: { months, ariaLabel: 'Age' } })
    expect(screen.getByRole('radiogroup', { name: 'Age' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('renders month labels', () => {
    render(MonthPicker, { props: { months, ariaLabel: 'Age' } })
    expect(screen.getByText('0m')).toBeInTheDocument()
    expect(screen.getByText('3m')).toBeInTheDocument()
    expect(screen.getByText('6m')).toBeInTheDocument()
  })

  it('marks the option matching value as checked', () => {
    render(MonthPicker, { props: { months, value: '6', ariaLabel: 'Age' } })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
    expect(radios[2]).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange when a month is clicked', async () => {
    const onChange = vi.fn()
    render(MonthPicker, { props: { months, ariaLabel: 'Age', onChange } })
    await fireEvent.click(screen.getByText('9m'))
    expect(onChange).toHaveBeenCalledWith('9')
  })

  it('applies roving tabindex', () => {
    render(MonthPicker, { props: { months, value: '3', ariaLabel: 'Age' } })
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('tabindex', '-1')
    expect(radios[1]).toHaveAttribute('tabindex', '0')
    expect(radios[2]).toHaveAttribute('tabindex', '-1')
  })

  it('applies aria-label to the radiogroup', () => {
    render(MonthPicker, { props: { months, ariaLabel: 'Select age' } })
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Select age')
  })

  it('moves selection with arrow keys', async () => {
    const onChange = vi.fn()
    render(MonthPicker, { props: { months, value: '3', ariaLabel: 'Age', onChange } })
    const radios = screen.getAllByRole('radio')
    await fireEvent.keyDown(radios[1], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('6')
  })

  it('wraps around with arrow keys', async () => {
    const onChange = vi.fn()
    render(MonthPicker, { props: { months, value: '12', ariaLabel: 'Age', onChange } })
    const radios = screen.getAllByRole('radio')
    await fireEvent.keyDown(radios[4], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('0')
  })

  it('moves with ArrowDown in grid layout', async () => {
    const onChange = vi.fn()
    render(MonthPicker, { props: { months, value: '0', ariaLabel: 'Age', onChange } })
    const radios = screen.getAllByRole('radio')
    await fireEvent.keyDown(radios[0], { key: 'ArrowDown' })
    expect(onChange).toHaveBeenCalled()
  })

  it('applies selected class', () => {
    const { container } = render(MonthPicker, { props: { months, value: '6', ariaLabel: 'Age' } })
    const cells = container.querySelectorAll('.monthpicker__cell')
    expect(cells[2]).toHaveClass('monthpicker__cell--selected')
    expect(cells[0]).not.toHaveClass('monthpicker__cell--selected')
  })
})
