import type { Meta, StoryObj } from '@storybook/svelte'
import TokenDocs from './TokenDocs.svelte'

const meta = {
  title: 'Fundamentos/Efeitos',
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
          '## Glass Tokens',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--glass` | rgba(255,255,255,0.52) | Superfície glass padrão |',
          '| `--glass-hi` | rgba(255,255,255,0.62) | Glass em hover/destaque |',
          '| `--glass-brd` | rgba(255,255,255,0.75) | Borda de elementos glass |',
          '| `--glass-line` | rgba(10,10,10,0.06) | Linha divisória sutil |',
          '| `--glass-blur` | blur(2.4rem) saturate(170%) | Efeito de desfoque |',
          '| `--glass-shadow` | 0 0.8rem 3.2rem rgba(10,10,10,0.07), inset 0 0.1rem 0 rgba(255,255,255,0.85) | Sombra glass |',
          '',
          '## Exemplos de Uso',
          '',
          '### TopBar / BottomNav / Card',
          '',
          '```css',
          'background: var(--glass);',
          'backdrop-filter: var(--glass-blur);',
          'border: 1px solid var(--glass-brd);',
          '```',
          '',
          '### Dark Overlay',
          '',
          '```css',
          'background: rgba(0, 0, 0, 0.25);',
          'backdrop-filter: blur(8px);',
          'border: 1px solid rgba(255, 255, 255, 0.15);',
          '```',
        ].join('\n'),
      },
    },
  },
}
