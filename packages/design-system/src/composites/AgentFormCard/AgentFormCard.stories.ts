import type { Meta, StoryObj } from '@storybook/svelte'
import AgentFormCard from './AgentFormCard.svelte'

const meta = {
  title: 'Composites/AgentFormCard',
  component: AgentFormCard,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: AgentFormCard,
    props: args,
  }),
} satisfies Meta<AgentFormCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Tell us about your child',
  },
}

export const WithMaxWidth: Story = {
  args: {
    title: 'Growth prediction',
    maxWidth: '32rem',
  },
}
