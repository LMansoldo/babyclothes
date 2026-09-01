import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
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

  it('navigates to logoHref when brand is clicked', async () => {
    const onNavigate = vi.fn()
    render(TopBar, {
      props: { onNavigate, logoHref: '/agent' },
    })
    await fireEvent.click(screen.getByRole('button', { name: /babyclothes/i }))
    expect(onNavigate).toHaveBeenCalledWith('/agent')
  })

  it('navigates to /catalog by default when brand is clicked', async () => {
    const onNavigate = vi.fn()
    render(TopBar, {
      props: { onNavigate },
    })
    await fireEvent.click(screen.getByRole('button', { name: /babyclothes/i }))
    expect(onNavigate).toHaveBeenCalledWith('/catalog')
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
        publishLabel: 'Publicar',
        onNavigate: () => {},
      },
    })
    expect(container.querySelector('.topnav__btn-publish')).toBeInTheDocument()
  })

  it('renders chat info in chat variant', () => {
    const { container } = render(TopBar, {
      props: {
        variant: 'chat',
        chatTitle: 'Assistente IA',
        chatStatus: 'SSE Live',
      },
    })
    expect(screen.getByText('Assistente IA')).toBeInTheDocument()
    expect(screen.getByText('SSE Live')).toBeInTheDocument()
    expect(container.querySelector('.topnav__btn-menu')).toBeInTheDocument()
  })

  it('renders logo in agent variant', () => {
    const { container } = render(TopBar, {
      props: { variant: 'agent', onNavigate: () => {} },
    })
    expect(container.querySelector('.topnav--agent')).toBeInTheDocument()
    expect(container.querySelector('.topnav__logo')).toBeInTheDocument()
  })

  it('does not render search field in agent variant', () => {
    const { container } = render(TopBar, {
      props: { variant: 'agent' },
    })
    expect(container.querySelector('.topnav__search')).not.toBeInTheDocument()
  })

  it('does not render publish button in agent variant', () => {
    const { container } = render(TopBar, {
      props: { variant: 'agent' },
    })
    expect(container.querySelector('.topnav__btn-publish')).not.toBeInTheDocument()
  })

  it('renders avatar button that opens profile in agent variant', async () => {
    const onProfile = vi.fn()
    const { container } = render(TopBar, {
      props: {
        variant: 'agent',
        userInitials: 'LM',
        onProfile,
      },
    })
    expect(container.querySelector('.topnav__avatar-btn')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Perfil' }))
    expect(onProfile).toHaveBeenCalledOnce()
  })

  it('renders user initials in agent variant avatar', () => {
    render(TopBar, {
      props: { variant: 'agent', userInitials: 'LM', onProfile: () => {} },
    })
    expect(screen.getByRole('button', { name: 'Perfil' })).toHaveTextContent('LM')
  })

  it('renders avatar placeholder in agent variant without onProfile', () => {
    const { container } = render(TopBar, {
      props: { variant: 'agent' },
    })
    expect(container.querySelector('.topnav__avatar-btn')).not.toBeInTheDocument()
    expect(container.querySelector('.topnav__avatar-placeholder')).toBeInTheDocument()
  })
})
