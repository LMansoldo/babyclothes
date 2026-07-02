import type { Meta, StoryObj } from '@storybook/svelte'
import LanguageToggle from './LanguageToggle.svelte'

const meta = {
  title: 'Composites/LanguageToggle',
  component: LanguageToggle,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: LanguageToggle,
    props: args,
  }),
} satisfies Meta<LanguageToggle>

export default meta
type Story = StoryObj<typeof meta>

export const PortugueseSelected: Story = {
  args: {
    current: 'pt',
    labels: { pt: 'PT-BR', en: 'EN' },
  },
}

export const EnglishSelected: Story = {
  args: {
    current: 'en',
    labels: { pt: 'PT-BR', en: 'EN' },
  },
}
