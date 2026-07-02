import type { Meta, StoryObj } from '@storybook/svelte'
import TokenDocs from './TokenDocs.svelte'

const meta = {
  title: 'Fundamentos/Cores',
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
          '## Rosa Principal',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--pk` | #FF3CAC | Ação primária, links, badges, destaque |',
          '| `--pk2` | #FF6EC7 | Hover, variante clara do primário |',
          '| `--pk3` | #FFD6EE | Fundo sutil de elementos rosa |',
          '| `--pk-soft` | #FFE8F5 | Badge soft, fundo de chip |',
          '| `--pk-mid` | #FF85CC | Tom médio, gradientes |',
          '| `--pk-purple` | #B03EFF | Gradiente de marca, accent secundário |',
          '',
          '## Superfícies',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--color-bg` | #F8F5F2 | Fundo principal da interface |',
          '| `--color-bg-2` | #ECEAE6 | Fundo secundário, cards |',
          '| `--color-bg-3` | #E2DFD9 | Borda sutil, variação de fundo |',
          '| `--wh` | #FFFFFF | Fundo de cards, modais |',
          '| `--bk` | #0A0A0A | Texto principal |',
          '| `--color-black-2` | #111111 | Fundo escuro, botão primary |',
          '| `--color-black-3` | #1C1C1C | Fundo mais escuro |',
          '',
          '## Neutros',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--gr` | #888888 | Texto secundário, labels |',
          '| `--gr2` | #BCBCBC | Placeholder, bordas leves |',
          '',
          '## Semânticas',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--color-success` | #22C55E | Online, disponível, confirmação |',
          '| `--color-error` | #EF4444 | Erro, validação, alerta |',
          '| `--color-warning` | #F59E0B | Atenção, pendente |',
          '| `--color-info` | #3B82F6 | Informativo, link |',
          '',
          '## Glass',
          '',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--glass` | rgba(255,255,255,0.52) | TopBar, BottomNav, cards translúcidos |',
          '| `--glass-hi` | rgba(255,255,255,0.62) | Glass em hover ou destaque |',
          '| `--glass-brd` | rgba(255,255,255,0.75) | Borda de elementos glass |',
          '| `--glass-line` | rgba(10,10,10,0.06) | Linha divisória sutil |',
          '',
          '## Gradiente de Marca',
          '',
          '```css',
          'linear-gradient(135deg, #FF3CAC 0%, #B03EFF 55%, #111 100%)',
          '```',
          '',
          'Hero, avatares, elementos decorativos.',
        ].join('\n'),
      },
    },
  },
}
