import type { Meta, StoryObj } from '@storybook/svelte'
import ActionBar from './ActionBar.svelte'

const meta = {
  title: 'Composites/ActionBar',
  component: ActionBar,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: ActionBar,
    props: args,
  }),
} satisfies Meta<ActionBar>

export default meta
type Story = StoryObj<typeof meta>

export const FullBar: Story = {
  args: {
    showBack: true,
    showFav: true,
    showShare: true,
    isFavorited: false,
  },
}

export const OnlyBack: Story = {
  args: {
    showBack: true,
    showFav: false,
    showShare: false,
  },
}

export const OnlyFavAndShare: Story = {
  args: {
    showBack: false,
    showFav: true,
    showShare: true,
    isFavorited: false,
  },
}

export const FavActive: Story = {
  args: {
    showBack: true,
    showFav: true,
    showShare: true,
    isFavorited: true,
  },
}
