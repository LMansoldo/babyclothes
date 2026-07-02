import type { Meta, StoryObj } from '@storybook/svelte'
import ChildMiniCard from './ChildMiniCard.svelte'

const meta = {
  title: 'Composites/ChildMiniCard',
  component: ChildMiniCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['compact', 'full'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChildMiniCard,
    props: args,
  }),
} satisfies Meta<ChildMiniCard>

export default meta
type Story = StoryObj<typeof meta>

export const Compact: Story = {
  args: {
    name: 'Sophia',
    age: '1a 3m',
    size: '3M',
    avatarUrl: 'https://i.pravatar.cc/80?u=sophia',
    selected: false,
    sizeLabel: 'Tam',
  },
}

export const CompactSelected: Story = {
  args: {
    name: 'Lucas',
    age: '2a 6m',
    size: '6M',
    avatarUrl: 'https://i.pravatar.cc/80?u=lucas',
    selected: true,
    sizeLabel: 'Tam',
    onclick: () => console.log('clicked'),
  },
}

export const Full: Story = {
  args: {
    name: 'Sophia',
    age: '1 ano e 3 meses',
    size: '3M',
    avatarUrl: 'https://i.pravatar.cc/80?u=sophia',
    progress: 78,
    progressLabel: 'Crescimento',
    selected: false,
    sizeLabel: 'Tam',
  },
}

export const FullWithProgress: Story = {
  args: {
    name: 'Lucas',
    age: '2 anos e 6 meses',
    size: '6M',
    avatarUrl: 'https://i.pravatar.cc/80?u=lucas',
    progress: 45,
    progressLabel: 'Crescimento',
    selected: false,
    sizeLabel: 'Tam',
  },
}

export const FullSelected: Story = {
  args: {
    name: 'Isabela',
    age: '8 meses',
    size: '1M',
    avatarUrl: 'https://i.pravatar.cc/80?u=isabela',
    progress: 92,
    progressLabel: 'Crescimento',
    selected: true,
    sizeLabel: 'Tam',
    onclick: () => console.log('clicked'),
  },
}

export const CompactNoAvatar: Story = {
  args: {
    name: 'Miguel',
    age: '3a 1m',
    size: '9M',
    selected: false,
    sizeLabel: 'Tam',
  },
}
