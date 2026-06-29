import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import BottomNav from './BottomNav.svelte'

const makeTabs = (count = 2) =>
  Array.from({ length: count }, (_, i) => ({
    href: `/tab${i}`,
    label: `Tab ${i}`,
  }))

describe('BottomNav', () => {
  it('renders a nav element', () => {
    const { container } = render(BottomNav, {
      props: { tabs: makeTabs(2), currentPath: '/tab0' },
    })
    expect(container.querySelector('.bottomnav')).toBeInTheDocument()
  })

  it('renders a tab for each item', () => {
    render(BottomNav, {
      props: { tabs: makeTabs(3), currentPath: '/tab0' },
    })
    expect(screen.getAllByRole('link').length).toBe(3)
  })

  it('renders label text for each tab', () => {
    render(BottomNav, {
      props: { tabs: makeTabs(2), currentPath: '/tab0' },
    })
    expect(screen.getByText('Tab 0')).toBeInTheDocument()
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
  })

  it('applies active modifier to matching tab', () => {
    const { container } = render(BottomNav, {
      props: { tabs: makeTabs(2), currentPath: '/tab0' },
    })
    const tabs = container.querySelectorAll('.bottomnav__tab')
    expect(tabs[0]).toHaveClass('bottomnav__tab--active')
    expect(tabs[1]).not.toHaveClass('bottomnav__tab--active')
  })

  it('sets aria-current="page" on active tab', () => {
    render(BottomNav, {
      props: { tabs: makeTabs(2), currentPath: '/tab1' },
    })
    const links = screen.getAllByRole('link')
    expect(links[1]).toHaveAttribute('aria-current', 'page')
    expect(links[0]).not.toHaveAttribute('aria-current')
  })

  it('renders buttons instead of links when onNavigate is provided', () => {
    render(BottomNav, {
      props: {
        tabs: makeTabs(2),
        currentPath: '/tab0',
        onNavigate: () => {},
      },
    })
    expect(screen.getAllByRole('button').length).toBe(2)
    expect(screen.queryAllByRole('link').length).toBe(0)
  })
})
