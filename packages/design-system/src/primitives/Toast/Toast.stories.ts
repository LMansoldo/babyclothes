import type { Meta, StoryObj } from '@storybook/svelte'
import Toast from './Toast.svelte'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'pk'],
    },
    closable: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Toast,
    props: args,
  }),
} satisfies Meta<Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    title: 'Informativo',
    message: 'Seu anúncio foi publicado com sucesso e está visível para todos.',
    type: 'info',
  },
}

export const Success: Story = {
  args: {
    title: 'Concluído',
    message: 'Pagamento aprovado! O vendedor será notificado.',
    type: 'success',
  },
}

export const Warning: Story = {
  args: {
    title: 'Atenção',
    message: 'Este item está quase esgotando. Aproveite enquanto disponível.',
    type: 'warning',
  },
}

export const Error: Story = {
  args: {
    title: 'Erro',
    message: 'Não foi possível processar sua solicitação. Tente novamente.',
    type: 'error',
  },
}

export const Pink: Story = {
  args: {
    title: 'Novidade',
    message: 'Você recebeu uma nova mensagem sobre seu anúncio.',
    type: 'pk',
  },
}

export const WithoutTitle: Story = {
  args: {
    message: 'Item adicionado aos favoritos com sucesso.',
    type: 'success',
  },
}

export const NotClosable: Story = {
  args: {
    title: 'Aviso',
    message: 'Esta notificação não pode ser fechada.',
    type: 'warning',
    closable: false,
  },
}
