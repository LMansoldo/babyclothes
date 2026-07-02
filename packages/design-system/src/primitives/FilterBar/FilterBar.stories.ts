import type { Meta, StoryObj } from '@storybook/svelte'
import FilterBar from './FilterBar.svelte'

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'pk', 'on-dark'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: FilterBar,
    props: args,
  }),
} satisfies Meta<FilterBar>

export default meta
type Story = StoryObj<typeof meta>

const tamanhos = [
  { label: 'RN', value: 'rn', count: 12 },
  { label: 'P', value: 'p', count: 45 },
  { label: 'M', value: 'm', count: 38 },
  { label: 'G', value: 'g', count: 22 },
  { label: 'GG', value: 'gg', count: 15 },
]

const categorias = [
  { label: 'Body', value: 'body', count: 28 },
  { label: 'Macacão', value: 'macacao', count: 18 },
  { label: 'Vestido', value: 'vestido', count: 14 },
  { label: 'Conjunto', value: 'conjunto', count: 32 },
  { label: 'Acessório', value: 'acessorio', count: 9 },
]

const condicoes = [
  { label: 'Novo', value: 'novo' },
  { label: 'Seminovo', value: 'seminovo' },
  { label: 'Usado', value: 'usado' },
]

export const Default: Story = {
  args: {
    filters: tamanhos,
    selected: ['p', 'm'],
    variant: 'default',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Categorias',
    filters: categorias,
    selected: ['body'],
    variant: 'default',
  },
}

export const Pink: Story = {
  args: {
    label: 'Condição',
    filters: condicoes,
    selected: ['novo'],
    variant: 'pk',
  },
}

export const OnDark: Story = {
  args: {
    label: 'Tamanhos',
    filters: tamanhos,
    selected: ['rn'],
    variant: 'on-dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Small: Story = {
  args: {
    label: 'Filtros',
    filters: condicoes,
    selected: [],
    size: 'sm',
  },
}
