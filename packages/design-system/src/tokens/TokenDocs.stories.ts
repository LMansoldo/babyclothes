import type { Meta, StoryObj } from '@storybook/svelte'
import TokenDocs from './TokenDocs.svelte'

const meta = {
  title: 'Fundamentos/Design Tokens',
  component: TokenDocs,
  tags: ['autodocs'],
} satisfies Meta<TokenDocs>

export default meta
type Story = StoryObj<typeof meta>

export const Docs: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '# Design Tokens',
          '',
          'Catálogo completo de tokens de design do BabyClothes.',
          '',
          'Navegue pelas categorias:',
          '- [Cores](/docs/fundamentos-cores--docs)',
          '- [Tipografia](/docs/fundamentos-tipografia--docs)',
          '- [Espaçamento](/docs/fundamentos-espaçamento--docs)',
          '- [Efeitos](/docs/fundamentos-efeitos--docs)',
        ].join('\n'),
      },
    },
  },
}
