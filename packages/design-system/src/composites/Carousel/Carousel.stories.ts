import type { Meta, StoryObj } from '@storybook/svelte'
import Carousel from './Carousel.svelte'

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
  render: (args: Record<string, unknown>) => ({
    Component: Carousel,
    props: args,
  }),
} satisfies Meta<Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Itens Relacionados',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Mais Vistos',
  },
}

export const WithoutLabel: Story = {
  args: {},
}
