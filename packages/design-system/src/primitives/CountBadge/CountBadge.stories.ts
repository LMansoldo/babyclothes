import type { Meta, StoryObj } from '@storybook/svelte'
import CountBadge from './CountBadge.svelte'

const meta = {
  title: 'Primitives/CountBadge',
  component: CountBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['dark', 'pink', 'gray'] },
    size: { control: 'select', options: ['sm', 'md'] },
    count: { control: { type: 'number', min: 0, max: 200 } },
    max: { control: { type: 'number', min: 10, max: 999 } },
  },
  render: (args: Record<string, unknown>) => ({
    Component: CountBadge,
    props: args,
  }),
} satisfies Meta<CountBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Dark: Story = {
  args: { count: 5, variant: 'dark' },
}

export const Pink: Story = {
  args: { count: 2, variant: 'pink' },
}

export const Gray: Story = {
  args: { count: 3, variant: 'gray' },
}

export const Overflow: Story = {
  args: { count: 150, variant: 'dark' },
}

export const Medium: Story = {
  args: { count: 12, size: 'md', variant: 'pink' },
}

export const Zero: Story = {
  args: { count: 0, variant: 'dark' },
}
