import type { Meta, StoryObj } from '@storybook/svelte'
import ChatHeader from './ChatHeader.svelte'

const meta = {
  title: 'Patterns/ChatHeader',
  component: ChatHeader,
  tags: ['autodocs'],
  argTypes: {
    onMore: { action: 'more' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: ChatHeader,
    props: args,
  }),
} satisfies Meta<ChatHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Agente BabyClothes',
    subtitle: 'assistente de descoberta e crescimento',
    liveLabel: 'LIVE',
  },
}

export const WithChildContext: Story = {
  args: {
    title: 'Maria (Mãe da Sofia)',
    subtitle: 'online',
    liveLabel: 'LIVE',
    childContext: 'Sofia • 8 meses',
    onMore: () => {},
  },
}

export const CustomTitle: Story = {
  args: {
    title: 'Ana Silva',
    subtitle: 'vendedora verificada',
    liveLabel: 'ONLINE',
    childContext: 'João • 2 anos',
    onMore: () => {},
  },
}
