import type { Meta, StoryObj } from '@storybook/svelte'
import Badge from './Badge.svelte'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dark', 'pk', 'pk-soft', 'neutral', 'green', 'amber'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    pill: { control: 'boolean' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Badge,
    props: args,
  }),
} satisfies Meta<Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Dark: Story = {
  args: {
    label: 'Novo',
    variant: 'dark',
  },
}

export const Pink: Story = {
  args: {
    label: 'Promoção',
    variant: 'pk',
  },
}

export const PinkSoft: Story = {
  args: {
    label: 'Recomendado',
    variant: 'pk-soft',
  },
}

export const Neutral: Story = {
  args: {
    label: 'Usado',
    variant: 'neutral',
  },
}

export const Green: Story = {
  args: {
    label: 'Disponível',
    variant: 'green',
  },
}

export const Amber: Story = {
  args: {
    label: 'Atenção',
    variant: 'amber',
  },
}

export const Pill: Story = {
  args: {
    label: 'Seminovo',
    variant: 'pk',
    pill: true,
  },
}

export const Small: Story = {
  args: {
    label: 'Novo',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    label: 'Novo',
    size: 'lg',
  },
}

export const AllVariants: Story = {
  render: () => ({
    Component: Badge,
    props: {},
  }),
  decorators: [
    () => ({
      Component: Badge,
      props: {},
      children: [],
    }),
  ],
}
