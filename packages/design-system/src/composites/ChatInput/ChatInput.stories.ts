import type { Meta, StoryObj } from '@storybook/svelte'
import ChatInput from './ChatInput.svelte'

const meta = {
  title: 'Components/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChatInput,
    props: args,
  }),
} satisfies Meta<ChatInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Digite sua mensagem...',
  },
}

export const WithQuickActions: Story = {
  args: {
    placeholder: 'Pergunte sobre o produto...',
    quickActions: [
      { label: 'Disponível?', value: 'O produto ainda está disponível?' },
      { label: 'Preço', value: 'Qual o menor preço?' },
      { label: 'Medidas', value: 'Quais as medidas exatas?' },
    ],
  },
}

export const Loading: Story = {
  args: {
    placeholder: 'Aguardando resposta...',
    loading: true,
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Pergunte sobre tamanhos, frete, etc...',
    quickActions: [
      { label: 'Frete', value: 'Qual o valor do frete?' },
      { label: 'Troca', value: 'Aceita troca?' },
    ],
  },
}
