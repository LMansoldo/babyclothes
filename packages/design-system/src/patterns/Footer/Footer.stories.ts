import type { Meta, StoryObj } from '@storybook/svelte'
import Footer from './Footer.svelte'

const meta = {
  title: 'Patterns/Footer',
  component: Footer,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: Footer,
    props: args,
  }),
} satisfies Meta<Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    links: [
      { href: '/terms', label: 'Termos de uso' },
      { href: '/privacy', label: 'Privacidade' },
    ],
    copyright: '© 2026 BabyClothes',
  },
}
