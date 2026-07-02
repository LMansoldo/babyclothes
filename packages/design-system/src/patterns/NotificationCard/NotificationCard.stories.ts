import type { Meta, StoryObj } from '@storybook/svelte'
import NotificationCard from './NotificationCard.svelte'

const meta = {
  title: 'Patterns/NotificationCard',
  component: NotificationCard,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['growth_prediction', 'new_match', 'system'] },
    onclick: { action: 'clicked' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: NotificationCard,
    props: args,
  }),
} satisfies Meta<NotificationCard>

export default meta
type Story = StoryObj<typeof meta>

export const GrowthPredictionUnread: Story = {
  args: {
    type: 'growth_prediction',
    title: 'Nova previsão de crescimento disponível',
    body: 'Sofia está prestes a mudar para o tamanho 9M. Veja as recomendações da semana.',
    timeAgo: 'há 5 min',
    isRead: false,
    unreadAriaLabel: 'Não lida',
  },
}

export const GrowthPredictionRead: Story = {
  args: {
    type: 'growth_prediction',
    title: 'Atualização de medidas',
    body: 'As medidas do Miguel foram atualizadas. A previsão de troca agora é 9M.',
    timeAgo: 'há 2 horas',
    isRead: true,
  },
}

export const NewMatchUnread: Story = {
  args: {
    type: 'new_match',
    title: 'Novo match encontrado!',
    body: 'Encontramos 5 bodies tamanho 6M compatíveis com seu perfil na região.',
    timeAgo: 'há 15 min',
    isRead: false,
    unreadAriaLabel: 'Não lida',
  },
}

export const NewMatchRead: Story = {
  args: {
    type: 'new_match',
    title: 'Match: Vestidos de verão',
    body: '3 vestidos novos foram listados próximos a você.',
    timeAgo: 'há 1 dia',
    isRead: true,
  },
}

export const SystemUnread: Story = {
  args: {
    type: 'system',
    title: 'Bem-vinda ao BabyClothes!',
    body: 'Complete seu cadastro e adicione as informações do seu bebê para começar.',
    timeAgo: 'há 1 hora',
    isRead: false,
    unreadAriaLabel: 'Não lida',
  },
}

export const SystemRead: Story = {
  args: {
    type: 'system',
    title: 'Atualização disponível',
    body: 'Nova versão do aplicativo disponível com melhorias de desempenho.',
    timeAgo: 'há 3 dias',
    isRead: true,
  },
}
