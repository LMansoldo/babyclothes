import type { Meta, StoryObj } from '@storybook/svelte'
import SelectionCard from './SelectionCard.svelte'

const meta = {
  title: 'Composites/SelectionCard',
  component: SelectionCard,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    iconTone: { control: 'select', options: ['brand', 'neutral'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: SelectionCard,
    props: args,
  }),
} satisfies Meta<SelectionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {
  args: {
    title: 'Pessoa Fisica',
    description: 'Venda roupas dos seus filhos. Requer CPF para verificacao.',
    selected: true,
    iconTone: 'brand',
  },
}

export const Unselected: Story = {
  args: {
    title: 'Pessoa Juridica',
    description: 'Loja ou empresa. Requer CNPJ para verificacao.',
    selected: false,
    iconTone: 'neutral',
  },
}
