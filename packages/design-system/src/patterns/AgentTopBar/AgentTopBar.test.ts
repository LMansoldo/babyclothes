import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import AgentTopBar from './AgentTopBar.svelte'

const defaultProps = {
  agentName: 'Growth Assistant',
  status: 'online' as const,
  statusLabel: 'SSE Live',
  userInitials: 'LM',
}

describe('AgentTopBar', () => {
  it('renders a nav element', () => {
    const { container } = render(AgentTopBar, { props: defaultProps })
    expect(container.querySelector('nav')).toBeInTheDocument()
  })

  it('renders the agent name', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByText('Growth Assistant')).toBeInTheDocument()
  })

  it('renders the status label', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByText('SSE Live')).toBeInTheDocument()
  })

  it('renders status detail when provided', () => {
    render(AgentTopBar, { props: { ...defaultProps, statusDetail: 'Monitoring growth' } })
    expect(screen.getByText(/Monitoring growth/)).toBeInTheDocument()
  })

  it('does not render status detail when not provided', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.queryByText(/Monitoring/)).not.toBeInTheDocument()
  })

  it('renders the user initials', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByText('LM')).toBeInTheDocument()
  })

  it('renders the notification button', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('renders the profile button', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument()
  })

  it('calls onNotifications when notification button is clicked', async () => {
    const onNotifications = vi.fn()
    render(AgentTopBar, { props: { ...defaultProps, onNotifications } })
    await fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(onNotifications).toHaveBeenCalledOnce()
  })

  it('calls onProfile when profile button is clicked', async () => {
    const onProfile = vi.fn()
    render(AgentTopBar, { props: { ...defaultProps, onProfile } })
    await fireEvent.click(screen.getByRole('button', { name: 'Profile' }))
    expect(onProfile).toHaveBeenCalledOnce()
  })

  it('shows unread count badge when count > 0', () => {
    render(AgentTopBar, { props: { ...defaultProps, unreadCount: 5 } })
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show badge when unreadCount is 0', () => {
    render(AgentTopBar, { props: { ...defaultProps, unreadCount: 0 } })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows 99+ for large unread counts', () => {
    render(AgentTopBar, { props: { ...defaultProps, unreadCount: 150 } })
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('applies online status class', () => {
    const { container } = render(AgentTopBar, { props: defaultProps })
    expect(container.querySelector('.agenttopbar__status-dot--online')).toBeInTheDocument()
    expect(container.querySelector('.agenttopbar__status-indicator--online')).toBeInTheDocument()
  })

  it('applies busy status class', () => {
    const { container } = render(AgentTopBar, { props: { ...defaultProps, status: 'busy' } })
    expect(container.querySelector('.agenttopbar__status-dot--busy')).toBeInTheDocument()
    expect(container.querySelector('.agenttopbar__status-indicator--busy')).toBeInTheDocument()
  })

  it('applies offline status class', () => {
    const { container } = render(AgentTopBar, { props: { ...defaultProps, status: 'offline' } })
    expect(container.querySelector('.agenttopbar__status-dot--offline')).toBeInTheDocument()
    expect(container.querySelector('.agenttopbar__status-indicator--offline')).toBeInTheDocument()
  })

  it('has aria-label on the nav', () => {
    render(AgentTopBar, { props: defaultProps })
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Agent navigation')
  })
})
