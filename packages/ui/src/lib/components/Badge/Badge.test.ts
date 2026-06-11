import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Badge from './Badge.svelte'

describe('Badge', () => {
  it('renders label text', () => {
    render(Badge, { props: { label: 'Novo' } })
    expect(screen.getByText('Novo')).toBeInTheDocument()
  })

  it('applies variant=dark class by default', () => {
    render(Badge, { props: { label: 'Novo' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--dark')
  })

  it('applies variant=pk class', () => {
    render(Badge, { props: { label: 'Novo', variant: 'pk' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--pk')
  })

  it('applies variant=pk-soft class', () => {
    render(Badge, { props: { label: 'Novo', variant: 'pk-soft' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--pk-soft')
  })

  it('applies variant=neutral class', () => {
    render(Badge, { props: { label: 'Novo', variant: 'neutral' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--neutral')
  })

  it('applies variant=green class', () => {
    render(Badge, { props: { label: 'Novo', variant: 'green' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--green')
  })

  it('applies variant=amber class', () => {
    render(Badge, { props: { label: 'Usado', variant: 'amber' } })
    expect(screen.getByText('Usado').closest('.badge')).toHaveClass('badge--amber')
  })

  it('applies size=sm class', () => {
    render(Badge, { props: { label: 'Novo', size: 'sm' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--sm')
  })

  it('applies size=lg class', () => {
    render(Badge, { props: { label: 'Novo', size: 'lg' } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--lg')
  })

  it('applies pill modifier', () => {
    render(Badge, { props: { label: 'Novo', pill: true } })
    expect(screen.getByText('Novo').closest('.badge')).toHaveClass('badge--pill')
  })

  it('does not apply pill modifier by default', () => {
    render(Badge, { props: { label: 'Novo' } })
    expect(screen.getByText('Novo').closest('.badge')).not.toHaveClass('badge--pill')
  })
})
