import type { Meta, StoryObj } from '@storybook/svelte'
import TokenDocs from './TokenDocs.svelte'

const meta = {
  title: 'Fundamentos/Tipografia',
  component: TokenDocs,
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Docs: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '## Lato',
          '',
          '| Token | Fonte | Uso |',
          '|-------|------|-----|',
          '| `--font-lato` / `--ld` / `--vd` | Lato, sans-serif | Corpo de texto, logotipo/wordmark |',
          '',
          '| Weight | Tamanho | Uso |',
          '|--------|--------|-----|',
          '| 300 | 0.75rem | Texto auxiliar e labels secundários |',
          '| 400 | 0.875rem | Texto corrido, descrições, placeholders |',
          '| 700 | 0.875rem | Labels, títulos de cards, nomes |',
          '| 900 | 1rem | Destaques, preços principais |',
          '| 700 uppercase | 0.6rem | Labels de seção, categoria, meta |',
        ].join('\n'),
      },
    },
  },
}
