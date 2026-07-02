import type { Meta, StoryObj } from '@storybook/svelte'
import FilterChipGroup from './FilterChipGroup.svelte'

const meta = {
  title: 'Composites/FilterChipGroup',
  component: FilterChipGroup,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: FilterChipGroup,
    props: args,
  }),
} satisfies Meta<FilterChipGroup>

export default meta
type Story = StoryObj<typeof meta>

export const SizeSingleSelect: Story = {
  args: {
    label: 'Tamanho',
    variant: 'size',
    multiselect: false,
    items: [
      { value: 'rn', label: 'RN', selected: false },
      { value: '3m', label: '3M', selected: false },
      { value: '6m', label: '6M', selected: false },
      { value: '9m', label: '9M', selected: true },
      { value: '12m', label: '12M', selected: false },
      { value: '18m', label: '18M', selected: false },
    ],
  },
}

export const GenderMultiSelect: Story = {
  args: {
    label: 'Gênero',
    variant: 'gender',
    multiselect: true,
    items: [
      { value: 'boy', label: 'Menino', selected: false },
      { value: 'girl', label: 'Menina', selected: true },
      { value: 'unisex', label: 'Unissex', selected: false },
    ],
  },
}

export const ConditionVariant: Story = {
  args: {
    label: 'Condição',
    variant: 'condition',
    multiselect: false,
    items: [
      { value: 'new', label: 'Novo', selected: false },
      { value: 'semi', label: 'Seminovo', selected: true },
      { value: 'used', label: 'Usado', selected: false },
    ],
  },
}

export const CategoryVariant: Story = {
  args: {
    label: 'Categoria',
    variant: 'category',
    multiselect: true,
    items: [
      { value: 'body', label: 'Body', selected: false },
      { value: 'macacao', label: 'Macacão', selected: false },
      { value: 'vestido', label: 'Vestido', selected: true },
      { value: 'calcado', label: 'Calçado', selected: false },
      { value: 'acessorio', label: 'Acessório', selected: false },
    ],
  },
}
