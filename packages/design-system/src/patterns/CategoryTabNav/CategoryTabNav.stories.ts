import type { Meta, StoryObj } from '@storybook/svelte'
import CategoryTabNav from './CategoryTabNav.svelte'

const meta = {
  title: 'Patterns/CategoryTabNav',
  component: CategoryTabNav,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'text' },
    categories: { control: 'object' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: CategoryTabNav,
    props: args,
  }),
} satisfies Meta<CategoryTabNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    categories: ['Todos', 'Meninos', 'Meninas', 'Bebês', 'Acessórios'],
    active: 'Todos',
  },
}

export const BoysSelected: Story = {
  args: {
    categories: ['Todos', 'Meninos', 'Meninas', 'Bebês', 'Acessórios'],
    active: 'Meninos',
  },
}

export const ManyCategories: Story = {
  args: {
    categories: ['Todos', 'Body', 'Vestidos', 'Shorts', 'Camisetas', 'Pijamas', 'Sapatos', 'Acessórios'],
    active: 'Body',
  },
}
