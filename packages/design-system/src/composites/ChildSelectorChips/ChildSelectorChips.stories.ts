import type { Meta, StoryObj } from '@storybook/svelte'
import ChildSelectorChips from './ChildSelectorChips.svelte'

const meta = {
  title: 'Composites/ChildSelectorChips',
  component: ChildSelectorChips,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: ChildSelectorChips,
    props: args,
  }),
} satisfies Meta<ChildSelectorChips>

export default meta
type Story = StoryObj<typeof meta>

export const MultipleChildren: Story = {
  args: {
    children: [
      { id: '1', name: 'Livia', age: '1a 6m', size: '9M' },
      { id: '2', name: 'Rafael', age: '3a 2m', size: '18M' },
      { id: '3', name: 'Ana Clara', age: '6m', size: '6M' },
    ],
  },
}

export const OneSelected: Story = {
  args: {
    children: [
      { id: '1', name: 'Livia', age: '1a 6m', size: '9M' },
      { id: '2', name: 'Rafael', age: '3a 2m', size: '18M' },
      { id: '3', name: 'Ana Clara', age: '6m', size: '6M' },
    ],
    selectedId: '1',
  },
}

export const WithAddButton: Story = {
  args: {
    children: [
      { id: '1', name: 'Livia', age: '1a 6m', size: '9M' },
      { id: '2', name: 'Rafael', age: '3a 2m', size: '18M' },
    ],
    selectedId: '2',
    onAdd: () => alert('Adicionar criança'),
  },
}
