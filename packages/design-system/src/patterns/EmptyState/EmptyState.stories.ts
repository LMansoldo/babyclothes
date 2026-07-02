import type { Meta, StoryObj } from '@storybook/svelte'
import EmptyState from './EmptyState.svelte'

const meta = {
  title: 'Patterns/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['centered', 'inline'] },
    accent: { control: 'select', options: ['default', 'pink'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: EmptyState,
    props: args,
  }),
} satisfies Meta<EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const CenteredDefault: Story = {
  args: {
    variant: 'centered',
    title: 'Nenhum item encontrado',
    description: 'Tente ajustar seus filtros ou buscar por termos diferentes.',
  },
}

export const CenteredPink: Story = {
  args: {
    variant: 'centered',
    title: 'Sem notificações',
    description: 'Você não tem notificações no momento. Elas aparecerão aqui quando houver novidades.',
    accent: 'pink',
  },
}

export const CenteredWithAction: Story = {
  args: {
    variant: 'centered',
    title: 'Carrinho vazio',
    description: 'Você ainda não adicionou nenhum item ao carrinho. Explore nosso catálogo!',
    action: {
      label: 'Ver catálogo',
      variant: 'pk',
      onclick: () => {},
    },
  },
}

export const InlineDefault: Story = {
  args: {
    variant: 'inline',
    title: 'Nenhum resultado',
    description: 'Tente modificar sua busca.',
  },
}

export const InlineWithAction: Story = {
  args: {
    variant: 'inline',
    title: 'Filtro muito restritivo',
    description: 'Tente remover alguns filtros para ver mais resultados.',
    action: {
      label: 'Limpar filtros',
      variant: 'ghost',
      onclick: () => {},
    },
  },
}
