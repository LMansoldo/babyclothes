import type { Meta, StoryObj } from '@storybook/svelte'
import DotIndicator from './DotIndicator.svelte'

const meta = {
  title: 'Primitives/DotIndicator',
  component: DotIndicator,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['light', 'dark'] },
    total: { control: { type: 'number', min: 1, max: 12 } },
    current: { control: { type: 'number', min: 0, max: 11 } },
    size: { control: { type: 'number', min: 0.2, max: 1.5, step: 0.1 } },
    gap: { control: { type: 'number', min: 0.2, max: 1.5, step: 0.1 } },
  },
  render: (args: Record<string, unknown>) => ({
    Component: DotIndicator,
    props: args,
  }),
} satisfies Meta<DotIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: { total: 4, current: 1, variant: 'light' },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Dark: Story = {
  args: { total: 3, current: 0, variant: 'dark' },
}

export const Compact: Story = {
  args: { total: 5, current: 2, variant: 'dark', size: 0.4, gap: 0.4 },
}

export const SingleDot: Story = {
  args: { total: 1, current: 0, variant: 'light' },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
