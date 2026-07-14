import type { Meta, StoryObj } from '@storybook/svelte'
import ChoiceChipGroup from './ChoiceChipGroup.svelte'

const meta = {
  title: 'Composites/ChoiceChipGroup',
  component: ChoiceChipGroup,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['default', 'soft'] },
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    onSelect: { action: 'select' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChoiceChipGroup,
    props: args,
  }),
} satisfies Meta<ChoiceChipGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ariaLabel: 'Size selection',
    options: [
      { value: 'rn', label: 'RN' },
      { value: '3m', label: '3M' },
      { value: '6m', label: '6M' },
      { value: '9m', label: '9M' },
      { value: '12m', label: '12M' },
    ],
  },
}

export const WithPrimary: Story = {
  args: {
    ariaLabel: 'Category selection',
    value: 'body',
    options: [
      { value: 'body', label: 'Body', primary: true },
      { value: 'vestido', label: 'Vestido' },
      { value: 'macacao', label: 'Macacao' },
      { value: 'calcado', label: 'Calcado', primary: true },
    ],
  },
}

export const SoftTone: Story = {
  args: {
    ariaLabel: 'Category selection',
    tone: 'soft',
    value: 'body',
    options: [
      { value: 'body', label: 'Body', primary: true },
      { value: 'vestido', label: 'Vestido' },
      { value: 'macacao', label: 'Macacao' },
    ],
  },
}

export const SmallSize: Story = {
  args: {
    ariaLabel: 'Size selection',
    size: 'sm',
    options: [
      { value: 'rn', label: 'RN' },
      { value: '3m', label: '3M' },
      { value: '6m', label: '6M' },
    ],
  },
}

export const Disabled: Story = {
  args: {
    ariaLabel: 'Disabled selection',
    disabled: true,
    value: 'option1',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
}
