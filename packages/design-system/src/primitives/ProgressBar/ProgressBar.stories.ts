import type { Meta, StoryObj } from '@storybook/svelte'
import ProgressBar from './ProgressBar.svelte'

const meta = {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['pink', 'gray', 'dark'] },
    value: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: { type: 'number', min: 1, max: 100 } },
    showLabel: { control: 'boolean' },
    animated: { control: 'boolean' },
    height: { control: { type: 'number', min: 0.2, max: 2, step: 0.1 } },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ProgressBar,
    props: args,
  }),
} satisfies Meta<ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const PinkWithLabel: Story = {
  args: { value: 68, variant: 'pink', showLabel: true },
}

export const PinkPartial: Story = {
  args: { value: 50, variant: 'pink' },
}

export const PinkComplete: Story = {
  args: { value: 100, variant: 'pink', showLabel: true },
}

export const Gray: Story = {
  args: { value: 32, variant: 'gray', showLabel: true },
}

export const Dark: Story = {
  args: { value: 50, variant: 'dark', showLabel: true, ariaValueText: 'Passo 1 de 2' },
}

export const DarkComplete: Story = {
  args: { value: 100, variant: 'dark', showLabel: true, ariaValueText: 'Passo 2 de 2' },
}

export const Compact: Story = {
  args: { value: 68, variant: 'pink', height: 0.4 },
}

export const Zero: Story = {
  args: { value: 0, variant: 'pink', showLabel: true },
}
