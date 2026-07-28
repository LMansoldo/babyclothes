import type { Meta, StoryObj } from '@storybook/svelte'
import Layout from './Layout.svelte'

const meta = {
  title: 'Fundamentos/Layout',
  component: Layout,
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Breakpoints: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '## Breakpoints (mobile-first)',
          '',
          '| Tier | `@media` (min-width) | px | Uso |',
          '|------|----------------------|-----|-----|',
          '| **mobile** | — (default) | < 640 | Celular |',
          '| **medium** | `40rem` | ≥ 640 | Tablet |',
          '| **large** | `64rem` | ≥ 1024 | Desktop |',
          '| **ultra** | `90rem` | ≥ 1440 | Desktop wide |',
          '',
          '> Dentro de `@media`, `rem` vale 16px (browser default), não 20px.',
          '> Custom properties **não** funcionam na condição `@media` → usar valor literal.',
          '',
          '### Tokens de referência (para JS / container-query)',
          '',
          '```css',
          '--bp-medium: 40rem;  /* 640px  */',
          '--bp-large:  64rem;  /* 1024px */',
          '--bp-ultra:  90rem;  /* 1440px */',
          '```',
        ].join('\n'),
      },
    },
  },
}

export const Container: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '## Container',
          '',
          'Limita a largura do conteúdo e aplica gutters responsivos.',
          '',
          '| Tier | `max-width` | `padding-inline` |',
          '|------|-------------|------------------|',
          '| mobile | `100%` | `1rem` (20px) |',
          '| medium | `36rem` (720px) | `1.5rem` (30px) |',
          '| large | `48rem` (960px) | `2rem` (40px) |',
          '| ultra | `60rem` (1200px) | `2rem` (40px) |',
          '',
          '### Uso',
          '',
          '```html',
          '<div class="container">',
          '  <!-- conteúdo limitado -->',
          '</div>',
          '```',
          '',
          '### Tokens',
          '',
          '```css',
          '--container-medium: 36rem;',
          '--container-large:  48rem;',
          '--container-ultra:  60rem;',
          '--gutter-mobile: 1rem;',
          '--gutter-medium: 1.5rem;',
          '--gutter-large:  2rem;',
          '```',
        ].join('\n'),
      },
    },
  },
}

export const Grid: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          '## Grid de Colunas',
          '',
          'Sistema de grid responsivo: 4 colunas no mobile, 8 no medium, 12 no large+.',
          '',
          '| Tier | Colunas | Gap |',
          '|------|---------|-----|',
          '| mobile | 4 | `--space-4` (1rem) |',
          '| medium | 8 | `--space-5` (1.25rem) |',
          '| large / ultra | 12 | `--space-6` (1.5rem) |',
          '',
          '### Uso',
          '',
          '```html',
          '<div class="grid">',
          '  <div>col 1</div>',
          '  <div>col 2</div>',
          '  <!-- ... -->',
          '</div>',
          '```',
          '',
          'Span de itens via `grid-column: span N` inline ou utilitário `.col-span-{n}`.',
        ].join('\n'),
      },
    },
  },
}
