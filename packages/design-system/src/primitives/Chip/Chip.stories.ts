import type { Meta, StoryObj } from '@storybook/svelte'
import Chip from './Chip.svelte'

const meta = {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'size', 'condition', 'gender', 'category', 'selected'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Chip,
    props: args,
  }),
} satisfies Meta<Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: { label: 'Tag', variant: 'neutral' },
}

export const SizeChip: Story = {
  args: { label: 'M', variant: 'size', selected: true },
}

export const SizeChipUnselected: Story = {
  args: { label: 'G', variant: 'size' },
}

export const ConditionNew: Story = {
  args: { label: 'Novo', variant: 'condition', selected: true },
}

export const ConditionUsed: Story = {
  args: { label: 'Seminovo', variant: 'condition' },
}

export const Gender: Story = {
  args: { label: 'Menina', variant: 'gender', selected: true },
}

export const Category: Story = {
  args: { label: 'Bodies', variant: 'category', selected: true },
}

export const GenericSelected: Story = {
  args: { label: 'Selecionado', variant: 'selected', selected: true },
}

export const Small: Story = {
  args: { label: 'RN', variant: 'size', size: 'sm' },
}

export const Disabled: Story = {
  args: { label: 'Indisponível', variant: 'size', disabled: true },
}
