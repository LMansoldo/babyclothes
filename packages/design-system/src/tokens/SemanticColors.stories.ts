import type { Meta, StoryObj } from '@storybook/svelte'
import SemanticColors from './SemanticColors.svelte'

const meta = {
  title: 'Fundamentos/Cores Semânticas',
  component: SemanticColors,
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: {
    theme: 'light',
  },
  parameters: {
    docs: {
      description: {
        story: [
          '## Tokens Semânticos — Tema Claro',
          '',
          'Camada de tokens por **papel/uso** sobre os primitivos. Consumidos pelos componentes no lugar de hex cru.',
          '',
          '### Superfícies',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--surface-base` | #F8F5F2 | Fundo da tela |',
          '| `--surface-raised` | #FFFFFF | Cards, bolha do agente |',
          '| `--surface-sunken` | #F3F4F6 | Inputs, wells |',
          '| `--surface-inverse` | #111111 | Bolha do usuário, chips escuros |',
          '| `--surface-overlay` | rgba(10,10,10,.5) | Scrims/modais |',
          '',
          '### Texto',
          '| Token | Valor | Uso |',
          '|-------|-------|-----|',
          '| `--text-primary` | #111111 | Texto principal |',
          '| `--text-secondary` | #374151 | Secundário |',
          '| `--text-tertiary` | #9CA3AF | Placeholder |',
          '| `--text-on-brand` | #FFFFFF | Sobre rosa |',
          '| `--text-inverse` | #FFFFFF | Sobre surface-inverse |',
          '| `--text-disabled` | #BCBCBC | Desabilitado |',
          '',
          '### Bordas',
          '| Token | Valor |',
          '|-------|-------|',
          '| `--border-subtle` | #F3F4F6 |',
          '| `--border-default` | #EDE9E4 |',
          '| `--border-strong` | #D1D5DB |',
          '| `--border-focus` | var(--color-pink) |',
          '',
          '### Marca',
          '| Token | Valor |',
          '|-------|-------|',
          '| `--brand` | #FF3CAC |',
          '| `--brand-hover` | #FF6EC7 |',
          '| `--brand-subtle` | #FFE8F5 |',
          '| `--on-brand` | #FFFFFF |',
          '',
          '### Feedback',
          '| Token | Valor |',
          '|-------|-------|',
          '| `--feedback-success-solid` | #22C55E |',
          '| `--feedback-warning-solid` | #F59E0B |',
          '| `--feedback-error-solid` | #EF4444 |',
          '| `--feedback-info-solid` | #3B82F6 |',
        ].join('\n'),
      },
    },
  },
}

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
  parameters: {
    docs: {
      description: {
        story: [
          '## Tokens Semânticos — Tema Escuro',
          '',
          'Mesmos tokens, valores re-declarados em `[data-theme="dark"]`.',
          '',
          '### Uso',
          '',
          '```html',
          '<!-- Tema global (futuro toggle) -->',
          '<html data-theme="dark">',
          '',
          '<!-- Ilha escura por escopo (onboarding) -->',
          '<section data-theme="dark">…</section>',
          '```',
          '',
          'Herança por cascata de custom properties — componentes não precisam mudar.',
        ].join('\n'),
      },
    },
  },
}
