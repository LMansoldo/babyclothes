import type { Meta, StoryObj } from '@storybook/svelte'
import PriceDisplay from './PriceDisplay.svelte'

const meta = {
  title: 'Primitives/PriceDisplay',
  component: PriceDisplay,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'select', options: ['default', 'pink'] },
    price: { control: 'number' },
    oldPrice: { control: 'number' },
    locale: { control: 'select', options: ['pt-BR', 'en-US'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: PriceDisplay,
    props: args,
  }),
} satisfies Meta<PriceDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { price: 32 },
}

export const WithOldPrice: Story = {
  args: { price: 32, oldPrice: 55 },
}

export const Pink: Story = {
  args: { price: 32, color: 'pink' },
}

export const PinkWithOldPrice: Story = {
  args: { price: 32, oldPrice: 55, color: 'pink' },
}

export const Small: Story = {
  args: { price: 32, size: 'sm' },
}

export const Large: Story = {
  args: { price: 32, size: 'lg' },
}

export const EnglishUSD: Story = {
  args: { price: 32, oldPrice: 55, locale: 'en-US', currency: 'USD' },
}
