import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import AgentFormCard from './AgentFormCard.svelte'

describe('AgentFormCard', () => {
  it('renders the title', () => {
    render(AgentFormCard, {
      props: { title: 'Growth prediction' },
    })
    expect(screen.getByText('Growth prediction')).toBeInTheDocument()
  })

  it('renders the IA badge', () => {
    const { container } = render(AgentFormCard, {
      props: { title: 'Test' },
    })
    expect(container.querySelector('.agentformcard__badge')).toBeInTheDocument()
    expect(screen.getByText('IA')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(AgentFormCard, {
      props: { title: 'Test' },
    })
    const body = document.querySelector('.agentformcard__body')
    expect(body).toBeInTheDocument()
  })

  it('applies the card border style', () => {
    const { container } = render(AgentFormCard, {
      props: { title: 'Test' },
    })
    const card = container.querySelector('.agentformcard')
    expect(card).toBeInTheDocument()
  })

  it('applies max-width when provided', () => {
    const { container } = render(AgentFormCard, {
      props: { title: 'Test', maxWidth: '32rem' },
    })
    const card = container.querySelector('.agentformcard') as HTMLElement
    expect(card.style.maxWidth).toBe('32rem')
  })

  it('does not set max-width when not provided', () => {
    const { container } = render(AgentFormCard, {
      props: { title: 'Test' },
    })
    const card = container.querySelector('.agentformcard') as HTMLElement
    expect(card.style.maxWidth).toBe('')
  })

  it('has the IA badge with droplet icon', () => {
    const { container } = render(AgentFormCard, {
      props: { title: 'Test' },
    })
    const badge = container.querySelector('.agentformcard__badge')
    expect(badge).toBeInTheDocument()
    const svg = badge?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
