import type { Meta, StoryObj } from '@storybook/svelte'
import Input from '../lib/components/Input/Input.svelte'

const meta: Meta<typeof Input> = {
  title: 'SDK/Input',
  component: Input,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'default', placeholder: 'Digite algo...' },
}

export const WithLabel: Story = {
  args: { id: 'name', label: 'Nome da criança', placeholder: 'Sofia' },
}

export const WithHint: Story = {
  args: { id: 'email', label: 'E-mail', placeholder: 'voce@email.com', hint: 'Nunca compartilhamos seu e-mail.' },
}

export const Error: Story = {
  args: { id: 'email-err', label: 'E-mail', value: 'nao-e-email', error: 'Formato de e-mail inválido.' },
}

export const Success: Story = {
  args: { id: 'email-ok', label: 'E-mail', value: 'sofia@email.com', success: 'E-mail verificado!' },
}

export const WithPrefix: Story = {
  args: { id: 'price', label: 'Preço', placeholder: '0,00', prefix: 'R$' },
}

export const WithSuffix: Story = {
  args: { id: 'coupon', label: 'Cupom', placeholder: 'BABY2025', suffixLabel: 'Aplicar' },
}

export const Password: Story = {
  args: { id: 'pw', label: 'Senha', type: 'password', placeholder: '••••••••' },
}
