import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import GrowthChart from './GrowthChart.svelte'

describe('GrowthChart', () => {
  it('renders eyebrow when provided', () => {
    render(GrowthChart, { props: { eyebrow: 'Previsão AI' } })
    expect(screen.getByText('Previsão AI')).toBeInTheDocument()
  })

  it('renders child name when provided', () => {
    render(GrowthChart, { props: { childName: 'Sofia' } })
    expect(screen.getByText('Sofia')).toBeInTheDocument()
  })

  it('renders current and next size blocks', () => {
    const { container } = render(GrowthChart, {
      props: { currentSize: 'P', nextSize: 'M' },
    })
    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__size-value--current')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__size-value--next')).toBeInTheDocument()
  })

  it('renders daysUntil inside the sizes block when provided', () => {
    const { container } = render(GrowthChart, {
      props: { currentSize: 'P', nextSize: 'M', daysUntil: 30 },
    })
    expect(screen.getByText('30 dias')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__days')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__days-value')).toBeInTheDocument()
  })

  it('does not render days block when daysUntil is not provided', () => {
    const { container } = render(GrowthChart, {
      props: { currentSize: 'P', nextSize: 'M' },
    })
    expect(container.querySelector('.growthchart__days')).not.toBeInTheDocument()
  })

  it('does not render sizes section when currentSize or nextSize is missing', () => {
    const { container } = render(GrowthChart, { props: { currentSize: 'P' } })
    expect(container.querySelector('.growthchart__sizes')).not.toBeInTheDocument()
  })

  it('renders SVG arrow between size blocks', () => {
    const { container } = render(GrowthChart, {
      props: { currentSize: 'P', nextSize: 'M' },
    })
    expect(container.querySelector('.growthchart__size-arrow')).toBeInTheDocument()
    expect(container.querySelector('svg.growthchart__size-arrow')).toBeInTheDocument()
  })

  it('renders progress bar when progress is provided', () => {
    const { container } = render(GrowthChart, { props: { progress: 60 } })
    expect(container.querySelector('.growthchart__progress-bar')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__progress-fill')).toBeInTheDocument()
  })

  it('renders timeline with dot-wrap elements for each size entry', () => {
    const sizes = [
      { label: 'RN', status: 'past' as const },
      { label: 'P', status: 'current' as const },
      { label: 'M', status: 'next' as const },
      { label: 'G', status: 'future' as const },
    ]
    const { container } = render(GrowthChart, { props: { sizes } })
    expect(container.querySelector('.growthchart__timeline')).toBeInTheDocument()
    const dotWraps = container.querySelectorAll('.growthchart__dot-wrap')
    expect(dotWraps.length).toBe(4)
  })

  it('renders connector lines between timeline entries', () => {
    const sizes = [
      { label: 'RN', status: 'past' as const },
      { label: 'P', status: 'current' as const },
      { label: 'M', status: 'next' as const },
    ]
    const { container } = render(GrowthChart, { props: { sizes } })
    const lines = container.querySelectorAll('.growthchart__line')
    expect(lines.length).toBe(2)
  })

  it('applies active modifier on connector line after current dot', () => {
    const sizes = [
      { label: 'RN', status: 'past' as const },
      { label: 'P', status: 'current' as const },
      { label: 'M', status: 'next' as const },
    ]
    const { container } = render(GrowthChart, { props: { sizes } })
    const activeLines = container.querySelectorAll('.growthchart__line--active')
    expect(activeLines.length).toBeGreaterThan(0)
  })

  it('applies correct dot status modifier classes', () => {
    const sizes = [
      { label: 'RN', status: 'past' as const },
      { label: 'P', status: 'current' as const },
      { label: 'M', status: 'next' as const },
      { label: 'G', status: 'future' as const },
    ]
    const { container } = render(GrowthChart, { props: { sizes } })
    expect(container.querySelector('.growthchart__dot--past')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__dot--current')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__dot--next')).toBeInTheDocument()
    expect(container.querySelector('.growthchart__dot--future')).toBeInTheDocument()
  })

  it('renders dot labels from sizes entries', () => {
    const sizes = [
      { label: 'RN', status: 'past' as const },
      { label: 'P', status: 'current' as const },
    ]
    render(GrowthChart, { props: { sizes } })
    expect(screen.getByText('RN')).toBeInTheDocument()
    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('does not render timeline when sizes is empty', () => {
    const { container } = render(GrowthChart, { props: { sizes: [] } })
    expect(container.querySelector('.growthchart__timeline')).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(GrowthChart, { props: { description: 'Previsão baseada em IA' } })
    expect(screen.getByText('Previsão baseada em IA')).toBeInTheDocument()
  })

  it('applies full variant class', () => {
    const { container } = render(GrowthChart, { props: { variant: 'full' } })
    expect(container.querySelector('.growthchart--full')).toBeInTheDocument()
  })

  it('renders primary action button', () => {
    render(GrowthChart, {
      props: { primaryAction: { label: 'Ver peças', onclick: () => {} } },
    })
    expect(screen.getByText('Ver peças')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Ver peças' })
    expect(btn.classList.contains('growthchart__btn--primary')).toBe(true)
  })

  it('renders secondary action button', () => {
    render(GrowthChart, {
      props: { secondaryAction: { label: 'Cancelar', onclick: () => {} } },
    })
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Cancelar' })
    expect(btn.classList.contains('growthchart__btn--ghost')).toBe(true)
  })
})
