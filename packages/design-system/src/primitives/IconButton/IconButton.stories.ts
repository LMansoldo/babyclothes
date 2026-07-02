import type { Meta, StoryObj } from '@storybook/svelte'
import IconButton from './IconButton.svelte'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'select', options: ['back', 'close', 'fav', 'share'] },
    variant: { control: 'select', options: ['glass', 'ghost', 'dark'] },
    size: { control: 'select', options: [32, 28] },
    active: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: IconButton,
    props: args,
  }),
} satisfies Meta<IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Back: Story = {
  args: { icon: 'back', variant: 'glass', ariaLabel: 'Voltar' },
}

export const Close: Story = {
  args: { icon: 'close', variant: 'glass', ariaLabel: 'Fechar' },
}

export const Fav: Story = {
  args: { icon: 'fav', variant: 'glass', ariaLabel: 'Favoritar' },
}

export const FavActive: Story = {
  args: { icon: 'fav', variant: 'glass', active: true, ariaLabel: 'Favoritar' },
}

export const Share: Story = {
  args: { icon: 'share', variant: 'glass', ariaLabel: 'Compartilhar' },
}

export const Ghost: Story = {
  args: { icon: 'back', variant: 'ghost', ariaLabel: 'Voltar' },
}

export const Dark: Story = {
  args: { icon: 'close', variant: 'dark', ariaLabel: 'Fechar' },
}

export const Compact: Story = {
  args: { icon: 'back', variant: 'glass', size: 28, ariaLabel: 'Voltar' },
}
