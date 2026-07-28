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
          '',
          '---',
          '',
          '## Escala Tipográfica (role-based)',
          '',
          'Base: **1rem = 20px**. Cada papel expõe `--text-<role>-size`, `--text-<role>-line`, `--text-<role>-weight`.',
          '',
          '| Papel | size (rem) | px | line | weight | tracking | Uso |',
          '|-------|-----------|-----|------|--------|----------|-----|',
          '| `display` | 1.7 | 34 | 1.15 | 300 | — | Hero (onboarding) |',
          '| `title` | 1.4 | 28 | 1.2 | 700 | — | Título de tela |',
          '| `heading` | 1.1 | 22 | 1.25 | 700 | — | Seção |',
          '| `subheading` | 0.95 | 19 | 1.3 | 700 | — | Título de card |',
          '| `body` | 0.85 | 17 | 1.55 | 400 | — | Parágrafo padrão |',
          '| `body-sm` | 0.78 | 15.6 | 1.5 | 400 | — | Chat, secundário |',
          '| `label` | 0.72 | 14.4 | 1.3 | 700 | — | Rótulo, chip |',
          '| `caption` | 0.62 | 12.4 | 1.4 | 500 | 0.05em | Timestamp, eyebrow |',
          '',
          '### Uso',
          '',
          '```css',
          '.card__title {',
          '  font-size: var(--text-subheading-size);',
          '  line-height: var(--text-subheading-line);',
          '  font-weight: var(--text-subheading-weight);',
          '}',
          '```',
        ].join('\n'),
      },
    },
  },
}
