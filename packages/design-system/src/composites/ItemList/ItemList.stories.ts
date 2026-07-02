import type { Meta, StoryObj } from '@storybook/svelte'
import ItemList from './ItemList.svelte'

const meta = {
  title: 'Components/ItemList',
  component: ItemList,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'select', options: ['grid', 'list'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ItemList,
    props: args,
  }),
} satisfies Meta<ItemList>

export default meta
type Story = StoryObj<typeof meta>

export const GridWithLabel: Story = {
  args: {
    label: 'Produtos em Destaque',
    count: 12,
    layout: 'grid',
  },
}

export const ListWithLabel: Story = {
  args: {
    label: 'Resultados da Busca',
    count: 8,
    layout: 'list',
  },
}

export const WithoutLabel: Story = {
  args: {
    layout: 'grid',
  },
}

export const EmptyGrid: Story = {
  args: {
    label: 'Nenhum item encontrado',
    count: 0,
    layout: 'grid',
  },
}
