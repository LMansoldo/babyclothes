import type { Meta, StoryObj } from '@storybook/svelte'
import ChatBubble from './ChatBubble.svelte'

const meta = {
  title: 'Patterns/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: ['user', 'agent', 'system'] },
    surface: { control: 'select', options: ['light', 'dark'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChatBubble,
    props: args,
  }),
} satisfies Meta<ChatBubble>

export default meta
type Story = StoryObj<typeof meta>

export const AgentDark: Story = {
  args: {
    role: 'agent',
    content: 'Olá! Encontrei vários bodies no tamanho 6M que podem interessar.',
    timestamp: '14:32',
    surface: 'dark',
  },
}

export const AgentLight: Story = {
  args: {
    role: 'agent',
    content: 'Olá! Encontrei vários bodies no tamanho 6M que podem interessar.',
    timestamp: '14:32',
    surface: 'light',
  },
  parameters: { backgrounds: { default: 'light' } },
}

export const UserLight: Story = {
  args: {
    role: 'user',
    content: 'Quero ver opções de vestido para bebê, tamanho 12M.',
    timestamp: '14:33',
    surface: 'light',
  },
  parameters: { backgrounds: { default: 'light' } },
}

export const SystemLight: Story = {
  args: {
    role: 'system',
    content: 'Hoje · 14:30',
    surface: 'light',
  },
  parameters: { backgrounds: { default: 'light' } },
}

export const LongMessage: Story = {
  args: {
    role: 'agent',
    content: 'Claro! Encontrei 12 vestidos no tamanho 12M disponíveis na sua região. Os preços variam de R$ 39,90 a R$ 89,90.',
    timestamp: '14:35',
    surface: 'light',
  },
  parameters: { backgrounds: { default: 'light' } },
}
