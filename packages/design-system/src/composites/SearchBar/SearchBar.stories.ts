import type { Meta, StoryObj } from '@storybook/svelte'
import SearchBar from './SearchBar.svelte'

const meta = {
  title: 'Composites/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: SearchBar,
    props: args,
  }),
} satisfies Meta<SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Buscar no catálogo...',
    value: '',
    ariaLabel: 'Buscar itens',
  },
}

export const WithText: Story = {
  args: {
    placeholder: 'Buscar no catálogo...',
    value: 'Body listrado',
    ariaLabel: 'Buscar itens',
  },
}

export const Focused: Story = {
  args: {
    placeholder: 'Buscar no catálogo...',
    value: '',
    ariaLabel: 'Buscar itens',
  },
  parameters: {
    pseudo: { focusWithin: true },
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Pesquisar por marca, tamanho...',
    value: '',
    ariaLabel: 'Pesquisar produtos',
  },
}
