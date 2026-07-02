import type { Meta, StoryObj } from '@storybook/svelte'
import BottomNav from './BottomNav.svelte'

const sampleIcon = () => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'

const meta = {
  title: 'Patterns/BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  argTypes: {
    currentPath: { control: 'text' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: BottomNav,
    props: args,
  }),
} satisfies Meta<BottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tabs: [
      { href: '/catalog', label: 'Catalog', icon: sampleIcon },
      { href: '/chat', label: 'Chat', icon: sampleIcon },
      { href: '/sell', label: 'Sell', icon: sampleIcon },
      { href: '/profile', label: 'Profile', icon: sampleIcon },
    ],
    currentPath: '/catalog',
  },
}

export const ChatActive: Story = {
  args: {
    tabs: [
      { href: '/catalog', label: 'Catalog', icon: sampleIcon },
      { href: '/chat', label: 'Chat', icon: sampleIcon },
      { href: '/sell', label: 'Sell', icon: sampleIcon },
      { href: '/profile', label: 'Profile', icon: sampleIcon },
    ],
    currentPath: '/chat',
  },
}
