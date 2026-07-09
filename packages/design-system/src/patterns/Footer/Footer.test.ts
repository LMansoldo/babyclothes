import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Footer from './Footer.svelte'

const props = {
  links: [
    { href: '/terms', label: 'Termos de uso' },
    { href: '/privacy', label: 'Privacidade' },
  ],
  copyright: '© 2026 BabyClothes',
}

describe('Footer', () => {
  it('renders a link for each entry', () => {
    render(Footer, { props })
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(2)
    expect(links[0]).toHaveAttribute('href', '/terms')
  })

  it('renders the copyright text', () => {
    render(Footer, { props })
    expect(screen.getByText('© 2026 BabyClothes')).toBeInTheDocument()
  })
})
