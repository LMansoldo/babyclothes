import type { Meta, StoryObj } from '@storybook/svelte'
import SettingsRow from './SettingsRow.svelte'

const meta = {
  title: 'Composites/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: SettingsRow,
    props: args,
  }),
} satisfies Meta<SettingsRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'My children',
  },
}

export const WithOnclick: Story = {
  args: {
    label: 'Chat history',
    onclick: () => console.log('clicked'),
  },
}
