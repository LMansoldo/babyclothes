import type { Meta, StoryObj } from '@storybook/svelte'
import Spinner from './Spinner.svelte'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'pk', 'inv'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Spinner,
    props: args,
  }),
} satisfies Meta<Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
  },
}

export const Pink: Story = {
  args: {
    size: 'md',
    variant: 'pk',
  },
}

export const Inverse: Story = {
  args: {
    size: 'md',
    variant: 'inv',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Carregando...',
    size: 'md',
  },
}
