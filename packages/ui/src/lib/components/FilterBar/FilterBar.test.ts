import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import FilterBar from './FilterBar.svelte'

const sampleFilters = [
  { label: 'Roupas', value: 'clothes' },
  { label: 'Calçados', value: 'shoes' },
  { label: 'Acessórios', value: 'accessories' },
  { label: 'Brinquedos', value: 'toys' },
]

const filtersWithCount = [
  { label: 'Roupas', value: 'clothes', count: 24 },
  { label: 'Calçados', value: 'shoes', count: 8 },
  { label: 'Acessórios', value: 'accessories' },
]

describe('FilterBar', () => {
  it('renders filter chips from filters prop', () => {
    render(FilterBar, { props: { filters: sampleFilters } })
    expect(screen.getByText('Roupas')).toBeInTheDocument()
    expect(screen.getByText('Calçados')).toBeInTheDocument()
    expect(screen.getByText('Acessórios')).toBeInTheDocument()
    expect(screen.getByText('Brinquedos')).toBeInTheDocument()
  })

  it('renders with empty filters array', () => {
    const { container } = render(FilterBar, { props: { filters: [] } })
    const group = container.querySelector('.filter-bar')
    expect(group).toBeInTheDocument()
    expect(group?.children.length).toBe(0)
  })

  it('renders all chips as unselected when selected is empty', () => {
    render(FilterBar, { props: { filters: sampleFilters, selected: [] } })
    const chips = screen.getAllByRole('button')
    chips.forEach(chip => {
      expect(chip).not.toHaveAttribute('data-selected')
    })
  })

  it('marks selected chips with data-selected attribute', () => {
    render(FilterBar, { props: { filters: sampleFilters, selected: ['clothes', 'shoes'] } })
    const chips = screen.getAllByRole('button')
    expect(chips[0]).toHaveAttribute('data-selected')
    expect(chips[1]).toHaveAttribute('data-selected')
    expect(chips[2]).not.toHaveAttribute('data-selected')
    expect(chips[3]).not.toHaveAttribute('data-selected')
  })

  it('toggles a chip when clicked — adds value to selected', async () => {
    render(FilterBar, { props: { filters: sampleFilters, selected: [] } })
    await fireEvent.click(screen.getByText('Roupas'))
    const chips = screen.getAllByRole('button')
    expect(chips[0]).toHaveAttribute('data-selected')
  })

  it('toggles a chip when clicked — removes value from selected', async () => {
    render(FilterBar, { props: { filters: sampleFilters, selected: ['clothes'] } })
    await fireEvent.click(screen.getByText('Roupas'))
    const chips = screen.getAllByRole('button')
    expect(chips[0]).not.toHaveAttribute('data-selected')
  })

  it('fires onchange callback with new selected array when chip is clicked', async () => {
    const handler = vi.fn()
    render(FilterBar, { props: { filters: sampleFilters, selected: [], onchange: handler } })
    await fireEvent.click(screen.getByText('Roupas'))
    expect(handler).toHaveBeenCalledWith(['clothes'])
  })

  it('fires onchange callback when deselecting a chip', async () => {
    const handler = vi.fn()
    render(FilterBar, { props: { filters: sampleFilters, selected: ['clothes'], onchange: handler } })
    await fireEvent.click(screen.getByText('Roupas'))
    expect(handler).toHaveBeenCalledWith([])
  })

  it('renders count badge when count is provided', () => {
    render(FilterBar, { props: { filters: filtersWithCount } })
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('does not render count badge when count is not provided', () => {
    const filters = [{ label: 'Roupas', value: 'clothes' }]
    const { container } = render(FilterBar, { props: { filters } })
    const countEl = container.querySelector('.filter-bar__count')
    expect(countEl).not.toBeInTheDocument()
  })

  it('applies variant=pk class on container', () => {
    const { container } = render(FilterBar, { props: { filters: sampleFilters, variant: 'pk' } })
    expect(container.querySelector('.filter-bar')).toHaveClass('filter-bar--pk')
  })

  it('applies variant=default class on container', () => {
    const { container } = render(FilterBar, { props: { filters: sampleFilters, variant: 'default' } })
    expect(container.querySelector('.filter-bar')).toHaveClass('filter-bar--default')
  })

  it('applies size=sm class on container', () => {
    const { container } = render(FilterBar, { props: { filters: sampleFilters, size: 'sm' } })
    expect(container.querySelector('.filter-bar')).toHaveClass('filter-bar--sm')
  })

  it('applies size=md class on container', () => {
    const { container } = render(FilterBar, { props: { filters: sampleFilters, size: 'md' } })
    expect(container.querySelector('.filter-bar')).toHaveClass('filter-bar--md')
  })

  it('supports two-way binding via $bindable selected', async () => {
    render(FilterBar, { props: { filters: sampleFilters, selected: [] } })
    const chips = screen.getAllByRole('button')
    // Click first chip
    await fireEvent.click(chips[0])
    expect(chips[0]).toHaveAttribute('data-selected')
    // Click second chip
    await fireEvent.click(chips[1])
    expect(chips[1]).toHaveAttribute('data-selected')
    // First should still be selected
    expect(chips[0]).toHaveAttribute('data-selected')
    // Click first again to deselect
    await fireEvent.click(chips[0])
    expect(chips[0]).not.toHaveAttribute('data-selected')
    // Second should still be selected
    expect(chips[1]).toHaveAttribute('data-selected')
  })

  it('renders multiple count badges correctly', () => {
    render(FilterBar, { props: { filters: filtersWithCount } })
    const countBadges = screen.getAllByText(/^(24|8)$/)
    expect(countBadges).toHaveLength(2)
  })
})
