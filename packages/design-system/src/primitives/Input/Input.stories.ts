import type { Meta, StoryObj } from '@storybook/svelte'
import Input from './Input.svelte'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'search', 'url'],
    },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Input,
    props: args,
  }),
} satisfies Meta<Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'input-default',
    label: 'Nome do Item',
    placeholder: 'Ex: Macacão de bebê tamanho 3M',
  },
}

export const WithValue: Story = {
  args: {
    id: 'input-value',
    label: 'Nome do Item',
    placeholder: 'Digite o nome...',
    value: 'Macacão de bebê azul',
  },
}

export const WithHint: Story = {
  args: {
    id: 'input-hint',
    label: 'Preço',
    placeholder: 'R$ 0,00',
    hint: 'Informe o valor que deseja receber',
  },
}

export const WithError: Story = {
  args: {
    id: 'input-error',
    label: 'Email',
    placeholder: 'seu@email.com',
    value: 'email-invalido',
    error: 'Insira um endereço de email válido',
  },
}

export const WithSuccess: Story = {
  args: {
    id: 'input-success',
    label: 'Email',
    placeholder: 'seu@email.com',
    value: 'maria@exemplo.com',
    success: 'Email verificado com sucesso',
  },
}

export const WithPrefix: Story = {
  args: {
    id: 'input-prefix',
    label: 'Valor',
    placeholder: '0,00',
    prefix: 'R$',
  },
}

export const WithSuffix: Story = {
  args: {
    id: 'input-suffix',
    label: 'CEP',
    placeholder: '00000-000',
    suffixLabel: 'Buscar',
  },
}

export const Password: Story = {
  args: {
    id: 'input-password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite sua senha',
  },
}

export const Disabled: Story = {
  args: {
    id: 'input-disabled',
    label: 'Desabilitado',
    value: 'Campo bloqueado',
    disabled: true,
  },
}

export const Email: Story = {
  args: {
    id: 'input-email',
    label: 'Email',
    type: 'email',
    placeholder: 'seu@email.com',
  },
}
