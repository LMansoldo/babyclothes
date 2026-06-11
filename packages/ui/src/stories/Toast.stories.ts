import type { Meta, StoryObj } from '@storybook/svelte'
import Toast from '../lib/components/Toast/Toast.svelte'

const meta: Meta<typeof Toast> = {
  title: 'SDK/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'pk'],
    },
    closable: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: { message: 'Sua lista de favoritos foi atualizada.', type: 'info', closable: true },
}

export const Success: Story = {
  args: { title: 'Anúncio publicado!', message: 'Seu item já está visível no catálogo.', type: 'success', closable: true },
}

export const Warning: Story = {
  args: { title: 'Atenção', message: 'Sofia está prestes a mudar de tamanho em 30 dias.', type: 'warning', closable: true },
}

export const Error: Story = {
  args: { title: 'Erro ao salvar', message: 'Verifique sua conexão e tente novamente.', type: 'error', closable: true },
}

export const Pink: Story = {
  args: { title: 'Novo match!', message: 'Macacão tam. M de outra mãe na sua área.', type: 'pk', closable: true },
}

export const NoClose: Story = {
  args: { message: 'Processando pagamento...', type: 'info', closable: false },
}
