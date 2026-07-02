import type { Meta, StoryObj } from '@storybook/svelte'
import TopBar from './TopBar.svelte'

const meta = {
  title: 'Patterns/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['catalog', 'chat'] },
    onSearch: { action: 'search' },
    onNavigate: { action: 'navigate' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: TopBar,
    props: args,
  }),
} satisfies Meta<TopBar>

export default meta
type Story = StoryObj<typeof meta>

export const CatalogVariant: Story = {
  args: {
    variant: 'catalog',
    searchPlaceholder: 'Buscar bodies, vestidos...',
    searchAriaLabel: 'Buscar no catálogo',
    chatAiLabel: 'IA',
    publishLabel: 'Publicar',
    onNavigate: () => {},
    onSearch: () => {},
  },
}

export const CatalogWithPath: Story = {
  args: {
    variant: 'catalog',
    currentPath: '/catalog',
    searchPlaceholder: 'O que você procura?',
    searchAriaLabel: 'Buscar no catálogo',
    chatAiLabel: 'IA',
    publishLabel: 'Vender',
    onNavigate: () => {},
    onSearch: () => {},
  },
}

export const ChatVariant: Story = {
  args: {
    variant: 'chat',
    currentPath: '/chat',
    navItems: [
      { href: '/chat', label: 'Chat' },
      { href: '/matches', label: 'Matches' },
    ],
    onNavigate: () => {},
  },
}

export const ChatVariantMultipleTabs: Story = {
  args: {
    variant: 'chat',
    currentPath: '/matches',
    navItems: [
      { href: '/chat', label: 'Conversas' },
      { href: '/matches', label: 'Interesses' },
      { href: '/history', label: 'Histórico' },
    ],
    onNavigate: () => {},
  },
}
