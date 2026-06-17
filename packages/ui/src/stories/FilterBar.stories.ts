import type { Meta, StoryObj } from '@storybook/svelte';
import FilterBar from '../lib/components/FilterBar/FilterBar.svelte';

const sampleFilters = [
  { label: 'Roupas', value: 'clothes' },
  { label: 'Calçados', value: 'shoes' },
  { label: 'Acessórios', value: 'accessories' },
  { label: 'Brinquedos', value: 'toys' },
  { label: 'Móveis', value: 'furniture' },
];

const meta: Meta<typeof FilterBar> = {
  title: 'SDK/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pk'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filters: sampleFilters,
    selected: [],
    variant: 'default',
    size: 'md',
  },
};

export const WithPreselection: Story = {
  args: {
    filters: sampleFilters,
    selected: ['clothes', 'accessories'],
    variant: 'default',
    size: 'md',
  },
};

export const WithCounts: Story = {
  args: {
    filters: [
      { label: 'Roupas', value: 'clothes', count: 24 },
      { label: 'Calçados', value: 'shoes', count: 8 },
      { label: 'Acessórios', value: 'accessories', count: 42 },
      { label: 'Brinquedos', value: 'toys', count: 15 },
    ],
    selected: ['clothes'],
    variant: 'default',
    size: 'md',
  },
};

export const PinkVariant: Story = {
  args: {
    filters: sampleFilters,
    selected: ['shoes', 'toys'],
    variant: 'pk',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    filters: sampleFilters,
    selected: [],
    variant: 'default',
    size: 'sm',
  },
};

export const ManyFilters: Story = {
  args: {
    filters: [
      { label: 'Roupas', value: 'clothes', count: 24 },
      { label: 'Calçados', value: 'shoes', count: 8 },
      { label: 'Acessórios', value: 'accessories', count: 42 },
      { label: 'Brinquedos', value: 'toys', count: 15 },
      { label: 'Móveis', value: 'furniture', count: 6 },
      { label: 'Higiene', value: 'hygiene', count: 19 },
      { label: 'Alimentação', value: 'food', count: 33 },
      { label: 'Livros', value: 'books', count: 11 },
      { label: 'Eletrônicos', value: 'electronics', count: 5 },
    ],
    selected: ['clothes', 'toys', 'food'],
    variant: 'pk',
    size: 'md',
  },
};
