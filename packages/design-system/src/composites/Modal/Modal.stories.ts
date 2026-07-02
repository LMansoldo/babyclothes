import type { Meta, StoryObj } from '@storybook/svelte'
import Modal from './Modal.svelte'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'danger', 'pk'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Modal,
    props: args,
  }),
} satisfies Meta<Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    title: 'Detalhes do Anúncio',
    variant: 'default',
    children: [],
    footer: [],
  },
}

export const Danger: Story = {
  args: {
    open: true,
    title: 'Excluir Anúncio',
    variant: 'danger',
    children: [],
    footer: [],
  },
}

export const Pink: Story = {
  args: {
    open: true,
    title: 'Parabéns!',
    variant: 'pk',
    children: [],
    footer: [],
  },
}

export const WithCloseHandler: Story = {
  args: {
    open: true,
    title: 'Notificação',
    variant: 'default',
    onclose: () => alert('Modal fechado'),
    children: [],
    footer: [],
  },
}
