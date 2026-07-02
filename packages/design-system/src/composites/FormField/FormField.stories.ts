import type { Meta, StoryObj } from '@storybook/svelte'
import FormField from './FormField.svelte'

const meta = {
  title: 'Composites/FormField',
  component: FormField,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: FormField,
    props: args,
  }),
} satisfies Meta<FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Nome completo',
    name: 'fullName',
    placeholder: 'Digite seu nome',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    name: 'email',
    type: 'text',
    value: 'email-invalido',
    placeholder: 'seu@email.com',
    inputmode: 'email',
    error: 'Informe um email válido',
  },
}

export const WithHint: Story = {
  args: {
    label: 'Senha',
    name: 'password',
    type: 'text',
    placeholder: 'Mínimo 8 caracteres',
    hint: 'Use letras, números e símbolos',
  },
}

export const WithSuffix: Story = {
  args: {
    label: 'Peso',
    name: 'weight',
    type: 'number',
    placeholder: '0',
    suffix: 'g',
    inputmode: 'decimal',
  },
}

export const WithPrefix: Story = {
  args: {
    label: 'Preço',
    name: 'price',
    type: 'number',
    placeholder: '0,00',
    prefix: 'R$',
    inputmode: 'decimal',
  },
}

export const Textarea: Story = {
  args: {
    label: 'Descrição',
    name: 'description',
    type: 'textarea',
    placeholder: 'Descreva o item em detalhes...',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Campo bloqueado',
    name: 'disabled',
    value: 'Não editável',
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    label: 'Nome da criança',
    name: 'childName',
    required: true,
    placeholder: 'Nome',
  },
}
