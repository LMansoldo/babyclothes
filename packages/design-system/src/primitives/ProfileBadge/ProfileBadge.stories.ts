import type { Meta, StoryObj } from '@storybook/svelte'
import ProfileBadge from './ProfileBadge.svelte'

const meta = {
  title: 'Primitives/ProfileBadge',
  component: ProfileBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['role', 'account-type', 'status'] },
    status: { control: 'select', options: ['online', 'offline'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ProfileBadge,
    props: args,
  }),
} satisfies Meta<ProfileBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Role: Story = {
  args: { label: 'Vendedora', variant: 'role' },
}

export const AccountTypePF: Story = {
  args: { label: 'PF', variant: 'account-type' },
}

export const AccountTypePJ: Story = {
  args: { label: 'PJ', variant: 'account-type' },
}

export const StatusOnline: Story = {
  args: { label: 'Online', variant: 'status', status: 'online' },
}

export const StatusOffline: Story = {
  args: { label: 'Offline', variant: 'status', status: 'offline' },
}
