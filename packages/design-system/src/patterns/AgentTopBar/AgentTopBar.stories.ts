import type { Meta, StoryObj } from '@storybook/svelte'
import AgentTopBar from './AgentTopBar.svelte'

const meta = {
  title: 'Patterns/AgentTopBar',
  component: AgentTopBar,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['online', 'offline', 'busy'] },
    unreadCount: { control: 'number' },
    onNotifications: { action: 'notifications' },
    onProfile: { action: 'profile' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: AgentTopBar,
    props: args,
  }),
} satisfies Meta<AgentTopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Online: Story = {
  args: {
    agentName: 'Growth Assistant',
    status: 'online',
    statusLabel: 'SSE Live',
    statusDetail: 'Monitoring growth',
    unreadCount: 0,
    userInitials: 'LM',
  },
}

export const WithNotifications: Story = {
  args: {
    agentName: 'Growth Assistant',
    status: 'online',
    statusLabel: 'SSE Live',
    unreadCount: 5,
    userInitials: 'LM',
  },
}

export const Busy: Story = {
  args: {
    agentName: 'Growth Assistant',
    status: 'busy',
    statusLabel: 'Processing',
    statusDetail: 'Analyzing data',
    unreadCount: 12,
    userInitials: 'LM',
  },
}

export const Offline: Story = {
  args: {
    agentName: 'Growth Assistant',
    status: 'offline',
    statusLabel: 'Offline',
    unreadCount: 0,
    userInitials: 'LM',
  },
}

export const ManyNotifications: Story = {
  args: {
    agentName: 'Growth Assistant',
    status: 'online',
    statusLabel: 'Online',
    unreadCount: 150,
    userInitials: 'LM',
  },
}
