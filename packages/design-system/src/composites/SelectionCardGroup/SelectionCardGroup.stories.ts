import type { Meta, StoryObj } from '@storybook/svelte'
import SelectionCardGroup from './SelectionCardGroup.svelte'

const meta = {
  title: 'Composites/SelectionCardGroup',
  component: SelectionCardGroup,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: SelectionCardGroup,
    props: args,
  }),
} satisfies Meta<SelectionCardGroup>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileChoice: Story = {
  args: {
    ariaLabel: 'Escolha o seu perfil',
    value: 'pf',
    options: [
      {
        value: 'pf',
        label: 'Pessoa Fisica',
        description: 'Venda roupas dos seus filhos. Requer CPF para verificacao.',
        iconTone: 'brand',
      },
      {
        value: 'pj',
        label: 'Pessoa Juridica',
        description: 'Loja ou empresa. Requer CNPJ para verificacao.',
        iconTone: 'neutral',
      },
    ],
  },
}
