import type { Meta, StoryObj } from '@storybook/svelte'
import Button from './Button.svelte'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'pk', 'secondary', 'ghost', 'ghost-pk', 'primary-inv', 'ghost-inv'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Button,
    props: args,
  }),
} satisfies Meta<Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'Comprar Agora',
    variant: 'primary',
  },
}

export const Pink: Story = {
  args: {
    label: 'Contatar Vendedor',
    variant: 'pk',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Adicionar ao Carrinho',
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    label: 'Cancelar',
    variant: 'ghost',
  },
}

export const GhostPink: Story = {
  args: {
    label: 'Ver Detalhes',
    variant: 'ghost-pk',
  },
}

export const PrimaryInv: Story = {
  args: {
    label: 'Continuar',
    variant: 'primary-inv',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const GhostInv: Story = {
  args: {
    label: 'Voltar',
    variant: 'ghost-inv',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Small: Story = {
  args: {
    label: 'Pequeno',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Grande',
    size: 'lg',
  },
}

export const Loading: Story = {
  args: {
    label: 'Enviando...',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Indisponível',
    disabled: true,
  },
}
