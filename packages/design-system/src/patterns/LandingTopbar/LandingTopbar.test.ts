import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import LandingTopbar from './LandingTopbar.svelte'

const props = {
  links: [
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#recursos', label: 'Recursos' },
  ],
  loginLabel: 'Entrar',
  ctaLabel: 'Comece gratis',
}

describe('LandingTopbar', () => {
  it('renders nav links', () => {
    render(LandingTopbar, { props })
    const links = screen.getAllByRole('link')
    const navLabels = links.filter(
      (l) => l.textContent === 'Como funciona' || l.textContent === 'Recursos',
    )
    expect(navLabels.length).toBe(2)
    expect(navLabels[0]).toHaveAttribute('href', '#como-funciona')
  })

  it('renders login link', () => {
    render(LandingTopbar, { props })
    const login = screen.getAllByRole('link').find((l) => l.textContent === 'Entrar')
    expect(login).toBeDefined()
    expect(login).toHaveAttribute('href', '/login')
  })

  it('renders CTA link', () => {
    render(LandingTopbar, { props })
    const cta = screen.getAllByRole('link').find((l) => l.textContent === 'Comece gratis')
    expect(cta).toBeDefined()
    expect(cta).toHaveAttribute('href', '/register')
  })

  it('renders brand name', () => {
    render(LandingTopbar, { props })
    expect(screen.getByText('BabyClothes')).toBeInTheDocument()
  })

  it('uses button when onNavigate is provided', () => {
    render(LandingTopbar, {
      props: { ...props, onNavigate: () => {} },
    })
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
