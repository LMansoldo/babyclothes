import type { Meta, StoryObj } from '@storybook/svelte'
import ChatBubble from './ChatBubble.svelte'

const meta = {
  title: 'Patterns/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: ['user', 'agent', 'system'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChatBubble,
    props: args,
  }),
} satisfies Meta<ChatBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Agent: Story = {
  args: {
    role: 'agent',
    content: 'Olá! Encontrei vários bodies no tamanho 6M que podem interessar. Temos opções a partir de R$ 29,90.',
    timestamp: '14:32',
  },
}

export const User: Story = {
  args: {
    role: 'user',
    content: 'Quero ver opções de vestido para bebê, tamanho 12M.',
    timestamp: '14:33',
  },
}

export const System: Story = {
  args: {
    role: 'system',
    content: 'Maria agora está online e pode responder suas perguntas.',
  },
}

export const LongMessage: Story = {
  args: {
    role: 'agent',
    content: 'Claro! Encontrei 12 vestidos no tamanho 12M disponíveis na sua região. Os preços variam de R$ 39,90 a R$ 89,90. Posso filtrar por cor ou material se preferir. Temos opções em algodão orgânico, malha e soft. Qual seria sua preferência?',
    timestamp: '14:35',
  },
}

export const WithoutTimestamp: Story = {
  args: {
    role: 'user',
    content: 'Qual o menor preço para body listrado?',
  },
}
