import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import TopBar from './TopBar.svelte'

describe('TopBar', () => {
  it('renders a nav element with topnav class', () => {
    const { container } = render(TopBar, { props: {} })
    expect(container.querySelector('.topnav')).toBeInTheDocument()
  })

  it('renders logo link by default', () => {
    const { container } = render(TopBar, { props: {} })
    expect(container.querySelector('.topnav__logo')).toBeInTheDocument()
  })

  it('renders logo as button when onNavigate is provided', () => {
    const { container } = render(TopBar, {
      props: { onNavigate: () => {} },
    })
    const logo = container.querySelector('.topnav__logo')
    expect(logo?.tagName.toLowerCase()).toBe('button')
  })

  it('renders search field in catalog variant', () => {
    const { container } = render(TopBar, {
      props: { variant: 'catalog', searchPlaceholder: 'Buscar' },
    })
    expect(container.querySelector('.topnav__search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument()
  })

  it('does not render search field in chat variant', () => {
    const { container } = render(TopBar, {
      props: { variant: 'chat' },
    })
    expect(container.querySelector('.topnav__search')).not.toBeInTheDocument()
  })

  it('renders action buttons in catalog variant', () => {
    const { container } = render(TopBar, {
      props: {
        variant: 'catalog',
        chatAiLabel: 'Chat IA',
        publishLabel: 'Publicar',
        onNavigate: () => {},
      },
    })
    expect(container.querySelector('.topnav__btn-ghost')).toBeInTheDocument()
    expect(container.querySelector('.topnav__btn-pink')).toBeInTheDocument()
  })

  it('renders nav tabs in chat variant when navItems provided', () => {
    const { container } = render(TopBar, {
      props: {
        variant: 'chat',
        navItems: [
          { href: '/chat', label: 'Chat' },
          { href: '/notifications', label: 'Notificações' },
        ],
        currentPath: '/chat',
      },
    })
    expect(container.querySelector('.topnav__tabs')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Notificações')).toBeInTheDocument()
  })

  it('applies active class to matching nav tab', () => {
    const { container } = render(TopBar, {
      props: {
        variant: 'chat',
        navItems: [
          { href: '/chat', label: 'Chat' },
          { href: '/notifications', label: 'Notificações' },
        ],
        currentPath: '/chat',
      },
    })
    const tabs = container.querySelectorAll('.topnav__tab')
    expect(tabs[0]).toHaveClass('topnav__tab--active')
    expect(tabs[1]).not.toHaveClass('topnav__tab--active')
  })
})
